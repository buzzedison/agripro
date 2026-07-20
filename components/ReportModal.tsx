'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { reportContent, REPORT_REASON_LABELS, type ReportReason, type ReportTargetType } from '@/lib/moderation';

interface ReportModalProps {
    reporterId: string;
    targetType: ReportTargetType;
    targetId: string;
    targetLabel?: string; // e.g. "this post", "Jane Doe"
    onClose: () => void;
}

export default function ReportModal({ reporterId, targetType, targetId, targetLabel, onClose }: ReportModalProps) {
    const [reason, setReason] = useState<ReportReason | ''>('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const submit = async () => {
        if (!reason) return;
        setSubmitting(true);
        try {
            await reportContent({ reporterId, targetType, targetId, reason, details });
            setSubmitted(true);
        } catch {
            toast.error('Could not submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Flag className="w-4 h-4 text-red-500" /> Report {targetType === 'user' ? 'account' : targetType}
                        </h3>
                        <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-5">
                        {submitted ? (
                            <div className="text-center py-6">
                                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-7 h-7 text-green-600" />
                                </div>
                                <p className="font-bold text-gray-900 mb-1">Report submitted</p>
                                <p className="text-sm text-gray-500 mb-5">
                                    Thanks — our team will review {targetLabel || 'this'} shortly.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 mb-4">
                                    Why are you reporting {targetLabel || 'this'}? Reports are reviewed by our team.
                                </p>
                                <div className="space-y-2 mb-4">
                                    {(Object.keys(REPORT_REASON_LABELS) as ReportReason[]).map((r) => (
                                        <label
                                            key={r}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-colors ${reason === r ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="reason"
                                                value={r}
                                                checked={reason === r}
                                                onChange={() => setReason(r)}
                                                className="w-4 h-4 text-green-600"
                                            />
                                            <span className="text-sm text-gray-800">{REPORT_REASON_LABELS[r]}</span>
                                        </label>
                                    ))}
                                </div>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    rows={3}
                                    placeholder="Add more detail (optional)"
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
                                />
                                <button
                                    onClick={submit}
                                    disabled={!reason || submitting}
                                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                                    Submit report
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
