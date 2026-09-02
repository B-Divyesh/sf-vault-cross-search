#!/bin/sh
set -eu

REPO="https://github.com/B-Divyesh/sf-vault-cross-search"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT HUP INT TERM

case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) PLATFORM="macos-arm64" ;;
  Darwin-x86_64) PLATFORM="macos-x64" ;;
  Linux-x86_64) PLATFORM="linux-x64" ;;
  *) echo "Vault Cross Search does not yet ship for $(uname -s) $(uname -m)." >&2; exit 1 ;;
esac

MANIFEST="$TMP_DIR/latest.json"
curl -fsSL "$REPO/releases/latest/download/latest.json" -o "$MANIFEST"
URL="$(sed -n "/\"$PLATFORM\"/,/}/s/.*\"url\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" "$MANIFEST" | head -1)"
SHA="$(sed -n "/\"$PLATFORM\"/,/}/s/.*\"sha256\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" "$MANIFEST" | head -1)"
[ -n "$URL" ] && [ -n "$SHA" ] || { echo "Release manifest is missing $PLATFORM." >&2; exit 1; }
ASSET="$TMP_DIR/$(basename "$URL")"
curl -fL "$URL" -o "$ASSET"
ACTUAL="$(shasum -a 256 "$ASSET" | awk '{print $1}')"
[ "$ACTUAL" = "$SHA" ] || { echo "Checksum verification failed; nothing was installed." >&2; exit 1; }

if [ "$(uname -s)" = "Darwin" ]; then
  MOUNT="$TMP_DIR/mount"; mkdir "$MOUNT"
  hdiutil attach "$ASSET" -mountpoint "$MOUNT" -nobrowse -quiet
  APP="$(find "$MOUNT" -maxdepth 1 -name '*.app' -print -quit)"
  [ -n "$APP" ] || { hdiutil detach "$MOUNT" -quiet; echo "No application found in disk image." >&2; exit 1; }
  cp -R "$APP" /Applications/
  hdiutil detach "$MOUNT" -quiet
  echo "Installed Vault Cross Search in /Applications. The installer is not signed by a verified publisher."
else
  INSTALL_DIR="${VCS_INSTALL_DIR:-$HOME/.local/bin}"
  DEST="$INSTALL_DIR/vault-cross-search.AppImage"
  mkdir -p "$INSTALL_DIR"
  cp "$ASSET" "$DEST"; chmod +x "$DEST"
  echo "Installed verified AppImage to $DEST"
  echo "Add $INSTALL_DIR to PATH if it is not already there."
fi
