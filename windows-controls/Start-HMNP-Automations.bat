@echo off
REM Launches the automation stack inside WSL Ubuntu via the helper script
wsl -d Ubuntu zsh -lic "/home/kenkarot/dev/hmnp/start-automation.sh"

