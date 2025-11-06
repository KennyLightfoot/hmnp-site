# Backup, Restore, and Disaster Recovery

## Database (PostgreSQL)

- Daily logical backup: `pg_dump --no-owner --format=custom $DATABASE_URL > backups/hmnp_$(date +%F).dump`
- Restore: `pg_restore --clean --if-exists --no-owner --dbname=$DATABASE_URL backups/<file>.dump`
- Retention: 14 days daily, 8 weeks weekly, 12 months monthly

## Environment & Secrets

- Store .env in Vercel/CI secrets; audit quarterly
- Rotate secrets annually or on incident

## DR Plan

- RTO: 4h, RPO: 24h
- Runbook: provision DB → restore latest dump → re-point app → smoke tests

