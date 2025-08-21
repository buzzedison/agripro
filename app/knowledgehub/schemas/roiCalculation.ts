import { defineType } from 'sanity'

export default defineType({
  name: 'roiCalculation',
  title: 'ROI Calculations',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Calculation Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'calculationType',
      title: 'Calculation Type',
      type: 'string',
      options: {
        list: [
          { title: 'Crop Farming', value: 'crop' },
          { title: 'Livestock Farming', value: 'livestock' },
          { title: 'Mixed Farming', value: 'mixed' },
          { title: 'Aquaculture', value: 'aquaculture' },
          { title: 'Agribusiness', value: 'agribusiness' }
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'ID of the user who created this calculation'
    },
    {
      name: 'userEmail',
      title: 'User Email',
      type: 'string',
      description: 'Email of the user who created this calculation'
    },
    {
      name: 'isPublic',
      title: 'Public Calculation',
      type: 'boolean',
      description: 'Whether this calculation can be viewed by other users',
      initialValue: false
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional description of the calculation scenario'
    },
    {
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        {
          name: 'country',
          title: 'Country',
          type: 'string'
        },
        {
          name: 'region',
          title: 'Region/State',
          type: 'string'
        },
        {
          name: 'city',
          title: 'City',
          type: 'string'
        }
      ]
    },
    {
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: {
        list: [
          { title: 'US Dollar (USD)', value: 'USD' },
          { title: 'Euro (EUR)', value: 'EUR' },
          { title: 'British Pound (GBP)', value: 'GBP' },
          { title: 'Ghanaian Cedi (GHS)', value: 'GHS' },
          { title: 'Nigerian Naira (NGN)', value: 'NGN' },
          { title: 'Kenyan Shilling (KES)', value: 'KES' },
          { title: 'South African Rand (ZAR)', value: 'ZAR' },
          { title: 'Canadian Dollar (CAD)', value: 'CAD' },
          { title: 'Australian Dollar (AUD)', value: 'AUD' },
          { title: 'Indian Rupee (INR)', value: 'INR' }
        ]
      },
      initialValue: 'USD'
    },
    {
      name: 'timeframe',
      title: 'Calculation Timeframe',
      type: 'object',
      fields: [
        {
          name: 'duration',
          title: 'Duration',
          type: 'number',
          validation: Rule => Rule.min(1)
        },
        {
          name: 'unit',
          title: 'Time Unit',
          type: 'string',
          options: {
            list: [
              { title: 'Months', value: 'months' },
              { title: 'Years', value: 'years' },
              { title: 'Seasons', value: 'seasons' }
            ]
          }
        }
      ]
    },
    {
      name: 'cropDetails',
      title: 'Crop Details',
      type: 'object',
      hidden: ({ document }) => document?.calculationType !== 'crop',
      fields: [
        {
          name: 'cropType',
          title: 'Crop Type',
          type: 'string',
          options: {
            list: [
              'Wheat', 'Corn', 'Rice', 'Soybeans', 'Cotton', 'Sugarcane',
              'Coffee', 'Cocoa', 'Potatoes', 'Tomatoes', 'Onions', 'Cassava',
              'Yam', 'Plantain', 'Maize', 'Sorghum', 'Millet', 'Groundnuts',
              'Cowpeas', 'Beans', 'Sweet Potato', 'Pepper', 'Okra', 'Other'
            ]
          }
        },
        {
          name: 'landSize',
          title: 'Land Size',
          type: 'object',
          fields: [
            {
              name: 'size',
              title: 'Size',
              type: 'number',
              validation: Rule => Rule.min(0)
            },
            {
              name: 'unit',
              title: 'Unit',
              type: 'string',
              options: {
                list: [
                  { title: 'Hectares', value: 'hectares' },
                  { title: 'Acres', value: 'acres' },
                  { title: 'Square Meters', value: 'sqm' },
                  { title: 'Square Feet', value: 'sqft' }
                ]
              }
            }
          ]
        },
        {
          name: 'expectedYield',
          title: 'Expected Yield',
          type: 'object',
          fields: [
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: Rule => Rule.min(0)
            },
            {
              name: 'unit',
              title: 'Unit',
              type: 'string',
              options: {
                list: [
                  { title: 'Tons', value: 'tons' },
                  { title: 'Kilograms', value: 'kg' },
                  { title: 'Pounds', value: 'lbs' },
                  { title: 'Bags', value: 'bags' },
                  { title: 'Bushels', value: 'bushels' }
                ]
              }
            }
          ]
        },
        {
          name: 'sellingPrice',
          title: 'Selling Price per Unit',
          type: 'number',
          validation: Rule => Rule.min(0)
        }
      ]
    },
    {
      name: 'livestockDetails',
      title: 'Livestock Details',
      type: 'object',
      hidden: ({ document }) => document?.calculationType !== 'livestock',
      fields: [
        {
          name: 'livestockType',
          title: 'Livestock Type',
          type: 'string',
          options: {
            list: [
              'Dairy Cattle', 'Beef Cattle', 'Poultry (Broilers)', 'Poultry (Layers)',
              'Goats', 'Sheep', 'Pigs', 'Fish', 'Rabbits', 'Ducks', 'Turkeys', 'Other'
            ]
          }
        },
        {
          name: 'numberOfAnimals',
          title: 'Number of Animals',
          type: 'number',
          validation: Rule => Rule.min(1)
        },
        {
          name: 'productionType',
          title: 'Production Type',
          type: 'string',
          options: {
            list: [
              { title: 'Meat Production', value: 'meat' },
              { title: 'Dairy/Egg Production', value: 'dairy' },
              { title: 'Breeding', value: 'breeding' },
              { title: 'Mixed Production', value: 'mixed' }
            ]
          }
        },
        {
          name: 'productionCapacity',
          title: 'Production Capacity',
          type: 'object',
          fields: [
            {
              name: 'quantity',
              title: 'Quantity per Animal',
              type: 'number',
              validation: Rule => Rule.min(0)
            },
            {
              name: 'unit',
              title: 'Unit',
              type: 'string',
              options: {
                list: [
                  { title: 'Liters/day', value: 'liters_day' },
                  { title: 'Eggs/day', value: 'eggs_day' },
                  { title: 'Kg live weight', value: 'kg_weight' },
                  { title: 'Pounds', value: 'lbs' }
                ]
              }
            }
          ]
        },
        {
          name: 'sellingPrice',
          title: 'Selling Price per Unit',
          type: 'number',
          validation: Rule => Rule.min(0)
        }
      ]
    },
    {
      name: 'costs',
      title: 'Cost Breakdown',
      type: 'object',
      fields: [
        {
          name: 'initialInvestment',
          title: 'Initial Investment',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'category',
                  title: 'Category',
                  type: 'string',
                  options: {
                    list: [
                      'Land Purchase/Lease', 'Equipment/Machinery', 'Infrastructure',
                      'Seeds/Seedlings', 'Animals/Livestock', 'Tools', 'Storage Facilities',
                      'Irrigation Systems', 'Fencing', 'Other'
                    ]
                  }
                },
                {
                  name: 'description',
                  title: 'Description',
                  type: 'string'
                },
                {
                  name: 'amount',
                  title: 'Amount',
                  type: 'number',
                  validation: Rule => Rule.min(0)
                }
              ]
            }
          ]
        },
        {
          name: 'operatingCosts',
          title: 'Operating Costs (per cycle/year)',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'category',
                  title: 'Category',
                  type: 'string',
                  options: {
                    list: [
                      'Seeds/Planting Materials', 'Fertilizers', 'Pesticides/Herbicides',
                      'Feed', 'Veterinary Services', 'Labor', 'Utilities', 'Transportation',
                      'Insurance', 'Maintenance', 'Marketing', 'Other'
                    ]
                  }
                },
                {
                  name: 'description',
                  title: 'Description',
                  type: 'string'
                },
                {
                  name: 'amount',
                  title: 'Amount',
                  type: 'number',
                  validation: Rule => Rule.min(0)
                },
                {
                  name: 'frequency',
                  title: 'Frequency',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'One-time', value: 'once' },
                      { title: 'Monthly', value: 'monthly' },
                      { title: 'Quarterly', value: 'quarterly' },
                      { title: 'Annually', value: 'annually' },
                      { title: 'Per Season', value: 'season' }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'revenue',
      title: 'Revenue Projections',
      type: 'object',
      fields: [
        {
          name: 'primaryProduct',
          title: 'Primary Product Revenue',
          type: 'object',
          fields: [
            {
              name: 'productName',
              title: 'Product Name',
              type: 'string'
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: Rule => Rule.min(0)
            },
            {
              name: 'pricePerUnit',
              title: 'Price per Unit',
              type: 'number',
              validation: Rule => Rule.min(0)
            },
            {
              name: 'totalRevenue',
              title: 'Total Revenue',
              type: 'number',
              validation: Rule => Rule.min(0)
            }
          ]
        },
        {
          name: 'secondaryProducts',
          title: 'Secondary Products',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'productName',
                  title: 'Product Name',
                  type: 'string'
                },
                {
                  name: 'quantity',
                  title: 'Quantity',
                  type: 'number',
                  validation: Rule => Rule.min(0)
                },
                {
                  name: 'pricePerUnit',
                  title: 'Price per Unit',
                  type: 'number',
                  validation: Rule => Rule.min(0)
                },
                {
                  name: 'totalRevenue',
                  title: 'Total Revenue',
                  type: 'number',
                  validation: Rule => Rule.min(0)
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'calculations',
      title: 'Calculation Results',
      type: 'object',
      fields: [
        {
          name: 'totalInitialInvestment',
          title: 'Total Initial Investment',
          type: 'number'
        },
        {
          name: 'totalOperatingCosts',
          title: 'Total Operating Costs',
          type: 'number'
        },
        {
          name: 'totalCosts',
          title: 'Total Costs',
          type: 'number'
        },
        {
          name: 'totalRevenue',
          title: 'Total Revenue',
          type: 'number'
        },
        {
          name: 'netProfit',
          title: 'Net Profit',
          type: 'number'
        },
        {
          name: 'roi',
          title: 'Return on Investment (%)',
          type: 'number'
        },
        {
          name: 'paybackPeriod',
          title: 'Payback Period (months)',
          type: 'number'
        },
        {
          name: 'profitMargin',
          title: 'Profit Margin (%)',
          type: 'number'
        },
        {
          name: 'breakEvenPoint',
          title: 'Break-even Point',
          type: 'number'
        }
      ]
    },
    {
      name: 'scenarios',
      title: 'Scenario Analysis',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'scenarioName',
              title: 'Scenario Name',
              type: 'string',
              options: {
                list: [
                  'Best Case', 'Worst Case', 'Most Likely', 'Conservative', 'Optimistic'
                ]
              }
            },
            {
              name: 'assumptions',
              title: 'Key Assumptions',
              type: 'text'
            },
            {
              name: 'adjustments',
              title: 'Cost/Revenue Adjustments (%)',
              type: 'object',
              fields: [
                {
                  name: 'costAdjustment',
                  title: 'Cost Adjustment (%)',
                  type: 'number'
                },
                {
                  name: 'revenueAdjustment',
                  title: 'Revenue Adjustment (%)',
                  type: 'number'
                }
              ]
            },
            {
              name: 'results',
              title: 'Scenario Results',
              type: 'object',
              fields: [
                {
                  name: 'roi',
                  title: 'ROI (%)',
                  type: 'number'
                },
                {
                  name: 'netProfit',
                  title: 'Net Profit',
                  type: 'number'
                },
                {
                  name: 'paybackPeriod',
                  title: 'Payback Period (months)',
                  type: 'number'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    },
    {
      name: 'notes',
      title: 'Additional Notes',
      type: 'text',
      description: 'Any additional notes or assumptions'
    },
    {
      name: 'attachments',
      title: 'Attachments',
      type: 'array',
      of: [
        {
          type: 'file',
          options: {
            accept: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
          }
        }
      ]
    },
    {
      name: 'sharedWith',
      title: 'Shared With',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'email',
              title: 'Email',
              type: 'string'
            },
            {
              name: 'permission',
              title: 'Permission',
              type: 'string',
              options: {
                list: [
                  { title: 'View Only', value: 'view' },
                  { title: 'Edit', value: 'edit' }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'title',
      calculationType: 'calculationType',
      roi: 'calculations.roi',
      createdAt: 'createdAt'
    },
    prepare(selection) {
      const { title, calculationType, roi, createdAt } = selection
      const date = createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown'
      return {
        title: title || 'Untitled Calculation',
        subtitle: `${calculationType || 'Unknown'} | ROI: ${roi ? roi.toFixed(2) : 'N/A'}% | ${date}`
      }
    }
  }
}) 