'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Heart, Sparkles } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [donationData, setDonationData] = useState<{
        amount?: number;
        currency?: string;
        donorName?: string;
    }>({});

    useEffect(() => {
        if (!reference) { setStatus('failed'); return; }

        fetch(`/api/donations/verify?reference=${reference}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.verified) {
                    setDonationData({
                        amount: data.amount,
                        currency: data.currency,
                        donorName: data.donorName,
                    });
                    setStatus('success');
                } else {
                    setStatus('failed');
                }
            })
            .catch(() => setStatus('failed'));
    }, [reference]);

    if (status === 'loading') {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-[#0B2C24] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Confirming your gift...</p>
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                        <Heart className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Payment not confirmed</h2>
                    <p className="text-gray-500 mb-6">
                        We couldn&apos;t verify your payment. If you were charged, please contact us at{' '}
                        <a href="mailto:info@agriprohub.com" className="text-[#0B2C24] font-semibold">info@agriprohub.com</a>{' '}
                        with your reference: <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{reference}</span>
                    </p>
                    <Link href="/womanyear/donate" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B2C24] text-white font-bold rounded-full text-sm">
                        Try again <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        );
    }

    const displayName = donationData.donorName || 'Friend';

    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-20 bg-[#F9FAF9]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-lg"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-[#F4C430]/15 flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle className="w-10 h-10 text-[#0B2C24]" />
                </motion.div>

                <h1 className="text-4xl font-black text-gray-900 mb-3">
                    Thank you, {displayName}.
                </h1>

                {donationData.amount && (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full mb-6 shadow-sm">
                        <Heart className="w-4 h-4 text-[#0B2C24]" />
                        <span className="font-bold text-[#0B2C24] text-sm">
                            {donationData.currency} {donationData.amount.toFixed(2)} funded
                        </span>
                    </div>
                )}

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    Your gift goes straight into connecting a Catalyst W founder with the partner who can move her business forward — and getting her to the Summit in Rwanda to close it. A receipt is on its way to your email.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/womanyear"
                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0B2C24] text-white font-bold rounded-full text-sm hover:bg-[#0d3a2e] transition-all"
                    >
                        <Sparkles size={15} /> Meet Catalyst W
                    </Link>
                    <Link
                        href="/womanyear/donate"
                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-full text-sm hover:border-gray-300 transition-all"
                    >
                        Fund another founder
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function CatalystWDonateSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-[#0B2C24] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
