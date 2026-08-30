# Vault Cross Search demo

Open https://vault-cross-search.sociobot.in/demo/ or choose **Try it with sample data** on the landing page.

The browser-only sandbox contains three realistic sample vault labels:

- Personal.kdbx — Northstar credit union and a library card.
- Work.kdbx — Acme VPN and Acme status.
- Archive.kdbx — Cloud console and travel insurance.

Search acme, river, or operations to see cross-vault results and the owning vault. The demo never reads a local .kdbx file or calls a product API. It persists only under demo:vault-cross-search:sample-v1 in browser localStorage. **Reset demo** removes that key and restores the bundled records. **Start for real** removes it and returns to the desktop-app download page.

The demo is deliberately separate from desktop-app data. It does not share the app’s local webview storage or unlock any actual vault.
