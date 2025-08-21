# Real Data Integration Guide for Agricultural Market Analyzer

## Overview

This guide shows you how to replace sample data with real agricultural market data from various sources. The system is designed to seamlessly transition from sample data to real data sources.

## 🌍 Available Data Sources

### **Free Data Sources**

#### 1. FAO (Food and Agriculture Organization)
- **URL**: http://fenixservices.fao.org/faostat/api/v1/en/
- **Coverage**: Global agricultural statistics, producer prices
- **Cost**: Free (may require registration)
- **Data Types**: Producer prices, trade data, production statistics
- **Update Frequency**: Monthly/Quarterly

```typescript
// Example API call
const faoData = await fetch(
  'http://fenixservices.fao.org/faostat/api/v1/en/data/QP?area=KEN&item=MAIZE&year=2023'
);
```

#### 2. World Bank Commodity Price Data
- **URL**: https://api.worldbank.org/v2/en/indicator/
- **Coverage**: Global commodity prices
- **Cost**: Free
- **Data Types**: Monthly commodity prices, price indices
- **Update Frequency**: Monthly

```typescript
// Example API call
const worldBankData = await fetch(
  'https://api.worldbank.org/v2/en/indicator/PMAIZMTUSDM?country=KE&date=2023:2024&format=json'
);
```

#### 3. Kenya National Bureau of Statistics (KNBS)
- **URL**: https://www.knbs.or.ke/
- **Coverage**: Kenya-specific agricultural data
- **Cost**: Free
- **Data Types**: Market prices, agricultural surveys
- **Update Frequency**: Weekly/Monthly

### **Paid Data Sources**

#### 1. ESOKO Market Information Service
- **URL**: https://esoko.com/
- **Coverage**: West and East Africa
- **Cost**: Subscription-based (varies by country/data)
- **Data Types**: Daily market prices, SMS alerts, farmer data
- **Update Frequency**: Daily/Real-time

#### 2. Bloomberg Terminal/API
- **URL**: https://www.bloomberg.com/professional/support/api-library/
- **Coverage**: Global commodity markets
- **Cost**: Enterprise subscription ($2,000+/month)
- **Data Types**: Real-time prices, historical data, analytics
- **Update Frequency**: Real-time

#### 3. Refinitiv (Thomson Reuters)
- **URL**: https://developers.refinitiv.com/
- **Coverage**: Global financial and commodity data
- **Cost**: Enterprise subscription
- **Data Types**: Real-time prices, news, analytics
- **Update Frequency**: Real-time

## 🚀 Implementation Steps

### Step 1: Set Up Environment Variables

Create a `.env.local` file with your API keys:

```bash
# Core API Keys
FAO_API_KEY=your_fao_api_key
ESOKO_API_KEY=your_esoko_api_key
BLOOMBERG_API_KEY=your_bloomberg_key

# African Exchange APIs
NSE_KENYA_API_KEY=your_nse_kenya_key
GSE_GHANA_API_KEY=your_gse_ghana_key

# Notification Services
TWILIO_AUTH_TOKEN=your_twilio_token
SENDGRID_API_KEY=your_sendgrid_key
```

### Step 2: Modify the Market Analyzer Component

Update the `loadPriceData` function to use real APIs:

```typescript
// In MarketPriceAnalyzer.tsx
const loadPriceData = async () => {
  if (!selectedProduct) return;
  
  setLoading(true);
  setError(null);
  
  try {
    // Try real data sources first
    const realDataResponse = await fetch(`/api/market-analyzer/real-data?` + 
      new URLSearchParams({
        commodity: selectedProduct,
        country: selectedRegion,
        start_date: startDate,
        end_date: endDate,
        sources: 'fao,worldBank,esoko'
      }));
    
    const realData = await realDataResponse.json();
    
    if (realData.data && realData.data.length > 0) {
      // Use real data
      setPriceRecords(transformRealData(realData.data));
      setDataSource('real');
    } else {
      // Fallback to sample data
      generateSampleData();
      setDataSource('sample');
    }
    
  } catch (error) {
    console.error('Error loading real data:', error);
    // Fallback to sample data
    generateSampleData();
    setDataSource('sample');
  } finally {
    setLoading(false);
  }
};
```

### Step 3: Enable Real-time Updates

For real-time data, use WebSocket connections:

```typescript
// Connect to real-time data streams
useEffect(() => {
  if (liveUpdates && selectedProduct) {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket('wss://your-websocket-endpoint');
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        commodity: selectedProduct,
        region: selectedRegion
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updatePriceData(data);
    };
    
    return () => ws.close();
  }
}, [liveUpdates, selectedProduct, selectedRegion]);
```

### Step 4: Set Up Database with Real Data

Run the database migration to add real-time data tables:

```bash
# Apply the real-time data schema
psql -d your_database -f real_time_data_schema.sql
```

### Step 5: Configure Alerts

Set up price alerts with real notification channels:

```typescript
// Configure real alert notifications
const setupPriceAlerts = async () => {
  await fetch('/api/market-analyzer/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: selectedProduct,
      alert_type: 'price_above',
      threshold_value: 100,
      notification_channels: ['email', 'sms'],
      is_active: true
    })
  });
};
```

## 📊 Data Source Comparison

| Source | Cost | Coverage | Frequency | Data Quality | Setup Difficulty |
|--------|------|----------|-----------|--------------|------------------|
| FAO | Free | Global | Monthly | High | Easy |
| World Bank | Free | Global | Monthly | High | Easy |
| KNBS | Free | Kenya | Weekly | Medium | Easy |
| ESOKO | Paid | Africa | Daily | High | Medium |
| Bloomberg | Expensive | Global | Real-time | Very High | Hard |

## 🔧 Technical Architecture

### Data Flow:
1. **API Calls** → Fetch data from multiple sources
2. **Data Transformation** → Standardize format
3. **Database Storage** → Store in PostgreSQL
4. **Real-time Updates** → WebSocket connections
5. **User Interface** → Display in React components

### Caching Strategy:
```typescript
// Implement Redis caching for API responses
const cacheKey = `price_data_${commodity}_${region}_${date}`;
const cachedData = await redis.get(cacheKey);

if (cachedData) {
  return JSON.parse(cachedData);
} else {
  const freshData = await fetchFromAPI();
  await redis.setex(cacheKey, 300, JSON.stringify(freshData)); // 5min cache
  return freshData;
}
```

## 📋 Getting Started Checklist

### For Free Data Sources:
- [ ] Register for FAO API access
- [ ] Test World Bank API calls
- [ ] Set up error handling and fallbacks
- [ ] Implement data transformation
- [ ] Add caching layer

### For Paid Data Sources:
- [ ] Contact ESOKO for subscription
- [ ] Set up Bloomberg Terminal access
- [ ] Configure API authentication
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerts

### For Real-time Features:
- [ ] Set up WebSocket connections
- [ ] Configure push notifications
- [ ] Implement alert system
- [ ] Set up database triggers
- [ ] Test failover mechanisms

## 🌍 African Market-Specific Integration

### Kenya:
```typescript
const kenyaDataSources = {
  primary: 'KNBS', // Kenya National Bureau of Statistics
  secondary: 'EAX', // East Africa Exchange
  markets: ['Wakulima', 'Marikiti', 'Kongowea']
};
```

### Ghana:
```typescript
const ghanaDataSources = {
  primary: 'GSS', // Ghana Statistical Service
  secondary: 'GCX', // Ghana Commodity Exchange
  markets: ['Makola', 'Kaneshie', 'Kumasi Central']
};
```

### Nigeria:
```typescript
const nigeriaDataSources = {
  primary: 'NBS', // Nigeria Bureau of Statistics
  secondary: 'NCX', // Nigeria Commodity Exchange
  markets: ['Mile 12', 'Kano Central', 'Onitsha Main']
};
```

## 🚨 Error Handling & Fallbacks

```typescript
const dataFetchingStrategy = {
  primary: 'real_api',
  fallback: 'sample_data',
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    circuitBreaker: true,
    gracefulDegradation: true
  }
};
```

## 📈 Monitoring & Analytics

Track data source performance:
- API response times
- Success/failure rates
- Data quality scores
- User engagement with real vs sample data

## 💡 Pro Tips

1. **Start Small**: Begin with 1-2 free data sources
2. **Test Thoroughly**: Use staging environment for API integration
3. **Monitor Usage**: Track API quotas and costs
4. **Cache Aggressively**: Reduce API calls with smart caching
5. **Plan for Failures**: Always have fallback mechanisms
6. **User Communication**: Clearly indicate when using real vs sample data

## 🔗 Useful Resources

- [FAO API Documentation](http://fenixservices.fao.org/faostat/api/v1/en/)
- [World Bank API Guide](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392)
- [ESOKO Platform](https://esoko.com/)
- [African Development Bank Data Portal](https://dataportal.opendataforafrica.org/)
- [Agricultural Market Information Systems](https://www.fao.org/3/a0395e/a0395e00.htm)

---

**Ready to go live with real data?** Start with the free sources, then gradually add paid services as your user base grows and generates revenue to support the costs! 