use keepass::{db::{Group, Value}, Database, DatabaseKey};
use serde::Serialize;
use std::{
    fs::File,
    path::{Path, PathBuf},
    sync::Mutex,
    time::{Duration, Instant},
};
use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder, Manager, State};
use uuid::Uuid;
use zeroize::{Zeroize, ZeroizeOnDrop};

const LOCK_AFTER: Duration = Duration::from_secs(15 * 60);

#[derive(Clone, Serialize, Zeroize, ZeroizeOnDrop)]
#[serde(rename_all = "camelCase")]
struct IndexedEntry {
    id: String,
    vault_id: String,
    vault_name: String,
    title: String,
    username: String,
    url: String,
    group: String,
}

#[derive(Zeroize, ZeroizeOnDrop)]
struct OpenVault {
    id: String,
    name: String,
    path: String,
    entries: Vec<IndexedEntry>,
}

#[derive(Default)]
struct Session {
    vaults: Vec<OpenVault>,
    last_access: Option<Instant>,
}

impl Session {
    fn expire_if_needed(&mut self) {
        if self.last_access.is_some_and(|last| last.elapsed() >= LOCK_AFTER) {
            self.vaults.zeroize();
            self.vaults.clear();
            self.last_access = None;
        }
    }
    fn touch(&mut self) { self.last_access = Some(Instant::now()); }
    fn clear(&mut self) {
        self.vaults.zeroize();
        self.vaults.clear();
        self.last_access = None;
    }
}

struct AppState(Mutex<Session>);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VaultSummary { id: String, name: String, entries: usize, unlocked: bool }

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionState { vaults: Vec<VaultSummary>, locked: bool, minutes_remaining: u64 }

fn text_field(entry: &keepass::db::Entry, key: &str) -> String {
    match entry.fields.get(key) {
        Some(Value::Unprotected(value)) => value.clone(),
        Some(Value::Protected(value)) => String::from_utf8_lossy(value.unsecure()).into_owned(),
        _ => String::new(),
    }
}

fn collect_entries(group: &Group, vault_id: &str, vault_name: &str, parents: &[String], output: &mut Vec<IndexedEntry>) {
    let mut path = parents.to_vec();
    if !group.name.is_empty() && group.name != "Root" { path.push(group.name.clone()); }
    for entry in &group.entries {
        output.push(IndexedEntry {
            id: entry.uuid.to_string(),
            vault_id: vault_id.to_owned(),
            vault_name: vault_name.to_owned(),
            title: text_field(entry, "Title"),
            username: text_field(entry, "UserName"),
            url: text_field(entry, "URL"),
            group: path.join(" / "),
        });
    }
    for child in &group.groups { collect_entries(child, vault_id, vault_name, &path, output); }
}

#[tauri::command]
fn unlock_vault(path: String, mut password: String, key_file: Option<String>, state: State<AppState>) -> Result<VaultSummary, String> {
    let vault_path = PathBuf::from(&path);
    if vault_path.extension().and_then(|x| x.to_str()).map(|x| x.eq_ignore_ascii_case("kdbx")) != Some(true) {
        password.zeroize();
        return Err("Choose a KeePass .kdbx vault.".into());
    }
    let key = DatabaseKey::new().with_password(&password);
    let key_result = if let Some(ref key_path) = key_file {
        File::open(key_path).map_err(|_| "The key file could not be read.").and_then(|mut file| key.with_keyfile(&mut file).map_err(|_| "The key file is not valid."))
    } else { Ok(key) };
    password.zeroize();
    let key = key_result?;
    let mut file = File::open(&vault_path).map_err(|_| "The vault could not be read. Check its location and permissions.")?;
    let db = Database::open(&mut file, key).map_err(|_| "Unlock failed. Check the master password and key file.")?;
    let id = Uuid::new_v4().to_string();
    let name = vault_path.file_stem().and_then(|x| x.to_str()).unwrap_or("Vault").to_owned();
    let mut entries = Vec::new();
    collect_entries(&db.root, &id, &name, &[], &mut entries);
    let summary = VaultSummary { id: id.clone(), name: name.clone(), entries: entries.len(), unlocked: true };
    let mut session = state.0.lock().map_err(|_| "The local session is unavailable.")?;
    session.expire_if_needed();
    if session.vaults.iter().any(|vault| vault.path == path) { return Err("That vault is already open in this session.".into()); }
    session.vaults.push(OpenVault { id, name, path, entries });
    session.touch();
    Ok(summary)
}

#[tauri::command]
fn search_entries(query: String, state: State<AppState>) -> Result<Vec<IndexedEntry>, String> {
    let terms: Vec<String> = query.split_whitespace().map(|s| s.to_lowercase()).collect();
    let mut session = state.0.lock().map_err(|_| "The local session is unavailable.")?;
    session.expire_if_needed();
    if session.vaults.is_empty() { return Err("Session locked. Unlock a vault to search again.".into()); }
    session.touch();
    let result = session.vaults.iter().flat_map(|vault| &vault.entries).filter(|entry| {
        let searchable = format!("{} {} {} {}", entry.title, entry.username, entry.url, entry.group).to_lowercase();
        terms.iter().all(|term| searchable.contains(term))
    }).take(250).cloned().collect();
    Ok(result)
}

#[tauri::command]
fn session_state(state: State<AppState>) -> Result<SessionState, String> {
    let mut session = state.0.lock().map_err(|_| "The local session is unavailable.")?;
    session.expire_if_needed();
    let minutes_remaining = session.last_access.map(|last| LOCK_AFTER.saturating_sub(last.elapsed()).as_secs().div_ceil(60)).unwrap_or(15);
    let vaults = session.vaults.iter().map(|vault| VaultSummary { id: vault.id.clone(), name: vault.name.clone(), entries: vault.entries.len(), unlocked: true }).collect();
    Ok(SessionState { locked: session.vaults.is_empty(), vaults, minutes_remaining })
}

#[tauri::command]
fn lock_vault(vault_id: String, state: State<AppState>) -> Result<(), String> {
    let mut session = state.0.lock().map_err(|_| "The local session is unavailable.")?;
    if let Some(index) = session.vaults.iter().position(|vault| vault.id == vault_id) {
        session.vaults[index].zeroize();
        session.vaults.remove(index);
    }
    if session.vaults.is_empty() { session.last_access = None; }
    Ok(())
}

#[tauri::command]
fn lock_all(state: State<AppState>) -> Result<(), String> {
    state.0.lock().map_err(|_| "The local session is unavailable.")?.clear();
    Ok(())
}

#[tauri::command]
fn open_entry(vault_id: String, entry_id: String, state: State<AppState>) -> Result<(), String> {
    let mut session = state.0.lock().map_err(|_| "The local session is unavailable.")?;
    session.expire_if_needed();
    let vault = session.vaults.iter().find(|vault| vault.id == vault_id).ok_or("The owning vault is no longer unlocked.")?;
    if !vault.entries.iter().any(|entry| entry.id == entry_id) { return Err("The selected entry is no longer in the session index.".into()); }
    open::that(Path::new(&vault.path)).map_err(|_| "Could not open the vault in its associated password app.".to_string())?;
    session.touch();
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use keepass::db::{Entry, Group, Value};
    #[test]
    fn empty_session_is_locked() { let session = Session::default(); assert!(session.vaults.is_empty()); }
    #[test]
    fn claim_session_lock_clears_every_vault() { let mut session = Session::default(); session.touch(); session.clear(); assert!(session.vaults.is_empty() && session.last_access.is_none()); }
    #[test]
    fn claim_metadata_only_index_collects_only_allowed_fields() {
        let mut group = Group::new("Banking");
        let mut entry = Entry::new();
        entry.fields.insert("Title".into(), Value::Unprotected("Credit union".into()));
        entry.fields.insert("UserName".into(), Value::Unprotected("river".into()));
        entry.fields.insert("Password".into(), Value::Unprotected("must-not-leak".into()));
        entry.fields.insert("Notes".into(), Value::Unprotected("also-private".into()));
        group.entries.push(entry);
        let mut index = Vec::new();
        collect_entries(&group, "v", "Personal", &[], &mut index);
        let serialized = serde_json::to_string(&index).unwrap();
        assert!(serialized.contains("Credit union"));
        assert!(!serialized.contains("must-not-leak"));
        assert!(!serialized.contains("also-private"));
    }
    #[test]
    fn kdbx_round_trip_can_be_unlocked_and_indexed() {
        let mut db = Database::new(Default::default());
        let mut group = Group::new("Work");
        let mut entry = Entry::new();
        entry.fields.insert("Title".into(), Value::Unprotected("Incident portal".into()));
        entry.fields.insert("UserName".into(), Value::Unprotected("on-call".into()));
        entry.fields.insert("URL".into(), Value::Unprotected("https://status.example".into()));
        group.entries.push(entry);
        db.root.groups.push(group);

        let mut bytes = Vec::new();
        db.save(&mut bytes, DatabaseKey::new().with_password("correct horse")).unwrap();
        let reopened = Database::open(&mut std::io::Cursor::new(bytes), DatabaseKey::new().with_password("correct horse")).unwrap();
        let mut index = Vec::new();
        collect_entries(&reopened.root, "vault", "Operations", &[], &mut index);
        assert_eq!(index.len(), 1);
        assert_eq!(index[0].group, "Work");
        assert_eq!(index[0].title, "Incident portal");
    }
    #[test]
    fn invalid_unlock_does_not_prevent_valid_recovery() {
        let db = Database::new(Default::default());
        let mut bytes = Vec::new();
        db.save(&mut bytes, DatabaseKey::new().with_password("correct horse")).unwrap();
        assert!(Database::open(&mut std::io::Cursor::new(bytes.clone()), DatabaseKey::new().with_password("wrong password")).is_err());
        assert!(Database::open(&mut std::io::Cursor::new(bytes), DatabaseKey::new().with_password("correct horse")).is_ok());
    }
    #[test]
    fn claim_auto_lock_inactivity_expiry_locks_a_populated_session() {
        assert_eq!(LOCK_AFTER, Duration::from_secs(15 * 60));
        let mut session = Session::default();
        session.vaults.push(OpenVault { id: "vault".into(), name: "Sample".into(), path: "/tmp/sample.kdbx".into(), entries: vec![IndexedEntry { id: "entry".into(), vault_id: "vault".into(), vault_name: "Sample".into(), title: "Sample entry".into(), username: "user".into(), url: "https://example.test".into(), group: "Root".into() }] });
        session.last_access = Some(Instant::now() - LOCK_AFTER);
        session.expire_if_needed();
        assert!(session.vaults.is_empty());
        assert!(session.last_access.is_none());
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState(Mutex::new(Session::default())))
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "Show Vault Cross Search", true, None::<&str>)?;
            let lock = MenuItem::with_id(app, "lock", "Lock all vaults", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &lock, &quit])?;
            TrayIconBuilder::new().icon(app.default_window_icon().unwrap().clone()).menu(&menu).tooltip("Vault Cross Search").on_menu_event(|app, event| match event.id.as_ref() {
                "show" => { if let Some(window) = app.get_webview_window("main") { let _ = window.show(); let _ = window.set_focus(); } },
                "lock" => { if let Some(state) = app.try_state::<AppState>() { if let Ok(mut session) = state.0.lock() { session.clear(); } } },
                "quit" => app.exit(0),
                _ => {}
            }).build(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![unlock_vault, search_entries, session_state, lock_vault, lock_all, open_entry])
        .run(tauri::generate_context!())
        .expect("error while running Vault Cross Search");
}
