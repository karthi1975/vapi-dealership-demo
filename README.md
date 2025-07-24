# VAPI Dealership Demo - Railway Backend

A production-ready backend for car dealership AI voice agent using VAPI, deployed on Railway.

## =€ Features

- VAPI webhook integration for voice agent callbacks
- Mock inventory search functionality
- Dashboard API for call analytics
- Rate limiting for free tier optimization
- Health check endpoint
- Secure with Helmet.js
- CORS configured for production

## =Ë Prerequisites

- Node.js 18.x or higher
- Railway account
- VAPI account (optional for testing)

## =à Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd vapi-dealership-railway
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## =á API Endpoints

### Health Check
- `GET /health` - Server health status

### VAPI Integration
- `POST /vapi/webhook` - VAPI webhook endpoint
- `POST /vapi/function/checkInventory` - Inventory search function
- `POST /vapi/function/transferToHuman` - Transfer to human agent

### Dashboard API
- `GET /api/dashboard` - Call analytics data

### Inventory API
- `GET /api/inventory` - Vehicle inventory
  - Query params: `make`, `model`, `maxPrice`

## =€ Railway Deployment

### Quick Deploy

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize and deploy:
```bash
railway init
railway up
```

4. Get your app URL:
```bash
railway domain
```

### Environment Variables

Set these in Railway dashboard or CLI:

```bash
NODE_ENV=production
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GROQ_API_KEY=your_groq_key
GOOGLE_SHEETS_CREDENTIALS=your_credentials_json
SPREADSHEET_ID=your_spreadsheet_id
```

## >ê Testing

Test your deployed endpoints:

```bash
# Health check
curl https://your-app.railway.app/health

# Test VAPI webhook
curl -X POST https://your-app.railway.app/vapi/webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "call": {"id": "test123"}}'

# Test inventory
curl https://your-app.railway.app/api/inventory?make=Toyota
```

## =Ê Monitoring

View logs in Railway:
```bash
railway logs --follow
```

Or in Railway dashboard ’ Your Project ’ Logs

## =' Configuration

### Rate Limiting
Configured in `src/server.js`:
- VAPI endpoints: 50 requests/minute
- API endpoints: 100 requests/minute

### CORS
Update allowed origins in `src/server.js` for production.

## =È Next Steps

1. Connect Supabase for data persistence
2. Integrate Google Sheets for inventory
3. Add Groq for AI responses
4. Configure VAPI assistant with your webhook URL
5. Set up monitoring and alerts

## > Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## =Ä License

MIT License - see LICENSE file for details