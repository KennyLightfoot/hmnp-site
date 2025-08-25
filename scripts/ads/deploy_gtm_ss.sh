#!/usr/bin/env bash
set -euo pipefail

# Deploy GTM Server-Side on Cloud Run (requires gcloud installed and authenticated)

SERVICE_NAME=${1:-gtm-ss}
REGION=${2:-us-central1}
IMAGE=gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable

echo "Deploying $SERVICE_NAME to region $REGION..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --region "$REGION" \
  --allow-unauthenticated \
  --platform managed | cat

echo "Done. Configure your web tags to send to the returned URL."


