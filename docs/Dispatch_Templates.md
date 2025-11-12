<!-- Dispatch Templates v2 -->
# Communication Templates

Use these templates within GHL sequences and manual outreach. Replace tokens like `{{client_name}}` with actual data.

## 1. Assignment Confirmation (Client)
```
Hi {{client_name}}, this is Houston Mobile Notary Pros. Your {{service_type}} appointment is confirmed for {{appointment_time}} with {{contractor_name}}. Reply YES to confirm, or call {{dispatch_number}} to adjust.
```

## 2. Assignment Confirmation (Contractor)
```
HMNP Dispatch: {{service_type}} booked for {{appointment_time}} at {{service_address}}. Documents: {{document_summary}}. Reply ACCEPT or DECLINE within 5 minutes.
```

## 3. Reassignment Notice (Client)
```
Hi {{client_name}}, due to an unexpected issue we reassigned your notary. {{new_contractor_name}} is en route with updated ETA {{eta}}. Thank you for your patience.
```

## 4. Reassignment Notice (Contractor)
```
HMNP Dispatch: Urgent reassignment available at {{service_address}} for {{service_type}} starting {{appointment_time}}. Travel tier: {{travel_tier}}. Reply ACCEPT to confirm.
```

## 5. Completion Follow-Up
```
Hi {{client_name}}, thank you for choosing Houston Mobile Notary Pros. Your service is complete. Receipt and document summary have been emailed. We would appreciate a quick review: {{review_link}}.
```

## 6. Payment Outstanding (On-Site Fallback)
```
Hello {{client_name}}, we still need to collect the remaining balance of {{balance_due}} for today's notarization. Please complete payment here: {{payment_link}}. Thank you!
```

Maintain and localize these templates in GHL for version control. Update tokens if integration identifiers change.

