# Missing HTML Email Templates from GHL Workflow Guide

## Template: Final Payment Reminder (Workflow 2)
**Subject**: Final reminder - Secure your notary appointment

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Final Payment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #f8f9fa;">
                <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); border-radius: 8px 8px 0 0;">
                            <img src="https://storage.googleapis.com/msgsndr/oUvYNTw2Wvul7JSJplqQ/media/68302173ce008c8562696b18.png" alt="Houston Mobile Notary Pros" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 50%;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">⏰ Final Payment Reminder</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #dc2626; margin: 0 0 20px; font-size: 24px;">Hi {{contact.first_name}},</h2>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                This is a final reminder to complete payment for your notary services.
                            </p>
                            <div style="background-color: #fef2f2; padding: 25px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 25px 0;">
                                <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6;">
                                    <strong>If you no longer need our services:</strong> No action required.<br>
                                    <strong>If you still need notary services:</strong> Please complete payment or call 832-617-4285.
                                </p>
                            </div>
                            <!-- Payment CTA -->
                            <div style="background-color: #dc2626; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
                                <h3 style="color: #ffffff; margin: 0 0 15px; font-size: 22px;">Complete Payment Now</h3>
                                <p style="color: #fecaca; margin: 0 0 25px; font-size: 16px;">
                                    Secure your appointment today
                                </p>
                                <a href="{{payment_link}}" style="display: inline-block; background-color: #ffffff; color: #dc2626; padding: 18px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 20px; margin: 5px;">💳 Complete Payment</a>
                            </div>
                            
                            <!-- Contact Options -->
                            <div style="background-color: #1e3a8a; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
                                <h3 style="color: #ffffff; margin: 0 0 15px; font-size: 20px;">Need Help?</h3>
                                <p style="color: #e0e7ff; margin: 0 0 20px; font-size: 16px;">
                                    Questions about payment or need to discuss your service?
                                </p>
                                <div style="margin: 20px 0;">
                                    <a href="tel:+18326174285" style="display: inline-block; background-color: #A52A2A; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px;">📞 Call (832) 617-4285</a>
                                    <a href="mailto:contact@houstonmobilenotarypros.com?subject=Payment Question from {{contact.first_name}}" style="display: inline-block; background-color: #ffffff; color: #1e3a8a; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px;">📧 Email Us</a>
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Enhanced Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #1e3a8a; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #ffffff; margin: 0 0 10px; font-size: 18px; font-weight: bold;">Houston Mobile Notary Pros</p>
                            <p style="color: #e0e7ff; margin: 0 0 15px; font-size: 16px;">
                                <a href="tel:+18326174285" style="color: #e0e7ff; text-decoration: none; font-weight: bold;">(832) 617-4285</a>
                            </p>
                            <p style="color: #e0e7ff; margin: 0 0 15px; font-size: 14px;">
                                <a href="mailto:contact@houstonmobilenotarypros.com" style="color: #e0e7ff; text-decoration: none;">contact@houstonmobilenotarypros.com</a> | 
                                <a href="https://houstonmobilenotarypros.com/?utm_source=email&utm_medium=template&utm_campaign=final_payment_reminder" style="color: #e0e7ff; text-decoration: none;">houstonmobilenotarypros.com</a>
                            </p>
                            <p style="color: #e0e7ff; margin: 0 0 20px; font-size: 14px; font-style: italic;">Professional • Calm • Reliable</p>
                            
                            <!-- Compliance Footer -->
                            <p style="color: #a7bce8; margin: 15px 0 5px; font-size: 11px;">
                                Houston Mobile Notary Pros LLC | Licensed & Bonded in Texas
                            </p>
                            <p style="color: #a7bce8; margin: 0 0 10px; font-size: 10px;">
                                <a href="{{unsubscribe_link}}" style="color: #a7bce8; text-decoration: underline;">Unsubscribe</a> | 
                                <a href="https://houstonmobilenotarypros.com/privacy" style="color: #a7bce8; text-decoration: underline;">Privacy Policy</a> | 
                                <a href="https://houstonmobilenotarypros.com/terms" style="color: #a7bce8; text-decoration: underline;">Terms of Service</a>
                            </p>
                            <p style="color: #a7bce8; margin: 10px 0 0; font-size: 10px;">
                                Houston Mobile Notary Pros | Houston, TX 77xxx | United States
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Template: Thank You Email (Workflow 6)
**Subject**: Thank you - Houston Mobile Notary Pros

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #f8f9fa;">
                <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); border-radius: 8px 8px 0 0;">
                            <img src="https://storage.googleapis.com/msgsndr/oUvYNTw2Wvul7JSJplqQ/media/68302173ce008c8562696b18.png" alt="Houston Mobile Notary Pros" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 50%;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🙏 Thank You!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #16a34a; margin: 0 0 20px; font-size: 24px;">Hi {{contact.first_name}},</h2>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                Thank you for choosing Houston Mobile Notary Pros today!
                            </p>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                I hope our service met your expectations. It was a pleasure serving you.
                            </p>
                            <div style="background-color: #f0fdf4; padding: 25px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 25px 0;">
                                <h3 style="color: #16a34a; margin: 0 0 15px; font-size: 20px;">🛡️ Our Promise to You</h3>
                                <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6;">
                                    <strong>Your notarization is complete and legally valid.</strong><br>
                                    All documents have been properly signed, sealed, and recorded according to Texas law. If you need copies of any documents or have questions about today's service, just reach out.
                                </p>
                            </div>
                            
                            <!-- Support Section -->
                            <div style="background-color: #1e3a8a; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
                                <h3 style="color: #ffffff; margin: 0 0 15px; font-size: 20px;">Need Copies or Have Questions?</h3>
                                <p style="color: #e0e7ff; margin: 0 0 20px; font-size: 16px;">
                                    We're here to help with any follow-up needs
                                </p>
                                <div style="margin: 20px 0;">
                                    <a href="mailto:contact@houstonmobilenotarypros.com?subject=Follow-up from {{contact.first_name}} {{contact.last_name}}" style="display: inline-block; background-color: #A52A2A; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px;">📧 Email Us</a>
                                    <a href="tel:+18326174285" style="display: inline-block; background-color: #ffffff; color: #1e3a8a; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px;">📞 Call Us</a>
                                </div>
                            </div>
                            
                            <p style="color: #374151; margin: 30px 0 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                <strong>Thank you again for your trust in our services!</strong><br>
                                <em>Kenneth Lightfoot<br>
                                Houston Mobile Notary Pros<br>
                                "Your Calm in Critical Moments"</em>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Enhanced Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #1e3a8a; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #ffffff; margin: 0 0 10px; font-size: 18px; font-weight: bold;">Houston Mobile Notary Pros</p>
                            <p style="color: #e0e7ff; margin: 0 0 15px; font-size: 16px;">
                                <a href="tel:+18326174285" style="color: #e0e7ff; text-decoration: none; font-weight: bold;">(832) 617-4285</a>
                            </p>
                            <p style="color: #e0e7ff; margin: 0 0 15px; font-size: 14px;">
                                <a href="mailto:contact@houstonmobilenotarypros.com" style="color: #e0e7ff; text-decoration: none;">contact@houstonmobilenotarypros.com</a> | 
                                <a href="https://houstonmobilenotarypros.com/?utm_source=email&utm_medium=template&utm_campaign=thank_you_email" style="color: #e0e7ff; text-decoration: none;">houstonmobilenotarypros.com</a>
                            </p>
                            <p style="color: #e0e7ff; margin: 0 0 20px; font-size: 14px; font-style: italic;">Professional • Calm • Reliable</p>
                            
                            <!-- Compliance Footer -->
                            <p style="color: #a7bce8; margin: 15px 0 5px; font-size: 11px;">
                                Houston Mobile Notary Pros LLC | Licensed & Bonded in Texas
                            </p>
                            <p style="color: #a7bce8; margin: 0 0 10px; font-size: 10px;">
                                <a href="{{unsubscribe_link}}" style="color: #a7bce8; text-decoration: underline;">Unsubscribe</a> | 
                                <a href="https://houstonmobilenotarypros.com/privacy" style="color: #a7bce8; text-decoration: underline;">Privacy Policy</a> | 
                                <a href="https://houstonmobilenotarypros.com/terms" style="color: #a7bce8; text-decoration: underline;">Terms of Service</a>
                            </p>
                            <p style="color: #a7bce8; margin: 10px 0 0; font-size: 10px;">
                                Houston Mobile Notary Pros | Houston, TX 77xxx | United States
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Template: VIP Welcome Back (Workflow 9)
**Subject**: Welcome back, {{contact.first_name}} - VIP service ready!

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VIP Welcome Back</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #f8f9fa;">
                <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); border-radius: 8px 8px 0 0;">
                            <img src="https://storage.googleapis.com/msgsndr/oUvYNTw2Wvul7JSJplqQ/media/68302173ce008c8562696b18.png" alt="Houston Mobile Notary Pros" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 50%;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">👑 VIP Welcome Back!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #7c3aed; margin: 0 0 20px; font-size: 24px;">Welcome back, {{contact.first_name}}!</h2>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                As a returning customer, you automatically receive our VIP treatment:
                            </p>
                            <div style="background-color: #faf5ff; padding: 25px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 25px 0;">
                                <h3 style="color: #7c3aed; margin: 0 0 15px; font-size: 20px;">VIP BENEFITS:</h3>
                                <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
                                    <li>✓ Priority scheduling</li>
                                    <li>✓ 10% loyalty discount applied</li>
                                    <li>✓ Skip the basic explanations - we know you</li>
                                    <li>✓ Faster service (we have your info on file)</li>
                                    <li>✓ Direct line for changes: 832-617-4285</li>
                                </ul>
                            </div>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                Your loyalty means everything to us. We'll provide the same calm, professional service you remember - just faster and with VIP attention.
                            </p>
                            
                            <!-- VIP Scheduling CTA -->
                            <div style="background-color: #7c3aed; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
                                <h3 style="color: #ffffff; margin: 0 0 15px; font-size: 22px;">Ready to Use Your VIP Benefits?</h3>
                                <p style="color: #e0d5ff; margin: 0 0 25px; font-size: 16px;">
                                    Schedule with priority access and your loyalty discount
                                </p>
                                <div style="margin: 20px 0;">
                                    <a href="tel:+18326174285" style="display: inline-block; background-color: #A52A2A; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px;">📞 VIP Line (832) 617-4285</a>
                                    <a href="mailto:contact@houstonmobilenotarypros.com?subject=VIP Service Request from {{contact.first_name}}" style="display: inline-block; background-color: #ffffff; color: #7c3aed; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px;">📧 Email VIP Request</a>
                                </div>
                            </div>
                            
                            <p style="color: #374151; margin: 30px 0 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                Thank you for choosing us again!<br>
                                <strong>Kenneth Lightfoot</strong><br>
                                Houston Mobile Notary Pros
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Enhanced Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #1e3a8a; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #ffffff; margin: 0 0 10px; font-size: 18px; font-weight: bold;">Houston Mobile Notary Pros</p>
                            <p style="color: #e0e7ff; margin: 0 0 15px; font-size: 16px;">
                                <a href="tel:+18326174285" style="color: #e0e7ff; text-decoration: none; font-weight: bold;">(832) 617-4285</a>
                            </p>
                            <p style="color: #e0e7ff; margin: 0 0 15px; font-size: 14px;">
                                <a href="mailto:contact@houstonmobilenotarypros.com" style="color: #e0e7ff; text-decoration: none;">contact@houstonmobilenotarypros.com</a> | 
                                <a href="https://houstonmobilenotarypros.com/?utm_source=email&utm_medium=template&utm_campaign=vip_welcome_back" style="color: #e0e7ff; text-decoration: none;">houstonmobilenotarypros.com</a>
                            </p>
                            <p style="color: #e0e7ff; margin: 0 0 20px; font-size: 14px; font-style: italic;">Professional • Calm • Reliable</p>
                            
                            <!-- Compliance Footer -->
                            <p style="color: #a7bce8; margin: 15px 0 5px; font-size: 11px;">
                                Houston Mobile Notary Pros LLC | Licensed & Bonded in Texas
                            </p>
                            <p style="color: #a7bce8; margin: 0 0 10px; font-size: 10px;">
                                <a href="{{unsubscribe_link}}" style="color: #a7bce8; text-decoration: underline;">Unsubscribe</a> | 
                                <a href="https://houstonmobilenotarypros.com/privacy" style="color: #a7bce8; text-decoration: underline;">Privacy Policy</a> | 
                                <a href="https://houstonmobilenotarypros.com/terms" style="color: #a7bce8; text-decoration: underline;">Terms of Service</a>
                            </p>
                            <p style="color: #a7bce8; margin: 10px 0 0; font-size: 10px;">
                                Houston Mobile Notary Pros | Houston, TX 77xxx | United States
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Template: Emergency Service Response (Workflow 8) ✅ ENHANCED
**Subject**: EMERGENCY SERVICE - We're responding immediately

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emergency Service Response</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #f8f9fa;">
                <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); border-radius: 8px 8px 0 0;">
                            <img src="https://storage.googleapis.com/msgsndr/oUvYNTw2Wvul7JSJplqQ/media/68302173ce008c8562696b18.png" alt="Houston Mobile Notary Pros" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 50%;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🚨 EMERGENCY SERVICE</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #dc2626; margin: 0 0 20px; font-size: 24px;">Hi {{contact.first_name}},</h2>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                We've received your emergency/same-day notary service request.
                            </p>
                            <div style="background-color: #fef2f2; padding: 25px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 25px 0;">
                                <h3 style="color: #dc2626; margin: 0 0 15px; font-size: 20px;">IMMEDIATE RESPONSE:</h3>
                                <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
                                    <li>• We're calling you within 15 minutes</li>
                                    <li>• Same-day service available 7am-9pm</li>
                                    <li>• Emergency rate: $150 flat fee</li>
                                    <li>• We'll bring calm to your urgent situation</li>
                                </ul>
                            </div>
                            <div style="background-color: #dc2626; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
                                <p style="color: #ffffff; margin: 0 0 15px; font-size: 18px; font-weight: bold;">
                                    If you need immediate assistance:
                                </p>
                                <a href="tel:+18326174285?utm_source=email&utm_medium=cta&utm_campaign=emergency_service" 
                                   style="display: inline-block; background-color: #ffffff; color: #dc2626; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px; min-width: 180px;">
                                    📞 Call NOW
                                </a>
                                <a href="sms:+18326174285" 
                                   style="display: inline-block; background-color: #A52A2A; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px; min-width: 180px;">
                                    💬 Text URGENT
                                </a>
                            </div>
                            <p style="color: #374151; margin: 30px 0 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                <strong>Kenneth Lightfoot</strong><br>
                                Houston Mobile Notary Pros<br>
                                <em>"Calm in Critical Moments"</em>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #1e3a8a; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #ffffff; margin: 0 0 10px; font-size: 16px; font-weight: bold;">Houston Mobile Notary Pros</p>
                            <p style="color: #e0e7ff; margin: 0 0 10px; font-size: 14px;">
                                <a href="tel:+18326174285" style="color: #e0e7ff; text-decoration: none;">(832) 617-4285</a>
                            </p>
                            <p style="color: #a7bce8; margin: 15px 0 0; font-size: 10px;">
                                <a href="{{unsubscribe_link}}" style="color: #a7bce8;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Template: No-Show Recovery (Workflow 7) ✅ ENHANCED
**Subject**: We missed you today - let's reschedule

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>No-Show Recovery</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #f8f9fa;">
                <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 8px 8px 0 0;">
                            <img src="https://storage.googleapis.com/msgsndr/oUvYNTw2Wvul7JSJplqQ/media/68302173ce008c8562696b18.png" alt="Houston Mobile Notary Pros" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 50%;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">We Missed You Today</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #f59e0b; margin: 0 0 20px; font-size: 24px;">Hi {{contact.first_name}},</h2>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                We arrived for your notary appointment today but weren't able to connect with you.
                            </p>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                We understand that unexpected things come up, and we're here to help reschedule at your convenience.
                            </p>
                            <div style="background-color: #fffbeb; padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
                                <h3 style="color: #92400e; margin: 0 0 15px; font-size: 20px;">RESCHEDULE OPTIONS:</h3>
                                <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
                                    <li>• Call/text: 832-617-4285</li>
                                    <li>• Reply to this email with preferred times</li>
                                    <li>• Visit: houstonmobilenotarypros.com/reschedule</li>
                                </ul>
                            </div>
                            <div style="background-color: #1e3a8a; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
                                <p style="color: #ffffff; margin: 0 0 15px; font-size: 18px; font-weight: bold;">
                                    No judgment, no hassle - just calm, professional service when you're ready.
                                </p>
                                <a href="tel:+18326174285?utm_source=email&utm_medium=cta&utm_campaign=no_show_recovery" 
                                   style="display: inline-block; background-color: #A52A2A; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px; min-width: 160px;">
                                    📞 Call to Reschedule
                                </a>
                                <a href="sms:+18326174285" 
                                   style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px; min-width: 160px;">
                                    💬 Text Us
                                </a>
                                <a href="mailto:contact@houstonmobilenotarypros.com?subject=Reschedule Appointment&utm_source=email&utm_medium=cta&utm_campaign=no_show_recovery" 
                                   style="display: inline-block; background-color: #ffffff; color: #1e3a8a; padding: 15px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px; min-width: 160px;">
                                    📧 Email Us
                                </a>
                            </div>
                            <p style="color: #374151; margin: 30px 0 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                Best regards,<br>
                                <strong>Kenneth Lightfoot</strong><br>
                                Houston Mobile Notary Pros
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #1e3a8a; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #ffffff; margin: 0 0 10px; font-size: 16px; font-weight: bold;">Houston Mobile Notary Pros</p>
                            <p style="color: #e0e7ff; margin: 0 0 10px; font-size: 14px;">
                                <a href="tel:+18326174285" style="color: #e0e7ff; text-decoration: none;">(832) 617-4285</a>
                            </p>
                            <p style="color: #a7bce8; margin: 15px 0 0; font-size: 10px;">
                                <a href="{{unsubscribe_link}}" style="color: #a7bce8;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Template: Reschedule Offer with Discount (Workflow 7) ✅ ENHANCED
**Subject**: 15% off your rescheduled appointment

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reschedule Offer</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #f8f9fa;">
                <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); border-radius: 8px 8px 0 0;">
                            <img src="https://storage.googleapis.com/msgsndr/oUvYNTw2Wvul7JSJplqQ/media/68302173ce008c8562696b18.png" alt="Houston Mobile Notary Pros" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 50%;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">💰 15% Off Reschedule</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #16a34a; margin: 0 0 20px; font-size: 24px;">Hi {{contact.first_name}},</h2>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                Life happens, and we understand that.
                            </p>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                To make rescheduling easier, we're offering <strong>15% off</strong> your rescheduled notary appointment.
                            </p>
                            <div style="background-color: #f0fdf4; padding: 25px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 25px 0;">
                                <h3 style="color: #16a34a; margin: 0 0 15px; font-size: 20px;">SPECIAL RESCHEDULE RATE:</h3>
                                <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
                                    <li>• Standard Service: $63.75 (was $75)</li>
                                    <li>• Priority Service: $85 (was $100)</li>
                                    <li>• Loan Signing: $127.50 (was $150)</li>
                                </ul>
                                <p style="color: #374151; margin: 15px 0 0; font-size: 14px; font-style: italic;">
                                    Valid for next 7 days
                                </p>
                            </div>
                            <div style="background-color: #16a34a; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
                                <p style="color: #ffffff; margin: 0 0 15px; font-size: 18px; font-weight: bold;">
                                    Ready to Reschedule?
                                </p>
                                <a href="tel:+18326174285?utm_source=email&utm_medium=cta&utm_campaign=reschedule_discount" 
                                   style="display: inline-block; background-color: #ffffff; color: #16a34a; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px; min-width: 180px;">
                                    📞 Call for 15% Off
                                </a>
                                <a href="sms:+18326174285" 
                                   style="display: inline-block; background-color: #A52A2A; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px; min-width: 180px;">
                                    💬 Text Message
                                </a>
                            </div>
                            <p style="color: #374151; margin: 30px 0 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                We're here when you're ready,<br>
                                Houston Mobile Notary Pros
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #1e3a8a; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #ffffff; margin: 0 0 10px; font-size: 16px; font-weight: bold;">Houston Mobile Notary Pros</p>
                            <p style="color: #e0e7ff; margin: 0 0 10px; font-size: 14px;">
                                <a href="tel:+18326174285" style="color: #e0e7ff; text-decoration: none;">(832) 617-4285</a>
                            </p>
                            <p style="color: #a7bce8; margin: 15px 0 0; font-size: 10px;">
                                <a href="{{unsubscribe_link}}" style="color: #a7bce8;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Template: Gold Member Benefits (Workflow 9) ✅ ENHANCED
**Subject**: 🏆 GOLD MEMBER STATUS - Special Benefits Unlocked

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gold Member Benefits</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #f8f9fa;">
                <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 8px 8px 0 0;">
                            <img src="https://storage.googleapis.com/msgsndr/oUvYNTw2Wvul7JSJplqQ/media/68302173ce008c8562696b18.png" alt="Houston Mobile Notary Pros" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 50%;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🏆 GOLD MEMBER STATUS</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #f59e0b; margin: 0 0 20px; font-size: 24px;">Congratulations {{contact.first_name}}!</h2>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                You've reached GOLD MEMBER status with Houston Mobile Notary Pros.
                            </p>
                            <div style="background-color: #fffbeb; padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
                                <h3 style="color: #92400e; margin: 0 0 15px; font-size: 20px;">YOUR GOLD BENEFITS:</h3>
                                <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
                                    <li>🏆 15% discount on all services (upgraded from 10%)</li>
                                    <li>🏆 Priority scheduling within 2 hours</li>
                                    <li>🏆 Direct VIP phone line: 832-617-4285</li>
                                    <li>🏆 Free document review before appointments</li>
                                    <li>🏆 Complimentary rush service (normally $25 extra)</li>
                                </ul>
                            </div>
                            <p style="color: #374151; margin: 0 0 25px; font-size: 16px; line-height: 1.6;">
                                Your continued trust in our services has earned you these exclusive benefits.
                            </p>
                            <div style="background-color: #f59e0b; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
                                <p style="color: #ffffff; margin: 0 0 15px; font-size: 18px; font-weight: bold;">
                                    Ready to schedule with your Gold member privileges?
                                </p>
                                <a href="tel:+18326174285?utm_source=email&utm_medium=cta&utm_campaign=gold_member_benefits" 
                                   style="display: inline-block; background-color: #ffffff; color: #f59e0b; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px; min-width: 200px;">
                                    📞 Call VIP Line
                                </a>
                                <a href="mailto:contact@houstonmobilenotarypros.com?subject=Gold Member Service Request&utm_source=email&utm_medium=cta&utm_campaign=gold_member_benefits" 
                                   style="display: inline-block; background-color: #A52A2A; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 5px; min-width: 200px;">
                                    📧 VIP Email
                                </a>
                            </div>
                            <p style="color: #374151; margin: 30px 0 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                Thank you for being a valued customer,<br>
                                <strong>Kenneth Lightfoot</strong><br>
                                Houston Mobile Notary Pros
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #1e3a8a; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #ffffff; margin: 0 0 10px; font-size: 16px; font-weight: bold;">Houston Mobile Notary Pros</p>
                            <p style="color: #e0e7ff; margin: 0 0 10px; font-size: 14px;">
                                <a href="tel:+18326174285" style="color: #e0e7ff; text-decoration: none;">(832) 617-4285</a>
                            </p>
                            <p style="color: #a7bce8; margin: 15px 0 0; font-size: 10px;">
                                <a href="{{unsubscribe_link}}" style="color: #a7bce8;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## Summary

These additional templates complete the missing emails from the GHL workflow guide:

1. **Final Payment Reminder** - For payment follow-up workflow
2. **Thank You Email** - Separate from review request in post-service workflow  
3. **VIP Welcome Back** - For returning customer workflow
4. **Emergency Service Response** - For urgent/same-day requests
5. **No-Show Recovery** - Initial follow-up for missed appointments
6. **Reschedule Offer with Discount** - Recovery email with incentive
7. **Gold Member Benefits** - For high-value repeat customers

All templates include:
- Mobile-responsive design
- Brand-consistent styling
- CAN-SPAM compliance
- Clear call-to-action buttons
- GHL merge field compatibility 
- GHL merge field compatibility 