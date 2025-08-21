'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, FileText, Calculator, Users, Shield } from 'lucide-react';
import BookingModal from './components/BookingModal';
import DiscoveryCallModal from './components/DiscoveryCallModal';

export default function ConsultingPage() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);

  const deliverables = [
    {
      title: "Field Health Report (10 p)",
      description: "Visual heat-map of cost leaks + top 5 quick wins",
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: "Market Gap Scan",
      description: "Know which crops, channels, & price points to chase next season",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "ROI Calculator",
      description: "See dollar impact of each quick win—no guesswork",
      icon: <Calculator className="w-6 h-6" />
    },
    {
      title: "45-min Action Debrief",
      description: "Walk away with a prioritised to-do list & next-step roadmap",
      icon: <Users className="w-6 h-6" />
    }
  ];

  const processSteps = [
    "Kick-off Call – align goals & data access.",
    "Remote Data Capture – satellite NDVI, cost & yield sheets, market prices.",
    "Margin-Leak Heat-Map – spotlight cost drains.",
    "Market Gap Scan – overlay demand vs. output mix.",
    "Quick-Win Calculator – quantify top 5 moves.",
    "Field Health Report + Debrief – delivered day 13; action plan day 14."
  ];

  const testimonials = [
    {
      quote: "The Agripro team found GHS 120k in savings we never knew existed. We implemented three quick wins and saw a 12% margin bump within one season.",
      author: "Kwame A.",
      title: "Cocoa Processor, Ghana"
    },
    {
      quote: "Most consultants talk—Agripro delivered numbers we could act on in weeks.",
      author: "L. Ndungu",
      title: "Horticulture Farmer, Kenya"
    }
  ];

  const faqs = [
    {
      question: "How much of my time will this take?",
      answer: "≈ 3 hours total: kick-off, midpoint check-in, and debrief."
    },
    {
      question: "Do you come on-site?",
      answer: "The sprint can be 100% remote using satellite and client-provided data, but we also offer on-site visits when needed."
    },
    {
      question: "Is my data secure?",
      answer: "All files live in an encrypted Google Drive folder with NDA protection."
    },
    {
      question: "What if I don't hit the ROI?",
      answer: "Our 2× guarantee means we refund the difference—zero risk."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Turn Hidden Farm Costs into{' '}
              <span className="text-green-600">Predictable Profit</span>{' '}
              in 14 Days
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Agripro&apos;s Rapid Diagnostics sprint pinpoints leaks, reveals market gaps, 
              and hands you a 10-page Field Health Report that pays for itself—often before the next harvest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
              >
                → Book My Rapid Diagnostic
              </button>
              <button
                onClick={() => setShowDiscoveryModal(true)}
                className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors"
              >
                30-min discovery call - FREE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Promise */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            You can&apos;t fix what you can&apos;t see.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Most farms bleed cash through silent yield loss, overpriced inputs, and missed market windows. 
            Traditional advisors take months to tell you what you already know. Agripro delivers 
            data-driven clarity in just two weeks, so you can act—fast.
          </p>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What You Get
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {deliverables.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="text-green-600 mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-lg font-semibold text-green-800">
              <strong>Guarantee:</strong> If you don&apos;t uncover at least 2× the fee in potential savings 
              or revenue uplift, we refund you. No questions.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works (14-Day Sprint)
          </h2>
          <div className="space-y-6">
            {processSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-lg text-gray-700 pt-1">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-lg font-semibold text-green-600">
              All remote. Zero disruption to your operations.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <p className="text-lg text-gray-700 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-gray-600">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-8">
            (More case snapshots available upon request.)
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Pricing
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-8 border border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-4">US $1,500</div>
            <p className="text-lg text-gray-600 mb-6">
              50% deposit today, 50% on report delivery.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Optional upgrade:</strong> Apply your fee as credit toward our Level 2 Growth Blueprint 
                if you decide to scale with us within 30 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Is This for You */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Is This for You?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Perfect Fit
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Early-stage farms & processors turning over ≤ US $1M</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You suspect cost leaks but lack time to dig</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You need clarity before planting the next season or pitching investors</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
                <XCircle className="w-6 h-6" />
                Not a Good Fit
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Large corporates needing embedded teams—see our Operator-in-Residence service</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Anyone unwilling to share basic cost & yield data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to turn insight into income?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              → Book My Rapid Diagnostic
            </button>
          </div>
          <p className="text-green-100 mb-4">
            Slots are limited to 4 clients per month to keep quality high.
          </p>
          <button
            onClick={() => setShowDiscoveryModal(true)}
            className="text-white underline hover:text-green-100 transition-colors"
          >
            Need more details? Schedule a free 30-min discovery call.
          </button>
        </div>
      </section>

      {/* Modals */}
      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)} 
      />
      <DiscoveryCallModal 
        isOpen={showDiscoveryModal} 
        onClose={() => setShowDiscoveryModal(false)} 
      />
    </div>
  );
} 