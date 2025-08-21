import { NextRequest } from 'next/server';

// WebSocket configuration for real-time data
const WS_CONFIG = {
  // African commodity exchanges
  exchanges: {
    nairobi: {
      url: 'wss://www.nse.co.ke/api/websocket',
      commodities: ['maize', 'wheat', 'beans']
    },
    lagos: {
      url: 'wss://www.nse.com.ng/api/websocket', 
      commodities: ['maize', 'rice', 'cassava']
    },
    accra: {
      url: 'wss://gse.com.gh/api/websocket',
      commodities: ['cocoa', 'maize', 'rice']
    }
  },
  
  // Alternative real-time data providers
  providers: {
    agricx: {
      url: 'wss://agricx.co/api/websocket',
      apiKey: process.env.AGRICX_API_KEY
    },
    bloomberg: {
      url: 'wss://api.bloomberg.com/commodities',
      apiKey: process.env.BLOOMBERG_API_KEY
    }
  }
};

// WebSocket connection manager
class MarketDataWebSocket {
  private connections: Map<string, WebSocket> = new Map();
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  // Connect to real-time data source
  async connect(exchange: string, commodities: string[]) {
    const config = WS_CONFIG.exchanges[exchange as keyof typeof WS_CONFIG.exchanges];
    if (!config) {
      throw new Error(`Exchange ${exchange} not supported`);
    }

    try {
      const ws = new WebSocket(config.url);
      
      ws.onopen = () => {
        console.log(`Connected to ${exchange} exchange`);
        
        // Subscribe to commodity price feeds
        commodities.forEach(commodity => {
          if (config.commodities.includes(commodity)) {
            ws.send(JSON.stringify({
              action: 'subscribe',
              channel: `prices.${commodity}`,
              exchange: exchange
            }));
          }
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlePriceUpdate(data);
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${exchange}:`, error);
      };

      ws.onclose = () => {
        console.log(`Disconnected from ${exchange} exchange`);
        this.connections.delete(exchange);
      };

      this.connections.set(exchange, ws);
      return ws;

    } catch (error) {
      console.error(`Failed to connect to ${exchange}:`, error);
      throw error;
    }
  }

  // Handle incoming price updates
  private handlePriceUpdate(data: any) {
    const standardizedData = {
      timestamp: new Date().toISOString(),
      commodity: data.symbol || data.commodity,
      price: parseFloat(data.price || data.last_price),
      currency: data.currency || 'USD',
      exchange: data.exchange,
      volume: data.volume,
      change: data.change,
      change_percent: data.change_percent
    };

    // Notify all subscribers
    const key = `${data.exchange}_${data.commodity}`;
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => callback(standardizedData));
    }
  }

  // Subscribe to price updates
  subscribe(exchange: string, commodity: string, callback: (data: any) => void) {
    const key = `${exchange}_${commodity}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);
  }

  // Unsubscribe from price updates
  unsubscribe(exchange: string, commodity: string, callback: (data: any) => void) {
    const key = `${exchange}_${commodity}`;
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.delete(callback);
    }
  }

  // Disconnect from exchange
  disconnect(exchange: string) {
    const ws = this.connections.get(exchange);
    if (ws) {
      ws.close();
      this.connections.delete(exchange);
    }
  }

  // Disconnect all
  disconnectAll() {
    this.connections.forEach((ws, exchange) => {
      ws.close();
    });
    this.connections.clear();
    this.subscribers.clear();
  }
}

// Global WebSocket manager instance
const wsManager = new MarketDataWebSocket();

// HTTP endpoint to manage WebSocket connections
export async function POST(request: NextRequest) {
  try {
    const { action, exchange, commodities, commodity } = await request.json();

    switch (action) {
      case 'connect':
        if (!exchange || !commodities) {
          return Response.json({ error: 'Exchange and commodities required' }, { status: 400 });
        }
        
        await wsManager.connect(exchange, commodities);
        return Response.json({ 
          message: `Connected to ${exchange} exchange`,
          subscribed_commodities: commodities 
        });

      case 'disconnect':
        if (!exchange) {
          return Response.json({ error: 'Exchange required' }, { status: 400 });
        }
        
        wsManager.disconnect(exchange);
        return Response.json({ message: `Disconnected from ${exchange} exchange` });

      case 'disconnect_all':
        wsManager.disconnectAll();
        return Response.json({ message: 'Disconnected from all exchanges' });

      case 'status':
        const connections = Array.from(wsManager['connections'].keys());
        return Response.json({ 
          active_connections: connections,
          total_connections: connections.length 
        });

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('WebSocket API error:', error);
    return Response.json({ 
      error: 'WebSocket operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Mock real-time data for development/testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exchange = searchParams.get('exchange') || 'nairobi';
  const commodity = searchParams.get('commodity') || 'maize';

  // Simulate real-time price data
  const mockData = {
    timestamp: new Date().toISOString(),
    exchange: exchange,
    commodity: commodity,
    price: 45.67 + (Math.random() - 0.5) * 5, // Base price with volatility
    currency: 'KES',
    volume: Math.floor(Math.random() * 1000) + 100,
    change: (Math.random() - 0.5) * 2,
    change_percent: (Math.random() - 0.5) * 5,
    bid: 45.50,
    ask: 45.75,
    high: 47.20,
    low: 44.30,
    market_status: 'open'
  };

  return Response.json({
    data: mockData,
    note: 'This is simulated real-time data. Connect to actual exchanges for live data.'
  });
}

// Note: wsManager is available within this module but not exported
// to comply with Next.js API route requirements 