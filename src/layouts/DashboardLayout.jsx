import React, { useState } from 'react';
import {
    LayoutDashboard,
    Calculator,
    Brain,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Bell,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import useGradeStore from '../store/useGradeStore';
import { supabase } from '../lib/supabase';

// Helper for the navigation items
const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'gpa', label: 'GPA Calculator', icon: <Calculator size={20} /> },
    { id: 'ai', label: 'AI Advisor', icon: <Brain size={20} /> },
    { id: 'planner', label: 'Semester Planner', icon: <Calendar size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export default function DashboardLayout({ children, activePage = 'dashboard', onNavChange }) {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const { profile } = useGradeStore();

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            window.location.reload();
        } catch (e) {
            console.warn('Sign out stubbed');
        }
    };

    const getPageTitle = (id) => {
        return navItems.find(item => item.id === id)?.label || 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-[#0A0A14] text-[#F0EFF4] font-sora flex overflow-hidden">

            {/* SIDEBAR */}
            <aside
                className={`fixed md:relative z-50 flex flex-col h-screen bg-[#12121A] border-r border-[#7B61FF]/10 transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-64' : 'w-16 md:w-20'
                    } ${sidebarExpanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                {/* Top: Logo */}
                <div className="h-14 flex items-center shrink-0 px-4 border-b border-[#7B61FF]/10">
                    <div className="w-8 h-8 rounded-lg bg-[#7B61FF] flex items-center justify-center font-bold text-white shrink-0 shadow-[0_0_15px_#7B61FF]">
                        G
                    </div>
                    <span className={`ml-3 font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        GradeOS
                    </span>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = activePage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavChange && onNavChange(item.id)}
                                className={`flex items-center h-10 px-2 rounded-xl transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#7B61FF] outline-none group
                  ${isActive
                                        ? 'bg-[#7B61FF]/10 text-[#7B61FF] border-l-2 border-[#7B61FF] pl-[6px]'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent pl-[6px]'
                                    }
                `}
                                title={!sidebarExpanded ? item.label : undefined}
                                aria-label={item.label}
                            >
                                <div className="shrink-0">
                                    {item.icon}
                                </div>
                                <span className={`ml-3 text-sm font-semibold whitespace-nowrap overflow-hidden transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden md:block'}`}>
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Bottom Pinned User Section */}
                <div className="shrink-0 p-3 border-t border-[#7B61FF]/10">
                    {/* Collapse Toggle */}
                    <button
                        onClick={() => setSidebarExpanded(!sidebarExpanded)}
                        className="hidden md:flex items-center justify-center w-full h-10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors mb-3 outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
                        aria-label="Toggle Sidebar"
                    >
                        {sidebarExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>

                    <div className={`flex items-center rounded-xl p-2 transition-colors ${sidebarExpanded ? 'bg-black/40' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-[#7B61FF]/10 border border-[#7B61FF]/30 flex items-center justify-center text-[#7B61FF] font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(123,97,255,0.2)]">
                            {profile?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className={`ml-3 flex-1 overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'opacity-100 w-auto text-left' : 'opacity-0 w-0'}`}>
                            <div className="text-sm font-bold text-[#F0EFF4] truncate">{profile?.name || 'Student'}</div>
                            <div className="text-xs font-fira tracking-wide text-gray-500 truncate cursor-pointer hover:text-red-400 transition-colors" onClick={handleSignOut}>
                                Log out
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* TOPBAR */}
                <header className="sticky top-0 z-40 h-14 bg-[#0A0A14]/80 backdrop-blur border-b border-[#7B61FF]/10 px-4 flex items-center justify-between shrink-0">

                    <div className="flex items-center gap-4">
                        {/* Mobile Sidebar Toggle - Visible only on mobile */}
                        <button
                            onClick={() => setSidebarExpanded(!sidebarExpanded)}
                            className="md:hidden text-gray-400 hover:text-white p-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
                            aria-label="Open Sidebar"
                        >
                            <PanelLeftOpen size={24} />
                        </button>

                        <h1 className="text-lg md:text-xl font-bold text-[#F0EFF4] truncate">
                            {getPageTitle(activePage)}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Semester Selector Mock */}
                        <select className="hidden md:block bg-[#12121A] border border-[#7B61FF]/20 text-[#7B61FF] font-fira text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] transition-colors cursor-pointer appearance-none text-center min-w-[120px]">
                            <option>Sem 3_2024</option>
                            <option>Sem 2_2024</option>
                            <option>Sem 1_2023</option>
                        </select>

                        <button className="text-gray-400 hover:text-[#7B61FF] transition-colors relative p-1 outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF] rounded" aria-label="Notifications">
                            <Bell size={20} />
                            <div className="absolute top-1 right-1 w-2 h-2 bg-[#7B61FF] rounded-full border border-[#0A0A14] animate-pulse"></div>
                        </button>
                    </div>
                </header>

                {/* SCROLLABLE PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {children}
                </main>

            </div>

        </div>
    );
}
