# VAPI Dealership System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   EXTERNAL SERVICES                                  │
├─────────────────────────┬─────────────────────────┬─────────────────────────────────┤
│      VAPI Platform      │    Google Sheets API    │        Supabase                 │
│  ┌─────────────────┐    │  ┌─────────────────┐    │  ┌─────────────────────────┐   │
│  │ Lead Qualifier  │    │  │  Lead Tracking  │    │  │ • Customers Table       │   │
│  │ Assistant (AI)  │    │  │   Spreadsheet   │    │  │ • Calls Table           │   │
│  │ ID: 1506a9d9... │    │  │ ID: 1rcTY673... │    │  │ • Intents Table         │   │
│  └────────┬────────┘    │  └────────▲────────┘    │  │ • Call Transfers Table  │   │
│           │             │           │              │  │ • Call Contexts Table   │   │
│           │             │           │              │  └───────────▲─────────────┘   │
└───────────┼─────────────┴───────────┼──────────────┴──────────────┼─────────────────┘
            │                         │                             │
            │ Phone Call              │ Write Lead Data            │ Store Data
            │ (+14754228650)          │                             │
            ▼                         │                             │
┌─────────────────────────────────────┴─────────────────────────────┴─────────────────┐
│                           NODE.JS EXPRESS SERVER (Railway)                           │
│                     https://vapi-dealership-demo-production.up.railway.app           │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌────────────────┐     ┌──────────────────┐     ┌────────────────────────────┐   │
│  │   Webhooks     │     │    Services       │     │      API Routes            │   │
│  ├────────────────┤     ├──────────────────┤     ├────────────────────────────┤   │
│  │ /vapi-tools    │────▶│ googleSheets.js  │     │ /api/dashboard             │   │
│  │ - Tool calls   │     │ - Write leads    │     │ /api/inventory             │   │
│  │ - Transfers    │     │ - Calculate score│     │ /health                    │   │
│  └────────────────┘     │                  │     └────────────────────────────┘   │
│         │               │ supabase.js      │                                       │
│         │               │ - Customer CRUD  │                                       │
│         ▼               │ - Call logging   │                                       │
│  ┌────────────────┐     └──────────────────┘                                      │
│  │  Tool Handlers │                                                                │
│  ├────────────────┤     ┌──────────────────────────────────────────┐              │
│  │leadQualification│     │         Environment Variables           │              │
│  │checkInventory  │     ├──────────────────────────────────────────┤              │
│  │transferToAgent │     │ VAPI_API_KEY, DEALERSHIP_PHONE           │              │
│  │scheduleTestDrive│     │ GOOGLE_SHEETS_CREDENTIALS, SPREADSHEET_ID│              │
│  │calculatePayment│     │ SUPABASE_URL, SUPABASE_ANON_KEY         │              │
│  └────────────────┘     └──────────────────────────────────────────┘              │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘

## Call Flow Sequence

1. **Inbound Call** → VAPI Phone Number (+14754228650)
2. **Lead Qualifier Assistant** handles the call
3. **Information Gathering**:
   - Customer name, phone, email
   - Vehicle preferences (make, model, type)
   - Budget and timeline
   - Urgency level

4. **Lead Qualification** (via webhook to /vapi-tools):
   - Store customer in Supabase
   - Calculate lead score (0-100)
   - Write to Google Sheets
   - Return response to VAPI

5. **Call Transfer**:
   - transferToAgent("sales") called
   - Backend returns transfer directive
   - VAPI transfers to +18016809129

## Data Flow

```
Customer Call → VAPI → Lead Qualifier AI → Webhook → Backend Server
                                                         │
                                                         ├─→ Supabase (Store)
                                                         ├─→ Google Sheets (Track)
                                                         └─→ Phone Transfer
```

## Key Components

### 1. **VAPI Integration**
- Lead Qualifier Assistant with custom tools
- Webhook handling for tool calls
- Phone call transfers

### 2. **Database (Supabase)**
- Customer information storage
- Call history and intents
- Transfer logs
- Call contexts

### 3. **Google Sheets Integration**
- Real-time lead tracking
- Automatic lead scoring
- Business metrics dashboard

### 4. **Tool Functions**
- `leadQualification`: Process and score leads
- `transferToAgent`: Route calls to appropriate destination
- `checkInventory`: Search available vehicles
- `scheduleTestDrive`: Book appointments
- `calculatePayment`: Finance calculations

## Security & Configuration

- Environment variables for sensitive data
- Service account authentication for Google Sheets
- Supabase Row Level Security
- CORS configuration for API access

## Deployment

- **Platform**: Railway
- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Auto-deploy**: GitHub integration