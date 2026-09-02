use keepass::{
    db::{Entry, Group, Value},
    Database, DatabaseKey,
};
use std::{fs, path::Path};

fn entry(title: &str, username: &str, url: &str) -> Entry {
    let mut entry = Entry::new();
    entry
        .fields
        .insert("Title".into(), Value::Unprotected(title.into()));
    entry
        .fields
        .insert("UserName".into(), Value::Unprotected(username.into()));
    entry
        .fields
        .insert("URL".into(), Value::Unprotected(url.into()));
    entry
}

fn main() {
    let mut database = Database::new(Default::default());
    let mut access = Group::new("Infrastructure / Access");
    access.entries.push(entry(
        "Acme VPN",
        "sample.operator",
        "https://vpn.acme.example",
    ));
    let mut operations = Group::new("Operations / On-call");
    operations.entries.push(entry(
        "Acme status",
        "sample.on-call",
        "https://status.acme.example",
    ));
    database.root.groups.push(access);
    database.root.groups.push(operations);

    let mut bytes = Vec::new();
    database
        .save(&mut bytes, DatabaseKey::new().with_password("sample-only"))
        .expect("save fake sample KDBX");
    let path = Path::new("src-tauri/resources/vault-cross-search-sample.kdbx");
    fs::create_dir_all(path.parent().expect("resource parent")).expect("create resources");
    fs::write(path, bytes).expect("write sample resource");
}
