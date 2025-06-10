# Additional HTML Email Templates for GHL Workflows
## Houston Mobile Notary Pros - ENHANCED PROFESSIONAL TEMPLATES

---

## Template 25: Final Payment Reminder ✅ ENHANCED
**Subject**: Final reminder - Secure your notary appointment
**Workflow**: Payment Follow-up (Workflow 2)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Final Payment Reminder</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .tagline {
            font-size: 14px;
            opacity: 0.9;
        }
        
        /* Main content */
        .content {
            padding: 30px 20px;
        }
        
        .greeting {
            font-size: 18px;
            color: #dc2626;
            margin-bottom: 20px;
        }
        
        .intro {
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 1.7;
        }
        
        /* Section styling */
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border-left: 4px solid #dc2626;
            background-color: #fef2f2;
            border-radius: 0 8px 8px 0;
        }
        
        .section-title {
            color: #dc2626;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .section-icon {
            margin-right: 10px;
            font-size: 24px;
        }
        
        /* Service details box */
        .service-details {
            background-color: #f1f5f9;
            border: 1px solid #b3d9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .service-details .title {
            color: #002147;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        
        .detail-label {
            font-weight: bold;
            color: #666;
        }
        
        .detail-value {
            color: #002147;
            font-weight: 500;
        }
        
        /* CTA section */
        .cta-section {
            background-color: #dc2626;
            color: white;
            padding: 30px 20px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
        }
        
        .cta-title {
            font-size: 22px;
            margin-bottom: 15px;
        }
        
        .cta-subtitle {
            color: #fecaca;
            margin-bottom: 25px;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #ffffff;
            color: #dc2626;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 18px;
            margin: 5px;
            min-width: 180px;
        }
        
        .cta-button.secondary {
            background-color: #A52A2A;
            color: white;
        }
        
        /* Help section */
        .help-section {
            background-color: #002147;
            color: white;
            padding: 25px 20px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
        }
        
        .help-title {
            font-size: 20px;
            margin-bottom: 15px;
        }
        
        .help-subtitle {
            color: #e0e7ff;
            margin-bottom: 20px;
        }
        
        /* Contact section */
        .contact-section {
            background-color: #002147;
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        
        .contact-methods {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
        }
        
        .contact-method a {
            color: white;
            text-decoration: none;
            font-weight: bold;
        }
        
        .contact-method a:hover {
            color: #A52A2A;
        }
        
        /* Footer */
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        
        .footer a {
            color: #666;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">⏰ Final Payment Reminder</div>
            <div class="tagline">Secure your appointment today</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h2 class="greeting">Hi {{contact.first_name}},</h2>
            
            <div class="intro">
                <p>This is a final reminder to complete payment for your notary services with Houston Mobile Notary Pros.</p>
            </div>
            
            <div class="section">
                <h3 class="section-title">
                    <span class="section-icon">🚨</span>
                    Payment Required to Secure Appointment
                </h3>
                <p><strong>If you no longer need our services:</strong> No action required.</p>
                <p><strong>If you still need notary services:</strong> Please complete payment or call us immediately.</p>
            </div>
            
            <div class="service-details">
                <div class="title">📋 Your Requested Service</div>
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">{{contact.service_type}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{contact.address1}}, {{contact.city}}, {{contact.state}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Requested Date:</span>
                    <span class="detail-value">{{contact.appointment_date}}</span>
                </div>
            </div>
            
            <div class="cta-section">
                <h3 class="cta-title">Complete Payment Now</h3>
                <p class="cta-subtitle">Secure your appointment today</p>
                <div>
                    <a href="{{payment_link}}?utm_source=email&utm_medium=cta&utm_campaign=final_payment_reminder" class="cta-button">💳 Complete Payment</a>
                    <a href="tel:+18326174285?utm_source=email&utm_medium=cta&utm_campaign=final_payment_reminder" class="cta-button secondary">📞 Call to Pay</a>
                </div>
            </div>
            
            <div class="help-section">
                <h3 class="help-title">Need Help?</h3>
                <p class="help-subtitle">Questions about payment or need to discuss your service?</p>
                <div>
                    <a href="tel:+18326174285" style="display: inline-block; background-color: #A52A2A; color: white; padding: 15px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px; min-width: 140px;">📞 Call Us</a>
                    <a href="mailto:contact@houstonmobilenotarypros.com?subject=Payment Question" style="display: inline-block; background-color: white; color: #002147; padding: 15px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px; min-width: 140px;">📧 Email Us</a>
                </div>
            </div>
            
            <p style="margin-top: 30px; text-align: center;">Thank you for considering Houston Mobile Notary Pros.<br>We're here to bring calm to your critical moments.</p>
        </div>
        
        <!-- Contact Section -->
        <div class="contact-section">
            <h4>Houston Mobile Notary Pros</h4>
            <div class="contact-methods">
                <div class="contact-method">
                    <a href="tel:+18326174285">(832) 617-4285</a>
                </div>
                <div class="contact-method">
                    <a href="mailto:contact@houstonmobilenotarypros.com">contact@houstonmobilenotarypros.com</a>
                </div>
            </div>
            <p style="margin-top: 15px; font-style: italic;">Professional • Calm • Reliable</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Houston Mobile Notary Pros LLC | Licensed & Bonded in Texas</p>
            <p><a href="{{unsubscribe_link}}">Unsubscribe</a> | <a href="https://houstonmobilenotarypros.com/privacy">Privacy Policy</a></p>
            <p>Houston Mobile Notary Pros | Houston, TX | United States</p>
        </div>
    </div>
</body>
</html>
```

---

## Template 26: Thank You (Post-Service) ✅ ENHANCED
**Subject**: Thank you - Houston Mobile Notary Pros
**Workflow**: Post-Service Follow-up (Workflow 6)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .tagline {
            font-size: 14px;
            opacity: 0.9;
        }
        
        /* Main content */
        .content {
            padding: 30px 20px;
        }
        
        .greeting {
            font-size: 18px;
            color: #16a34a;
            margin-bottom: 20px;
        }
        
        .intro {
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 1.7;
        }
        
        /* Section styling */
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border-left: 4px solid #16a34a;
            background-color: #f0fdf4;
            border-radius: 0 8px 8px 0;
        }
        
        .section-title {
            color: #16a34a;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .section-icon {
            margin-right: 10px;
            font-size: 24px;
        }
        
        /* Service details box */
        .service-details {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .service-details .title {
            color: #16a34a;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        
        .detail-label {
            font-weight: bold;
            color: #666;
        }
        
        .detail-value {
            color: #16a34a;
            font-weight: 500;
        }
        
        /* Promise section */
        .promise-section {
            background-color: #f1f5f9;
            border: 1px solid #b3d9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .promise-section .title {
            color: #002147;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        /* Next steps section */
        .next-steps {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .next-steps .title {
            color: #92400e;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .checklist {
            list-style: none;
            padding: 0;
        }
        
        .checklist li {
            padding: 5px 0;
            position: relative;
            padding-left: 25px;
        }
        
        .checklist li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #f59e0b;
            font-weight: bold;
        }
        
        /* Support section */
        .support-section {
            background-color: #002147;
            color: white;
            padding: 25px 20px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
        }
        
        .support-title {
            font-size: 20px;
            margin-bottom: 15px;
        }
        
        .support-subtitle {
            color: #e0e7ff;
            margin-bottom: 20px;
        }
        
        .support-button {
            display: inline-block;
            background-color: #A52A2A;
            color: white;
            padding: 15px 25px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 5px;
            min-width: 140px;
        }
        
        .support-button.secondary {
            background-color: white;
            color: #002147;
        }
        
        /* Contact section */
        .contact-section {
            background-color: #002147;
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        
        .contact-methods {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
        }
        
        .contact-method a {
            color: white;
            text-decoration: none;
            font-weight: bold;
        }
        
        .contact-method a:hover {
            color: #A52A2A;
        }
        
        /* Footer */
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        
        .footer a {
            color: #666;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🙏 Thank You!</div>
            <div class="tagline">Service completed successfully</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h2 class="greeting">Hi {{contact.first_name}},</h2>
            
            <div class="intro">
                <p>Thank you for choosing Houston Mobile Notary Pros today! It was a pleasure serving you, and I hope our service met your expectations.</p>
            </div>
            
            <div class="service-details">
                <div class="title">✅ Service Completed</div>
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">{{contact.service_type}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{contact.service_date}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{contact.address1}}, {{contact.city}}, {{contact.state}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Documents:</span>
                    <span class="detail-value">{{contact.document_count | default: "Multiple"}} documents notarized</span>
                </div>
            </div>
            
            <div class="promise-section">
                <div class="title">🛡️ Our Promise to You</div>
                <p>Your documents have been properly notarized according to Texas state law. All signatures, seals, and certificates are legally valid and enforceable. If you ever need copies or have questions about today's service, just reach out to us.</p>
            </div>
            
            <div class="next-steps">
                <div class="title">📋 What's Next?</div>
                <ul class="checklist">
                    <li>Your notarized documents are ready for their intended use</li>
                    <li>Keep copies in a safe place for your records</li>
                    <li>If you need additional copies, contact us within 30 days</li>
                    <li>For future notary needs, you're now a preferred customer</li>
                </ul>
            </div>
            
            <div class="support-section">
                <h3 class="support-title">Need Copies or Have Questions?</h3>
                <p class="support-subtitle">We're here to help with any follow-up needs</p>
                <div>
                    <a href="mailto:contact@houstonmobilenotarypros.com?subject=Follow-up from {{contact.first_name}} {{contact.last_name}}" class="support-button">📧 Email Us</a>
                    <a href="tel:+18326174285" class="support-button secondary">📞 Call Us</a>
                </div>
            </div>
        </div>
        
        <!-- Contact Section -->
        <div class="contact-section">
            <h4>Houston Mobile Notary Pros</h4>
            <div class="contact-methods">
                <div class="contact-method">
                    <a href="tel:+18326174285">(832) 617-4285</a>
                </div>
                <div class="contact-method">
                    <a href="mailto:contact@houstonmobilenotarypros.com">contact@houstonmobilenotarypros.com</a>
                </div>
                <div class="contact-method">
                    <a href="https://houstonmobilenotarypros.com">houstonmobilenotarypros.com</a>
                </div>
            </div>
            <p style="margin-top: 15px; font-style: italic;">Professional • Calm • Reliable</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Houston Mobile Notary Pros LLC | Licensed & Bonded in Texas</p>
            <p><a href="{{unsubscribe_link}}">Unsubscribe</a> | <a href="https://houstonmobilenotarypros.com/privacy">Privacy Policy</a></p>
            <p>Houston Mobile Notary Pros | Houston, TX | United States</p>
        </div>
    </div>
</body>
</html>
```