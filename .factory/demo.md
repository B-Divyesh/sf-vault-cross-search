# Vault Cross Search demo

Open https://vault-cross-search.sociobot.in/?demo=1 or choose **Try it with sample data** on the landing page. `/demo/` remains a canonical alias.

The browser-only sandbox contains three realistic sample vault labels:

- Personal.kdbx — Northstar credit union and a library card.
- Work.kdbx — Acme VPN and Acme status.
- Archive.kdbx — Cloud console and travel insurance.

The initial query is acme, so two owned results appear immediately. Search river or operations for other records. The demo has no file picker or desktop bridge. It persists only under demo:vault-cross-search:sample-v1 in browser localStorage. **Reset demo** removes that key, restores the bundled records, and clears the query. **Start for real** removes the demo key and returns to the desktop-app download page.

The demo is deliberately separate from desktop-app data. It does not share the app’s local webview storage or unlock any actual vault.
