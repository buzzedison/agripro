'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Home, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VendorModeSwitcherProps {
    currentMode: 'main' | 'vendor';
}

const modes = [
    {
        id: 'main',
        label: 'Agripro Hub',
        description: 'Main platform',
        icon: Home,
        href: '/connect/dashboard',
        color: 'green'
    },
    {
        id: 'vendor',
        label: 'Vendor Dashboard',
        description: 'Manage your store',
        icon: Store,
        href: '/greenmarket/vendor-dashboard',
        color: 'emerald'
    }
];

export default function VendorModeSwitcher({ currentMode }: VendorModeSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const current = modes.find(m => m.id === currentMode) || modes[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
                <div className={`w-9 h-9 rounded-lg bg-${current.color}-100 flex items-center justify-center`}>
                    <current.icon className={`w-5 h-5 text-${current.color}-600`} />
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{current.label}</p>
                    <p className="text-xs text-gray-500">{current.description}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        
                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                        >
                            <div className="p-2">
                                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Switch Mode
                                </p>
                                
                                {modes.map((mode) => {
                                    const isActive = mode.id === currentMode;
                                    
                                    return (
                                        <Link
                                            key={mode.id}
                                            href={mode.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-green-50'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                isActive
                                                    ? `bg-${mode.color}-100`
                                                    : 'bg-gray-100'
                                            }`}>
                                                <mode.icon className={`w-5 h-5 ${
                                                    isActive
                                                        ? `text-${mode.color}-600`
                                                        : 'text-gray-500'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-semibold ${
                                                    isActive ? 'text-green-700' : 'text-gray-900'
                                                }`}>
                                                    {mode.label}
                                                </p>
                                                <p className="text-xs text-gray-500">{mode.description}</p>
                                            </div>
                                            {isActive && (
                                                <Check className="w-5 h-5 text-green-600" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                            
                            <div className="border-t border-gray-100 p-2">
                                <Link
                                    href="/greenmarket"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <Store className="w-4 h-4" />
                                    Browse Green Market
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
