#!/usr/bin/env bash
# ==============================================================================
# AegisCare - Automated Google Cloud Run Deployment Script (Linux/macOS/Cloud Shell)
# ==============================================================================

set -e

echo "==> [1/4] Checking Google Cloud SDK..."
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud is not installed or not in PATH."
    echo "Install gcloud or open this repository directly in Google Cloud Shell:"
    echo "https://shell.cloud.google.com"
    exit 1
fi

GCP_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -z "$GCP_PROJECT" ] || [ "$GCP_PROJECT" = "(unset)" ]; then
    read -p "Enter your Google Cloud Project ID: " GCP_PROJECT
    gcloud config set project "$GCP_PROJECT"
fi

echo "==> [2/4] Selected Project: $GCP_PROJECT"
echo "==> [3/4] Enabling required Cloud APIs (run.googleapis.com, cloudbuild.googleapis.com)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com --quiet

echo "==> [4/4] Deploying AegisCare to Google Cloud Run from source..."
gcloud run deploy aegiscare-platform \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1

SERVICE_URL=$(gcloud run services describe aegiscare-platform --platform managed --region us-central1 --format="value(status.url)")

echo "====================================================================="
echo " 🎉 AegisCare Platform is LIVE on Google Cloud Run!"
echo " 🌐 Service URL: $SERVICE_URL"
echo "====================================================================="
