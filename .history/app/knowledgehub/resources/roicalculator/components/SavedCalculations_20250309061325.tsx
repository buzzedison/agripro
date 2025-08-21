'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { useToast } from '@/app/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Badge } from '@/app/components/ui/badge';

// Define the calculation result types
interface BaseCalculationResult {
  totalCost: number;
  totalRevenue: number;
  roi: number;
  timestamp: number;
  name: string;
}

interface CropCalculationResult extends BaseCalculationResult {
  type: 'crop';
  cropType: string;
  inputs: {
    cropType: string;
    area: number;
    seedCost: number;
    fertilizerCost: number;
    laborCost: number;
    otherExpenses: number;
    expectedYield: number;
    sellingPrice: number;
  };
}

interface LivestockCalculationResult extends BaseCalculationResult {
  type: 'livestock';
  livestockType: string;
  productionType: 'dairy' | 'meat';
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

type CalculationResult = CropCalculationResult | LivestockCalculationResult;

interface SavedCalculationsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SavedCalculations({ activeTab, setActiveTab }: SavedCalculationsProps) {
  const { toast } = useToast();
  const [savedCalculations, setSavedCalculations] = useState<CalculationResult[]>([]);
  const [selectedCalculations, setSelectedCalculations] = useState<string[]>([]);
  const [comparisonView, setComparisonView] = useState<'table' | 'cards'>('table');
  const [filterType, setFilterType] = useState<'all' | 'crop' | 'livestock'>('all');

  useEffect(() => {
    // Load saved calculations from localStorage
    const savedCalculationsJSON = localStorage.getItem('agriproROICalculations');
    if (savedCalculationsJSON) {
      try {
        const parsed = JSON.parse(savedCalculationsJSON);
        setSavedCalculations(parsed);
      } catch (error) {
        console.error('Error parsing saved calculations:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading saved calculations',
          description: 'There was an error loading your saved calculations.'
        });
      }
    }
  }, [toast]);

  const handleDeleteCalculation = (index: number) => {
    const newCalculations = [...savedCalculations];
    newCalculations.splice(index, 1);
    setSavedCalculations(newCalculations);
    localStorage.setItem('agriproROICalculations', JSON.stringify(newCalculations));
    
    // Update selected calculations if needed
    const deletedName = savedCalculations[index].name;
    if (selectedCalculations.includes(deletedName)) {
      setSelectedCalculations(selectedCalculations.filter(name => name !== deletedName));
    }
    
    toast({
      title: 'Calculation deleted',
      description: 'The calculation has been deleted successfully.'
    });
  };

  const handleClearAll = () => {
    setSavedCalculations([]);
    setSelectedCalculations([]);
    localStorage.removeItem('agriproROICalculations');
    
    toast({
      title: 'All calculations cleared',
      description: 'All saved calculations have been cleared successfully.'
    });
  };

  const toggleCalculationSelection = (name: string) => {
    if (selectedCalculations.includes(name)) {
      setSelectedCalculations(selectedCalculations.filter(n => n !== name));
    } else {
      // Limit to maximum 3 selections
      if (selectedCalculations.length < 3) {
        setSelectedCalculations([...selectedCalculations, name]);
      } else {
        toast({
          variant: 'destructive',
          title: 'Selection limit reached',
          description: 'You can compare a maximum of 3 calculations at once.'
        });
      }
    }
  };

  const handleNewCalculation = (type: 'crops' | 'livestock') => {
    setActiveTab(type);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCalculations = savedCalculations.filter(calc => {
    if (filterType === 'all') return true;
    return calc.type === filterType;
  });

  const selectedCalculationsData = savedCalculations.filter(calc => 
    selectedCalculations.includes(calc.name)
  );

  return (
    <div className="space-y-6">
      {savedCalculations.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-4">No saved calculations yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by creating a new ROI calculation for your crops or livestock.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => handleNewCalculation('crops')}>
              Calculate Crop ROI
            </Button>
            <Button onClick={() => handleNewCalculation('livestock')}>
              Calculate Livestock ROI
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-medium">Saved Calculations</h3>
              <p className="text-sm text-muted-foreground">
                Select up to 3 calculations to compare
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Tabs defaultValue="all" className="w-[200px]" onValueChange={(v) => setFilterType(v as any)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="crop">Crops</TabsTrigger>
                  <TabsTrigger value="livestock">Livestock</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Clear All</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will delete all your saved calculations. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <ScrollArea className="h-[300px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.map((calculation, index) => (
                  <TableRow key={index} className={selectedCalculations.includes(calculation.name) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <div className="flex items-center">
                        <input 
                          id={`select-calculation-${index}`}
                          type="checkbox" 
                          checked={selectedCalculations.includes(calculation.name)}
                          onChange={() => toggleCalculationSelection(calculation.name)}
                          className="h-4 w-4"
                          aria-label={`Select ${calculation.name} for comparison`}
                          title={`Select ${calculation.name} for comparison`}
                        />
                        <label htmlFor={`select-calculation-${index}`} className="sr-only">
                          Select {calculation.name} for comparison
                        </label>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{calculation.name}</TableCell>
                    <TableCell>
                      {calculation.type === 'crop' ? (
                        <Badge variant="outline" className="bg-green-50">Crop</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50">Livestock</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(calculation.timestamp)}</TableCell>
                    <TableCell className={`text-right ${calculation.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculation.roi.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will delete the calculation "{calculation.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCalculation(index)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          
          {selectedCalculations.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Comparison</h3>
                <Tabs defaultValue="table" onValueChange={(v) => setComparisonView(v as any)}>
                  <TabsList>
                    <TabsTrigger value="table">Table</TabsTrigger>
                    <TabsTrigger value="cards">Cards</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {comparisonView === 'table' ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        {selectedCalculationsData.map((calc, i) => (
                          <TableHead key={i}>{calc.name}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Type</TableCell>
                        {selectedCalculationsData.map((calc, i) => (
                          <TableCell key={i}>
                            {calc.type === 'crop' ? 'Crop' : 'Livestock'}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Total Cost</TableCell>
                        {selectedCalculationsData.map((calc, i) => (
                          <TableCell key={i}>{formatCurrency(calc.totalCost)}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Total Revenue</TableCell>
                        {selectedCalculationsData.map((calc, i) => (
                          <TableCell key={i}>{formatCurrency(calc.totalRevenue)}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">ROI</TableCell>
                        {selectedCalculationsData.map((calc, i) => (
                          <TableCell key={i} className={calc.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {calc.roi.toFixed(2)}%
                          </TableCell>
                        ))}
                      </TableRow>
                      {/* Specific fields based on type */}
                      <TableRow>
                        <TableCell className="font-medium">Details</TableCell>
                        {selectedCalculationsData.map((calc, i) => (
                          <TableCell key={i}>
                            {calc.type === 'crop' ? (
                              <>
                                <span className="block">Crop: {calc.cropType}</span>
                                <span className="block">Area: {calc.inputs.area} ha</span>
                                <span className="block">Yield: {calc.inputs.expectedYield} tons/ha</span>
                              </>
                            ) : (
                              <>
                                <span className="block">Livestock: {calc.livestockType}</span>
                                <span className="block">Animals: {calc.inputs.numAnimals}</span>
                                <span className="block">Type: {calc.productionType}</span>
                              </>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedCalculationsData.map((calc, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">{calc.name}</h4>
                            <Badge variant="outline" className={calc.type === 'crop' ? 'bg-green-50' : 'bg-blue-50'}>
                              {calc.type === 'crop' ? 'Crop' : 'Livestock'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Cost:</span>
                              <span>{formatCurrency(calc.totalCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Revenue:</span>
                              <span>{formatCurrency(calc.totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>ROI:</span>
                              <span className={calc.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {calc.roi.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            {calc.type === 'crop' ? (
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Crop:</span>
                                  <span>{calc.cropType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Area:</span>
                                  <span>{calc.inputs.area} ha</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Yield:</span>
                                  <span>{calc.inputs.expectedYield} tons/ha</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Price:</span>
                                  <span>{formatCurrency(calc.inputs.sellingPrice)}/ton</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Livestock:</span>
                                  <span>{calc.livestockType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Animals:</span>
                                  <span>{calc.inputs.numAnimals}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Production:</span>
                                  <span>{calc.productionType === 'dairy' ? 'Dairy' : 'Meat'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    {calc.productionType === 'dairy' ? 'Production:' : 'Weight:'}
                                  </span>
                                  <span>
                                    {calc.inputs.productionAmount} 
                                    {calc.productionType === 'dairy' ? ' units/day' : ' kg'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
