import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Export ROI calculation
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const format = searchParams.get('format') || 'json';

    if (!id) {
      return NextResponse.json(
        { error: 'Calculation ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
    }

    // Fetch the calculation
    const { data: calculation, error } = await supabase
      .from('roi_calculations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Calculation not found' },
        { status: 404 }
      );
    }

    if (!calculation) {
      return NextResponse.json(
        { error: 'Calculation not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this calculation
    if (!calculation.is_public && (!user || calculation.user_id !== user.id)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Format the data based on requested format
    switch (format.toLowerCase()) {
      case 'json':
        return NextResponse.json(calculation);

      case 'csv':
        const csvData = convertToCSV(calculation);
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${calculation.title.replace(/[^a-zA-Z0-9]/g, '_')}_ROI_Calculation.csv"`
          }
        });

      case 'pdf':
        // For PDF, we'll return the calculation data and let the frontend handle PDF generation
        // This is because PDF generation requires additional libraries and setup
        return NextResponse.json({
          ...calculation,
          exportFormat: 'pdf',
          exportTimestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Unsupported format. Use json, csv, or pdf' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error exporting ROI calculation:', error);
    return NextResponse.json(
      { error: 'Failed to export calculation' },
      { status: 500 }
    );
  }
}

// Helper function to convert calculation to CSV format
function convertToCSV(calculation: any): string {
  const lines: string[] = [];
  
  // Basic Information
  lines.push('ROI Calculation Export');
  lines.push('');
  lines.push(`Title,${calculation.title || ''}`);
  lines.push(`Type,${calculation.calculation_type || ''}`);
  lines.push(`Currency,${calculation.currency || ''}`);
  lines.push(`Created,${calculation.created_at ? new Date(calculation.created_at).toLocaleDateString() : ''}`);
  lines.push('');

  // Location
  if (calculation.location) {
    lines.push('Location Information');
    lines.push(`Country,${calculation.location.country || ''}`);
    lines.push(`Region,${calculation.location.region || ''}`);
    lines.push(`City,${calculation.location.city || ''}`);
    lines.push('');
  }

  // Crop Details
  if (calculation.crop_details) {
    lines.push('Crop Information');
    lines.push(`Crop Type,${calculation.crop_details.cropType || ''}`);
    if (calculation.crop_details.landSize) {
      lines.push(`Land Size,${calculation.crop_details.landSize.size || ''} ${calculation.crop_details.landSize.unit || ''}`);
    }
    if (calculation.crop_details.expectedYield) {
      lines.push(`Expected Yield,${calculation.crop_details.expectedYield.quantity || ''} ${calculation.crop_details.expectedYield.unit || ''}`);
    }
    lines.push(`Selling Price,${calculation.crop_details.sellingPrice || ''}`);
    lines.push('');
  }

  // Livestock Details
  if (calculation.livestock_details) {
    lines.push('Livestock Information');
    lines.push(`Livestock Type,${calculation.livestock_details.livestockType || ''}`);
    lines.push(`Number of Animals,${calculation.livestock_details.numberOfAnimals || ''}`);
    lines.push(`Production Type,${calculation.livestock_details.productionType || ''}`);
    if (calculation.livestock_details.productionCapacity) {
      lines.push(`Production Capacity,${calculation.livestock_details.productionCapacity.quantity || ''} ${calculation.livestock_details.productionCapacity.unit || ''}`);
    }
    lines.push(`Selling Price,${calculation.livestock_details.sellingPrice || ''}`);
    lines.push('');
  }

  // Cost Breakdown
  if (calculation.costs) {
    lines.push('Cost Breakdown');
    
    if (calculation.costs.initialInvestment) {
      lines.push('Initial Investment');
      lines.push('Category,Description,Amount');
      calculation.costs.initialInvestment.forEach((item: any) => {
        lines.push(`${item.category || ''},${item.description || ''},${item.amount || 0}`);
      });
      lines.push('');
    }

    if (calculation.costs.operatingCosts) {
      lines.push('Operating Costs');
      lines.push('Category,Description,Amount,Frequency');
      calculation.costs.operatingCosts.forEach((item: any) => {
        lines.push(`${item.category || ''},${item.description || ''},${item.amount || 0},${item.frequency || ''}`);
      });
      lines.push('');
    }
  }

  // Revenue Information
  if (calculation.revenue) {
    lines.push('Revenue Information');
    
    if (calculation.revenue.primaryProduct) {
      lines.push('Primary Product');
      lines.push(`Product,${calculation.revenue.primaryProduct.productName || ''}`);
      lines.push(`Quantity,${calculation.revenue.primaryProduct.quantity || ''}`);
      lines.push(`Price per Unit,${calculation.revenue.primaryProduct.pricePerUnit || ''}`);
      lines.push(`Total Revenue,${calculation.revenue.primaryProduct.totalRevenue || ''}`);
      lines.push('');
    }

    if (calculation.revenue.secondaryProducts && calculation.revenue.secondaryProducts.length > 0) {
      lines.push('Secondary Products');
      lines.push('Product,Quantity,Price per Unit,Total Revenue');
      calculation.revenue.secondaryProducts.forEach((product: any) => {
        lines.push(`${product.productName || ''},${product.quantity || ''},${product.pricePerUnit || ''},${product.totalRevenue || ''}`);
      });
      lines.push('');
    }
  }

  // Calculation Results
  if (calculation.calculations) {
    lines.push('Calculation Results');
    lines.push(`Total Initial Investment,${calculation.calculations.totalInitialInvestment || 0}`);
    lines.push(`Total Operating Costs,${calculation.calculations.totalOperatingCosts || 0}`);
    lines.push(`Total Costs,${calculation.calculations.totalCosts || 0}`);
    lines.push(`Total Revenue,${calculation.calculations.totalRevenue || 0}`);
    lines.push(`Net Profit,${calculation.calculations.netProfit || 0}`);
    lines.push(`ROI (%),"${calculation.calculations.roi || 0}%"`);
    lines.push(`Payback Period (months),${calculation.calculations.paybackPeriod || 0}`);
    lines.push(`Profit Margin (%),"${calculation.calculations.profitMargin || 0}%"`);
    lines.push(`Break-even Point,${calculation.calculations.breakEvenPoint || 0}`);
    lines.push('');
  }

  // Scenarios
  if (calculation.scenarios && calculation.scenarios.length > 0) {
    lines.push('Scenario Analysis');
    lines.push('Scenario,ROI (%),Net Profit,Payback Period (months)');
    calculation.scenarios.forEach((scenario: any) => {
      lines.push(`${scenario.scenarioName || ''},"${scenario.results?.roi || 0}%",${scenario.results?.netProfit || 0},${scenario.results?.paybackPeriod || 0}`);
    });
    lines.push('');
  }

  // Notes
  if (calculation.notes) {
    lines.push('Notes');
    lines.push(`"${calculation.notes}"`);
    lines.push('');
  }

  return lines.join('\n');
}

// POST - Bulk export multiple calculations
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { calculationIds, format = 'json' } = body;

    if (!calculationIds || !Array.isArray(calculationIds) || calculationIds.length === 0) {
      return NextResponse.json(
        { error: 'Calculation IDs array is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch calculations (only user's own or public ones)
    const { data: calculations, error } = await supabase
      .from('roi_calculations')
      .select('*')
      .in('id', calculationIds)
      .or(`user_id.eq.${user.id},is_public.eq.true`);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calculations' },
        { status: 500 }
      );
    }

    if (!calculations || calculations.length === 0) {
      return NextResponse.json(
        { error: 'No accessible calculations found' },
        { status: 404 }
      );
    }

    // Format the data based on requested format
    switch (format.toLowerCase()) {
      case 'json':
        return NextResponse.json({
          calculations,
          exportTimestamp: new Date().toISOString(),
          totalCount: calculations.length
        });

      case 'csv':
        // For bulk CSV export, we'll combine all calculations into one CSV
        let combinedCSV = '';
        calculations.forEach((calc, index) => {
          if (index > 0) {
            combinedCSV += '\n\n' + '='.repeat(80) + '\n\n';
          }
          combinedCSV += convertToCSV(calc);
        });

        return new NextResponse(combinedCSV, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="ROI_Calculations_Bulk_Export.csv"`
          }
        });

      default:
        return NextResponse.json(
          { error: 'Unsupported format. Use json or csv' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error bulk exporting ROI calculations:', error);
    return NextResponse.json(
      { error: 'Failed to export calculations' },
      { status: 500 }
    );
  }
} 