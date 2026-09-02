use keepass::{
    db::{Group, Value},
    Database, DatabaseKey,
};
use serde::Serialize;
use std::{
    fs::File,
    path::{Path, PathBuf},
    sync::Mutex,
    time::{Duration, Instant},
};
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager, RunEvent, State,
};
use uuid::Uuid;
use zeroize::{Zeroize, ZeroizeOnDrop};

const LOCK_AFTER: Duration = Duration::from_secs(15 * 60);
const BUNDLED_SAMPLE_PATH: &str = "bundled://vault-cross-search-sample.kdbx";
const BUNDLED_SAMPLE_NAME: &str = "Sample vault.kdbx";
const BUNDLED_SAMPLE_VAULT: &[u8] = include_bytes!("../resources/vault-cross-search-sample.kdbx");

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
        if self
            .last_access
            .is_some_and(|last| last.elapsed() >= LOCK_AFTER)
        {
            self.vaults.zeroize();
            self.vaults.clear();
            self.last_access = None;
        }
    }
    fn touch(&mut self) {
        self.last_access = Some(Instant::now());
    }
    fn clear(&mut self) {
        self.vaults.zeroize();
        self.vaults.clear();
        self.last_access = None;
    }
}

struct AppState(Mutex<Session>);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VaultSummary {
    id: String,
    name: String,
    entries: usize,
    unlocked: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionState {
    vaults: Vec<VaultSummary>,
    locked: bool,
    minutes_remaining: u64,
}

fn text_field(entry: &keepass::db::Entry, key: &str) -> String {
    match entry.fields.get(key) {
        Some(Value::Unprotected(value)) => value.clone(),
        Some(Value::Protected(value)) => String::from_utf8_lossy(value.unsecure()).into_owned(),
        _ => String::new(),
    }
}

fn database_key_from_password(password: &mut String) -> DatabaseKey {
    let key = DatabaseKey::new().with_password(password.as_str());
    password.zeroize();
    key
}

fn database_key_from_credentials(
    password: &mut String,
    key_file: Option<&Path>,
) -> Result<DatabaseKey, String> {
    let key = database_key_from_password(password);
    if let Some(key_path) = key_file {
        let mut file = File::open(key_path).map_err(|_| "The key file could not be read.")?;
        key.with_keyfile(&mut file)
            .map_err(|_| "The key file is not valid.".to_string())
    } else {
        Ok(key)
    }
}

fn collect_entries(
    group: &Group,
    vault_id: &str,
    vault_name: &str,
    parents: &[String],
    output: &mut Vec<IndexedEntry>,
) {
    let mut path = parents.to_vec();
    if !group.name.is_empty() && group.name != "Root" {
        path.push(group.name.clone());
    }
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
    for child in &group.groups {
        collect_entries(child, vault_id, vault_name, &path, output);
    }
}

fn index_database(db: Database, vault_id: &str, vault_name: &str) -> Vec<IndexedEntry> {
    let mut entries = Vec::new();
    collect_entries(&db.root, vault_id, vault_name, &[], &mut entries);
    entries
}

fn load_bundled_sample_project(session: &mut Session) -> Result<VaultSummary, String> {
    session.expire_if_needed();
    if !session.vaults.is_empty() {
        return Err("Lock the current session before loading the separate sample vault.".into());
    }
    let database = Database::open(
        &mut std::io::Cursor::new(BUNDLED_SAMPLE_VAULT),
        DatabaseKey::new().with_password("sample-only"),
    )
    .map_err(|_| "The bundled sample vault could not be opened.")?;
    let id = Uuid::new_v4().to_string();
    let entries = index_database(database, &id, BUNDLED_SAMPLE_NAME);
    let summary = VaultSummary {
        id: id.clone(),
        name: BUNDLED_SAMPLE_NAME.into(),
        entries: entries.len(),
        unlocked: true,
    };
    session.vaults.push(OpenVault {
        id,
        name: BUNDLED_SAMPLE_NAME.into(),
        path: BUNDLED_SAMPLE_PATH.into(),
        entries,
    });
    session.touch();
    Ok(summary)
}

#[tauri::command]
fn unlock_vault(
    path: String,
    mut password: String,
    key_file: Option<String>,
    state: State<AppState>,
) -> Result<VaultSummary, String> {
    let vault_path = PathBuf::from(&path);
    if vault_path
        .extension()
        .and_then(|x| x.to_str())
        .map(|x| x.eq_ignore_ascii_case("kdbx"))
        != Some(true)
    {
        password.zeroize();
        return Err("Choose a KeePass .kdbx vault.".into());
    }
    let key = database_key_from_credentials(&mut password, key_file.as_deref().map(Path::new))?;
    let mut file = File::open(&vault_path)
        .map_err(|_| "The vault could not be read. Check its location and permissions.")?;
    let db = Database::open(&mut file, key)
        .map_err(|_| "Unlock failed. Check the master password and key file.")?;
    let id = Uuid::new_v4().to_string();
    let name = vault_path
        .file_stem()
        .and_then(|x| x.to_str())
        .unwrap_or("Vault")
        .to_owned();
    let entries = index_database(db, &id, &name);
    let summary = VaultSummary {
        id: id.clone(),
        name: name.clone(),
        entries: entries.len(),
        unlocked: true,
    };
    let mut session = state
        .0
        .lock()
        .map_err(|_| "The local session is unavailable.")?;
    session.expire_if_needed();
    if session.vaults.iter().any(|vault| vault.path == path) {
        return Err("That vault is already open in this session.".into());
    }
    session.vaults.push(OpenVault {
        id,
        name,
        path,
        entries,
    });
    session.touch();
    Ok(summary)
}

#[tauri::command]
fn load_sample_project(state: State<AppState>) -> Result<VaultSummary, String> {
    let mut session = state
        .0
        .lock()
        .map_err(|_| "The local session is unavailable.")?;
    load_bundled_sample_project(&mut session)
}

#[tauri::command]
fn search_entries(query: String, state: State<AppState>) -> Result<Vec<IndexedEntry>, String> {
    let terms: Vec<String> = query.split_whitespace().map(|s| s.to_lowercase()).collect();
    let mut session = state
        .0
        .lock()
        .map_err(|_| "The local session is unavailable.")?;
    session.expire_if_needed();
    if session.vaults.is_empty() {
        return Err("Session locked. Unlock a vault to search again.".into());
    }
    session.touch();
    let result = session
        .vaults
        .iter()
        .flat_map(|vault| &vault.entries)
        .filter(|entry| {
            let searchable = format!(
                "{} {} {} {}",
                entry.title, entry.username, entry.url, entry.group
            )
            .to_lowercase();
            terms.iter().all(|term| searchable.contains(term))
        })
        .take(250)
        .cloned()
        .collect();
    Ok(result)
}

#[tauri::command]
fn session_state(state: State<AppState>) -> Result<SessionState, String> {
    let mut session = state
        .0
        .lock()
        .map_err(|_| "The local session is unavailable.")?;
    session.expire_if_needed();
    let minutes_remaining = session
        .last_access
        .map(|last| {
            LOCK_AFTER
                .saturating_sub(last.elapsed())
                .as_secs()
                .div_ceil(60)
        })
        .unwrap_or(15);
    let vaults = session
        .vaults
        .iter()
        .map(|vault| VaultSummary {
            id: vault.id.clone(),
            name: vault.name.clone(),
            entries: vault.entries.len(),
            unlocked: true,
        })
        .collect();
    Ok(SessionState {
        locked: session.vaults.is_empty(),
        vaults,
        minutes_remaining,
    })
}

#[tauri::command]
fn lock_vault(vault_id: String, state: State<AppState>) -> Result<(), String> {
    let mut session = state
        .0
        .lock()
        .map_err(|_| "The local session is unavailable.")?;
    clear_one_vault(&mut session, &vault_id);
    Ok(())
}

fn clear_one_vault(session: &mut Session, vault_id: &str) {
    if let Some(index) = session.vaults.iter().position(|vault| vault.id == vault_id) {
        session.vaults[index].zeroize();
        session.vaults.remove(index);
    }
    if session.vaults.is_empty() {
        session.last_access = None;
    }
}

#[tauri::command]
fn lock_all(state: State<AppState>) -> Result<(), String> {
    state
        .0
        .lock()
        .map_err(|_| "The local session is unavailable.")?
        .clear();
    Ok(())
}

#[tauri::command]
fn open_entry_with<F>(
    vault_id: &str,
    entry_id: &str,
    session: &mut Session,
    opener: F,
) -> Result<(), String>
where
    F: FnOnce(&Path) -> Result<(), ()>,
{
    session.expire_if_needed();
    let vault = session
        .vaults
        .iter()
        .find(|vault| vault.id == vault_id)
        .ok_or("The owning vault is no longer unlocked.")?;
    if !vault.entries.iter().any(|entry| entry.id == entry_id) {
        return Err("The selected entry is no longer in the session index.".into());
    }
    if vault.path == BUNDLED_SAMPLE_PATH {
        return Err(
            "This is a bundled fake sample. Add a local vault to open it in your password app."
                .into(),
        );
    }
    opener(Path::new(&vault.path)).map_err(|_| {
        "Could not open the vault in the password app set to handle it.".to_string()
    })?;
    session.touch();
    Ok(())
}

#[tauri::command]
fn open_entry(vault_id: String, entry_id: String, state: State<AppState>) -> Result<(), String> {
    let mut session = state
        .0
        .lock()
        .map_err(|_| "The local session is unavailable.")?;
    open_entry_with(&vault_id, &entry_id, &mut session, |path| {
        open::that(path).map(|_| ()).map_err(|_| ())
    })
}

fn clear_session_for_exit(session: &mut Session) {
    session.clear();
}

#[cfg(test)]
#[allow(clippy::items_after_test_module)]
mod tests {
    use super::*;
    use keepass::db::{Entry, Group, Value};
    use secstr::SecStr;
    use std::io::{Cursor, Write};
    use tempfile::NamedTempFile;
    #[test]
    fn empty_session_is_locked() {
        let session = Session::default();
        assert!(session.vaults.is_empty());
    }
    #[test]
    // @claim:session-lock
    fn claim_session_lock_clears_every_vault() {
        let mut session = populated_session();
        session.clear();
        assert!(session.vaults.is_empty() && session.last_access.is_none());
    }
    #[test]
    // @claim:single-vault-lock
    fn claim_single_vault_lock_clears_only_that_vault() {
        let mut session = populated_session();
        session.vaults.push(OpenVault {
            id: "second".into(),
            name: "Other".into(),
            path: "/tmp/other.kdbx".into(),
            entries: Vec::new(),
        });
        clear_one_vault(&mut session, "vault");
        assert_eq!(session.vaults.len(), 1);
        assert_eq!(session.vaults[0].id, "second");
        assert!(session.last_access.is_some());
        clear_one_vault(&mut session, "second");
        assert!(session.vaults.is_empty());
        assert!(session.last_access.is_none());
    }
    #[test]
    // @claim:metadata-only
    fn claim_metadata_only_index_collects_only_allowed_fields() {
        let mut group = Group::new("Banking");
        let mut entry = Entry::new();
        entry
            .fields
            .insert("Title".into(), Value::Unprotected("Credit union".into()));
        entry
            .fields
            .insert("UserName".into(), Value::Unprotected("river".into()));
        entry.fields.insert(
            "URL".into(),
            Value::Unprotected("https://bank.example".into()),
        );
        entry.fields.insert(
            "Password".into(),
            Value::Protected(SecStr::new(b"must-not-leak".to_vec())),
        );
        entry
            .fields
            .insert("Notes".into(), Value::Unprotected("also-private".into()));
        entry.fields.insert(
            "Private custom field".into(),
            Value::Protected(SecStr::new(b"custom-secret".to_vec())),
        );
        entry.fields.insert(
            "invoice.pdf".into(),
            Value::Bytes(b"attachment-secret".to_vec()),
        );
        group.entries.push(entry);
        let mut index = Vec::new();
        collect_entries(&group, "v", "Personal", &[], &mut index);
        let serialized = serde_json::to_string(&index).unwrap();
        assert!(serialized.contains("Credit union"));
        assert!(serialized.contains("river"));
        assert!(serialized.contains("https://bank.example"));
        assert!(serialized.contains("Banking"));
        assert!(!serialized.contains("must-not-leak"));
        assert!(!serialized.contains("also-private"));
        assert!(!serialized.contains("custom-secret"));
        assert!(!serialized.contains("attachment-secret"));
        let object = serde_json::to_value(&index).unwrap()[0]
            .as_object()
            .unwrap()
            .clone();
        assert_eq!(object.len(), 7);
        for key in [
            "id",
            "vaultId",
            "vaultName",
            "title",
            "username",
            "url",
            "group",
        ] {
            assert!(object.contains_key(key), "missing {key}");
        }
    }
    #[test]
    // @claim:credential-clear
    fn claim_unlock_credential_is_cleared_after_key_derivation() {
        let mut password = String::from("correct horse battery staple");
        let _key = database_key_from_password(&mut password);
        assert!(password.is_empty());
    }
    #[test]
    // @claim:database-drop
    fn claim_decrypted_database_is_dropped_after_metadata_extraction() {
        let mut db = Database::new(Default::default());
        let mut group = Group::new("Private");
        let mut entry = Entry::new();
        entry
            .fields
            .insert("Title".into(), Value::Unprotected("Visible marker".into()));
        entry.fields.insert(
            "Password".into(),
            Value::Protected(SecStr::new(b"database-only-secret".to_vec())),
        );
        group.entries.push(entry);
        db.root.groups.push(group);
        let index = index_database(db, "vault", "Personal");
        let retained_session_value = serde_json::to_string(&index).unwrap();
        assert!(retained_session_value.contains("Visible marker"));
        assert!(!retained_session_value.contains("database-only-secret"));
    }
    #[test]
    // @claim:memory-only-index
    fn claim_index_has_no_disk_persistence_path() {
        let core = include_str!("lib.rs").split("#[cfg(test)]").next().unwrap();
        assert!(core.contains("struct Session"));
        assert!(core.contains("entries: Vec<IndexedEntry>"));
        for forbidden in [
            "File::create",
            "OpenOptions",
            "fs::write",
            "std::io::Write",
            "serialize_into",
        ] {
            assert!(
                !core.contains(forbidden),
                "Rust core contains persistence path {forbidden}"
            );
        }
        let mut session = populated_session();
        assert_eq!(session.vaults[0].entries[0].title, "Sample entry");
        session.clear();
        assert!(session.vaults.is_empty());
    }
    #[test]
    // @claim:kdbx-unlock
    fn kdbx_round_trip_can_be_unlocked_and_indexed() {
        let mut db = Database::new(Default::default());
        let mut group = Group::new("Work");
        let mut entry = Entry::new();
        entry
            .fields
            .insert("Title".into(), Value::Unprotected("Incident portal".into()));
        entry
            .fields
            .insert("UserName".into(), Value::Unprotected("on-call".into()));
        entry.fields.insert(
            "URL".into(),
            Value::Unprotected("https://status.example".into()),
        );
        group.entries.push(entry);
        db.root.groups.push(group);

        let mut bytes = Vec::new();
        db.save(
            &mut bytes,
            DatabaseKey::new().with_password("correct horse"),
        )
        .unwrap();
        let reopened = Database::open(
            &mut std::io::Cursor::new(bytes),
            DatabaseKey::new().with_password("correct horse"),
        )
        .unwrap();
        let index = index_database(reopened, "vault", "Operations");
        assert_eq!(index.len(), 1);
        assert_eq!(index[0].group, "Work");
        assert_eq!(index[0].title, "Incident portal");
        assert_eq!(index[0].username, "on-call");
    }
    #[test]
    // @claim:optional-key-files
    fn claim_optional_key_file_unlock_and_invalid_key_recovery() {
        let valid_key_bytes = b"vault-cross-search-fixture-key";
        let invalid_key_bytes = b"wrong-fixture-key";
        let mut valid_key_file = NamedTempFile::new().unwrap();
        valid_key_file.write_all(valid_key_bytes).unwrap();
        let mut invalid_key_file = NamedTempFile::new().unwrap();
        invalid_key_file.write_all(invalid_key_bytes).unwrap();

        let mut db = Database::new(Default::default());
        let mut entry = Entry::new();
        entry.fields.insert(
            "Title".into(),
            Value::Unprotected("Key-file protected marker".into()),
        );
        db.root.entries.push(entry);
        let save_key = DatabaseKey::new()
            .with_password("fixture password")
            .with_keyfile(&mut Cursor::new(valid_key_bytes))
            .unwrap();
        let mut bytes = Vec::new();
        db.save(&mut bytes, save_key).unwrap();

        let mut wrong_password = String::from("fixture password");
        let wrong_key =
            database_key_from_credentials(&mut wrong_password, Some(invalid_key_file.path()))
                .unwrap();
        assert!(wrong_password.is_empty());
        assert!(Database::open(&mut Cursor::new(bytes.clone()), wrong_key).is_err());

        let mut password = String::from("fixture password");
        let valid_key =
            database_key_from_credentials(&mut password, Some(valid_key_file.path())).unwrap();
        assert!(password.is_empty());
        let reopened = Database::open(&mut Cursor::new(bytes), valid_key).unwrap();
        let index = index_database(reopened, "vault", "Keyed");
        assert_eq!(index[0].title, "Key-file protected marker");

        let mut missing_password = String::from("fixture password");
        assert_eq!(
            database_key_from_credentials(
                &mut missing_password,
                Some(Path::new("missing-key-file.fixture"))
            )
            .unwrap_err(),
            "The key file could not be read."
        );
        assert!(missing_password.is_empty());
    }
    #[test]
    fn invalid_unlock_does_not_prevent_valid_recovery() {
        let db = Database::new(Default::default());
        let mut bytes = Vec::new();
        db.save(
            &mut bytes,
            DatabaseKey::new().with_password("correct horse"),
        )
        .unwrap();
        assert!(Database::open(
            &mut std::io::Cursor::new(bytes.clone()),
            DatabaseKey::new().with_password("wrong password")
        )
        .is_err());
        assert!(Database::open(
            &mut std::io::Cursor::new(bytes),
            DatabaseKey::new().with_password("correct horse")
        )
        .is_ok());
    }
    #[test]
    // @claim:auto-lock
    fn claim_auto_lock_inactivity_expiry_locks_a_populated_session() {
        assert_eq!(LOCK_AFTER, Duration::from_secs(15 * 60));
        let mut session = Session::default();
        session.vaults.push(OpenVault {
            id: "vault".into(),
            name: "Sample".into(),
            path: "/tmp/sample.kdbx".into(),
            entries: vec![IndexedEntry {
                id: "entry".into(),
                vault_id: "vault".into(),
                vault_name: "Sample".into(),
                title: "Sample entry".into(),
                username: "user".into(),
                url: "https://example.test".into(),
                group: "Root".into(),
            }],
        });
        session.last_access = Some(Instant::now() - LOCK_AFTER);
        session.expire_if_needed();
        assert!(session.vaults.is_empty());
        assert!(session.last_access.is_none());
    }
    #[test]
    // @claim:quit-lock
    fn claim_quit_clears_the_populated_session() {
        let mut session = populated_session();
        clear_session_for_exit(&mut session);
        assert!(session.vaults.is_empty());
        assert!(session.last_access.is_none());
    }
    #[test]
    // @claim:associated-open
    fn claim_associated_app_receives_the_owning_vault_path() {
        let mut session = populated_session();
        let mut opened = PathBuf::new();
        open_entry_with("vault", "entry", &mut session, |path| {
            opened = path.to_path_buf();
            Ok(())
        })
        .unwrap();
        assert_eq!(opened, PathBuf::from("/tmp/sample.kdbx"));
    }
    #[test]
    // @claim:bundled-sample-vault
    fn claim_bundled_sample_project_is_a_real_kdbx_in_an_isolated_session() {
        let opened = Database::open(
            &mut Cursor::new(BUNDLED_SAMPLE_VAULT),
            DatabaseKey::new().with_password("sample-only"),
        )
        .expect("bundled sample is a readable KDBX database");
        let indexed = index_database(opened, "fixture", BUNDLED_SAMPLE_NAME);
        assert_eq!(indexed.len(), 2);
        assert!(indexed.iter().any(|entry| entry.title == "Acme VPN"));
        assert!(indexed.iter().any(|entry| entry.title == "Acme status"));
        assert!(indexed
            .iter()
            .all(|entry| entry.vault_name == BUNDLED_SAMPLE_NAME));

        let mut session = Session::default();
        let summary = load_bundled_sample_project(&mut session).unwrap();
        assert_eq!(summary.name, BUNDLED_SAMPLE_NAME);
        assert_eq!(summary.entries, 2);
        assert_eq!(session.vaults.len(), 1);
        assert_eq!(session.vaults[0].path, BUNDLED_SAMPLE_PATH);
        assert!(load_bundled_sample_project(&mut session).is_err());
        session.clear();
        assert!(session.vaults.is_empty());
    }
    #[test]
    // @claim:no-secret-actions
    fn claim_desktop_has_no_clipboard_autofill_or_password_storage_paths() {
        let desktop = include_str!("../../src/main.ts");
        let core = include_str!("lib.rs").split("#[cfg(test)]").next().unwrap();
        for forbidden in [
            "navigator.clipboard",
            "writeText(",
            "autofill",
            "File::create",
            "OpenOptions",
            "fs::write",
        ] {
            assert!(
                !desktop.contains(forbidden),
                "desktop UI contains {forbidden}"
            );
            assert!(!core.contains(forbidden), "Rust core contains {forbidden}");
        }
        assert!(!desktop.contains("localStorage.setItem(\"password"));
    }
    #[test]
    // @claim:no-custody-sync
    fn claim_no_vault_custody_recovery_or_sync_path_exists() {
        let core = include_str!("lib.rs").split("#[cfg(test)]").next().unwrap();
        let desktop = include_str!("../../src/main.ts");
        assert!(core.contains("File::open"));
        for forbidden in [
            "reqwest",
            "upload",
            "synchronize",
            "recover_password",
            "TcpStream",
            "UdpSocket",
        ] {
            assert!(!core.contains(forbidden), "Rust core contains {forbidden}");
        }
        assert_eq!(
            desktop.matches("fetch(").count(),
            1,
            "only explicit license verification may use the network"
        );
        assert!(desktop.contains("/verify?license="));
    }
    #[test]
    fn license_does_not_branch_core_safety_behavior() {
        let core = include_str!("lib.rs").split("#[cfg(test)]").next().unwrap();
        assert!(!core.to_lowercase().contains("license"));
        assert!(core.contains("password.zeroize()"));
        assert!(core.contains("session.clear()"));
        assert!(core.contains("collect_entries"));
    }

    fn populated_session() -> Session {
        let mut session = Session::default();
        session.vaults.push(OpenVault {
            id: "vault".into(),
            name: "Sample".into(),
            path: "/tmp/sample.kdbx".into(),
            entries: vec![IndexedEntry {
                id: "entry".into(),
                vault_id: "vault".into(),
                vault_name: "Sample".into(),
                title: "Sample entry".into(),
                username: "user".into(),
                url: "https://example.test".into(),
                group: "Root".into(),
            }],
        });
        session.touch();
        session
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState(Mutex::new(Session::default())))
        .setup(|app| {
            let show =
                MenuItem::with_id(app, "show", "Show Vault Cross Search", true, None::<&str>)?;
            let lock = MenuItem::with_id(app, "lock", "Lock all vaults", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &lock, &quit])?;
            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Vault Cross Search")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "lock" => {
                        if let Some(state) = app.try_state::<AppState>() {
                            if let Ok(mut session) = state.0.lock() {
                                session.clear();
                            }
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            unlock_vault,
            load_sample_project,
            search_entries,
            session_state,
            lock_vault,
            lock_all,
            open_entry
        ])
        .build(tauri::generate_context!())
        .expect("error while building Vault Cross Search");
    app.run(|handle, event| {
        if matches!(event, RunEvent::ExitRequested { .. } | RunEvent::Exit) {
            if let Some(state) = handle.try_state::<AppState>() {
                if let Ok(mut session) = state.0.lock() {
                    clear_session_for_exit(&mut session);
                }
            }
        }
    });
}
