"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PollOption {
    id: string;
    option_text: string;
    index: number;
    vote_count?: number; // Calculated
}

interface PollCardProps {
    postId: string;
    userId: string;
}

export default function PollCard({ postId, userId }: PollCardProps) {
    const supabase = createClient();
    const [options, setOptions] = useState<PollOption[]>([]);
    const [userVote, setUserVote] = useState<string | null>(null); // Option ID
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);

    useEffect(() => {
        fetchPollData();
    }, [postId]);

    const fetchPollData = async () => {
        try {
            // Fetch options
            const { data: optionsData, error: optionsError } = await supabase
                .from('poll_options')
                .select('*')
                .eq('post_id', postId)
                .order('index', { ascending: true });

            if (optionsError) throw optionsError;

            // Fetch votes (count per option)
            const { data: votesData, error: votesError } = await supabase
                .from('poll_votes')
                .select('poll_option_id, user_id')
                .eq('post_id', postId);

            if (votesError) throw votesError;

            // Process votes
            const counts: Record<string, number> = {};
            let myVote = null;
            let total = 0;

            if (votesData) {
                votesData.forEach((v: { poll_option_id: string; user_id: string }) => {
                    counts[v.poll_option_id] = (counts[v.poll_option_id] || 0) + 1;
                    total++;
                    if (v.user_id === userId) {
                        myVote = v.poll_option_id;
                    }
                });
            }

            const formattedOptions = (optionsData || []).map((opt: PollOption) => ({
                ...opt,
                vote_count: counts[opt.id] || 0
            }));

            setOptions(formattedOptions);
            setTotalVotes(total);
            setUserVote(myVote);
        } catch (err) {
            console.error("Error fetching poll:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (optionId: string) => {
        if (voting || userVote === optionId) return; // Prevent spam or re-vote same

        setVoting(true);
        // Optimistic update
        const previousVote = userVote;
        const previousOptions = [...options];
        const previousTotal = totalVotes;

        // Update local state immediately
        setUserVote(optionId);
        setTotalVotes(prev => prev + (previousVote ? 0 : 1)); // If switching, total stays same. If new, +1.
        setOptions(current => current.map(opt => {
            if (opt.id === optionId) return { ...opt, vote_count: (opt.vote_count || 0) + 1 };
            if (opt.id === previousVote) return { ...opt, vote_count: Math.max(0, (opt.vote_count || 0) - 1) };
            return opt;
        }));

        try {
            const { error } = await supabase.rpc('vote_in_poll', {
                p_post_id: postId,
                p_option_id: optionId
            });

            if (error) throw error;
        } catch (err) {
            console.error("Error voting:", err);
            // Revert
            setUserVote(previousVote);
            setOptions(previousOptions);
            setTotalVotes(previousTotal);
            alert("Failed to submit vote");
        } finally {
            setVoting(false);
        }
    };

    if (loading) {
        return <div className="p-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>;
    }

    if (options.length === 0) {
        return (
            <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                Debug: Zero options found for poll {postId.slice(0, 8)}...
                <br />
                Check console for fetch errors.
            </div>
        );
    }

    return (
        <div className="mt-3 space-y-2">
            {options.map((option) => {
                const percentage = totalVotes > 0 ? Math.round(((option.vote_count || 0) / totalVotes) * 100) : 0;
                const isSelected = userVote === option.id;

                return (
                    <button
                        key={option.id}
                        onClick={() => handleVote(option.id)}
                        disabled={voting}
                        className={`relative w-full text-left rounded-xl overflow-hidden transition-all border ${isSelected
                            ? "ring-2 ring-green-500 border-green-500 bg-green-50/30"
                            : "hover:bg-gray-50 border-gray-200 bg-white"
                            }`}
                        style={{ height: '48px' }}
                    >
                        {/* Progress Bar Background */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className={`absolute inset-y-0 left-0 h-full ${isSelected ? "bg-green-100/80" : "bg-gray-100"
                                }`}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />

                        {/* Text and Percentage (on top) */}
                        <div className="absolute inset-0 flex items-center justify-between px-4 z-10 pointer-events-none">
                            <span className={`font-medium text-sm ${isSelected ? "text-green-900" : "text-gray-700"}`}>
                                {option.option_text}
                            </span>
                            <span className={`text-sm font-semibold ${isSelected ? "text-green-700" : "text-gray-500"}`}>
                                {percentage}%
                            </span>
                        </div>
                    </button>
                );
            })}
            <div className="flex justify-between items-center px-1 pt-1">
                <p className="text-xs text-gray-500 font-medium">
                    {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                </p>
                {/* Optional: Time remaining */}
            </div>
        </div>
    );
}
