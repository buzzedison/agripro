'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Calculator,
  Users,
  Shield,
  Zap,
  Target,
  BarChart3,
  Building2,
  ArrowRight,
  Calendar,
  Phone,
  MessageSquare,
  Award,
  ChevronDown,
  Info
} from 'lucide-react';
import Image from 'next/image';
import DiscoveryCallModal from './components/DiscoveryCallModal';
import QuoteRequestModal from './components/QuoteRequestModal';

export default function ConsultingPage() {
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const openQuoteModal = (service: string) => {
    setSelectedService(service);
    setShowQuoteModal(true);
  };

  const tiers = [
    {
      id: 'tier-1',
      number: '01',
      title: 'Quick Intelligence',
      description: 'Fast diagnostics and research to spot opportunities.',
      timeline: '7–14 days',
      services: [
        {
          name: 'Rapid Farm Diagnostics',
          duration: '7–10 Days',
          level: 'Entry-Level Service',
          description: 'Most farms bleed cash through silent yield loss, overpriced inputs, and missed market windows. We deliver data-driven clarity in just 10 days, so you can act fast.',
          getDetails: [
            'Visual heat-map of cost leaks across your operation',
            'Top 5 quick wins with specific action steps',
            'ROI calculator showing impact of each recommendation',
            '10-page Field Health Report',
            '45-minute action debrief call with prioritized roadmap'
          ],
          perfectFor: 'Farms and processors turning over ≤ GHS 1.5M annually who suspect cost leaks but lack time to dig',
          guarantee: 'If you don\'t uncover at least 4× the investment in potential savings or revenue uplift, we refund you. No questions.',
        },
        {
          name: 'Market Feasibility Study',
          duration: '7–14 Days',
          level: 'Three Levels Available',
          description: 'Stop guessing which crops will be profitable. Get data-backed answers before you invest.',
          subTiers: [
            {
              name: 'Basic Study',
              duration: '7 Days',
              includes: [
                'Crop suitability assessment for your land/climate',
                'Current market prices and demand trends',
                'Basic competition overview',
                'Break-even analysis and profit potential',
                'Clear recommendation: Proceed or pivot'
              ]
            },
            {
              name: 'Standard Study',
              duration: '10 Days',
              includes: [
                'Everything in Basic, plus:',
                'Compare 3-5 crop options side-by-side',
                'Detailed competitive analysis (who\'s winning and why)',
                'Pricing strategy and margin expectations',
                'Input supplier landscape',
                'Distribution channel recommendations'
              ]
            },
            {
              name: 'Comprehensive Study',
              duration: '14 Days',
              includes: [
                'Everything in Standard, plus:',
                'Export market assessment and requirements',
                'Complete value chain mapping (farm to final buyer)',
                'Risk analysis and mitigation strategies',
                '3-year market trend projections',
                'Partnership opportunities identification'
              ]
            }
          ],
          perfectFor: 'Anyone considering new crops, expanding operations, or pivoting their business model'
        }
      ]
    },
    {
      id: 'tier-2',
      number: '02',
      title: 'Strategic Planning',
      description: 'Bank-ready plans and pitch decks that open doors.',
      timeline: '2–4 weeks',
      services: [
        {
          name: 'Business Plan Development',
          duration: '2–4 Weeks',
          level: 'Bank & Investor Ready',
          description: 'Bank-ready plans that open funding doors. Written by operators who know how farms actually work.',
          subTiers: [
            {
              name: 'Startup Plan',
              duration: '2 Weeks',
              perfectFor: 'Starting a new farm or agro-processing venture',
              includes: [
                '15-20 Page Plan Includes:',
                'Executive summary that captures attention',
                'Market analysis with real Ghana data',
                'Operations overview with realistic timelines',
                '3-year financial projections (P&L, cash flow, balance sheet)',
                'Funding requirements and use of funds',
                'Risk assessment and mitigation'
              ]
            },
            {
              name: 'Growth Plan',
              duration: '3 Weeks',
              perfectFor: 'Scaling from 10 acres to 50, adding processing capacity, or entering new markets',
              includes: [
                '25-30 Page Plan Includes:',
                'Everything in Startup Plan, plus:',
                'Detailed competitive positioning',
                'Comprehensive operations blueprint with SOPs',
                '5-year financial model with sensitivity analysis',
                'Growth strategy and milestones',
                'Management team and organizational structure',
                'Detailed market entry or expansion strategy'
              ]
            },
            {
              name: 'Investment Plan',
              duration: '4 Weeks',
              perfectFor: 'Raising significant capital, pitching to institutional investors, or seeking equity partners',
              includes: [
                '35+ Page Plan Includes:',
                'Everything in Growth Plan, plus:',
                'Full due diligence ready documentation',
                'Detailed financial modeling with multiple scenarios',
                'Investor return analysis and exit strategies',
                'Complete risk matrix and mitigation plans',
                'Market validation and traction evidence',
                'Regulatory compliance roadmap'
              ]
            }
          ],
          guarantee: 'If you don\'t secure funding within 12 months and it\'s plan-related (not market conditions), we revise for free.'
        },
        {
          name: 'Pitch Deck Creation',
          duration: '5–10 Days',
          level: 'Investor Ready',
          description: 'Investor-ready presentations that get meetings booked and checks written.',
          subTiers: [
            {
              name: 'Standard Deck',
              duration: '5 Days',
              includes: [
                '10-12 Slides + One-Pager',
                'Problem/Solution/Opportunity',
                'Market size and traction',
                'Business model and financials',
                'Team and competitive advantage',
                'Funding ask and use of funds',
                'Professional design and layout',
                'One-page executive summary (PDF)'
              ]
            },
            {
              name: 'Premium Deck',
              duration: '10 Days',
              perfectFor: 'Pitching to investors, applying for grants, or seeking strategic partnerships',
              includes: [
                '15 Slides + Financial Summary + Coaching',
                'Everything in Standard, plus:',
                'Expanded financial slides with visual charts',
                '5-page financial summary document',
                '1 hour pitch coaching session',
                'Video explainer script (optional)',
                'Revised version after initial feedback'
              ]
            }
          ]
        },
        {
          name: 'Go-to-Market Strategy',
          duration: '10 Days',
          level: 'Launch Ready',
          description: 'Don\'t launch blind. Know exactly how you\'ll reach customers and generate revenue.',
          perfectFor: 'Launching new products, entering new markets, or fixing a distribution problem',
          getDetails: [
            'Distribution channel strategy (direct, wholesale, retail, export)',
            'Pricing strategy with competitive positioning',
            'Launch roadmap with 90-day action plan',
            'Customer acquisition tactics specific to your product',
            'Sales forecast and revenue projections',
            'Marketing message and positioning framework'
          ]
        }
      ]
    },
    {
      id: 'tier-3',
      number: '03',
      title: 'Operational Implementation',
      description: 'Build systems that run without you.',
      timeline: '3–8 weeks',
      services: [
        {
          name: 'Farm Management Systems',
          duration: '3–8 Weeks',
          level: 'Stop Firefighting, Start Scaling',
          description: 'Stop firefighting. Build systems that run without you.',
          subTiers: [
            {
              name: 'Small Scale Setup',
              duration: '3 Weeks',
              perfectFor: 'Up to 20 acres',
              includes: [
                'Production planning calendar and crop rotation schedule',
                'Resource allocation system (labor, inputs, equipment)',
                'Basic record-keeping templates (expenses, yields, labor)',
                'Quality control checklists',
                'Harvest and post-harvest management protocols'
              ]
            },
            {
              name: 'Medium Scale Setup',
              duration: '5 Weeks',
              perfectFor: '20-100 acres',
              includes: [
                'Everything in Small Scale, plus:',
                'Labor management SOPs and training materials',
                'Inventory management system for inputs',
                'Financial management and cash flow tracking',
                'Detailed harvest and logistics planning'
              ]
            },
            {
              name: 'Commercial Scale Setup',
              duration: '8 Weeks',
              perfectFor: '100+ acres or multiple sites',
              includes: [
                'Everything in Medium Scale, plus:',
                'Full ERP/Farm Management Software setup',
                'Complete SOP library for all farm activities',
                'Supply chain and procurement management',
                'Compliance and regulatory management',
                'Custom reporting dashboards for management'
              ]
            }
          ]
        },
        {
          name: 'Market Linkage & Offtaker Facilitation',
          duration: 'Ongoing Support',
          level: 'Get Paid Faster',
          description: 'Connect with reliable buyers who pay on time and at fair prices.',
          perfectFor: 'Established farms or processors seeking stable, high-value markets',
          getDetails: [
            'Identify and vet potential buyers (local and export)',
            'Support contract negotiations (terms, pricing, volumes)',
            'Review and advise on contract agreements',
            'Create partnership pitch materials',
            'Facilitate introductions where we have connections'
          ]
        },
        {
          name: 'Marketing & Brand Launch Package',
          duration: '3 Weeks',
          level: 'Stand Out & Attract Customers',
          description: 'Build a brand that stands out and attracts customers.',
          perfectFor: 'Launching a new product, rebranding, or building your first real marketing presence',
          getDetails: [
            'Brand positioning and messaging framework',
            'Logo and basic visual identity (or refinement of existing)',
            'Digital presence setup (website, social media profiles)',
            'Content strategy with 90-day content calendar',
            'Launch campaign materials (flyers, social posts, email templates)',
            'Customer messaging and value proposition',
            'Basic marketing training for your team'
          ]
        }
      ]
    },
    {
      id: 'tier-4',
      number: '04',
      title: 'Ongoing Partnership',
      description: 'Fractional support to keep growing.',
      timeline: 'Monthly Retainers',
      services: [
        {
          name: 'Fractional Operations Support',
          duration: 'Monthly Retainer',
          level: '3-Month Minimum',
          description: '10 hours/month of strategic + execution support. Like having a COO without the full-time salary.',
          perfectFor: 'Growing operations that need senior-level guidance but can\'t afford a full-time executive',
          getDetails: [
            'Weekly strategic check-ins (virtual or in-person)',
            'Problem-solving support as challenges arise',
            'Performance review and optimization recommendations',
            'Team coaching and staff development',
            'Quarterly planning and goal-setting',
            'On-call advice when urgent decisions come up'
          ]
        },
        {
          name: 'Growth Advisory Retainer',
          duration: 'Monthly Retainer',
          level: '6-Month Minimum',
          description: 'Monthly strategy sessions + quarterly deep planning + on-call support.',
          perfectFor: 'Founders who want consistent strategic partnership without full retainer cost',
          getDetails: [
            'Monthly 90-minute strategy session',
            'Quarterly full-day planning workshops',
            'Unlimited email/WhatsApp support for quick questions',
            'Performance tracking and accountability',
            'Network connections and partnership introductions',
            'Access to AgriPro templates and frameworks'
          ]
        },
        {
          name: 'Marketing Management Retainer',
          duration: 'Monthly Retainer',
          level: '3-Month Minimum',
          description: 'Content creation + social media + campaign execution.',
          perfectFor: 'Businesses that know they need marketing but don\'t have time or staff to execute',
          getDetails: [
            '8-12 social media posts per month (written + designed)',
            '2 blog posts or email campaigns per month',
            'Campaign planning and execution',
            'Performance tracking and reporting',
            'Content strategy refinement',
            'Respond to inquiries and engagement'
          ]
        }
      ]
    }
  ];

  const faqItems = [
    {
      question: "How much do your services cost?",
      answer: "Investment varies based on scope and complexity. Book a free discovery call and we'll provide a custom quote tailored to your needs and budget."
    },
    {
      question: "How much of my time will this take?",
      answer: "Minimal. Most services require 2-4 hours total: kick-off meeting, midpoint check-in, and final debrief. We do the heavy lifting."
    },
    {
      question: "Do you work remotely or on-site?",
      answer: "Both. Most services can be delivered 100% remotely, but we offer on-site visits when needed (Northern Region, Ashanti, Eastern, Greater Accra)."
    },
    {
      question: "What if I'm not sure which service I need?",
      answer: "Book a free 30-minute discovery call. We'll assess your situation and recommend the best starting point—even if it's not one of our services."
    },
    {
      question: "Can I pay in installments?",
      answer: "Yes. We offer flexible payment terms with milestone-based payments. Details provided in your custom proposal."
    },
    {
      question: "What industries do you serve?",
      answer: "We work across the entire agribusiness value chain: crop farming (grains, vegetables, cocoa, cashew, etc.), livestock, processing, aggregation, distribution, and agri-tech."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header / Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 bg-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/consulting-hero.png"
            alt="Modern Agribusiness Transformation"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full mb-8 border border-green-100 shadow-sm">
            <Award className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Consulting Built by Operators, For Operators</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Scale Your Agribusiness <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-500">
              Faster, Smarter, and Profitably
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed font-light">
            Before we advised anyone, we managed farms. Ran processing operations. Scaled agribusinesses from the ground up. Now we help you do the same—faster, smarter, and more profitably.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowDiscoveryModal(true)}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-green-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
            >
              Book Free Discovery Call
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#services"
              className="inline-flex items-center justify-center px-8 py-4 font-bold text-slate-700 transition-all duration-200 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200"
            >
              View Our Services
            </a>
          </div>

          <div className="mt-16 flex flex-col items-center">
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-6">Trusted by 40+ farms and agribusinesses across Ghana</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale filter">
              {/* Placeholder for logos */}
              <div className="h-8 w-24 bg-slate-300 rounded"></div>
              <div className="h-8 w-24 bg-slate-300 rounded"></div>
              <div className="h-8 w-24 bg-slate-300 rounded"></div>
              <div className="h-8 w-24 bg-slate-300 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="h-full w-full bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-8 leading-tight">
                We Don&apos;t Just Advise. <br />
                <span className="text-green-500">We&apos;ve Built It.</span>
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Most consultants talk. We deliver—because we&apos;ve done it. The difference? When we say &quot;we know what works,&quot; we mean it. Every recommendation comes from our own operations, tested in Ghana&apos;s real conditions—not from textbooks.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Managed 200+ acres of commercial crop production",
                  "Processed 5,000+ kg of produce weekly",
                  "Negotiated offtaker agreements worth GHS 500,000+",
                  "Built businesses from zero to profitable",
                  "Managed field teams of 20+ staff",
                  "Solved the same problems you face right now"
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3 group">
                    <div className="mt-1 bg-green-500/20 p-1 rounded-full group-hover:bg-green-500/40 transition-colors">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-slate-300 group-hover:text-white transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:ml-12">
              <div className="absolute -inset-4 bg-green-500/20 blur-2xl rounded-full"></div>
              <div className="relative aspect-square max-w-md mx-auto bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl group">
                <Image
                  src="/images/consulting-team.png"
                  alt="AgriPro Consulting Team in the Field"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10 opacity-60"></div>
                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <p className="text-2xl font-bold mb-1">Our Team in the Field</p>
                  <p className="text-slate-400 text-sm">Real operations, real results, real Ghana conditions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-16">The Agribusiness Consulting Problem in Ghana</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "International Consultants",
                problem: "Charge premium rates and don't understand Ghana's reality",
                icon: <XCircle className="w-8 h-8 text-red-500" />
              },
              {
                title: "Generic Business Consultants",
                problem: "Have never managed a farm or processed a crop",
                icon: <XCircle className="w-8 h-8 text-red-500" />
              },
              {
                title: "Freelance Advisors",
                problem: "Give advice but can't help you implement",
                icon: <XCircle className="w-8 h-8 text-red-500" />
              },
              {
                title: "Government Programs",
                problem: "Offer free training but lack actionable, specific solutions",
                icon: <XCircle className="w-8 h-8 text-red-500" />
              }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.problem}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-4xl mx-auto bg-green-50 p-8 lg:p-12 rounded-3xl border border-green-100 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 bg-green-600 p-4 rounded-2xl shadow-lg shadow-green-100">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-green-900 mb-2">What you actually need:</p>
              <p className="text-green-800 text-lg leading-relaxed">
                Expert guidance from people who&apos;ve done it, at prices that make sense, with implementation support that gets results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Overview */}
      <section id="services" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How AgriPro Consulting Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">We provide four levels of support based on where you are and where you want to go.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <a
                key={tier.id}
                href={`#${tier.id}`}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-green-200 transition-all group"
              >
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-green-600 transition-colors">Tier {tier.number}</div>
                <h3 className="text-2xl font-bold mb-4">{tier.title}</h3>
                <p className="text-slate-600 text-sm mb-6">{tier.description}</p>
                <div className="flex items-center text-green-600 font-bold text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  {tier.timeline}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers Detail Section */}
      {tiers.map((tier, idx) => (
        <section
          key={tier.id}
          id={tier.id}
          className={`py-24 scroll-mt-20 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 mb-12">
              <div className="text-4xl lg:text-5xl font-bold text-slate-200">{tier.number}</div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold">{tier.title}</h2>
                <div className="h-1.5 w-20 bg-green-500 rounded-full mt-2"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {tier.services.map((service, sIdx) => (
                <div
                  key={sIdx}
                  className={`bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col group hover:border-green-300 transition-all h-full ${tier.services.length === 1 ? 'md:col-span-2 max-w-2xl mx-auto' : ''
                    }`}
                >
                  <div className="p-8 lg:p-10 flex-grow">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">{service.level}</div>
                      <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-tight">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
                        {service.duration}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-4 group-hover:text-green-600 transition-colors">{service.name}</h3>
                    <p className="text-slate-600 mb-8 leading-relaxed font-light">{service.description}</p>

                    {service.getDetails && (
                      <div className="space-y-4 mb-8">
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-4 h-[1px] bg-green-500"></span>
                          What You Get
                        </p>
                        {service.getDetails.map((item, i) => (
                          <div key={i} className="flex items-start text-[14px] text-slate-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {service.subTiers && (
                      <div className="space-y-4 mb-8">
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-4 h-[1px] bg-green-500"></span>
                          Pricing Tiers
                        </p>
                        {service.subTiers.map((sub, i) => (
                          <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group/sub hover:bg-white hover:shadow-md transition-all">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-bold text-slate-900">{sub.name}</h4>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-100">{sub.duration}</span>
                            </div>
                            <ul className="space-y-2">
                              {sub.includes.map((incl, j) => (
                                <li key={j} className={`text-xs ${j === 0 && (incl as string).includes(':') ? 'font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2' : 'text-slate-500 flex items-start'}`}>
                                  {!(j === 0 && (incl as string).includes(':')) && <ArrowRight className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />}
                                  {incl}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {service.perfectFor && (
                      <div className="mt-auto pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-blue-800 text-[11px] font-bold uppercase tracking-widest mb-1">
                          <Users className="w-3.5 h-3.5" />
                          Perfect For
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed italic">
                          {service.perfectFor}
                        </p>
                      </div>
                    )}

                    {(service as any).guarantee && (
                      <div className="mt-6 bg-green-50/50 p-4 rounded-2xl border border-green-100/50">
                        <p className="text-[11px] text-green-900 font-medium">
                          <span className="font-black uppercase tracking-widest text-[9px] mr-2 text-green-600">The AgriPro Guarantee:</span>
                          {(service as any).guarantee}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="px-8 pb-10 mt-auto">
                    <button
                      onClick={() => openQuoteModal(service.name)}
                      className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center group-hover:bg-green-600 shadow-xl shadow-slate-200 group-hover:shadow-green-200"
                    >
                      Request Quote
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Package Deals */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Save 15-20% with Our Bundle Packages</h2>
            <p className="text-slate-400">Pre-designed packages for common scenarios—or customize your own.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "\"Launch Ready\"",
                target: "Startups ready to go to market",
                includes: ["Market Feasibility Study (Standard)", "Business Plan (Startup)", "Pitch Deck (Standard)"]
              },
              {
                title: "\"Scale Up\"",
                target: "Existing businesses expanding operations",
                includes: ["Rapid Farm Diagnostics", "Business Plan (Growth)", "Operations Management Package"],
                popular: true
              },
              {
                title: "\"Investment Ready\"",
                target: "Raising significant capital",
                includes: ["Market Feasibility Study (Comprehensive)", "Business Plan (Investment)", "Pitch Deck (Premium)"]
              }
            ].map((pkg, i) => (
              <div key={i} className={`relative p-8 rounded-3xl border ${pkg.popular ? 'bg-slate-800 border-green-500 shadow-2xl shadow-green-500/10' : 'bg-slate-800/50 border-slate-700'}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-slate-900 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Most Popular</div>
                )}
                <h3 className="text-2xl font-bold mb-2">{pkg.title}</h3>
                <p className="text-xs text-slate-400 mb-8 font-medium uppercase tracking-widest">For: {pkg.target}</p>
                <div className="space-y-4 mb-10">
                  <p className="text-sm font-bold text-slate-300">Included Services:</p>
                  {pkg.includes.map((item, j) => (
                    <div key={j} className="flex items-start text-sm text-slate-400">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => openQuoteModal(pkg.title + ' Package')}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${pkg.popular ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                >
                  Get Package Quote
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Four Simple Steps to Better Results</h2>
            <div className="h-1.5 w-24 bg-green-500 rounded-full mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 z-0"></div>
            {[
              {
                step: "01",
                title: "Book Discovery Call",
                desc: "Free, 30 minutes. We discuss your situation, goals, and challenges to determine fit.",
                icon: <Phone className="w-6 h-6" />
              },
              {
                step: "02",
                title: "Receive Proposal & Timeline",
                desc: "Clear scope of work, deliverables, pricing, and timeline—no surprises.",
                icon: <FileText className="w-6 h-6" />
              },
              {
                step: "03",
                title: "Kick-Off & Data Gathering",
                desc: "We start work immediately, collaborating closely with you throughout.",
                icon: <Target className="w-6 h-6" />
              },
              {
                step: "04",
                title: "Delivery & Implementation Support",
                desc: "Receive your deliverables, plus guidance on implementation and next steps.",
                icon: <Zap className="w-6 h-6" />
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-3xl bg-white border-2 border-slate-50 flex items-center justify-center mb-8 shadow-xl shadow-slate-100 group-hover:border-green-500 transition-all duration-300 transform group-hover:-rotate-6">
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center justify-center border-2 border-white">{item.step}</span>
                  <div className="text-slate-400 group-hover:text-green-600 transition-colors">{item.icon}</div>
                </div>
                <h3 className="text-lg font-bold mb-4 text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-slate-50 rounded-full border border-slate-100 text-slate-600 text-sm font-medium">
              <Clock className="w-4 h-4 mr-2" />
              Average time from discovery call to final delivery: 2-6 weeks
            </div>
          </div>
        </div>
      </section>

      {/* Payment Terms */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-8">Flexible, Fair <br /> Payment Structure</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4">
                    <div className="w-1 h-6 bg-green-500 mr-3 rounded-full"></div>
                    For Project-Based Work
                  </h3>
                  <ul className="space-y-3 text-slate-600 ml-4">
                    <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2 text-green-500" /> Deposit to commence work</li>
                    <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2 text-green-500" /> Milestone payment at midpoint review</li>
                    <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2 text-green-500" /> Final payment on delivery</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4">
                    <div className="w-1 h-6 bg-green-500 mr-3 rounded-full"></div>
                    For Retainer Services
                  </h3>
                  <ul className="space-y-3 text-slate-600 ml-4">
                    <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2 text-green-500" /> Monthly, quarterly, or semi-annual options</li>
                    <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2 text-green-500" /> Discounts available for longer commitments</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-colors"></div>
              <Info className="w-12 h-12 text-green-500 mb-8" />
              <h3 className="text-2xl font-bold mb-6">Credit Roll-Over System</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Investment in early-stage services can be credited toward more comprehensive engagements when you&apos;re ready to scale.
              </p>
              <button
                onClick={() => setShowDiscoveryModal(true)}
                className="inline-flex items-center text-green-500 font-bold hover:text-green-400 transition-colors"
              >
                Learn how it works <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-200 rotate-3">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-16 underline decoration-green-500 decoration-4 underline-offset-8">What Our Clients Say</h2>

          <div className="relative bg-slate-50 p-10 lg:p-16 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="text-8xl text-green-200 absolute -top-4 left-8 font-serif select-none leading-none">&quot;</div>
            <p className="text-2xl text-slate-700 leading-relaxed italic mb-12 relative z-10">
              &quot;AgriPro didn&apos;t just give us a report; they gave us a roadmap. Within 3 months of implementing their operational systems, our yield increased by 25% and our waste reduced by nearly half. They are true operators.&quot;
            </p>
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-green-500 rounded-full rotate-6 scale-105"></div>
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src="/images/client-samuel.png"
                    alt="Samuel K. Mensah"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <p className="font-bold text-xl text-slate-900">Samuel K. Mensah</p>
              <p className="text-green-600 text-sm font-black uppercase tracking-widest mt-1">Managing Director, GreenValley Farms</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[3rem] overflow-hidden bg-green-600 px-8 py-20 lg:p-24 shadow-2xl shadow-green-200">
            <div className="absolute inset-0 z-0">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,_white_0.1px,_transparent_1px)] [background-size:24px_24px] opacity-10"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-8">Ready to Build a Better Agribusiness?</h2>
              <p className="text-xl text-green-50 mb-12 font-light">
                Stop guessing. Start growing. Whether you need quick diagnostics, a funding-ready plan, or ongoing strategic support, we&apos;re here to help.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button
                  onClick={() => setShowDiscoveryModal(true)}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-green-600 font-black rounded-2xl hover:bg-green-50 transition-all shadow-xl hover:-translate-y-1 transform"
                >
                  Book Free Discovery Call
                </button>
                <div className="flex flex-col items-center sm:items-start text-white/90">
                  <p className="text-sm font-bold uppercase tracking-widest mb-1">Or Call / WhatsApp</p>
                  <p className="text-2xl font-black">+233 [Phone Number]</p>
                  <p className="text-xs font-medium opacity-60 mt-1">Available Mon-Fri, 8am-6pm GMT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <DiscoveryCallModal
        isOpen={showDiscoveryModal}
        onClose={() => setShowDiscoveryModal(false)}
      />

      <QuoteRequestModal
        isOpen={showQuoteModal}
        serviceName={selectedService}
        onClose={() => setShowQuoteModal(false)}
      />
    </div>
  );
}