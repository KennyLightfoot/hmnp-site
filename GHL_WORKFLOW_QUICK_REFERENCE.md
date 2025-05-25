# GoHighLevel Workflow Quick Reference Guide

## How to Create Workflows in GHL

### Step 1: Access Workflows
1. Log into GoHighLevel
2. Navigate to **Automation** → **Workflows**
3. Click **"+ Create Workflow"**
4. Name your workflow clearly (e.g., "New Lead Welcome Sequence")

### Step 2: Add Trigger
1. Click **"Add New Trigger"**
2. Choose trigger type:
   - **Contact Tag** - When a tag is added/removed
   - **Contact Created** - When new contact is added
   - **Appointment Status** - When appointment changes
   - **Opportunity Stage Change** - When deal moves stages
   - **Form Submitted** - When specific form is submitted
   - **Custom Webhook** - When external event occurs

### Step 3: Add Actions
Click the **"+"** button after trigger to add actions:

#### Common Actions to Use:

**1. Send SMS/Email**
- Action: "Send SMS" or "Send Email"
- Use merge fields: `{{contact.first_name}}`, `{{contact.email}}`, etc.
- Check "Only send if contact has given consent" for SMS

**2. Add/Remove Tags**
- Action: "Add Tag" or "Remove Tag"
- Enter tag name exactly as created

**3. Update Custom Fields**
- Action: "Update Contact"
- Select custom fields to update
- Use dynamic values or static text

**4. Wait Steps**
- Action: "Wait"
- Options:
  - Wait for X minutes/hours/days
  - Wait until specific time
  - Wait until date/time in custom field

**5. If/Else Conditions**
- Action: "If/Else"
- Set conditions based on:
  - Tags
  - Custom fields
  - Contact properties
  - Previous actions

**6. HTTP POST (Webhook)**
- Action: "Custom Webhook"
- URL: Your webhook endpoint
- Method: POST
- Headers: `Content-Type: application/json`
- Body: JSON with merge fields

**7. Create Task**
- Action: "Create Task"
- Set title, description, assignee
- Set due date/time
- Set priority

### Step 4: Save and Publish
1. Click **"Save"** to save draft
2. Click **"Publish"** to activate workflow
3. Test with a contact before full deployment

---

## Workflow Setup Checklist

### Before Creating Workflows:
- [ ] All custom fields created
- [ ] All tags created
- [ ] Email/SMS templates ready
- [ ] Webhook endpoints tested
- [ ] Team members assigned for tasks

### Essential Workflows to Create:

#### 1. Lead Management (4 workflows)
- [ ] New Lead Welcome Sequence
- [ ] Hot Prospect Follow-up
- [ ] Quote Follow-up Automation
- [ ] Long-term Nurture

#### 2. Booking & Service (4 workflows)
- [ ] Booking Confirmation & Preparation
- [ ] Appointment Reminders
- [ ] Service Completion Follow-up
- [ ] No-Show Handling

#### 3. Payment (4 workflows)
- [ ] Payment Confirmation
- [ ] Payment Reminders
- [ ] Failed Payment Recovery
- [ ] Refund Processing

#### 4. Reviews & Feedback (3 workflows)
- [ ] Post-Service Feedback Request
- [ ] Review Request Sequence
- [ ] Testimonial Collection

---

## Common Workflow Patterns

### Pattern 1: Tag-Based Trigger with Follow-up
```
Trigger: Tag Added → "Status:New_Lead"
├── Wait: 5 minutes
├── Send SMS (if consent)
├── Send Email
├── Create Task
├── Wait: 24 hours
└── If/Else: Check if contacted
    ├── If NO: Send follow-up
    └── If YES: End
```

### Pattern 2: Time-Based Reminders
```
Trigger: Appointment Status → Scheduled
├── Branch 1: Wait until 24hr before → Send reminder
├── Branch 2: Wait until 2hr before → Send reminder
└── Branch 3: Wait until 1hr before → Send final reminder
```

### Pattern 3: Progressive Follow-up
```
Trigger: Tag Added → "Status:Quote_Sent"
├── Wait: 24 hours
├── Send Email #1
├── Wait: 2 days
├── If no booking → Send SMS
├── Wait: 3 days
└── If still no booking → Send discount offer
```

### Pattern 4: Conditional Routing
```
Trigger: Form Submitted
└── If/Else: Service Type
    ├── If "Standard Notary" → Route to standard workflow
    ├── If "Loan Signing" → Route to loan workflow
    └── If "Emergency" → Route to urgent workflow
```

---

## Troubleshooting Common Issues

### Workflow Not Triggering
1. Check workflow is "Published" not "Draft"
2. Verify trigger conditions match exactly
3. Check contact has required tags/fields
4. Look at workflow history for errors

### Actions Not Executing
1. Check wait times haven't passed
2. Verify If/Else conditions
3. Ensure SMS consent for SMS actions
4. Check merge fields exist

### Testing Workflows
1. Create test contact
2. Manually add trigger (tag, etc.)
3. Watch workflow history
4. Check all actions complete
5. Verify timing is correct

---

## Pro Tips

1. **Name Workflows Clearly**: Use format "Category - Specific Action"
2. **Use Folders**: Organize workflows by category
3. **Add Notes**: Document complex logic in workflow notes
4. **Test First**: Always test with single contact before bulk
5. **Monitor Performance**: Check workflow analytics weekly
6. **Version Control**: Clone workflows before major changes
7. **Error Handling**: Add fallback actions for critical workflows

---

## Quick Action Reference

| Action | When to Use | Key Settings |
|--------|-------------|--------------|
| Send SMS | Immediate communication | Check consent, use merge fields |
| Send Email | Detailed information | Use templates, personalize |
| Add Tag | Track status/progress | Exact tag name required |
| Wait | Delay next action | Time-based or until specific date |
| If/Else | Conditional logic | Based on tags, fields, or actions |
| HTTP POST | Sync with external system | JSON body with merge fields |
| Create Task | Human intervention needed | Assign to team, set priority |
| Update Field | Store data | Use dynamic or static values |

---

**Remember**: Workflows in GHL handle the automation flow, while your codebase handles the business logic when webhooks are received. 