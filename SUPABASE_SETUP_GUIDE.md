# 🗄️ Supabase Database Setup Guide - VAPI Squads

## Overview
This guide will help you set up the complete Supabase database schema for the car dealership VAPI Squads system with full data tracking, analytics, and multi-agent support.

## 📋 **Database Schema Overview**

### **Core Tables (15 Total)**

1. **customers** - Customer information and contact details
2. **calls** - Call tracking and metadata
3. **call_transfers** - Agent transfer history
4. **customer_intents** - Intent recognition and classification
5. **vehicle_interests** - Customer vehicle preferences
6. **test_drive_bookings** - Test drive scheduling
7. **financing_applications** - Loan and financing data
8. **trade_in_evaluations** - Trade-in vehicle assessments
9. **agent_performance** - Agent metrics and analytics
10. **conversation_logs** - Detailed conversation tracking
11. **inventory** - Real-time vehicle inventory
12. **service_appointments** - Service scheduling
13. **parts_orders** - Parts and accessories
14. **promotions** - Marketing and promotional offers
15. **lead_follow_ups** - Follow-up scheduling

## 🚀 **Setup Steps**

### **Step 1: Create Supabase Project**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name:** `vapi-dealership-squads`
   - **Database Password:** (generate a strong password)
   - **Region:** Choose closest to your users
5. Click "Create new project"

### **Step 2: Get Connection Details**

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL:** `https://your-project-ref.supabase.co`
   - **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Step 3: Update Environment Variables**

In your Railway dashboard, update these variables:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### **Step 4: Run Database Schema**

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the entire content from `supabase-schema.sql`
3. Paste and run the SQL script
4. Verify all tables are created successfully

### **Step 5: Verify Schema Creation**

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all 15 tables listed.

## 📊 **Database Features**

### **Real-time Data Tracking**
- ✅ **Call lifecycle** tracking (start → transfers → end)
- ✅ **Customer journey** mapping across agents
- ✅ **Intent classification** with confidence scores
- ✅ **Transfer history** with reasons and context
- ✅ **Performance metrics** for each agent

### **Analytics & Reporting**
- ✅ **Call analytics** by date range
- ✅ **Agent performance** tracking
- ✅ **Customer journey** analysis
- ✅ **Intent distribution** reports
- ✅ **Transfer pattern** analysis

### **Data Relationships**
```
customers (1) ←→ (many) calls
calls (1) ←→ (many) call_transfers
calls (1) ←→ (many) customer_intents
calls (1) ←→ (many) vehicle_interests
calls (1) ←→ (many) conversation_logs
```

## 🔧 **API Integration Points**

### **Webhook Data Flow**
```javascript
// Call Started
POST /squads/webhook
{
  "event": "call-started",
  "call": { "id": "call_123", "customer": { "number": "+1234567890" } }
}
→ Creates record in `calls` table

// Transfer Requested
POST /squads/webhook
{
  "event": "transfer-requested",
  "fromAgent": "leadQualifier",
  "toAgent": "salesAgent",
  "reason": "qualified_lead"
}
→ Creates record in `call_transfers` table

// Call Ended
POST /squads/webhook
{
  "event": "call-ended",
  "call": { "duration": 300, "outcome": "sale" }
}
→ Updates `calls` table with end time and summary
```

### **Function Integration**
```javascript
// Lead Qualification
POST /squads/function/leadQualification
{
  "customerInfo": { "phoneNumber": "+1234567890", "name": "John Doe" },
  "callId": "call_123"
}
→ Creates/updates `customers` table
→ Logs intent in `customer_intents` table

// Transfer Agent
POST /squads/function/transferAgent
{
  "currentAgent": "salesAgent",
  "conversationContext": { "intent": "testDrive" },
  "callId": "call_123"
}
→ Logs transfer intent
→ Determines next agent
```

## 📈 **Analytics Endpoints**

### **Call Analytics**
```bash
GET /squads/analytics/calls?startDate=2024-01-01&endDate=2024-01-31
```

Response:
```json
{
  "success": true,
  "analytics": {
    "totalCalls": 150,
    "avgDuration": 240,
    "totalTransfers": 45,
    "mostActiveAgent": "salesAgent",
    "topIntent": "vehicle_inquiry"
  }
}
```

### **Agent Performance**
```bash
GET /squads/analytics/agent/salesAgent?startDate=2024-01-01&endDate=2024-01-31
```

Response:
```json
{
  "success": true,
  "agentName": "salesAgent",
  "performance": {
    "callsHandled": 45,
    "transfersOut": 12,
    "transfersIn": 8,
    "avgCallDuration": 280,
    "customerSatisfaction": 4.2,
    "resolutionRate": 0.85
  }
}
```

## 🎯 **Sample Data**

### **Inventory Sample**
```sql
INSERT INTO inventory (make, model, year, price, mileage, condition, vin, status) VALUES
('Toyota', 'Camry', 2023, 28999.00, 15000, 'used', '1HGBH41JXMN109186', 'available'),
('Honda', 'Civic', 2024, 32999.00, 0, 'new', '2T1BURHE0JC123456', 'available'),
('Ford', 'F-150', 2023, 45999.00, 25000, 'used', '1FTEW1EG8JFA12345', 'available');
```

### **Promotions Sample**
```sql
INSERT INTO promotions (title, description, discount_percentage, valid_from, valid_until, is_active) VALUES
('Summer Sale', 'Get up to 15% off on all used vehicles', 15.00, '2024-06-01', '2024-08-31', true),
('New Car Special', '0% APR financing on all new vehicles', 0.00, '2024-01-01', '2024-12-31', true);
```

## 🔍 **Database Functions**

### **Call Analytics Function**
```sql
SELECT * FROM get_call_analytics('2024-01-01', '2024-01-31');
```

### **Customer Journey Function**
```sql
SELECT * FROM get_customer_journey('+1234567890');
```

## 🛡️ **Security Features**

### **Row Level Security (RLS)**
- ✅ All tables have RLS enabled
- ✅ Authenticated users can access all data
- ✅ Secure API access with JWT tokens

### **Indexes for Performance**
- ✅ Optimized queries for phone numbers
- ✅ Fast lookups by customer ID
- ✅ Efficient date range queries
- ✅ Agent performance tracking

## 📊 **Monitoring & Maintenance**

### **Database Health Checks**
```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public';

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes;
```

### **Performance Monitoring**
- ✅ **Query performance** tracking
- ✅ **Index usage** monitoring
- ✅ **Connection pool** management
- ✅ **Storage usage** tracking

## 🚀 **Deployment Checklist**

- ✅ **Supabase project** created
- ✅ **Environment variables** configured
- ✅ **Database schema** deployed
- ✅ **Sample data** inserted
- ✅ **RLS policies** configured
- ✅ **Indexes** created
- ✅ **Functions** deployed
- ✅ **API integration** tested

## 📞 **Your Live System**

**Database:** Supabase PostgreSQL  
**Tables:** 15 comprehensive tables  
**Functions:** Analytics and journey tracking  
**Security:** RLS enabled with JWT authentication  
**Performance:** Optimized indexes and queries  

Your VAPI Squads system now has a complete, production-ready database that tracks every interaction, transfer, and outcome! 🚗📞🗄️ 