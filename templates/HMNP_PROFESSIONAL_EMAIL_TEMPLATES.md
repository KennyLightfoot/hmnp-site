# 📧 **HOUSTON MOBILE NOTARY PROS - PROFESSIONAL EMAIL TEMPLATES**
**High-Quality GoHighLevel Email Templates for Automated Workflows**

## 📋 **TEMPLATE OVERVIEW**

This document contains professionally crafted email templates for all HMNP workflows. Each template includes:
- ✅ **Proper GHL Field Mapping** - Correct custom field references
- 🎨 **Professional Styling** - Consistent branding and formatting
- 📱 **Mobile-Responsive Design** - Works on all devices
- 🔧 **Conditional Logic** - Dynamic content based on contact data
- 📊 **Tracking Elements** - Built-in analytics support

---

## 🔧 **REQUIRED CUSTOM FIELDS**

Before using these templates, ensure these custom fields exist in your GHL account:

```
Contact Fields:
- booking_id (Text)
- payment_url (Text)  
- payment_amount (Number)
- urgency_level (Text)
- service_requested (Text)
- service_address (Text)
- appointment_date (Date)
- appointment_time (Text)
- service_price (Number)
- hours_old (Number)
- preferred_datetime (DateTime)
- referral_link (Text)
```

---

## 💳 **TEMPLATE 1: PAYMENT FOLLOW-UP (HIGH URGENCY)**

**Subject:** `🚨 Action Required: Secure Your HMNP Appointment`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Urgent Payment Required</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .greeting { font-size: 22px; color: #b71c1c; margin-bottom: 20px; font-weight: bold; }
        .intro { margin-bottom: 30px; font-size: 16px; line-height: 1.7; }
        .details-box { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #dee2e6;}
        .details-box .title { color: #333; font-weight: bold; margin-bottom: 15px; font-size: 18px; text-align: center; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; font-weight: 500; text-align: right; }
        .detail-value.important { font-size: 18px; font-weight: bold; color: #d32f2f; }
        .alert-box { background-color: #ffebee; border: 2px solid #d32f2f; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .alert-box .title { color: #d32f2f; font-weight: bold; margin-bottom: 10px; font-size: 18px; display: flex; align-items: center; }
        .alert-icon { font-size: 24px; margin-right: 10px; }
        .button-wrapper { text-align: center; margin: 40px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(211, 47, 47, 0.3); }
        .contact-section { background-color: #333; color: white; padding: 25px 20px; text-align: center; }
        .contact-title { font-size: 18px; margin-bottom: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Houston Mobile Notary Pros</div>
            <div class="tagline">URGENT: Action Required</div>
        </div>
        <div class="content">
            <div class="greeting">Hi {{contact.firstName}},</div>
            <div class="intro">
                This is a friendly reminder that your scheduled mobile notary appointment requires payment to be confirmed. To prevent your time slot from being automatically released to another client, please complete the payment at your earliest convenience.
            </div>

            <div class="alert-box">
                <div class="title"><span class="alert-icon">⏰</span>Time Sensitive</div>
                <p>Payment for this appointment has been pending for <strong>{{contact.custom_fields.hours_old}} hours</strong>. To ensure fairness to all clients, unconfirmed appointments are automatically released after 48 hours.</p>
            </div>

            <div class="details-box">
                <div class="title">📋 Appointment Details</div>
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">{{contact.custom_fields.service_requested}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{contact.custom_fields.appointment_date}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">{{contact.custom_fields.appointment_time}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{contact.custom_fields.service_address}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Due:</span>
                    <span class="detail-value important">${{contact.custom_fields.payment_amount}}</span>
                </div>
            </div>

            <div class="button-wrapper">
                <a href="{{contact.custom_fields.payment_url}}" class="button">💳 SECURE YOUR APPOINTMENT</a>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px;">
                <strong>Questions or payment issues?</strong><br>
                Call or text immediately: <a href="tel:8326174285" style="color: #d32f2f;">832-617-4285</a>
            </p>
        </div>
        <div class="contact-section">
            <div class="contact-title">Kenneth Lightfoot | Certified Notary Public</div>
            <a href="mailto:info@houstonmobilenotarypros.com" style="color: #fff; text-decoration: none;">info@houstonmobilenotarypros.com</a> | 
            <a href="tel:8326174285" style="color: #fff; text-decoration: none;">832-617-4285</a>
        </div>
        <div class="footer">
            <p><strong>Houston Mobile Notary Pros</strong></p>
            <p>© 2024 Houston Mobile Notary Pros. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 💳 **TEMPLATE 2: PAYMENT FOLLOW-UP (STANDARD)**

**Subject:** `💳 Just One More Step: Confirm Your Notary Appointment`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Payment</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .greeting { font-size: 22px; color: #1565c0; margin-bottom: 20px; font-weight: bold; }
        .intro { margin-bottom: 30px; font-size: 16px; line-height: 1.7; }
        .details-box { background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .details-box .title { color: #1565c0; font-weight: bold; margin-bottom: 15px; font-size: 18px; text-align: center; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #d0e7f9; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; font-weight: 500; text-align: right; }
        .detail-value.important { font-size: 18px; font-weight: bold; color: #1976d2; }
        .section { margin-bottom: 20px; padding: 20px; border-left: 4px solid #1976d2; background-color: #f8f9fa; border-radius: 0 8px 8px 0; }
        .section-title { color: #1565c0; font-size: 18px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; }
        .section-icon { margin-right: 10px; font-size: 24px; }
        .checklist { list-style: none; padding: 0; }
        .checklist li { padding: 8px 0; position: relative; padding-left: 30px; }
        .checklist li::before { content: "✓"; position: absolute; left: 0; color: #1976d2; font-weight: bold; font-size: 16px; }
        .button-wrapper { text-align: center; margin: 40px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3); }
        .contact-section { background-color: #333; color: white; padding: 25px 20px; text-align: center; }
        .contact-title { font-size: 18px; margin-bottom: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Houston Mobile Notary Pros</div>
            <div class="tagline">Your Appointment is Almost Confirmed!</div>
        </div>
        <div class="content">
            <div class="greeting">Hi {{contact.firstName}},</div>
            <div class="intro">
                Thank you for choosing Houston Mobile Notary Pros! We've reserved your requested appointment time. Please complete the final step below to formally confirm your booking.
            </div>

            <div class="details-box">
                <div class="title">📋 Appointment Summary</div>
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">{{contact.custom_fields.service_requested}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date & Time:</span>
                    <span class="detail-value">{{contact.custom_fields.appointment_date}} at {{contact.custom_fields.appointment_time}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{contact.custom_fields.service_address}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value important">${{contact.custom_fields.payment_amount}}</span>
                </div>
            </div>

            <div class="button-wrapper">
                <a href="{{contact.custom_fields.payment_url}}" class="button">💳 COMPLETE BOOKING</a>
            </div>

            <div class="section">
                <div class="section-title"><span class="section-icon">✅</span>What Happens Next</div>
                <ul class="checklist">
                    <li>You'll receive an instant confirmation email.</li>
                    <li>Your appointment reminders will be scheduled.</li>
                    <li>I'll call you personally when I'm en route.</li>
                    <li>A professional, reliable service is guaranteed.</li>
                </ul>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
                Questions? Call or text me at <a href="tel:8326174285" style="color: #1976d2;">832-617-4285</a>
            </p>
        </div>
        <div class="contact-section">
            <div class="contact-title">Kenneth Lightfoot | Certified Notary Public</div>
            <a href="mailto:info@houstonmobilenotarypros.com" style="color: #fff; text-decoration: none;">info@houstonmobilenotarypros.com</a> | 
            <a href="tel:8326174285" style="color: #fff; text-decoration: none;">832-617-4285</a>
        </div>
        <div class="footer">
            <p><strong>Houston Mobile Notary Pros</strong></p>
            <p>© 2024 Houston Mobile Notary Pros. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## ✅ **TEMPLATE 3: BOOKING CONFIRMATION**

**Subject:** `✅ Confirmed: Your Mobile Notary Appointment with HMNP`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmed</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .greeting { font-size: 22px; color: #388e3c; margin-bottom: 20px; font-weight: bold; }
        .intro { margin-bottom: 30px; font-size: 16px; line-height: 1.7; }
        .details-box { background-color: #e8f5e8; border: 1px solid #c8e6c9; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .details-box .title { color: #388e3c; font-weight: bold; margin-bottom: 15px; font-size: 18px; text-align: center; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #dceddc; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; font-weight: 500; text-align: right; }
        .detail-value.important { font-size: 16px; font-weight: bold; color: #4caf50; }
        .section { margin-bottom: 20px; padding: 20px; border-left: 4px solid #ff9800; background-color: #fff3e0; border-radius: 0 8px 8px 0; }
        .section-title { color: #f57c00; font-size: 18px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; }
        .section-icon { margin-right: 10px; font-size: 24px; }
        .checklist { list-style: none; padding: 0; }
        .checklist li { padding: 8px 0; position: relative; padding-left: 30px; }
        .checklist li::before { content: "✓"; position: absolute; left: 0; color: #4caf50; font-weight: bold; font-size: 16px; }
        .contact-section { background-color: #333; color: white; padding: 25px 20px; text-align: center; }
        .contact-title { font-size: 18px; margin-bottom: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Houston Mobile Notary Pros</div>
            <div class="tagline">APPOINTMENT CONFIRMED</div>
        </div>
        <div class="content">
            <div class="greeting">You're all set, {{contact.firstName}}!</div>
            <div class="intro">
                Your mobile notary appointment is confirmed and paid. I am looking forward to providing you with a professional and convenient service.
            </div>

            <div class="details-box">
                <div class="title">✅ Your Appointment Details</div>
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">{{contact.custom_fields.service_requested}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{contact.custom_fields.appointment_date}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">{{contact.custom_fields.appointment_time}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{contact.custom_fields.service_address}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Paid:</span>
                    <span class="detail-value important">${{contact.custom_fields.payment_amount}}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title"><span class="section-icon">📝</span>Please Have Ready</div>
                <ul class="checklist">
                    <li>Government-issued photo ID (driver's license, passport, etc.)</li>
                    <li>All documents requiring notarization</li>
                    <li>Any other individuals who need to sign</li>
                    <li>A quiet space for us to complete the signing</li>
                </ul>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <h4 style="color: #333; margin-top: 0;">Questions or Need to Reschedule?</h4>
                <p style="color: #666; font-size: 16px; margin: 5px 0;">
                    Call/Text: <a href="tel:8326174285" style="color: #1976d2; text-decoration: none; font-weight: bold;">832-617-4285</a>
                </p>
            </div>
        </div>
        <div class="contact-section">
            <div class="contact-title">Kenneth Lightfoot | Certified, Bonded, & Insured Notary Public</div>
            <p style="font-size: 12px; opacity: 0.8; margin-bottom: 10px;">Proudly serving Houston, Katy, Sugar Land, Cypress, Spring, and surrounding areas</p>
            <a href="mailto:info@houstonmobilenotarypros.com" style="color: #fff; text-decoration: none;">info@houstonmobilenotarypros.com</a> | 
            <a href="tel:8326174285" style="color: #fff; text-decoration: none;">832-617-4285</a>
        </div>
        <div class="footer">
            <p><strong>Houston Mobile Notary Pros</strong></p>
            <p>© 2024 Houston Mobile Notary Pros. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 📞 **TEMPLATE 4: PHONE BOOKING CONFIRMATION**

**Subject:** `📞 Regarding Our Call: Your HMNP Appointment & Payment Link`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phone Booking Confirmation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .greeting { font-size: 22px; color: #4a148c; margin-bottom: 20px; font-weight: bold; }
        .intro { margin-bottom: 30px; font-size: 16px; line-height: 1.7; }
        .details-box { background-color: #f3e5f5; border: 1px solid #e1bee7; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .details-box .title { color: #4a148c; font-weight: bold; margin-bottom: 15px; font-size: 18px; text-align: center; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #e1bee7; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; font-weight: 500; text-align: right; }
        .detail-value.important { font-size: 18px; font-weight: bold; color: #6a1b9a; }
        .section { margin-bottom: 20px; padding: 20px; border-left: 4px solid #6a1b9a; background-color: #f8f9fa; border-radius: 0 8px 8px 0; }
        .section-title { color: #4a148c; font-size: 18px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; }
        .section-icon { margin-right: 10px; font-size: 24px; }
        .checklist { list-style: none; padding: 0; }
        .checklist li { padding: 8px 0; position: relative; padding-left: 30px; }
        .checklist li::before { content: "✓"; position: absolute; left: 0; color: #6a1b9a; font-weight: bold; font-size: 16px; }
        .button-wrapper { text-align: center; margin: 40px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%); color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(106, 27, 154, 0.3); }
        .contact-section { background-color: #333; color: white; padding: 25px 20px; text-align: center; }
        .contact-title { font-size: 18px; margin-bottom: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Houston Mobile Notary Pros</div>
            <div class="tagline">APPOINTMENT RESERVED</div>
        </div>
        <div class="content">
            <div class="greeting">Hi {{contact.firstName}},</div>
            <div class="intro">
                It was a pleasure speaking with you! As discussed, I have reserved your mobile notary appointment. Please find the details and a secure payment link below to finalize everything.
            </div>

            <div class="details-box">
                <div class="title">📋 Appointment From Our Call</div>
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">{{contact.custom_fields.service_requested}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date & Time:</span>
                    <span class="detail-value">{{contact.custom_fields.appointment_date}} at {{contact.custom_fields.appointment_time}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{contact.custom_fields.service_address}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total:</span>
                    <span class="detail-value important">${{contact.custom_fields.service_price}}</span>
                </div>
            </div>
            
            <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #f57c00; margin-top: 0; font-size: 18px;">💳 Please Complete Your Payment</h4>
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 10px 0;">
                    To finalize your booking, please complete the payment using the secure link below. This confirms your time slot and allows me to prepare for our meeting.
                </p>
                <div class="button-wrapper" style="margin: 20px 0 0 0;">
                    <a href="{{contact.custom_fields.payment_url}}" class="button">💳 FINALIZE YOUR BOOKING</a>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title"><span class="section-icon">✅</span>Benefits of Our Direct Service</div>
                <ul class="checklist">
                    <li>Immediate answers to all your questions</li>
                    <li>Personalized service recommendations</li>
                    <li>Flexible scheduling options confirmed directly</li>
                    <li>You have a direct line to me, your notary!</li>
                </ul>
            </div>
        </div>
        <div class="contact-section">
            <div class="contact-title">Kenneth Lightfoot | Your Personal Mobile Notary</div>
            <a href="mailto:info@houstonmobilenotarypros.com" style="color: #fff; text-decoration: none;">info@houstonmobilenotarypros.com</a> | 
            <a href="tel:8326174285" style="color: #fff; text-decoration: none;">832-617-4285</a>
        </div>
        <div class="footer">
            <p><strong>Houston Mobile Notary Pros</strong></p>
            <p>"Personal service, professional results"</p>
        </div>
    </div>
</body>
</html>
```

---

## 🚨 **TEMPLATE 5: EMERGENCY SERVICE RESPONSE**

**Subject:** `🚨 URGENT RESPONSE: On My Way for Your Same-Day Notary Needs`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emergency Service Response</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .greeting { font-size: 22px; color: #b71c1c; margin-bottom: 20px; font-weight: bold; }
        .intro { margin-bottom: 30px; font-size: 16px; line-height: 1.7; }
        .timeline-box { background-color: #ffebee; border: 2px solid #d32f2f; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .timeline-box .title { color: #d32f2f; font-weight: bold; margin-bottom: 15px; font-size: 18px; text-align: center; }
        .timeline-item { display: flex; align-items: center; margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #ffcdd2; }
        .timeline-item:last-child { border-bottom: none; }
        .timeline-icon { background-color: #ff9800; color: white; border-radius: 50%; min-width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
        .timeline-icon.done { background-color: #4caf50; }
        .timeline-icon.next { background-color: #2196f3; }
        .section { margin-bottom: 20px; padding: 20px; border-left: 4px solid #ff9800; background-color: #fff3e0; border-radius: 0 8px 8px 0; }
        .section-title { color: #f57c00; font-size: 18px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; }
        .section-icon { margin-right: 10px; font-size: 24px; }
        .checklist { list-style: none; padding: 0; }
        .checklist li { padding: 8px 0; position: relative; padding-left: 30px; }
        .checklist li::before { content: "✓"; position: absolute; left: 0; color: #4caf50; font-weight: bold; font-size: 16px; }
        .contact-box { background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
        .contact-box .title { margin-top: 0; font-size: 20px; }
        .contact-box a { color: white; text-decoration: none; font-size: 18px; font-weight: bold; }
        .contact-section { background-color: #333; color: white; padding: 25px 20px; text-align: center; }
        .contact-title { font-size: 18px; margin-bottom: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Houston Mobile Notary Pros</div>
            <div class="tagline">URGENT & ON IT</div>
        </div>
        <div class="content">
            <div class="greeting">I'm on my way, {{contact.firstName}}!</div>
            <div class="intro">
                I have received your emergency notary request and am treating it with the highest priority. Rest assured, handling urgent, same-day requests is my specialty.
            </div>
            
            <div class="timeline-box">
                <div class="title">⚡ RESPONSE TIMELINE</div>
                <div class="timeline-item">
                    <div class="timeline-icon done">✓</div>
                    <div><strong style="color: #333;">Request Received</strong><br><span style="color: #666; font-size: 14px;">Emergency priority has been assigned.</span></div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-icon">⏰</div>
                    <div><strong style="color: #333;">Calling You Within 15 Minutes</strong><br><span style="color: #666; font-size: 14px;">To confirm final details and provide an ETA.</span></div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-icon next">🚗</div>
                    <div><strong style="color: #333;">On-Site Within 2 Hours</strong><br><span style="color: #666; font-size: 14px;">I will arrive fully equipped and ready to assist.</span></div>
                </div>
            </div>

            <div class="contact-box">
                <div class="title">🆘 NEED TO SPEAK NOW?</div>
                <p style="margin: 10px 0;"><a href="tel:8326174285">📞 Call or Text: 832-617-4285</a></p>
                <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Available 24/7 for emergency services</p>
            </div>

            <div class="section">
                <div class="section-title"><span class="section-icon">✅</span>Please Prepare</div>
                <ul class="checklist">
                    <li>Valid government-issued photo ID</li>
                    <li>All documents requiring notarization</li>
                    <li>Payment method (emergency rates apply)</li>
                    <li>A clear, well-lit signing space</li>
                </ul>
            </div>
        </div>
        <div class="contact-section">
            <div class="contact-title">Kenneth Lightfoot | Emergency Mobile Notary Specialist</div>
            <p style="font-size: 12px; opacity: 0.8; margin-bottom: 10px;">"When you need it done TODAY"</p>
            <a href="mailto:info@houstonmobilenotarypros.com" style="color: #fff; text-decoration: none;">info@houstonmobilenotarypros.com</a> | 
            <a href="tel:8326174285" style="color: #fff; text-decoration: none;">832-617-4285</a>
        </div>
        <div class="footer">
            <p><strong>Houston Mobile Notary Pros</strong></p>
            <p>© 2024 Houston Mobile Notary Pros. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 🚗 **TEMPLATE 7: 2-HOUR FINAL REMINDER**

**Subject:** `🚨 Final Reminder: Your Notary Appointment is in 2 Hours`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Final Appointment Reminder</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #ff8f00 0%, #ff6f00 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 40px 20px; text-align: center; }
        .greeting { font-size: 22px; color: #ff6f00; margin-bottom: 20px; font-weight: bold; }
        .intro { margin-bottom: 15px; font-size: 18px; line-height: 1.7; }
        .address { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 30px; }
        .eta { font-size: 16px; color: #555; margin-bottom: 30px; }
        .button-wrapper { margin: 20px 0; }
        .button { display: inline-block; background-color: #ff6f00; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; }
        .contact-section { background-color: #333; color: white; padding: 25px 20px; text-align: center; }
        .contact-title { font-size: 18px; margin-bottom: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Houston Mobile Notary Pros</div>
            <div class="tagline">FINAL REMINDER</div>
        </div>
        <div class="content">
            <div class="greeting">See you soon, {{contact.firstName}}!</div>
            <p class="intro">
                This is a final confirmation that I am scheduled to meet you in approximately <strong>2 hours</strong> at:
            </p>
            <p class="address">{{contact.custom_fields.service_address}}</p>
            <p class="eta">
                I will call you directly when I am en route.
                <br>
                {{#if contact.tags.contains('Consent:SMS_Opt_In')}}
                (You should have also received a text message reminder.)
                {{/if}}
            </p>
            <div class="button-wrapper">
                <a href="tel:8326174285" class="button">📞 Need to Call?</a>
            </div>
        </div>
        <div class="contact-section">
            <div class="contact-title">Kenneth Lightfoot | Your Mobile Notary</div>
            <a href="mailto:info@houstonmobilenotarypros.com" style="color: #fff; text-decoration: none;">info@houstonmobilenotarypros.com</a> | 
            <a href="tel:8326174285" style="color: #fff; text-decoration: none;">832-617-4285</a>
        </div>
        <div class="footer">
            <p><strong>Houston Mobile Notary Pros</strong></p>
            <p>© 2024 Houston Mobile Notary Pros. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 🤝 **TEMPLATE 11: REFERRAL PROGRAM**

**Subject:** `Share the Convenience: Refer a Friend to HMNP`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Referral Program</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #00796b 0%, #004d40 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .greeting { font-size: 22px; color: #004d40; margin-bottom: 20px; font-weight: bold; }
        .intro { margin-bottom: 30px; font-size: 16px; line-height: 1.7; }
        .deal-box { background-color: #e0f2f1; border: 2px dashed #00796b; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center; }
        .deal-title { font-size: 20px; font-weight: bold; color: #004d40; margin-bottom: 15px; }
        .deal-text { font-size: 16px; color: #333; }
        .deal-text strong { color: #00796b; }
        .how-it-works { margin-top: 30px; }
        .how-it-works h3 { text-align: center; color: #004d40; margin-bottom: 20px; }
        .step { display: flex; align-items: center; margin-bottom: 15px; }
        .step-number { background-color: #00796b; color: white; border-radius: 50%; min-width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; }
        .button-wrapper { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background-color: #00796b; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; }
        .contact-section { background-color: #333; color: white; padding: 25px 20px; text-align: center; }
        .contact-title { font-size: 18px; margin-bottom: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Houston Mobile Notary Pros</div>
            <div class="tagline">Refer a Friend, You Both Benefit!</div>
        </div>
        <div class="content">
            <div class="greeting">Hi {{contact.firstName}},</div>
            <div class="intro">
                Did you enjoy the convenience of our mobile notary service? Share that same great experience with your friends, family, or colleagues!
            </div>

            <div class="deal-box">
                <div class="deal-title">Give 10%, Get $10!</div>
                <p class="deal-text">Your friend gets <strong>10% OFF</strong> their first service, and you get a <strong>$10 credit</strong> on your next one. It's a win-win!</p>
            </div>

            <div class="how-it-works">
                <h3>How It Works</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div><strong>Share Your Link:</strong> Forward this email or share your personal referral link below.</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div><strong>They Book Service:</strong> Your friend books a service with us using your link.</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div><strong>You Both Save:</strong> They automatically get 10% off, and we'll apply a $10 credit to your account.</div>
                </div>
            </div>

            <div class="button-wrapper">
                <!-- GHL custom field for referral link is required -->
                <a href="{{contact.custom_fields.referral_link}}" class="button">Copy Your Referral Link</a>
            </div>
        </div>
        <div class="contact-section">
            <div class="contact-title">Kenneth Lightfoot | Certified Notary Public</div>
            <a href="mailto:info@houstonmobilenotarypros.com" style="color: #fff; text-decoration: none;">info@houstonmobilenotarypros.com</a> | 
            <a href="tel:8326174285" style="color: #fff; text-decoration: none;">832-617-4285</a>
        </div>
        <div class="footer">
            <p><strong>Houston Mobile Notary Pros</strong></p>
            <p>© 2024 Houston Mobile Notary Pros. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 🌱 **TEMPLATE 12: LEAD NURTURING (INITIAL FOLLOW-UP)**

**Subject:** `Following Up on Your Notary Inquiry`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Following Up</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .greeting { font-size: 22px; color: #1565c0; margin-bottom: 20px; font-weight: bold; }
        .intro { margin-bottom: 30px; font-size: 16px; line-height: 1.7; }
        .button-wrapper { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background-color: #1976d2; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; margin: 0 5px; }
        .button-secondary { background-color: #546e7a; }
        .contact-section { background-color: #333; color: white; padding: 25px 20px; text-align: center; }
        .contact-title { font-size: 18px; margin-bottom: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Houston Mobile Notary Pros</div>
            <div class="tagline">Here to Help With Your Notary Needs</div>
        </div>
        <div class="content">
            <div class="greeting">Hi {{contact.firstName}},</div>
            <div class="intro">
                I'm just following up on the recent inquiry you made about mobile notary services. I wanted to see if you had any further questions or if there was anything else I could help you with.
                <br><br>
                My goal is to make the notarization process as simple and convenient as possible for you.
            </div>
            
            <p style="text-align: center; font-size: 16px; color: #555;">
                If you're ready to book or just want to ask a question, please don't hesitate to reach out.
            </p>

            <div class="button-wrapper">
                <a href="tel:8326174285" class="button">📞 Ask a Question</a>
                <!-- IMPORTANT: Replace # with your booking page link -->
                <a href="#" class="button button-secondary">🗓️ Book Online</a>
            </div>
        </div>
        <div class="contact-section">
            <div class="contact-title">Kenneth Lightfoot | Your Mobile Notary</div>
            <a href="mailto:info@houstonmobilenotarypros.com" style="color: #fff; text-decoration: none;">info@houstonmobilenotarypros.com</a> | 
            <a href="tel:8326174285" style="color: #fff; text-decoration: none;">832-617-4285</a>
        </div>
        <div class="footer">
            <p><strong>Houston Mobile Notary Pros</strong></p>
            <p>© 2024 Houston Mobile Notary Pros. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 📚 **TEMPLATE USAGE & CUSTOMIZATION GUIDE**

This document now contains a comprehensive set of 12 professional email templates for your primary HMNP workflows.

### **Important Next Steps:**

1.  **Review Links:** In the Review Request template (Template 10), you **must** replace the `href="#"` placeholders with your actual links to Google Reviews, Yelp, etc.
2.  **Referral Link:** The Referral Program template (Template 11) relies on a custom field `{{contact.custom_fields.referral_link}}`. Ensure your GHL system generates and populates this field for each contact.
3.  **Booking Link:** The Lead Nurturing template (Template 12) has a placeholder `href="#"` for your online booking page. Update this with the correct URL.

### **Field Mapping Reference:**
- `{{contact.firstName}}` - Contact's first name
- `{{contact.custom_fields.booking_id}}` - Booking system ID
- `{{contact.custom_fields.payment_url}}` - Stripe payment link
- `{{contact.custom_fields.payment_amount}}` - Amount owed
- `{{contact.custom_fields.service_requested}}` - Service type
- `{{contact.custom_fields.service_address}}` - Service location
- `{{contact.custom_fields.appointment_date}}` - Appointment date
- `{{contact.custom_fields.appointment_time}}` - Appointment time
- `{{contact.custom_fields.service_price}}` - Service price
- `{{contact.custom_fields.hours_old}}` - Number of hours since booking
- `{{contact.custom_fields.preferred_datetime}}` - For emergency requests
- `{{contact.custom_fields.referral_link}}` - Unique client referral link

### **Conditional Logic Examples:**
```html
<!-- Show content only if SMS opted in -->
{{#if contact.tags.contains('Consent:SMS_Opt_In')}}
<p>Text reminders enabled</p>
{{/if}}

<!-- Different content based on urgency -->
{{#if contact.tags.contains('urgency:high')}}
<div style="color: red;">URGENT</div>
{{else}}
<div style="color: blue;">Standard</div>
{{/if}}
```

### **Mobile Optimization:**
All templates are designed to be mobile-responsive and will automatically adjust to different screen sizes.

</rewritten_file>