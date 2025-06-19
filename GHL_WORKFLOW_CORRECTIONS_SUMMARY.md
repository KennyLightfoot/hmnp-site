# 🔧 **GHL WORKFLOW CORRECTIONS SUMMARY**
**Quick Reference for Fixing Time-Based Actions**

## **❌ WHAT'S WRONG IN THE CURRENT GUIDE**

### **1. Workflow 2 - Step 5: Create Preparation Task**
```
INCORRECT:
- Create Task
- Due: 2 hours before appointment ❌
```
**Problem:** GHL doesn't support "2 hours before {{custom_field}}" as a due date

### **2. Workflow 2 - Step 6: Wait Until 24 Hours Before**
```
INCORRECT:
- Wait Until
- Date/Time: {{appointment_date}} minus 24 hours ❌
```
**Problem:** Wait Until doesn't support calculations with custom fields

### **3. Workflow 2 - Step 11: Wait Until 2 Hours Before**
```
INCORRECT:
- Wait Until
- Date/Time: {{appointment_date}} minus 2 hours ❌
```
**Problem:** Same issue - no custom field calculations

### **4. Workflow 2 - Step 14: Create Departure Task**
```
INCORRECT:
- Create Task
- Due: 1 hour ❌
```
**Problem:** Unclear if this means "in 1 hour" or "1 hour before appointment"

### **5. Workflow 4 - Step 4: Create Urgent Task**
```
INCORRECT:
- Create Task
- Due: 5 minutes ❌
```
**Problem:** Should be "Now" for emergency tasks

### **6. Workflow 5 - Step 2: Create Booking Task**
```
INCORRECT:
- Create Task
- Due Date: 30 minutes ❌
```
**Problem:** Should specify "Now + 30 minutes" or just "Now"

---

## **✅ CORRECT PATTERNS TO USE**

### **Pattern 1: Time-Based Task Creation**
```yaml
CORRECT WAY:
1. Set Event Start Date
   - Type: Custom Field
   - Field: appointment_datetime

2. Wait
   - Wait For: Event/Appointment Time
   - Until: Before
   - Time: 2 hours 0 minutes
   - If past: Move to next step

3. Create Task
   - Title: "Prepare for appointment"
   - Due: Now ✅
   - Priority: High
```

### **Pattern 2: Multiple Time-Based Reminders**
```yaml
CORRECT WAY:
1. Set Event Start Date (once at beginning)

2. For 24-hour reminder:
   - Wait → Event/Appointment Time → Before → 24 hours
   - Send reminder
   - Add tag

3. For 2-hour reminder:
   - Wait → Event/Appointment Time → Before → 2 hours
   - Send reminder
   - Create task (Due: Now)
```

### **Pattern 3: Immediate Tasks**
```yaml
For urgent/emergency:
- Create Task
- Due: Now ✅
- Priority: Urgent

For scheduled follow-up:
- Create Task
- Due: Now + 30 minutes ✅
- Priority: Normal
```

---

## **📝 STEP-BY-STEP FIX FOR WORKFLOW 2**

### **Replace Current Steps 5-16 with:**

```yaml
Step 5: Set Event Start Date
- Action: Set Event Start Date
- Type: Custom Field
- Field: appointment_date (ensure it includes time)

Step 6: Schedule 2-Hour Prep Task
- Action: Wait
- Wait For: Event/Appointment Time
- Until: Before
- Time: 2 hours
- If past: Move to next step
- Action: Create Task
- Title: "Prepare for {{firstName}}"
- Due: Now
- Priority: High

Step 7: Add workflow tag
- Action: Add Tag
- Tag: workflow:confirmation_sent

Step 8: Wait for 24-Hour Mark
- Action: Wait
- Wait For: Event/Appointment Time
- Until: Before
- Time: 24 hours
- If past: Skip outbound communication

Step 9-10: Send 24-hour reminder (existing)

Step 11: Update tag
- Action: Add Tag
- Tag: Reminder:24hr_Sent

Step 12: Wait for 2-Hour Mark
- Action: Wait
- Wait For: Event/Appointment Time
- Until: Before
- Time: 2 hours
- If past: Move to next step

Step 13-14: Send 2-hour reminder (existing)

Step 15: Create Departure Task
- Action: Create Task
- Title: "DEPART NOW"
- Due: Now
- Priority: Urgent

Step 16: Final tags (existing)
```

---

## **🚀 QUICK FIXES FOR ALL WORKFLOWS**

### **Workflow 1 - Payment Follow-up**
- Step 8: Change task due from "2 hours" to "Now + 2 hours"

### **Workflow 2 - Booking Reminders**
- Add Set Event Start Date at beginning
- Fix all Wait Until to Wait for Event/Appointment Time
- Change all task due dates to "Now"

### **Workflow 3 - Phone Booking**
- No time-based issues

### **Workflow 4 - Emergency**
- Step 4: Change task due from "5 minutes" to "Now"

### **Workflow 5 - New Booking**
- Step 2: Change task due from "30 minutes" to "Now + 30 minutes"

### **Workflow 6 - Post-Service**
- Add proper structure (not detailed in current guide)

### **Workflow 7 - Lead Nurturing**
- Use standard Wait actions (already correct)

---

## **💡 REMEMBER**

1. **Always use Set Event Start Date** for appointment-based timing
2. **Create Task only supports:**
   - Now
   - Now + X minutes/hours/days
   - Specific date/time (not relative to custom fields)
3. **Wait actions should use:**
   - Time Delay for fixed waits
   - Event/Appointment Time for appointment-relative waits
4. **Test with real appointments** 3+ days in the future

---

## **📋 IMPLEMENTATION CHECKLIST**

- [ ] Update Workflow 2 with Set Event Start Date
- [ ] Fix all "Wait Until" actions
- [ ] Correct all task due dates
- [ ] Test with future appointment
- [ ] Document any custom modifications
- [ ] Train team on new pattern 