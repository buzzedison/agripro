'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useToast } from '@/app/components/ui/use-toast';

// Define livestock types
const LIVESTOCK_TYPES = [
  { id: 'dairy', name: 'Dairy', type: 'dairy' },
  { id: 'beef', name: 'Beef Cattle', type: 'meat' },
  { id: 'poultry_meat', name: 'Poultry (Meat)', type: 'meat' },
  { id: 'poultry_eggs', name: 'Poultry (Eggs)', type: 'dairy' },
  { id: 'sheep_meat', name: 'Sheep (Meat)', type: 'meat' },
  { id: 'sheep_wool', name: 'Sheep (Wool)', type: 'dairy' },
  { id: 'goats', name: 'Goats', type: 'dairy' },
  { id: 'pigs', name: 'Pigs', type: 'meat' },
  { id: 'fish', name: 'Fish Farming', type: 'meat' }
];

// Define the calculation result type
interface CalculationResult {
  totalCost: number;
  totalRevenue: number;
  roi: number;
  livestockType: string;
  productionType: 'dairy' | 'meat';
  timestamp: number;
  type: 'livestock';
  name?: string;
  inputs: {
    livestockType: string;
    numAnimals: number;
    purchaseCost: number;
    feedCost: number;
    veterinaryCost: number;
    otherExpenses: number;
    productionAmount: number;
    sellingPrice: number;
  };
}

export default function LivestockCalculator() {
  const { toast } = useToast();
  const [calculationName, setCalculationName] = useState('');
  const [inputs, setInputs] = useState({
    livestockType: '',
    numAnimals: 0,
    purchaseCost: 0,
    feedCost: 0,
    veterinaryCost: 0,
    otherExpenses: 0,
    productionAmount: 0,
    sellingPrice: 0
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getProductionType = (livestockType: string): 'dairy' | 'meat' | '' => {
    const livestock = LIVESTOCK_TYPES.find(item => item.id === livestockType);
    return livestock ? livestock.type as 'dairy' | 'meat' : '';
  };

  const getProductionLabel = (productionType: 'dairy' | 'meat' | '') => {
    if (productionType === 'dairy') {
      return 'Milk/Eggs Production (per animal per day)';
    } else if (productionType === 'meat') {
      return 'Weight per Animal (kg)';
    }
    return '';
  };

  const getSellingPriceLabel = (productionType: 'dairy' | 'meat' | '') => {
    if (productionType === 'dairy') {
      return 'Selling Price (per liter/per egg)';
    } else if (productionType === 'meat') {
      return 'Selling Price (per kg)';
    }
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    const numericValue = field !== 'livestockType' ? parseFloat(value) || 0 : value;
    setInputs({ ...inputs, [field]: numericValue });
    
    // Clear error for this field if it exists
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    
    if (!inputs.livestockType) {
      newErrors.livestockType = 'Please select a livestock type';
    }
    
    const numericFields = [
      { name: 'numAnimals', label: 'Number of animals' },
      { name: 'purchaseCost', label: 'Purchase cost' },
      { name: 'feedCost', label: 'Feed cost' },
      { name: 'veterinaryCost', label: 'Veterinary cost' },
      { name: 'otherExpenses', label: 'Other expenses' },
      { name: 'productionAmount', label: 'Production amount' },
      { name: 'sellingPrice', label: 'Selling price' }
    ];
    
    numericFields.forEach(field => {
      const value = inputs[field.name as keyof typeof inputs] as number;
      if (value <= 0) {
        newErrors[field.name] = `${field.label} must be greater than zero`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateROI = () => {
    if (!validateInputs()) {
      toast({
        variant: 'destructive',
        title: 'Invalid inputs',
        description: 'Please correct the errors before calculating ROI.'
      });
      return;
    }
    
    const productionType = getProductionType(inputs.livestockType);
    
    // Calculate total cost
    const totalCost = 
      (inputs.purchaseCost + inputs.feedCost + inputs.veterinaryCost) * inputs.numAnimals + 
      inputs.otherExpenses;
    
    // Calculate total revenue based on production type
    let totalRevenue = 0;
    
    if (productionType === 'dairy') {
      // For dairy, calculate annual production
      totalRevenue = inputs.productionAmount * 365 * inputs.numAnimals * inputs.sellingPrice;
    } else if (productionType === 'meat') {
      // For meat, calculate one-time sale
      totalRevenue = inputs.productionAmount * inputs.numAnimals * inputs.sellingPrice;
    }
    
    // Calculate ROI
    const roi = ((totalRevenue - totalCost) / totalCost) * 100;
    
    const calculationResult: CalculationResult = {
      totalCost,
      totalRevenue,
      roi,
      livestockType: inputs.livestockType,
      productionType: productionType as 'dairy' | 'meat',
      timestamp: Date.now(),
      type: 'livestock',
      inputs: { ...inputs }
    };
    
    setResult(calculationResult);
  };

  const saveCalculation = () => {
    if (!result) return;
    
    if (!calculationName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please provide a name for this calculation before saving.'
      });
      return;
    }
    
    // Get existing saved calculations
    const savedCalculationsJSON = localStorage.getItem('agriproROICalculations');
    const savedCalculations = savedCalculationsJSON ? JSON.parse(savedCalculationsJSON) : [];
    
    // Add new calculation with name
    const calculationToSave = {
      ...result,
      name: calculationName
    };
    
    savedCalculations.push(calculationToSave);
    
    // Save back to localStorage
    localStorage.setItem('agriproROICalculations', JSON.stringify(savedCalculations));
    
    toast({
      title: 'Calculation saved',
      description: `"${calculationName}" has been saved successfully.`
    });
    
    // Reset calculation name
    setCalculationName('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const productionType = getProductionType(inputs.livestockType);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="livestockType">Livestock Type</Label>
            <Select
              value={inputs.livestockType}
              onValueChange={(value) => handleInputChange('livestockType', value)}
            >
              <SelectTrigger id="livestockType" className={errors.livestockType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select livestock type" />
              </SelectTrigger>
              <SelectContent>
                {LIVESTOCK_TYPES.map((livestock) => (
                  <SelectItem key={livestock.id} value={livestock.id}>
                    {livestock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.livestockType && <p className="text-red-500 text-sm mt-1">{errors.livestockType}</p>}
          </div>

          <div>
            <Label htmlFor="numAnimals">Number of Animals</Label>
            <Input
              id="numAnimals"
              type="number"
              min="1"
              step="1"
              value={inputs.numAnimals || ''}
              onChange={(e) => handleInputChange('numAnimals', e.target.value)}
              className={errors.numAnimals ? 'border-red-500' : ''}
            />
            {errors.numAnimals && <p className="text-red-500 text-sm mt-1">{errors.numAnimals}</p>}
          </div>

          <div>
            <Label htmlFor="purchaseCost">Purchase Cost (per animal)</Label>
            <Input
              id="purchaseCost"
              type="number"
              min="0.01"
              step="0.01"
              value={inputs.purchaseCost || ''}
              onChange={(e) => handleInputChange('purchaseCost', e.target.value)}
              className={errors.purchaseCost ? 'border-red-500' : ''}
            />
            {errors.purchaseCost && <p className="text-red-500 text-sm mt-1">{errors.purchaseCost}</p>}
          </div>

          <div>
            <Label htmlFor="feedCost">Feed Cost (per animal per year)</Label>
            <Input
              id="feedCost"
              type="number"
              min="0.01"
              step="0.01"
              value={inputs.feedCost || ''}
              onChange={(e) => handleInputChange('feedCost', e.target.value)}
              className={errors.feedCost ? 'border-red-500' : ''}
            />
            {errors.feedCost && <p className="text-red-500 text-sm mt-1">{errors.feedCost}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="veterinaryCost">Veterinary Cost (per animal per year)</Label>
            <Input
              id="veterinaryCost"
              type="number"
              min="0.01"
              step="0.01"
              value={inputs.veterinaryCost || ''}
              onChange={(e) => handleInputChange('veterinaryCost', e.target.value)}
              className={errors.veterinaryCost ? 'border-red-500' : ''}
            />
            {errors.veterinaryCost && <p className="text-red-500 text-sm mt-1">{errors.veterinaryCost}</p>}
          </div>

          <div>
            <Label htmlFor="otherExpenses">Other Expenses (total per year)</Label>
            <Input
              id="otherExpenses"
              type="number"
              min="0"
              step="0.01"
              value={inputs.otherExpenses || ''}
              onChange={(e) => handleInputChange('otherExpenses', e.target.value)}
              className={errors.otherExpenses ? 'border-red-500' : ''}
            />
            {errors.otherExpenses && <p className="text-red-500 text-sm mt-1">{errors.otherExpenses}</p>}
          </div>

          <div>
            <Label htmlFor="productionAmount">{getProductionLabel(productionType)}</Label>
            <Input
              id="productionAmount"
              type="number"
              min="0.01"
              step="0.01"
              value={inputs.productionAmount || ''}
              onChange={(e) => handleInputChange('productionAmount', e.target.value)}
              className={errors.productionAmount ? 'border-red-500' : ''}
              disabled={!productionType}
            />
            {errors.productionAmount && <p className="text-red-500 text-sm mt-1">{errors.productionAmount}</p>}
          </div>

          <div>
            <Label htmlFor="sellingPrice">{getSellingPriceLabel(productionType)}</Label>
            <Input
              id="sellingPrice"
              type="number"
              min="0.01"
              step="0.01"
              value={inputs.sellingPrice || ''}
              onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
              className={errors.sellingPrice ? 'border-red-500' : ''}
              disabled={!productionType}
            />
            {errors.sellingPrice && <p className="text-red-500 text-sm mt-1">{errors.sellingPrice}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={calculateROI} className="w-full md:w-auto">Calculate ROI</Button>
      </div>

      {result && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">{formatCurrency(result.totalCost)}</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(result.totalRevenue)}</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className={`text-2xl font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.roi.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Name this calculation"
                    value={calculationName}
                    onChange={(e) => setCalculationName(e.target.value)}
                    className="flex-grow"
                  />
                  <Button onClick={saveCalculation} disabled={!calculationName.trim()}>
                    Save Calculation
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
