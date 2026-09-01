$ErrorActionPreference = "Stop"
$repo = "https://github.com/B-Divyesh/sf-vault-cross-search"
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ("vcs-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $temp | Out-Null
try {
  $manifestPath = Join-Path $temp "latest.json"
  Invoke-WebRequest "$repo/releases/latest/download/latest.json" -OutFile $manifestPath
  $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
  $asset = $manifest.platforms."windows-x64"
  if (-not $asset.url -or -not $asset.sha256) { throw "Release manifest is missing windows-x64." }
  $installer = Join-Path $temp ([System.IO.Path]::GetFileName($asset.url))
  Invoke-WebRequest $asset.url -OutFile $installer
  $actual = (Get-FileHash $installer -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne $asset.sha256.ToLowerInvariant()) { throw "Checksum verification failed; nothing was installed." }
  if ($installer.EndsWith(".msi")) {
    Start-Process msiexec.exe -ArgumentList "/i `"$installer`"" -Wait
  } else {
    Start-Process $installer -Wait
  }
  Write-Host "Installed Vault Cross Search from a verified release asset."
  Write-Host "Publisher signing is not configured, so Windows may show SmartScreen."
} finally {
  Remove-Item -Recurse -Force $temp -ErrorAction SilentlyContinue
}
