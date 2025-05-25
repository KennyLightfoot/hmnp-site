# Data Retention Policy
## Houston Mobile Notary Pros

**Version:** 1.0  
**Last Updated:** January 2025  
**Review Date:** January 2026

---

## 🎯 Purpose

This policy defines how long different types of data are retained in our database and when they should be archived or deleted. This helps maintain optimal database performance, comply with legal requirements, and manage storage costs.

---

## 📊 Data Categories & Retention Periods

### 🔐 **Authentication & Session Data**
| Data Type | Retention Period | Cleanup Method | Business Justification |
|-----------|------------------|----------------|----------------------|
| **Sessions** | Until expiration | Automatic cleanup | Security - expired sessions should be removed immediately |
| **Verification Tokens** | Until expiration | Automatic cleanup | Security - expired tokens are no longer valid |
| **Invitation Tokens** | 30 days | Automatic cleanup | Business - gives users reasonable time to respond |

### 📝 **System Logs & Monitoring**
| Data Type | Retention Period | Cleanup Method | Business Justification |
|-----------|------------------|----------------|----------------------|
| **Background Errors** | 30 days | Automatic cleanup | Debugging - keep recent errors for troubleshooting |
| **Download Logs** | 90 days | Automatic cleanup | Audit - track document access for security |
| **Notification Logs** | 90 days | Automatic cleanup | Compliance - track communications sent to clients |

### 👥 **Business Data**
| Data Type | Retention Period | Cleanup Method | Business Justification |
|-----------|------------------|----------------|----------------------|
| **Users** | Indefinite* | Manual review | Legal - customer records for ongoing business |
| **Bookings** | 7 years | Archive after 2 years | Legal - business records, tax requirements |
| **Assignments** | 7 years | Archive after 2 years | Legal - notarization records |
| **Payments** | 7 years | Archive after 2 years | Legal - financial records, tax requirements |
| **Documents** | 7 years | Archive after 2 years | Legal - notarized document copies |

### 💬 **Communication Data**
| Data Type | Retention Period | Cleanup Method | Business Justification |
|-----------|------------------|----------------|----------------------|
| **Comments** | 3 years | Archive | Business - project history and collaboration |
| **SMS/Email Records** | 2 years | Archive | Compliance - communication audit trail |

---

## 🤖 Automated Cleanup Schedule

### **Daily Cleanup (Via Application)**
- Delete expired sessions on user login
- Remove expired verification tokens during auth process

### **Weekly Cleanup (GitHub Actions)**
- Run every Monday at 2:00 AM UTC
- Clean expired sessions and tokens
- Remove old background errors (30+ days)
- Archive old logs (90+ days)

### **Monthly Review**
- Analyze database usage and growth
- Review retention policy effectiveness
- Identify additional cleanup opportunities

### **Quarterly Archive**
- Archive completed bookings older than 2 years
- Archive completed assignments older than 2 years
- Review archived data access needs

---

## 📂 Archive Strategy

### **What Gets Archived**
1. **Completed Bookings** (2+ years old)
2. **Completed Assignments** (2+ years old)
3. **Old Payment Records** (2+ years old)
4. **Historical Documents** (2+ years old)

### **Archive Location**
- **Primary**: Neon Branch with archive storage
- **Backup**: Encrypted cloud storage (AWS S3/Google Cloud)

### **Archive Access**
- Archived data accessible via admin panel
- Export capability for legal/audit requests
- Restore process documented for compliance

---

## 🛡️ Compliance Considerations

### **Legal Requirements**
- **Tax Records**: 7 years (IRS requirement)
- **Business Records**: 7 years (general business practice)
- **Notarization Records**: Per state requirements (varies by state)

### **GDPR/Privacy Compliance**
- **Right to be Forgotten**: User deletion process documented
- **Data Minimization**: Only keep necessary data
- **Purpose Limitation**: Data retained only for original purpose

### **Industry Standards**
- **PCI DSS**: Credit card data handling (if applicable)
- **SOC 2**: Data security and availability

---

## 🔧 Implementation

### **Automated Scripts**
```bash
# Weekly cleanup
node scripts/cleanup-database.cjs --confirm

# Monthly analysis
node scripts/analyze-db-usage.cjs

# Quarterly archive (to be implemented)
node scripts/archive-old-data.cjs --confirm
```

### **Manual Processes**
1. **User Deletion Requests**: Handle within 30 days
2. **Legal Holds**: Suspend normal deletion for specific records
3. **Data Export Requests**: Provide within 30 days

---

## 📈 Monitoring & Metrics

### **Database Health Metrics**
- Total database size
- Growth rate per month
- Storage by table
- Cleanup effectiveness

### **Retention Metrics**
- Records cleaned per period
- Archive size and growth
- Policy compliance rate

### **Alert Thresholds**
- Database size approaching plan limits
- Cleanup failures
- Unusual data growth patterns

---

## 🔄 Review & Updates

### **Regular Reviews**
- **Monthly**: Cleanup effectiveness
- **Quarterly**: Policy compliance
- **Annually**: Full policy review

### **Update Triggers**
- Legal requirement changes
- Business process changes
- Technology platform changes
- Security incident learnings

---

## 👥 Responsibilities

### **Development Team**
- Implement automated cleanup scripts
- Monitor database performance
- Update retention logic as needed

### **Business Team**
- Review business data retention needs
- Approve policy changes
- Handle legal/compliance requests

### **System Administrator**
- Monitor automated cleanup jobs
- Manage archive storage
- Handle emergency data recovery

---

## 📞 Contact & Support

For questions about this policy or data retention requests:

- **Technical Issues**: Development Team
- **Business Questions**: Operations Manager  
- **Legal/Compliance**: Legal Team
- **Emergency**: On-call system administrator

---

## 📝 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | January 2025 | Initial policy creation | AI Assistant |

---

**Note**: This policy should be reviewed by legal counsel to ensure compliance with applicable laws and regulations in your jurisdiction. 