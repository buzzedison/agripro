'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, Bell, Eye, Star, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  unit_of_measurement: string;
}

interface Region {
  id: string;
  name: string;
  country: string;
}

interface Market {
  id: string;
  name: string;
  market_type: string;
}

interface Watchlist {
  id: string;
  name: string;
  description: string;
  products: string[];
  regions: string[];
  markets: string[];
  is_default: boolean;
  is_public: boolean;
  alert_settings: any;
  created_at: string;
}

interface MarketAlert {
  id: string;
  product_id: string;
  region_id: string;
  alert_type: string;
  threshold_price: number;
  threshold_percentage: number;
  condition_operator: string;
  is_active: boolean;
  notification_methods: string[];
  frequency: string;
  last_triggered_at: string;
  trigger_count: number;
}

const WatchlistManager: React.FC = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('watchlists');

  // Form states
  const [showCreateWatchlist, setShowCreateWatchlist] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(null);
  const [editingAlert, setEditingAlert] = useState<MarketAlert | null>(null);

  // New watchlist form
  const [newWatchlist, setNewWatchlist] = useState({
    name: '',
    description: '',
    products: [] as string[],
    regions: [] as string[],
    markets: [] as string[],
    is_public: false,
    alert_settings: {
      price_alerts: true,
      trend_alerts: true,
      volatility_alerts: false
    }
  });

  // New alert form
  const [newAlert, setNewAlert] = useState({
    product_id: '',
    region_id: 'all',
    alert_type: 'price_threshold',
    threshold_price: '',
    threshold_percentage: '',
    condition_operator: 'greater_than',
    notification_methods: ['in_app'] as string[],
    frequency: 'immediate'
  });

  // Load initial data
  useEffect(() => {
    loadWatchlists();
    loadAlerts();
    loadProducts();
    loadRegions();
  }, []);

  const loadWatchlists = async () => {
    try {
      const response = await fetch('/api/market-analyzer/watchlists');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setWatchlists(data.watchlists || []);
      }
    } catch (error) {
      console.error('Error loading watchlists:', error);
      setError('Failed to load watchlists');
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/market-analyzer/alerts');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      setError('Failed to load alerts');
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/market-analyzer/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadRegions = async () => {
    try {
      const response = await fetch('/api/market-analyzer/regions');
      const data = await response.json();
      setRegions(data.regions || []);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const createWatchlist = async () => {
    if (!newWatchlist.name.trim()) {
      setError('Watchlist name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/market-analyzer/watchlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWatchlist),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setWatchlists([...watchlists, data.watchlist]);
        setShowCreateWatchlist(false);
        setNewWatchlist({
          name: '',
          description: '',
          products: [],
          regions: [],
          markets: [],
          is_public: false,
          alert_settings: {
            price_alerts: true,
            trend_alerts: true,
            volatility_alerts: false
          }
        });
      }
    } catch (error) {
      console.error('Error creating watchlist:', error);
      setError('Failed to create watchlist');
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    if (!newAlert.product_id || (!newAlert.threshold_price && !newAlert.threshold_percentage)) {
      setError('Product and threshold are required');
      return;
    }

    setLoading(true);
    try {
      const alertData = {
        ...newAlert,
        region_id: newAlert.region_id === 'all' ? null : newAlert.region_id,
        threshold_price: newAlert.threshold_price ? parseFloat(newAlert.threshold_price) : null,
        threshold_percentage: newAlert.threshold_percentage ? parseFloat(newAlert.threshold_percentage) : null
      };

      const response = await fetch('/api/market-analyzer/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setAlerts([...alerts, data.alert]);
        setShowCreateAlert(false);
        setNewAlert({
          product_id: '',
          region_id: 'all',
          alert_type: 'price_threshold',
          threshold_price: '',
          threshold_percentage: '',
          condition_operator: 'greater_than',
          notification_methods: ['in_app'],
          frequency: 'immediate'
        });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      setError('Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const deleteWatchlist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this watchlist?')) return;

    try {
      const response = await fetch(`/api/market-analyzer/watchlists?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setWatchlists(watchlists.filter(w => w.id !== id));
      }
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      setError('Failed to delete watchlist');
    }
  };

  const deleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      const response = await fetch(`/api/market-analyzer/alerts?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setAlerts(alerts.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      setError('Failed to delete alert');
    }
  };

  const toggleAlert = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/market-analyzer/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, is_active: isActive }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setAlerts(alerts.map(alert => 
          alert.id === id ? { ...alert, is_active: isActive } : alert
        ));
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
      setError('Failed to update alert');
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getRegionName = (regionId: string) => {
    if (!regionId || regionId === 'all') return 'All Regions';
    const region = regions.find(r => r.id === regionId);
    return region ? `${region.name}, ${region.country}` : 'Unknown Region';
  };

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'price_threshold': return 'Price Threshold';
      case 'trend_change': return 'Trend Change';
      case 'volatility': return 'High Volatility';
      case 'supply_shortage': return 'Supply Shortage';
      default: return alertType;
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'price_threshold': return <TrendingUp className="w-4 h-4" />;
      case 'trend_change': return <TrendingDown className="w-4 h-4" />;
      case 'volatility': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Watchlists & Alerts</h2>
          <p className="text-gray-600">Manage your market monitoring and notification preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setActiveTab('watchlists')}
            variant={activeTab === 'watchlists' ? 'default' : 'outline'}
          >
            <Eye className="w-4 h-4 mr-2" />
            Watchlists
          </Button>
          <Button 
            onClick={() => setActiveTab('alerts')}
            variant={activeTab === 'alerts' ? 'default' : 'outline'}
          >
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Watchlists Tab */}
      {activeTab === 'watchlists' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Watchlists</h3>
            <Button onClick={() => setShowCreateWatchlist(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Watchlist
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlists.map(watchlist => (
              <Card key={watchlist.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{watchlist.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {watchlist.is_default && (
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {watchlist.is_public && (
                        <Badge variant="outline">Public</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{watchlist.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Products:</span>
                      <span className="font-medium">{watchlist.products.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Regions:</span>
                      <span className="font-medium">{watchlist.regions.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Markets:</span>
                      <span className="font-medium">{watchlist.markets.length}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingWatchlist(watchlist)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWatchlist(watchlist.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {watchlists.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Watchlists Yet</h3>
                <p className="text-gray-600 mb-4">Create your first watchlist to start monitoring market prices.</p>
                <Button onClick={() => setShowCreateWatchlist(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Watchlist
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Alerts</h3>
            <Button onClick={() => setShowCreateAlert(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </div>

          <div className="space-y-4">
            {alerts.map(alert => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${alert.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{getProductName(alert.product_id)}</h4>
                        <p className="text-sm text-gray-600">
                          {getAlertTypeLabel(alert.alert_type)} - {getRegionName(alert.region_id)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        {alert.threshold_price && (
                          <p className="text-sm font-medium">
                            ${alert.threshold_price.toFixed(2)}
                          </p>
                        )}
                        {alert.threshold_percentage && (
                          <p className="text-sm font-medium">
                            {alert.threshold_percentage}%
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {alert.condition_operator.replace('_', ' ')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={alert.is_active}
                          onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Notifications: {alert.notification_methods.join(', ')}</span>
                      <span>Frequency: {alert.frequency}</span>
                      {alert.trigger_count > 0 && (
                        <span>Triggered: {alert.trigger_count} times</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {alerts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Set</h3>
                <p className="text-gray-600 mb-4">Create alerts to get notified about important market changes.</p>
                <Button onClick={() => setShowCreateAlert(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Watchlist Modal */}
      {showCreateWatchlist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Watchlist</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="watchlistName">Name *</Label>
                <Input
                  id="watchlistName"
                  value={newWatchlist.name}
                  onChange={(e) => setNewWatchlist({...newWatchlist, name: e.target.value})}
                  placeholder="My Watchlist"
                />
              </div>

              <div>
                <Label htmlFor="watchlistDescription">Description</Label>
                <Textarea
                  id="watchlistDescription"
                  value={newWatchlist.description}
                  onChange={(e) => setNewWatchlist({...newWatchlist, description: e.target.value})}
                  placeholder="Description of what you're monitoring..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newWatchlist.is_public}
                  onCheckedChange={(checked) => setNewWatchlist({...newWatchlist, is_public: checked})}
                />
                <Label>Make watchlist public</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateWatchlist(false)}>
                Cancel
              </Button>
              <Button onClick={createWatchlist} disabled={loading}>
                {loading ? 'Creating...' : 'Create Watchlist'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Alert</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="alertProduct">Product *</Label>
                <Select value={newAlert.product_id} onValueChange={(value) => setNewAlert({...newAlert, product_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="alertRegion">Region</Label>
                <Select value={newAlert.region_id} onValueChange={(value) => setNewAlert({...newAlert, region_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}, {region.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="alertType">Alert Type</Label>
                <Select value={newAlert.alert_type} onValueChange={(value) => setNewAlert({...newAlert, alert_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_threshold">Price Threshold</SelectItem>
                    <SelectItem value="trend_change">Trend Change</SelectItem>
                    <SelectItem value="volatility">High Volatility</SelectItem>
                    <SelectItem value="supply_shortage">Supply Shortage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newAlert.alert_type === 'price_threshold' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="thresholdPrice">Price Threshold</Label>
                    <Input
                      id="thresholdPrice"
                      type="number"
                      step="0.01"
                      value={newAlert.threshold_price}
                      onChange={(e) => setNewAlert({...newAlert, threshold_price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={newAlert.condition_operator} onValueChange={(value) => setNewAlert({...newAlert, condition_operator: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater_than">Greater than</SelectItem>
                        <SelectItem value="less_than">Less than</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newAlert.frequency} onValueChange={(value) => setNewAlert({...newAlert, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateAlert(false)}>
                Cancel
              </Button>
              <Button onClick={createAlert} disabled={loading}>
                {loading ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistManager; 