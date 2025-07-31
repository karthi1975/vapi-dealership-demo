# 🏗️ VAPI Dealership System - High-Level Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CUSTOMER TOUCHPOINTS                                   │
├─────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
│        Phone Call           │        Email               │        Web Link             │
│    📞 +1-475-422-8650       │    📧 Delayed 20min        │    🌐 Inventory Page        │
└──────────────┬──────────────┴──────────────┬──────────────┴──────────────┬──────────────┘
               │                             │                             │
               ▼                             ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    AI VOICE LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                            VAPI Platform (Lead Qualifier AI)                              │
│  • Natural conversation    • Vehicle preference capture    • Email/phone collection      │
│  • Intent recognition      • Lead qualification logic      • Tool function calls         │
└─────────────────────────────────────┬───────────────────────────────────────────────────┘
                                      │ Webhooks
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION LAYER (Railway)                                  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│   ┌────────────────┐    ┌─────────────────────┐    ┌─────────────────────────────┐    │
│   │  VAPI Webhooks │    │   Core Services      │    │   Background Jobs          │    │
│   ├────────────────┤    ├─────────────────────┤    ├─────────────────────────────┤    │
│   │ • Tool Calls   │    │ • Lead Processing    │    │ • Email Scheduler (cron)   │    │
│   │ • Transfers    │───▶│ • Inventory Matching │───▶│ • SMS Queue (future)       │    │
│   │ • Call Events  │    │ • Link Generation    │    │ • Education Campaigns      │    │
│   └────────────────┘    │ • Score Calculation  │    │ • Daily Reports            │    │
│                         └─────────────────────┘    └─────────────────────────────┘    │
│                                      │                             │                     │
└──────────────────────────────────────┼─────────────────────────────┼───────────────────┘
                                      ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA LAYER                                            │
├────────────────────────┬───────────────────────────┬────────────────────────────────────┤
│      Supabase DB       │    Google Sheets         │       External APIs               │
│  ┌─────────────────┐   │  ┌─────────────────┐    │  ┌──────────────────────────┐     │
│  │ • customers     │   │  │ Lead Tracking   │    │  │ • Gmail SMTP            │     │
│  │ • inventory     │   │  │ Spreadsheet     │    │  │ • Twilio SMS (future)   │     │
│  │ • call_logs     │   │  │                 │    │  │ • CRM Integration       │     │
│  │ • transcripts   │   │  │ Real-time sync  │    │  │ • Payment APIs          │     │
│  │ • shared_links  │   │  └─────────────────┘    │  └──────────────────────────┘     │
│  │ • communications │   │                         │                                    │
│  │ • campaigns     │   │                         │                                    │
│  └─────────────────┘   │                         │                                    │
└────────────────────────┴───────────────────────────┴────────────────────────────────────┘
```

## 📊 Data Flow Diagram

```
Customer Call ──┐
                ▼
        ┌───────────────┐
        │  VAPI AI      │
        │ Conversation  │
        └───────┬───────┘
                │
        Collect │ Data
                ▼
    ┌─────────────────────┐
    │ Enhanced Lead       │
    │ Qualification Tool  │
    └─────────┬───────────┘
              │
      ┌───────┴───────┬──────────┬─────────────┐
      ▼               ▼          ▼             ▼
 Store Customer  Match Cars  Generate Link  Schedule Email
  (Supabase)    (Inventory)  (Short URL)    (20min delay)
      │               │          │             │
      └───────┬───────┴──────────┴─────────────┘
              ▼
        Google Sheets
        (Lead Track)
              │
              ▼
    ┌─────────────────┐
    │ Customer Gets:  │
    │ • SMS Link      │
    │ • Email Summary │
    │ • Education     │
    └─────────────────┘
```

## 🔧 Component Details

### 1. **Customer Interface Layer**
- **Phone**: VAPI number for inbound calls
- **Web**: Personalized inventory pages
- **Email**: Automated follow-ups

### 2. **AI Processing Layer**
- **VAPI Assistant**: Natural language understanding
- **Tool Functions**: 
  - enhancedLeadQualification
  - enhancedInventorySearch
  - transferToAgent

### 3. **Application Services**
- **Express.js Server**: Core API
- **Webhook Handlers**: Process VAPI events
- **Business Logic**:
  - Lead scoring algorithm
  - Inventory matching engine
  - Link generation system

### 4. **Background Processing**
- **Node-Cron Scheduler**:
  - Email queue (every minute)
  - SMS queue (every 30 seconds)
  - Daily reports (8 AM)
  - Link cleanup (2 AM)

### 5. **Data Storage**
- **Supabase PostgreSQL**:
  - Customer profiles
  - Vehicle inventory
  - Call transcripts
  - Communication logs
- **Google Sheets**: Real-time lead dashboard

### 6. **Communication Channels**
- **Email**: Gmail SMTP / SendGrid
- **SMS**: Twilio (optional)
- **Voice**: VAPI platform

## 🔄 Key Workflows

### Inbound Call Flow:
```
1. Customer calls → VAPI answers
2. AI gathers: name, email, phone, vehicle preferences
3. System searches inventory in real-time
4. Generates personalized link
5. Assigns salesperson
6. Schedules follow-up communications
```

### Post-Call Automation:
```
Immediate: Log to database + Google Sheets
5 minutes: SMS with inventory link (if enabled)
20 minutes: Detailed email with matches
Day 1-14: Education email series
Daily: Manager reports at 8 AM
```

## 🎯 Feature Capabilities

### Lead Capture & Qualification
- **Multi-field Data Collection**: Name, phone, email (required), vehicle preferences
- **Advanced Vehicle Matching**: Year, make, model, mileage range, price range, stock number
- **Real-time Lead Scoring**: 0-100 score based on budget, timeline, intent
- **Intent Analysis**: Browse, buy, finance, test drive

### Inventory Management
- **100+ Vehicle Database**: Imported from CSV with full details
- **Dynamic Search**: Real-time matching during calls
- **Shareable Links**: Unique URLs for each customer
- **Click Tracking**: Monitor customer engagement

### Communication Automation
- **Delayed Email System**: 20-minute delay for personalized follow-up
- **Education Campaigns**: 7-email series over 14 days
- **SMS Integration**: Ready for Twilio integration
- **Manager Reports**: Daily summaries at 8 AM

### Customer Experience
- **Personalized Web Pages**: Mobile-responsive inventory display
- **Contact Forms**: Direct communication with assigned salesperson
- **Multi-channel Follow-up**: Email, SMS, and education content
- **Persistent Links**: 30-day expiration with tracking

## 🔐 Security & Scalability

### Security Measures
- **API Key Authentication**: All external services secured
- **Environment Variables**: Sensitive data in Railway config
- **HTTPS Only**: SSL/TLS on all endpoints
- **Data Validation**: Input sanitization on all forms

### Scalability Features
- **Stateless Architecture**: Horizontal scaling ready
- **Background Job Queue**: Async processing for communications
- **Database Indexing**: Optimized queries for inventory search
- **CDN Ready**: Static assets can be offloaded

### Monitoring & Reliability
- **Health Checks**: `/health` endpoint for uptime monitoring
- **Error Logging**: Comprehensive error tracking
- **Graceful Shutdown**: Proper cleanup on deployment
- **Retry Logic**: Failed emails retry automatically

## 🚀 Deployment Architecture

```
GitHub Repo ──push──> Railway ──deploy──> Production
                         │
                         ├── Environment Variables
                         ├── Auto SSL/TLS
                         ├── Load Balancing
                         └── Continuous Deployment
```

### Infrastructure Stack
- **Hosting**: Railway (PaaS)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: In-database for now, S3 ready
- **Email**: Gmail SMTP / SendGrid
- **DNS**: Railway provided or custom domain

## 📈 Performance Metrics

### Current Capabilities
- **Concurrent Calls**: 10+ simultaneous VAPI calls
- **Email Processing**: 60 emails/minute
- **Inventory Search**: <500ms response time
- **Link Generation**: Instant with 10-character codes
- **Database Queries**: Indexed for sub-second responses

### Monitoring Points
- Call completion rate
- Email delivery success
- Link click-through rate
- Lead qualification score distribution
- Average response times

## 🔧 Technical Stack

### Backend
- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Database ORM**: Supabase JS Client
- **Email**: Nodemailer
- **Scheduling**: Node-cron
- **Security**: Helmet, CORS

### Integrations
- **VAPI**: Voice AI platform
- **Supabase**: Database and auth
- **Google Sheets**: Lead tracking
- **Gmail**: Email delivery
- **Railway**: Deployment platform

### Frontend (Inventory Pages)
- **Pure HTML/CSS/JavaScript**: No framework needed
- **Responsive Design**: Mobile-first approach
- **Interactive Forms**: Native form validation
- **Analytics Ready**: GA/GTM compatible

## 🚦 System Status Indicators

### Green (Healthy)
- All services initialized
- Email queue processing
- Database connected
- VAPI webhooks responding

### Yellow (Degraded)
- Email delays >5 minutes
- Slow inventory searches
- High error rate in logs

### Red (Critical)
- Database connection lost
- VAPI webhooks failing
- Email service down
- Railway deployment failed

## 📚 Documentation

### For Developers
- API endpoints documented in code
- Environment variables in `.env.example`
- Database schema in `/migrations`
- Deployment guide included

### For Operations
- Health check endpoint
- Log aggregation ready
- Error tracking built-in
- Performance metrics available

### For Business Users
- Google Sheets real-time dashboard
- Daily email reports
- Lead scoring explanation
- ROI tracking ready

This architecture ensures:
- **Scalability**: Can handle growth from 10 to 10,000 calls/day
- **Reliability**: Multiple fallbacks and retry mechanisms
- **Flexibility**: Easy to add new features and integrations
- **Maintainability**: Clean separation of concerns
- **Cost-Effectiveness**: Efficient use of resources