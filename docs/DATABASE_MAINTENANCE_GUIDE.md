# Database Maintenance Quick Reference Guide

## 🚀 Quick Commands

### Analysis & Monitoring
```bash
# Analyze database usage and size
pnpm db:analyze

# Check what can be cleaned up (safe, no changes)
pnpm db:cleanup

# Check what can be archived (safe, no changes)
pnpm db:archive
```

### Cleanup Operations
```bash
# Run cleanup with confirmation (DELETES DATA)
pnpm db:cleanup:confirm

# Run archive analysis with confirmation (MOVES DATA)
pnpm db:archive:confirm

# Full maintenance (analyze + cleanup)
pnpm db:maintenance
```

---

## 🤖 Automated Setup

### GitHub Actions
- **Schedule**: Every Monday at 2:00 AM UTC
- **Manual**: Can be triggered via GitHub Actions tab
- **Location**: `.github/workflows/database-cleanup.yml`

### Current Automation Status
✅ **Weekly Cleanup** - Automated via GitHub Actions  
⚠️ **Archive Process** - Manual (simulation mode)  
📊 **Monitoring** - Database analysis included  

---

## 📊 Current Database Status

Based on latest analysis:
- **Database Size**: ~9MB (well within free tier)
- **Tables**: Mostly empty (new database)
- **Cleanup Needed**: None currently
- **Recommendation**: Monitor as data grows

---

## 🚨 Alert Thresholds

### Free Plan (0.5GB limit)
- **Green**: 0-200MB (< 40% usage)
- **Yellow**: 200-400MB (40-80% usage)  
- **Red**: 400MB+ (> 80% usage) - **UPGRADE NEEDED**

### Launch Plan (10GB limit)
- **Green**: 0-5GB (< 50% usage)
- **Yellow**: 5-8GB (50-80% usage)
- **Red**: 8GB+ (> 80% usage)

---

## 🔄 Regular Tasks

### Weekly (Automated)
- ✅ Database analysis
- ✅ Cleanup expired sessions/tokens
- ✅ Remove old error logs
- ✅ Archive old notification logs

### Monthly (Manual)
- [ ] Review database growth trends
- [ ] Check archive storage usage
- [ ] Update retention policy if needed
- [ ] Verify cleanup automation is working

### Quarterly (Manual)
- [ ] Run archive simulation
- [ ] Review data retention policy
- [ ] Plan for archive storage setup
- [ ] Evaluate Neon plan needs

---

## 🚨 Emergency Procedures

### Database Full
1. **Immediate**: Run manual cleanup
   ```bash
   pnpm db:cleanup:confirm
   ```
2. **Short-term**: Upgrade Neon plan
3. **Long-term**: Implement archiving

### Cleanup Failure
1. Check GitHub Actions logs
2. Run manual analysis: `pnpm db:analyze`
3. Check database connectivity
4. Contact support if needed

### Data Recovery
1. Check Neon console for backups
2. Use point-in-time restore if available
3. Contact Neon support for assistance

---

## 📞 Support Contacts

- **Database Issues**: Check Neon console
- **Script Problems**: Review error logs
- **Policy Questions**: Review `DATA_RETENTION_POLICY.md`
- **Emergency**: Use Neon support channels

---

## 🔗 Related Files

- `docs/DATA_RETENTION_POLICY.md` - Full retention policy
- `scripts/analyze-db-usage.cjs` - Database analysis
- `scripts/cleanup-database.cjs` - Cleanup operations
- `scripts/archive-old-data.cjs` - Archive simulation
- `.github/workflows/database-cleanup.yml` - Automation

---

**Last Updated**: January 2025  
**Next Review**: February 2025 