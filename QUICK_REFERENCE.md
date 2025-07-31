# 🎯 Quick Reference - VAPI Dealership System

## 🔑 Key URLs & Credentials

### Production URLs:
```
Main App: https://vapi-dealership-demo-production.up.railway.app
Health Check: https://vapi-dealership-demo-production.up.railway.app/health
Inventory Link: https://vapi-dealership-demo-production.up.railway.app/inventory/{code}
```

### VAPI Phone Number:
```
+1 (475) 422-8650
```

### Important Dashboards:
- VAPI: https://dashboard.vapi.ai
- Railway: https://railway.app/dashboard
- Supabase: https://app.supabase.com
- Google Sheets: [Your Sheet URL]

---

## 📞 Call Flow Script

### Customer calls → AI answers:
```
AI: "Thank you for calling! I'm here to help you find the perfect vehicle. May I have your name?"
Customer: "[Name]"

AI: "Nice to meet you, [Name]! And what's the best phone number to reach you?"
Customer: "[Phone]"

AI: "Great! And what's your email address so I can send you the vehicle details and pricing?"
Customer: "[Email]" ← REQUIRED

AI: "Perfect! Now, what type of vehicle are you looking for today?"
Customer: "[Vehicle preferences]"

AI: "Excellent! I found [X] vehicles that match your criteria. I'll send you a personalized link to [email] within 20 minutes where you can see photos, pricing, and features for each vehicle."
```

---

## 🛠️ Common Operations

### Check System Health:
```bash
curl https://vapi-dealership-demo-production.up.railway.app/health
```

### View Recent Logs:
```bash
railway logs --tail 100
```

### Test Email System:
```bash
# SSH into Railway
railway run node test-email-send.js
```

### Import New Inventory:
1. Update `100 Used_Cars_Inventory.csv`
2. Run: `railway run npm run import-inventory`

---

## 📊 Daily Monitoring

### Morning Checklist (9 AM):
- [ ] Check manager email for daily report
- [ ] Review Google Sheets for yesterday's leads
- [ ] Check Railway logs for any errors
- [ ] Verify email queue is empty

### Lead Quality Indicators:
- **Hot Lead**: Score 70-100, timeline "today/this week"
- **Warm Lead**: Score 40-69, timeline "this month"
- **Cold Lead**: Score <40, timeline "just browsing"

---

## 🚨 Troubleshooting

### Customer says "I didn't get the email":
1. Check communication_logs table in Supabase
2. Verify their email was captured correctly
3. Check spam folder
4. Manually resend if needed

### AI not answering calls:
1. Check VAPI dashboard for assistant status
2. Verify webhook URL in assistant settings
3. Check Railway deployment status

### Inventory not showing:
1. Verify inventory table has data
2. Check if search criteria too restrictive
3. Review shared_links table for the code

---

## 📈 Key Metrics

### Daily KPIs:
- Total calls received
- Email capture rate (should be >90%)
- Link click-through rate
- Lead score distribution
- Average call duration

### Where to Find:
- **Call Volume**: VAPI Dashboard
- **Email Stats**: communication_logs table
- **Link Clicks**: shared_links table
- **Lead Scores**: Google Sheets

---

## 👥 Team Contacts

### System Issues:
- Technical Lead: [Name] - [Email]
- Railway Support: support@railway.app
- VAPI Support: support@vapi.ai

### Business Questions:
- Sales Manager: [Name] - [Email]
- Dealership GM: [Name] - [Email]

---

## 🔧 Quick Fixes

### Reset Email Queue:
```sql
UPDATE communication_logs 
SET status = 'pending' 
WHERE status = 'failed' 
AND created_at > NOW() - INTERVAL '24 hours';
```

### Find Customer by Phone:
```sql
SELECT * FROM customers 
WHERE phone_number = '+1234567890';
```

### Check Today's Leads:
```sql
SELECT COUNT(*) FROM customers 
WHERE created_at > CURRENT_DATE;
```

---

## 📝 Environment Variables Checklist

Critical variables that must be set in Railway:
- [x] SUPABASE_URL
- [x] SUPABASE_ANON_KEY
- [x] GOOGLE_SHEETS_CREDENTIALS
- [x] SPREADSHEET_ID
- [x] VAPI_API_KEY
- [x] EMAIL_SERVICE
- [x] EMAIL_USER/SMTP_USER
- [x] EMAIL_APP_PASSWORD/SMTP_PASS
- [x] BASE_URL
- [x] MANAGER_EMAILS

---

## 🎯 Success Checklist

System is working when:
- ✅ Calls are being answered
- ✅ Emails sending after 20 minutes
- ✅ Google Sheets updating
- ✅ Inventory links clickable
- ✅ Daily reports arriving
- ✅ No errors in logs

---

## 📞 Emergency Procedures

### System Down:
1. Check Railway deployment status
2. Verify all environment variables
3. Restart service: `railway restart`
4. Check Supabase connection
5. Verify VAPI webhook URL

### Mass Email Failure:
1. Check email credentials
2. Verify Gmail app password
3. Check email service logs
4. Switch to backup email service
5. Process failed emails manually

---

Keep this guide handy for daily operations!