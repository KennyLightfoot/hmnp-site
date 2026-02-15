@echo off
REM Stops the automation stack running inside WSL Ubuntu via the helper script
wsl -d Ubuntu zsh -lic "/home/kenkarot/dev/hmnp/stop-automation.sh"

