# Windows Automation Controls

This guide explains how to launch or stop the HMNP automation stack (PM2 agents + n8n) with one click from Windows, while the services continue to run inside WSL.

## Repo Helpers (WSL)

- `start-automation.sh` – runs `pnpm automation:start` from `/home/kenkarot/dev/hmnp`.
- `stop-automation.sh` – runs `pnpm automation:stop` from the same directory.

Both scripts live in the repo root, are executable, and can be called directly if you're already inside WSL.

## Windows Batch Wrappers

`windows-controls/Start-HMNP-Automations.bat` and `.../Stop-HMNP-Automations.bat` simply launch the repo helper scripts through WSL using `zsh -lic ...` so your regular zsh profile (`.zshrc`) runs. The helper scripts themselves also fall back to sourcing `~/.nvm/nvm.sh` if `pnpm` is missing, so they keep working even if the interactive PATH isn’t fully set up.

Copy these .bat files to your preferred Windows drive (`D:\HMNP-Controls` recommended) so they stay separate from your game libraries.

## Desktop Shortcuts (Automated Setup)

Run the provided PowerShell helper from **Windows** to copy the .bat files and create desktop shortcuts that launch minimized:

```
powershell -ExecutionPolicy Bypass -File "\\\\wsl$\\Ubuntu\\home\\kenkarot\\dev\\hmnp\\windows-controls\\setup-automation-shortcuts.ps1"
```

Optional parameters:

- `-DestinationFolder "D:\HMNP-Controls"` to pick a different working drive.

After the script finishes, you'll have two shortcuts on your desktop: **Start HMNP Automations** and **Stop HMNP Automations**.

## Usage Flow

1. **Starting your work session** – double-click the Start shortcut. PM2 boots the agents service and n8n inside WSL. Verify via `/admin/system-checks`.
2. **Before gaming** – double-click the Stop shortcut. PM2 tears down the same processes so they no longer consume CPU/RAM.
3. **Hotkeys later** – if you decide to add AutoHotkey, point your hotkeys at the same `.bat` files.

## Troubleshooting

- If `wsl` reports "distribution not found", update the `.bat` files to use your distro name (replace `Ubuntu`).
- If pnpm complains about missing env vars, ensure the repo `.env` files are loaded inside WSL before running the scripts.
- If Windows prevents the PowerShell script from running, open PowerShell as Administrator and re-run with `-ExecutionPolicy Bypass`.

