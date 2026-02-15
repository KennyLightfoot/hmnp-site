param(
    [string]$DestinationFolder = "D:\HMNP-Controls"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$startBatch = Join-Path $scriptDir "Start-HMNP-Automations.bat"
$stopBatch = Join-Path $scriptDir "Stop-HMNP-Automations.bat"

if (-not (Test-Path $startBatch) -or -not (Test-Path $stopBatch)) {
    throw "Batch files not found in $scriptDir. Run this script from the repo's windows-controls folder."
}

New-Item -ItemType Directory -Force -Path $DestinationFolder | Out-Null
Copy-Item -Path $startBatch -Destination $DestinationFolder -Force
Copy-Item -Path $stopBatch -Destination $DestinationFolder -Force

$shortcuts = @(
    @{
        Name = "Start HMNP Automations"
        Target = Join-Path $DestinationFolder "Start-HMNP-Automations.bat"
    },
    @{
        Name = "Stop HMNP Automations"
        Target = Join-Path $DestinationFolder "Stop-HMNP-Automations.bat"
    }
)

$desktopPath = [Environment]::GetFolderPath("Desktop")
$wshShell = New-Object -ComObject WScript.Shell

foreach ($shortcut in $shortcuts) {
    $lnkPath = Join-Path $desktopPath ("{0}.lnk" -f $shortcut.Name)
    $shortcutObj = $wshShell.CreateShortcut($lnkPath)
    $shortcutObj.TargetPath = $shortcut.Target
    $shortcutObj.WorkingDirectory = $DestinationFolder
    $shortcutObj.WindowStyle = 7 # Start minimized to avoid flashing terminals
    $shortcutObj.Save()
}

Write-Host "Shortcut setup complete. Files copied to $DestinationFolder and shortcuts created on $desktopPath."

