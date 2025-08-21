'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Calculator, 
  Plus, 
  Minus, 
  Save, 
  Download, 
  Share2, 
  TrendingUp, 
  DollarSign,
  ChevronRight,
  ChevronLeft,
  FileText,
  BarChart3,
  AlertCircle,
  Check,
  X,
  Info,
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Home
} from 'lucide-react';

// Types
interface CostItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency?: string;
}

interface RevenueItem {
  id: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalRevenue: number;
}

interface Scenario {
  id: string;
  name: string;
  costAdjustment: number;
  revenueAdjustment: number;
  roi: number;
  netProfit: number;
  paybackPeriod: number;
}

interface CalculationData {
  title: string;
  calculationType: 'crop' | 'livestock' | 'mixed' | 'aquaculture' | 'agribusiness';
  description: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
  currency: string;
  timeframe: {
    duration: number;
    unit: 'months' | 'years' | 'seasons';
  };
  cropDetails?: {
    cropType: string;
    landSize: { size: number; unit: string };
    expectedYield: { quantity: number; unit: string };
    sellingPrice: number;
  };
  livestockDetails?: {
    livestockType: string;
    numberOfAnimals: number;
    productionType: string;
    productionCapacity: { quantity: number; unit: string };
    sellingPrice: number;
  };
  initialInvestment: CostItem[];
  operatingCosts: CostItem[];
  primaryProduct: RevenueItem;
  secondaryProducts: RevenueItem[];
  scenarios: Scenario[];
  notes: string;
}

interface CalculationResults {
  totalInitialInvestment: number;
  totalOperatingCosts: number;
  totalCosts: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  paybackPeriod: number;
  profitMargin: number;
  breakEvenPoint: number;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

const CROP_TYPES = [
  'Wheat', 'Corn', 'Rice', 'Soybeans', 'Cotton', 'Sugarcane',
  'Coffee', 'Cocoa', 'Potatoes', 'Tomatoes', 'Onions', 'Cassava',
  'Yam', 'Plantain', 'Maize', 'Sorghum', 'Millet', 'Groundnuts',
  'Cowpeas', 'Beans', 'Sweet Potato', 'Pepper', 'Okra', 'Other'
];

const LIVESTOCK_TYPES = [
  'Dairy Cattle', 'Beef Cattle', 'Poultry (Broilers)', 'Poultry (Layers)',
  'Goats', 'Sheep', 'Pigs', 'Fish', 'Rabbits', 'Ducks', 'Turkeys', 'Other'
];

const COST_CATEGORIES = [
  'Land Purchase/Lease', 'Equipment/Machinery', 'Infrastructure',
  'Seeds/Seedlings', 'Animals/Livestock', 'Tools', 'Storage Facilities',
  'Irrigation Systems', 'Fencing', 'Fertilizers', 'Pesticides/Herbicides',
  'Feed', 'Veterinary Services', 'Labor', 'Utilities', 'Transportation',
  'Insurance', 'Maintenance', 'Marketing', 'Other'
];

export default function EnhancedROICalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [calculationData, setCalculationData] = useState<CalculationData>({
    title: '',
    calculationType: 'crop',
    description: '',
    location: { country: '', region: '', city: '' },
    currency: 'USD',
    timeframe: { duration: 1, unit: 'years' },
    initialInvestment: [],
    operatingCosts: [],
    primaryProduct: { id: '1', productName: '', quantity: 0, pricePerUnit: 0, totalRevenue: 0 },
    secondaryProducts: [],
    scenarios: [],
    notes: ''
  });
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText, description: 'Project details' },
    { id: 2, title: 'Production', icon: TrendingUp, description: 'Farming details' },
    { id: 3, title: 'Costs', icon: DollarSign, description: 'Investment & expenses' },
    { id: 4, title: 'Revenue', icon: BarChart3, description: 'Income projections' },
    { id: 5, title: 'Results', icon: Calculator, description: 'ROI analysis' }
  ];

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || '$';
  };

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol(calculationData.currency);
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const addCostItem = (type: 'initial' | 'operating') => {
    const newItem: CostItem = {
      id: Date.now().toString(),
      category: '',
      description: '',
      amount: 0,
      frequency: type === 'operating' ? 'annually' : undefined
    };

    setCalculationData(prev => ({
      ...prev,
      [type === 'initial' ? 'initialInvestment' : 'operatingCosts']: [
        ...prev[type === 'initial' ? 'initialInvestment' : 'operatingCosts'],
        newItem
      ]
    }));
  };

  const updateCostItem = (id: string, field: keyof CostItem, value: any, type: 'initial' | 'operating') => {
    setCalculationData(prev => ({
      ...prev,
      [type === 'initial' ? 'initialInvestment' : 'operatingCosts']: prev[type === 'initial' ? 'initialInvestment' : 'operatingCosts'].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeCostItem = (id: string, type: 'initial' | 'operating') => {
    setCalculationData(prev => ({
      ...prev,
      [type === 'initial' ? 'initialInvestment' : 'operatingCosts']: prev[type === 'initial' ? 'initialInvestment' : 'operatingCosts'].filter(item => item.id !== id)
    }));
  };

  const addSecondaryProduct = () => {
    const newProduct: RevenueItem = {
      id: Date.now().toString(),
      productName: '',
      quantity: 0,
      pricePerUnit: 0,
      totalRevenue: 0
    };

    setCalculationData(prev => ({
      ...prev,
      secondaryProducts: [...prev.secondaryProducts, newProduct]
    }));
  };

  const updateRevenueItem = (id: string, field: keyof RevenueItem, value: any, isPrimary: boolean = false) => {
    if (isPrimary) {
      setCalculationData(prev => ({
        ...prev,
        primaryProduct: { ...prev.primaryProduct, [field]: value }
      }));
    } else {
      setCalculationData(prev => ({
        ...prev,
        secondaryProducts: prev.secondaryProducts.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }));
    }
  };

  const calculateROI = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const totalInitialInvestment = calculationData.initialInvestment.reduce((sum, item) => sum + item.amount, 0);
      const totalOperatingCosts = calculationData.operatingCosts.reduce((sum, item) => sum + item.amount, 0);
      const totalCosts = totalInitialInvestment + totalOperatingCosts;
      
      const primaryRevenue = calculationData.primaryProduct.quantity * calculationData.primaryProduct.pricePerUnit;
      const secondaryRevenue = calculationData.secondaryProducts.reduce((sum, item) => 
        sum + (item.quantity * item.pricePerUnit), 0
      );
      const totalRevenue = primaryRevenue + secondaryRevenue;
      
      const netProfit = totalRevenue - totalCosts;
      const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const paybackPeriod = netProfit > 0 ? (totalInitialInvestment / (netProfit / 12)) : 0;
      const breakEvenPoint = totalOperatingCosts > 0 ? totalInitialInvestment / totalOperatingCosts : 0;

      setResults({
        totalInitialInvestment,
        totalOperatingCosts,
        totalCosts,
        totalRevenue,
        netProfit,
        roi,
        paybackPeriod,
        profitMargin,
        breakEvenPoint
      });
      
      setIsCalculating(false);
    }, 1000);
  };

  const saveCalculation = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/roi-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...calculationData,
          results,
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast.success('Calculation saved successfully!');
      } else {
        throw new Error('Failed to save calculation');
      }
    } catch (error) {
      toast.error('Failed to save calculation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const exportCalculation = async (format: 'csv' | 'pdf') => {
    try {
      if (format === 'pdf') {
        generatePDF({ calculationData, results });
        return;
      }

      const response = await fetch('/api/roi-calculator/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Export-Format': format,
          'Calculation-Data': JSON.stringify({ calculationData, results })
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roi-calculation-${calculationData.title || 'untitled'}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success(`${format.toUpperCase()} exported successfully!`);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()}. Please try again.`);
    }
  };

  const generatePDF = (data: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ROI Calculation Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .card { border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
            .highlight { background-color: #f0f9ff; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ROI Calculation Report</h1>
            <h2>${data.calculationData.title}</h2>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h3>Project Overview</h3>
            <p><strong>Type:</strong> ${data.calculationData.calculationType}</p>
            <p><strong>Description:</strong> ${data.calculationData.description}</p>
            <p><strong>Duration:</strong> ${data.calculationData.timeframe.duration} ${data.calculationData.timeframe.unit}</p>
          </div>

          ${data.results ? `
            <div class="section highlight">
              <h3>Financial Results</h3>
              <div class="grid">
                <div>
                  <p><strong>Total Investment:</strong> ${formatCurrency(data.results.totalCosts)}</p>
                  <p><strong>Total Revenue:</strong> ${formatCurrency(data.results.totalRevenue)}</p>
                  <p><strong>Net Profit:</strong> ${formatCurrency(data.results.netProfit)}</p>
                </div>
                <div>
                  <p><strong>ROI:</strong> ${data.results.roi.toFixed(2)}%</p>
                  <p><strong>Profit Margin:</strong> ${data.results.profitMargin.toFixed(2)}%</p>
                  <p><strong>Payback Period:</strong> ${data.results.paybackPeriod.toFixed(1)} months</p>
                </div>
              </div>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
              <span>ROI Calculator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-black">ROI Calculator</h1>
              <p className="text-xs text-gray-600 hidden sm:block">Agricultural Investment Analysis</p>
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
                {/* Project Overview */}
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
                      <Label htmlFor="calculationType" className="text-sm font-medium text-black mb-2 block">
                        Farming Type *
                      </Label>
                      <Select
                        value={calculationData.calculationType}
                        onValueChange={(value: any) => setCalculationData(prev => ({ ...prev, calculationType: value }))}
                      >
                        <SelectTrigger className="w-full h-12 text-base border-gray-300 focus:border-green-500">
                          <SelectValue placeholder="Select farming type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="crop">🌾 Crop Farming</SelectItem>
                          <SelectItem value="livestock">🐄 Livestock Farming</SelectItem>
                          <SelectItem value="mixed">🚜 Mixed Farming</SelectItem>
                          <SelectItem value="aquaculture">🐟 Aquaculture</SelectItem>
                          <SelectItem value="agribusiness">🏢 Agribusiness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-black mb-2 block">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={calculationData.description}
                        onChange={(e) => setCalculationData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of your agricultural project..."
                        rows={3}
                        className="w-full text-base border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Settings */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-black">Location & Settings</h3>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration" className="text-sm font-medium text-black mb-2 block">
                        Duration
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={calculationData.timeframe.duration}
                        onChange={(e) => setCalculationData(prev => ({ 
                          ...prev, 
                          timeframe: { ...prev.timeframe, duration: parseInt(e.target.value) || 1 }
                        }))}
                        min="1"
                        className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeUnit" className="text-sm font-medium text-black mb-2 block">
                        Time Unit
                      </Label>
                      <Select
                        value={calculationData.timeframe.unit}
                        onValueChange={(value: any) => setCalculationData(prev => ({ 
                          ...prev, 
                          timeframe: { ...prev.timeframe, unit: value }
                        }))}
                      >
                        <SelectTrigger className="w-full h-12 text-base border-gray-300 focus:border-green-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                          <SelectItem value="seasons">Seasons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Production Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Crop Details */}
                {(calculationData.calculationType === 'crop' || calculationData.calculationType === 'mixed') && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-black">Crop Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cropType" className="text-sm font-medium text-black mb-2 block">
                          Crop Type *
                        </Label>
                        <Select
                          value={calculationData.cropDetails?.cropType || ''}
                          onValueChange={(value) => setCalculationData(prev => ({ 
                            ...prev, 
                            cropDetails: { ...prev.cropDetails, cropType: value } as any
                          }))}
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

                      <div>
                        <Label htmlFor="landSize" className="text-sm font-medium text-black mb-2 block">
                          Land Size *
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={calculationData.cropDetails?.landSize?.size || ''}
                            onChange={(e) => setCalculationData(prev => ({ 
                              ...prev, 
                              cropDetails: { 
                                ...prev.cropDetails, 
                                landSize: { ...prev.cropDetails?.landSize, size: parseFloat(e.target.value) || 0 }
                              } as any
                            }))}
                            placeholder="0"
                            className="flex-1 h-12 text-base border-gray-300 focus:border-green-500"
                          />
                          <Select
                            value={calculationData.cropDetails?.landSize?.unit || 'acres'}
                            onValueChange={(value) => setCalculationData(prev => ({ 
                              ...prev, 
                              cropDetails: { 
                                ...prev.cropDetails, 
                                landSize: { ...prev.cropDetails?.landSize, unit: value }
                              } as any
                            }))}
                          >
                            <SelectTrigger className="w-24 h-12 text-base border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="acres">Acres</SelectItem>
                              <SelectItem value="hectares">Hectares</SelectItem>
                              <SelectItem value="sqft">Sq Ft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="expectedYield" className="text-sm font-medium text-black mb-2 block">
                          Expected Yield *
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={calculationData.cropDetails?.expectedYield?.quantity || ''}
                            onChange={(e) => setCalculationData(prev => ({ 
                              ...prev, 
                              cropDetails: { 
                                ...prev.cropDetails, 
                                expectedYield: { ...prev.cropDetails?.expectedYield, quantity: parseFloat(e.target.value) || 0 }
                              } as any
                            }))}
                            placeholder="0"
                            className="flex-1 h-12 text-base border-gray-300 focus:border-green-500"
                          />
                          <Select
                            value={calculationData.cropDetails?.expectedYield?.unit || 'tons'}
                            onValueChange={(value) => setCalculationData(prev => ({ 
                              ...prev, 
                              cropDetails: { 
                                ...prev.cropDetails, 
                                expectedYield: { ...prev.cropDetails?.expectedYield, unit: value }
                              } as any
                            }))}
                          >
                            <SelectTrigger className="w-24 h-12 text-base border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="tons">Tons</SelectItem>
                              <SelectItem value="kg">Kg</SelectItem>
                              <SelectItem value="bags">Bags</SelectItem>
                              <SelectItem value="bushels">Bushels</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="sellingPrice" className="text-sm font-medium text-black mb-2 block">
                          Selling Price per Unit *
                        </Label>
                        <Input
                          type="number"
                          value={calculationData.cropDetails?.sellingPrice || ''}
                          onChange={(e) => setCalculationData(prev => ({ 
                            ...prev, 
                            cropDetails: { ...prev.cropDetails, sellingPrice: parseFloat(e.target.value) || 0 } as any
                          }))}
                          placeholder="0"
                          className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Livestock Details */}
                {(calculationData.calculationType === 'livestock' || calculationData.calculationType === 'mixed') && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-black">Livestock Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="livestockType" className="text-sm font-medium text-black mb-2 block">
                          Livestock Type *
                        </Label>
                        <Select
                          value={calculationData.livestockDetails?.livestockType || ''}
                          onValueChange={(value) => setCalculationData(prev => ({ 
                            ...prev, 
                            livestockDetails: { ...prev.livestockDetails, livestockType: value } as any
                          }))}
                        >
                          <SelectTrigger className="w-full h-12 text-base border-gray-300 focus:border-green-500">
                            <SelectValue placeholder="Select livestock type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {LIVESTOCK_TYPES.map(livestock => (
                              <SelectItem key={livestock} value={livestock}>{livestock}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="numberOfAnimals" className="text-sm font-medium text-black mb-2 block">
                          Number of Animals *
                        </Label>
                        <Input
                          type="number"
                          value={calculationData.livestockDetails?.numberOfAnimals || ''}
                          onChange={(e) => setCalculationData(prev => ({ 
                            ...prev, 
                            livestockDetails: { ...prev.livestockDetails, numberOfAnimals: parseInt(e.target.value) || 0 } as any
                          }))}
                          placeholder="0"
                          className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="productionType" className="text-sm font-medium text-black mb-2 block">
                          Production Type *
                        </Label>
                        <Input
                          value={calculationData.livestockDetails?.productionType || ''}
                          onChange={(e) => setCalculationData(prev => ({ 
                            ...prev, 
                            livestockDetails: { ...prev.livestockDetails, productionType: e.target.value } as any
                          }))}
                          placeholder="e.g., Milk, Eggs, Meat"
                          className="w-full h-12 text-base border-gray-300 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="productionCapacity" className="text-sm font-medium text-black mb-2 block">
                          Production Capacity *
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={calculationData.livestockDetails?.productionCapacity?.quantity || ''}
                            onChange={(e) => setCalculationData(prev => ({ 
                              ...prev, 
                              livestockDetails: { 
                                ...prev.livestockDetails, 
                                productionCapacity: { ...prev.livestockDetails?.productionCapacity, quantity: parseFloat(e.target.value) || 0 }
                              } as any
                            }))}
                            placeholder="0"
                            className="flex-1 h-12 text-base border-gray-300 focus:border-green-500"
                          />
                          <Select
                            value={calculationData.livestockDetails?.productionCapacity?.unit || 'per day'}
                            onValueChange={(value) => setCalculationData(prev => ({ 
                              ...prev, 
                              livestockDetails: { 
                                ...prev.livestockDetails, 
                                productionCapacity: { ...prev.livestockDetails?.productionCapacity, unit: value }
                              } as any
                            }))}
                          >
                            <SelectTrigger className="w-28 h-12 text-base border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="per day">Per Day</SelectItem>
                              <SelectItem value="per week">Per Week</SelectItem>
                              <SelectItem value="per month">Per Month</SelectItem>
                              <SelectItem value="per year">Per Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Cost Breakdown */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Initial Investment */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-black">Initial Investment</h3>
                    </div>
                    <Button
                      onClick={() => addCostItem('initial')}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Cost
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {calculationData.initialInvestment.map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Select
                            value={item.category}
                            onValueChange={(value) => updateCostItem(item.id, 'category', value, 'initial')}
                          >
                            <SelectTrigger className="h-10 text-sm border-gray-300">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {COST_CATEGORIES.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={item.description}
                            onChange={(e) => updateCostItem(item.id, 'description', e.target.value, 'initial')}
                            placeholder="Description"
                            className="h-10 text-sm border-gray-300"
                          />
                          <Input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateCostItem(item.id, 'amount', parseFloat(e.target.value) || 0, 'initial')}
                            placeholder="Amount"
                            className="h-10 text-sm border-gray-300"
                          />
                        </div>
                        <Button
                          onClick={() => removeCostItem(item.id, 'initial')}
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {calculationData.initialInvestment.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No initial investment items added yet. Click &quot;Add Cost&quot; to get started.
                      </div>
                    )}
                  </div>
                </div>

                {/* Operating Costs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-black">Operating Costs</h3>
                    </div>
                    <Button
                      onClick={() => addCostItem('operating')}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Cost
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {calculationData.operatingCosts.map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <Select
                            value={item.category}
                            onValueChange={(value) => updateCostItem(item.id, 'category', value, 'operating')}
                          >
                            <SelectTrigger className="h-10 text-sm border-gray-300">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {COST_CATEGORIES.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={item.description}
                            onChange={(e) => updateCostItem(item.id, 'description', e.target.value, 'operating')}
                            placeholder="Description"
                            className="h-10 text-sm border-gray-300"
                          />
                          <Input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateCostItem(item.id, 'amount', parseFloat(e.target.value) || 0, 'operating')}
                            placeholder="Amount"
                            className="h-10 text-sm border-gray-300"
                          />
                          <Select
                            value={item.frequency || 'annually'}
                            onValueChange={(value) => updateCostItem(item.id, 'frequency', value, 'operating')}
                          >
                            <SelectTrigger className="h-10 text-sm border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => removeCostItem(item.id, 'operating')}
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {calculationData.operatingCosts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No operating costs added yet. Click &quot;Add Cost&quot; to get started.
                      </div>
                    )}
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-black mb-2">Cost Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Initial Investment:</span>
                      <div className="font-semibold text-black">
                        {formatCurrency(calculationData.initialInvestment.reduce((sum, item) => sum + item.amount, 0))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Operating Costs:</span>
                      <div className="font-semibold text-black">
                        {formatCurrency(calculationData.operatingCosts.reduce((sum, item) => sum + item.amount, 0))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Revenue Projections */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Primary Product */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-black">Primary Product Revenue</h3>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="primaryProductName" className="text-sm font-medium text-black mb-2 block">
                          Product Name *
                        </Label>
                        <Input
                          id="primaryProductName"
                          value={calculationData.primaryProduct.productName}
                          onChange={(e) => updateRevenueItem(calculationData.primaryProduct.id, 'productName', e.target.value, true)}
                          placeholder="e.g., Maize, Milk, Eggs"
                          className="h-10 text-sm border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="primaryQuantity" className="text-sm font-medium text-black mb-2 block">
                          Quantity *
                        </Label>
                        <Input
                          id="primaryQuantity"
                          type="number"
                          value={calculationData.primaryProduct.quantity}
                          onChange={(e) => updateRevenueItem(calculationData.primaryProduct.id, 'quantity', parseFloat(e.target.value) || 0, true)}
                          placeholder="0"
                          className="h-10 text-sm border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="primaryPrice" className="text-sm font-medium text-black mb-2 block">
                          Price per Unit *
                        </Label>
                        <Input
                          id="primaryPrice"
                          type="number"
                          value={calculationData.primaryProduct.pricePerUnit}
                          onChange={(e) => updateRevenueItem(calculationData.primaryProduct.id, 'pricePerUnit', parseFloat(e.target.value) || 0, true)}
                          placeholder="0"
                          className="h-10 text-sm border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="primaryTotal" className="text-sm font-medium text-black mb-2 block">
                          Total Revenue
                        </Label>
                        <div className="h-10 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-semibold">
                          {formatCurrency(calculationData.primaryProduct.quantity * calculationData.primaryProduct.pricePerUnit)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Products */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-black">Secondary Products</h3>
                    </div>
                    <Button
                      onClick={addSecondaryProduct}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {calculationData.secondaryProducts.map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <Input
                            value={item.productName}
                            onChange={(e) => updateRevenueItem(item.id, 'productName', e.target.value)}
                            placeholder="Product name"
                            className="h-10 text-sm border-gray-300"
                          />
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateRevenueItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Quantity"
                            className="h-10 text-sm border-gray-300"
                          />
                          <Input
                            type="number"
                            value={item.pricePerUnit}
                            onChange={(e) => updateRevenueItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                            placeholder="Price per unit"
                            className="h-10 text-sm border-gray-300"
                          />
                          <div className="h-10 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-semibold">
                            {formatCurrency(item.quantity * item.pricePerUnit)}
                          </div>
                        </div>
                        <Button
                          onClick={() => setCalculationData(prev => ({
                            ...prev,
                            secondaryProducts: prev.secondaryProducts.filter(p => p.id !== item.id)
                          }))}
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {calculationData.secondaryProducts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No secondary products added yet. Click &quot;Add Product&quot; to include additional revenue streams.
                      </div>
                    )}
                  </div>
                </div>

                {/* Revenue Summary */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-black mb-2">Revenue Summary</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Primary Product:</span>
                      <div className="font-semibold text-black">
                        {formatCurrency(calculationData.primaryProduct.quantity * calculationData.primaryProduct.pricePerUnit)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Secondary Products:</span>
                      <div className="font-semibold text-black">
                        {formatCurrency(calculationData.secondaryProducts.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Revenue:</span>
                      <div className="font-semibold text-black">
                        {formatCurrency(
                          (calculationData.primaryProduct.quantity * calculationData.primaryProduct.pricePerUnit) +
                          calculationData.secondaryProducts.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0)
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Results & Analysis */}
            {currentStep === 5 && (
              <div className="space-y-6">
                {results ? (
                  <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{results.roi.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">ROI</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(results.netProfit)}</div>
                        <div className="text-sm text-gray-600">Net Profit</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{results.paybackPeriod.toFixed(1)} years</div>
                        <div className="text-sm text-gray-600">Payback Period</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">{results.profitMargin.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Profit Margin</div>
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
                            <span className="text-gray-600">Initial Investment:</span>
                            <span className="font-semibold text-black">{formatCurrency(results.totalInitialInvestment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Operating Costs:</span>
                            <span className="font-semibold text-black">{formatCurrency(results.totalOperatingCosts)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Total Costs:</span>
                            <span className="font-semibold text-black">{formatCurrency(results.totalCosts)}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Net Profit:</span>
                            <span className={`font-semibold ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(results.netProfit)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Break-even Point:</span>
                            <span className="font-semibold text-black">{formatCurrency(results.breakEvenPoint)}</span>
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
                          onClick={() => exportCalculation('pdf')}
                          className="flex items-center space-x-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Export PDF</span>
                        </Button>
                        <Button
                          onClick={() => exportCalculation('csv')}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export CSV</span>
                        </Button>
                        <Button
                          onClick={saveCalculation}
                          disabled={isSaving}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSaving ? 'Saving...' : 'Save to Database'}</span>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Calculator className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-black mb-2">Ready to Calculate</h3>
                    <p className="text-gray-600 mb-6">Click the button below to analyze your ROI based on the information provided.</p>
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