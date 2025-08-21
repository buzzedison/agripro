'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { 
  TrendingUp, 
  DollarSign, 
  Calculator,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  BarChart3,
  Save,
  Download,
  Info,
  MapPin,
  LogIn
} from 'lucide-react';

// Define crop types
const CROP_TYPES = [
  'Wheat', 'Corn', 'Rice', 'Soybeans', 'Cotton', 'Sugarcane',
  'Coffee', 'Cocoa', 'Potatoes', 'Tomatoes', 'Onions', 'Cassava',
  'Yam', 'Plantain', 'Maize', 'Sorghum', 'Millet', 'Groundnuts',
  'Cowpeas', 'Beans', 'Sweet Potato', 'Pepper', 'Okra', 'Other'
];

// Define currency options
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

interface CropCalculationData {
  title: string;
  cropType: string;
  location: {
    country: string;
    region: string;
  };
  currency: string;
  landSize: {
    size: number;
    unit: string;
  };
  costs: {
    seedCost: number;
    fertilizerCost: number;
    laborCost: number;
    equipmentCost: number;
    otherCosts: number;
  };
  production: {
    expectedYield: number;
    yieldUnit: string;
    sellingPrice: number;
  };
}

interface CalculationResults {
  totalCosts: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  profitPerUnit: number;
  breakEvenYield: number;
}

export default function CropsCalculator() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [calculationData, setCalculationData] = useState<CropCalculationData>({
    title: '',
    cropType: '',
    location: { country: '', region: '' },
    currency: 'USD',
    landSize: { size: 0, unit: 'hectares' },
    costs: {
      seedCost: 0,
      fertilizerCost: 0,
      laborCost: 0,
      equipmentCost: 0,
      otherCosts: 0
    },
    production: {
      expectedYield: 0,
      yieldUnit: 'tons',
      sellingPrice: 0
    }
  });
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check user authentication
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const steps = [
    { id: 1, title: 'Basic Info', icon: Info, description: 'Project details' },
    { id: 2, title: 'Land & Crop', icon: TrendingUp, description: 'Crop and land details' },
    { id: 3, title: 'Costs', icon: DollarSign, description: 'All farming costs' },
    { id: 4, title: 'Production', icon: BarChart3, description: 'Yield and pricing' },
    { id: 5, title: 'Results', icon: Calculator, description: 'ROI analysis' }
  ];

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || '$';
  };

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol(calculationData.currency);
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateROI = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const totalCosts = Object.values(calculationData.costs).reduce((sum, cost) => sum + cost, 0);
      const totalRevenue = calculationData.production.expectedYield * calculationData.production.sellingPrice;
      const netProfit = totalRevenue - totalCosts;
      const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
      const profitPerUnit = calculationData.landSize.size > 0 ? netProfit / calculationData.landSize.size : 0;
      const breakEvenYield = calculationData.production.sellingPrice > 0 ? totalCosts / calculationData.production.sellingPrice : 0;

      setResults({
        totalCosts,
        totalRevenue,
        netProfit,
        roi,
        profitPerUnit,
        breakEvenYield
      });
      
      setIsCalculating(false);
      toast.success('ROI calculated successfully!');
    }, 1000);
  };

  const saveCalculation = async () => {
    if (!results) return;
    
    // Check if user is authenticated
    if (!user) {
      toast.error('Please log in to save calculations', {
        description: 'You need to be logged in to save your calculations.',
        action: {
          label: 'Log In',
          onClick: () => router.push('/auth/login')
        }
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('Saving calculation...', { user: user.email });
      
      const response = await fetch('/api/roi-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: calculationData.title,
          calculationType: 'crop',
          description: `Crop ROI calculation for ${calculationData.cropType}`,
          location: calculationData.location,
          currency: calculationData.currency,
          timeframe: { duration: 1, unit: 'years' },
          cropDetails: {
            cropType: calculationData.cropType,
            landSize: calculationData.landSize,
            expectedYield: {
              quantity: calculationData.production.expectedYield,
              unit: calculationData.production.yieldUnit
            },
            sellingPrice: calculationData.production.sellingPrice
          },
          costs: {
            initialInvestment: [
              { category: 'Seeds', description: 'Seed costs', amount: calculationData.costs.seedCost },
              { category: 'Fertilizer', description: 'Fertilizer costs', amount: calculationData.costs.fertilizerCost },
              { category: 'Equipment', description: 'Equipment costs', amount: calculationData.costs.equipmentCost }
            ],
            operatingCosts: [
              { category: 'Labor', description: 'Labor costs', amount: calculationData.costs.laborCost },
              { category: 'Other', description: 'Other costs', amount: calculationData.costs.otherCosts }
            ]
          },
          revenue: {
            primaryProduct: {
              productName: calculationData.cropType,
              quantity: calculationData.production.expectedYield,
              pricePerUnit: calculationData.production.sellingPrice,
              totalRevenue: results.totalRevenue
            }
          },
          calculations: {
            totalInitialInvestment: calculationData.costs.seedCost + calculationData.costs.fertilizerCost + calculationData.costs.equipmentCost,
            totalOperatingCosts: calculationData.costs.laborCost + calculationData.costs.otherCosts,
            totalCosts: results.totalCosts,
            totalRevenue: results.totalRevenue,
            netProfit: results.netProfit,
            roi: results.roi,
            profitMargin: ((results.netProfit / results.totalRevenue) * 100),
            breakEvenPoint: results.breakEvenYield
          },
          isPublic: false
        })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Save successful:', data);
        toast.success('Calculation saved successfully!', {
          description: 'Your crop ROI calculation has been saved to your account.'
        });
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        throw new Error(errorData.error || 'Failed to save calculation');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save calculation', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepData = () => steps.find(s => s.id === currentStep);

  return (
    <div className="bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <Link
              href="/knowledgehub"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Home className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
              <span>Knowledge Hub</span>
              <ChevronRight className="w-4 h-4" />
              <span>Crop Calculator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-black">Crop ROI Calculator</h1>
              <p className="text-xs text-gray-600 hidden sm:block">Calculate returns for crop farming</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Mobile Progress Indicator */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-black">{getCurrentStepData()?.title}</span>
          <span className="text-xs text-gray-500">{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep >= step.id 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.id ? <Check className="w-3 h-3" /> : step.id}
              </div>
              <span className="text-xs mt-1 text-center hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 md:px-6 max-w-4xl mx-auto">
        <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
          {/* Step Header */}
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
            <div className="flex items-center space-x-3">
              {(() => {
                const currentStepData = getCurrentStepData();
                const IconComponent = currentStepData?.icon;
                return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
              })()}
              <div>
                <CardTitle className="text-xl font-semibold">
                  {getCurrentStepData()?.title}
                </CardTitle>
                <p className="text-green-100 text-sm mt-1">
                  {getCurrentStepData()?.description}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-black">Project Overview</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium text-black mb-2 block">
                        Project Title *
                      </Label>
                      <Input
                        id="title"
                        value={calculationData.title}
                        onChange={(e) => setCalculationData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Maize Farming ROI 2024"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cropType" className="text-sm font-medium text-black mb-2 block">
                        Crop Type *
                      </Label>
                      <Select
                        value={calculationData.cropType}
                        onValueChange={(value) => setCalculationData(prev => ({ ...prev, cropType: value }))}
                      >
                        <SelectTrigger className="w-full h-12 text-base border-gray-300 focus:border-green-500">
                          <SelectValue placeholder="Select crop type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {CROP_TYPES.map(crop => (
                            <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-black">Location & Currency</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium text-black mb-2 block">
                        Country
                      </Label>
                      <Input
                        id="country"
                        value={calculationData.location.country}
                        onChange={(e) => setCalculationData(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, country: e.target.value }
                        }))}
                        placeholder="e.g., Ghana"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="currency" className="text-sm font-medium text-black mb-2 block">
                        Currency
                      </Label>
                      <Select
                        value={calculationData.currency}
                        onValueChange={(value) => setCalculationData(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className="w-full h-12 text-base border-gray-300 focus:border-green-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {CURRENCIES.map(currency => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.symbol} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Land & Crop Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-black">Land Size</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="landSize" className="text-sm font-medium text-black mb-2 block">
                        Land Size *
                      </Label>
                      <Input
                        id="landSize"
                        type="number"
                        value={calculationData.landSize.size}
                        onChange={(e) => setCalculationData(prev => ({ 
                          ...prev, 
                          landSize: { ...prev.landSize, size: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="landUnit" className="text-sm font-medium text-black mb-2 block">
                        Unit
                      </Label>
                      <Select
                        value={calculationData.landSize.unit}
                        onValueChange={(value) => setCalculationData(prev => ({ 
                          ...prev, 
                          landSize: { ...prev.landSize, unit: value }
                        }))}
                      >
                        <SelectTrigger className="w-full h-12 text-base border-gray-300 focus:border-green-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="hectares">Hectares</SelectItem>
                          <SelectItem value="acres">Acres</SelectItem>
                          <SelectItem value="plots">Plots</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-black mb-2">Selected Crop Information</h4>
                  <div className="text-sm">
                    <p><span className="font-medium">Crop:</span> {calculationData.cropType || 'Not selected'}</p>
                    <p><span className="font-medium">Land Size:</span> {calculationData.landSize.size} {calculationData.landSize.unit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Costs */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-black">Farming Costs</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="seedCost" className="text-sm font-medium text-black mb-2 block">
                        Seed Cost
                      </Label>
                      <Input
                        id="seedCost"
                        type="number"
                        value={calculationData.costs.seedCost}
                        onChange={(e) => setCalculationData(prev => ({ 
                          ...prev, 
                          costs: { ...prev.costs, seedCost: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fertilizerCost" className="text-sm font-medium text-black mb-2 block">
                        Fertilizer Cost
                      </Label>
                      <Input
                        id="fertilizerCost"
                        type="number"
                        value={calculationData.costs.fertilizerCost}
                        onChange={(e) => setCalculationData(prev => ({ 
                          ...prev, 
                          costs: { ...prev.costs, fertilizerCost: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="laborCost" className="text-sm font-medium text-black mb-2 block">
                        Labor Cost
                      </Label>
                      <Input
                        id="laborCost"
                        type="number"
                        value={calculationData.costs.laborCost}
                        onChange={(e) => setCalculationData(prev => ({ 
                          ...prev, 
                          costs: { ...prev.costs, laborCost: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="equipmentCost" className="text-sm font-medium text-black mb-2 block">
                        Equipment Cost
                      </Label>
                      <Input
                        id="equipmentCost"
                        type="number"
                        value={calculationData.costs.equipmentCost}
                        onChange={(e) => setCalculationData(prev => ({ 
                          ...prev, 
                          costs: { ...prev.costs, equipmentCost: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="otherCosts" className="text-sm font-medium text-black mb-2 block">
                        Other Costs
                      </Label>
                      <Input
                        id="otherCosts"
                        type="number"
                        value={calculationData.costs.otherCosts}
                        onChange={(e) => setCalculationData(prev => ({ 
                          ...prev, 
                          costs: { ...prev.costs, otherCosts: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-black mb-2">Total Costs</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(Object.values(calculationData.costs).reduce((sum, cost) => sum + cost, 0))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Production */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-black">Production Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expectedYield" className="text-sm font-medium text-black mb-2 block">
                        Expected Yield *
                      </Label>
                      <Input
                        id="expectedYield"
                        type="number"
                        value={calculationData.production.expectedYield}
                        onChange={(e) => setCalculationData(prev => ({ 
                          ...prev, 
                          production: { ...prev.production, expectedYield: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="yieldUnit" className="text-sm font-medium text-black mb-2 block">
                        Yield Unit
                      </Label>
                      <Select
                        value={calculationData.production.yieldUnit}
                        onValueChange={(value) => setCalculationData(prev => ({ 
                          ...prev, 
                          production: { ...prev.production, yieldUnit: value }
                        }))}
                      >
                        <SelectTrigger className="w-full h-12 text-base border-gray-300 focus:border-green-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="tons">Tons</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="bags">Bags</SelectItem>
                          <SelectItem value="bushels">Bushels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="sellingPrice" className="text-sm font-medium text-black mb-2 block">
                        Selling Price per {calculationData.production.yieldUnit} *
                      </Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        value={calculationData.production.sellingPrice}
                        onChange={(e) => setCalculationData(prev => ({ 
                          ...prev, 
                          production: { ...prev.production, sellingPrice: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-black mb-2">Expected Revenue</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculationData.production.expectedYield * calculationData.production.sellingPrice)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {calculationData.production.expectedYield} {calculationData.production.yieldUnit} × {formatCurrency(calculationData.production.sellingPrice)}
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Results */}
            {currentStep === 5 && (
              <div className="space-y-6">
                {results ? (
                  <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{results.roi.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">ROI</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(results.netProfit)}</div>
                        <div className="text-sm text-gray-600">Net Profit</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{formatCurrency(results.profitPerUnit)}</div>
                        <div className="text-sm text-gray-600">Profit per {calculationData.landSize.unit}</div>
                      </div>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="font-semibold text-black mb-4">Financial Analysis</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Revenue:</span>
                            <span className="font-semibold text-black">{formatCurrency(results.totalRevenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Costs:</span>
                            <span className="font-semibold text-black">{formatCurrency(results.totalCosts)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Net Profit:</span>
                            <span className={`font-semibold ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(results.netProfit)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Break-even Yield:</span>
                            <span className="font-semibold text-black">{results.breakEvenYield.toFixed(2)} {calculationData.production.yieldUnit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ROI:</span>
                            <span className={`font-semibold ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {results.roi.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Export Options */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-black mb-4">Export & Save Options</h4>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => window.print()}
                          className="flex items-center space-x-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Print Report</span>
                        </Button>
                        {user ? (
                          <Button
                            onClick={saveCalculation}
                            disabled={isSaving}
                            variant="outline"
                            className="flex items-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Saving...' : 'Save Calculation'}</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={() => router.push('/auth/login')}
                            variant="outline"
                            className="flex items-center space-x-2"
                          >
                            <LogIn className="w-4 h-4" />
                            <span>Login to Save</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Calculator className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-black mb-2">Ready to Calculate</h3>
                    <p className="text-gray-600 mb-6">Click the button below to analyze your crop farming ROI.</p>
                    <Button
                      onClick={calculateROI}
                      disabled={isCalculating}
                      className="bg-green-500 hover:bg-green-600 px-8 py-3 text-lg"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      {isCalculating ? 'Calculating...' : 'Calculate ROI'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 px-2">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center space-x-2 px-6 py-3 text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center space-x-2">
            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 px-6 py-3 text-base"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={calculateROI}
                disabled={isCalculating}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 px-6 py-3 text-base"
              >
                <Calculator className="w-4 h-4" />
                <span>{isCalculating ? 'Calculating...' : 'Calculate ROI'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
