@echo off
REM ==============================================================================
REM AegisCare - Automated GitHub Repository Initialization & Push (Windows)
REM ==============================================================================

echo [1/3] Checking Git and GitHub CLI...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Initializing local git repository...
git init
git checkout -b main
git add .
git commit -m "feat: initial commit of AegisCare elderly care & medication management platform"

echo.
where gh >nul 2>nul
if %errorlevel% equ 0 (
    echo [2/3] GitHub CLI detected. Creating remote repository on GitHub...
    gh repo create aegiscare-platform --public --source=. --remote=origin --push
    if %errorlevel% equ 0 (
        echo.
        echo ===============================================================
        echo [SUCCESS] GitHub repository created and pushed!
        gh repo view --web
        echo ===============================================================
        pause
        exit /b 0
    )
)

echo [3/3] To push to your GitHub account manually:
echo   1. Create an empty repository named 'aegiscare-platform' at https://github.com/new
echo   2. Run:
echo      git remote add origin https://github.com/YOUR_USERNAME/aegiscare-platform.git
echo      git branch -M main
echo      git push -u origin main
echo.
pause
