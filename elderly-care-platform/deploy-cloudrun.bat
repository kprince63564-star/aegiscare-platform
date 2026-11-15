@echo off
REM ==============================================================================
REM AegisCare - Automated Google Cloud Run Deployment Script (Windows)
REM ==============================================================================

echo [1/4] Checking Google Cloud CLI authentication...
where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Google Cloud SDK 'gcloud' is not found in PATH.
    echo Please install Google Cloud SDK from https://cloud.google.com/sdk/docs/install
    echo or run using Cloud Shell directly in your browser: https://shell.cloud.google.com
    pause
    exit /b 1
)

echo [2/4] Verifying GCP Project...
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set GCP_PROJECT=%%i

if "%GCP_PROJECT%"=="" (
    echo No active GCP project configured.
    set /p GCP_PROJECT="Enter your Google Cloud Project ID: "
    gcloud config set project %GCP_PROJECT%
)

echo Deploying to Project: %GCP_PROJECT%
echo [3/4] Building and deploying directly from source to Google Cloud Run...

gcloud run deploy aegiscare-platform ^
    --source . ^
    --platform managed ^
    --region us-central1 ^
    --allow-unauthenticated ^
    --port 8080 ^
    --memory 512Mi ^
    --cpu 1

if %errorlevel% equ 0 (
    echo.
    echo ===============================================================
    echo [SUCCESS] AegisCare is deployed and live on Google Cloud Run!
    echo Fetching URL...
    gcloud run services describe aegiscare-platform --platform managed --region us-central1 --format="value(status.url)"
    echo ===============================================================
) else (
    echo [ERROR] Cloud Run deployment encountered an error.
)

pause
