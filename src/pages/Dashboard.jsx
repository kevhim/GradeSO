import React, { useState } from 'react';
import { BookOpen, BarChart2, Target, Grid, Sun, Moon, LogOut, Menu, X, Scan } from 'lucide-react';
import useGradeStore from '../store/useGradeStore';
import { supabase } from '../lib/supabase';

// Phase 1 Module
// We assume it's exposed at src/modules/SemesterManager/SemesterManager.jsx in the real app,
// but for the stub we'll just mock it or assume the real one isn't strictly needed for the Phase 2 components to test individually.
// However, the instructions state "It imports all Phase 2 modules and the Phase 1 SemesterManager."
// Wait, Phase 2 bootstrap doesn't provide a stub for SemesterManager.jsx. I will create a minimal stub for it below so it doesn't break.
// Wait! The user says: "it imports the Phase 1 SemesterManager".
// "Phase 2 bootstrap" does not say to stub SemesterManager. Let me create a minimal stub just so it compiles. 
// Actually, I'll create the stub in another file so it imports clearly.

import CourseManager from '../modules/CourseManager/CourseManager';
import SGPACalculator from '../modules/Calculator/SGPACalculator';
import AnalyticsDashboard from '../modules/Analytics/AnalyticsDashboard';
import AIAdvisorModule from '../modules/AIAdvisor/AIAdvisorModule';
import GoalTracker from '../modules/GoalTracker/GoalTracker';
import ExamScanner from '../modules/ExamScanner/ExamScanner';

// Inline Stub for SemesterManager just to make Phase 2 render cleanly.
// When Phase 1 merges, this file will just import from the real path if it exists.
// Wait, the Phase 1 path is '../modules/SemesterManager/SemesterManager'.
// I will create that file quickly if it doesn't exist, but I'll do this in a separate command.
import SemesterManager from '../modules/SemesterManager/SemesterManager';

export default function Dashboard() {
    const [activeView, setActiveView] = useState('courses');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { darkMode, toggleDarkMode, profile } = useGradeStore();

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            window.location.reload();
        } catch (e) {
            console.warn('Sign out stubbed');
        }
    };

    const navItems = [
        { id: 'courses', label: 'Courses', icon: <BookOpen size={20} /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
        { id: 'goals', label: 'Goals', icon: <Target size={20} /> },
        { id: 'heatmap', label: 'Heatmap', icon: <Grid size={20} /> },
        { id: 'scanner', label: 'Scanner', icon: <Scan size={20} /> },
    ];

    return (
        <div className={`min-h-screen flex flex-col font-sora ${darkMode ? 'bg-void text-ghost' : 'bg-ghost text-graphite'} transition-colors duration-300`}>

            {/* NAVBAR */}
            <nav className={`w-full h-20 px-6 md:px-8 flex items-center justify-between border-b ${darkMode ? 'border-white/5 bg-void/80' : 'border-black/5 bg-ghost/80'} backdrop-blur-xl sticky top-0 z-40`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-plasma flex items-center justify-center text-white font-bold font-serif text-xl border border-plasma/30 shadow-[0_0_15px_#7B61FF]">
                        G
                    </div>
                    <span className="font-bold text-xl md:text-2xl tracking-tight hidden sm:block">GradeOS</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-ghost/70 hover:text-white' : 'hover:bg-black/5 text-graphite/70 hover:text-graphite'}`}
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-full border ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                        <div className="w-6 h-6 rounded-full bg-plasma text-white flex items-center justify-center text-xs font-bold leading-none">
                            {profile?.name?.[0] || 'U'}
                        </div>
                        <span className="text-sm font-semibold">{profile?.name || 'Student'}</span>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className={`hidden md:flex items-center gap-2 p-2 rounded-lg transition-colors text-red-500/70 hover:text-red-500 hover:bg-red-500/10`}
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* MAIN LAYOUT */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* SIDEBAR (Desktop) */}
                <aside className={`hidden md:flex flex-col w-64 border-r ${darkMode ? 'border-white/5 bg-graphite/30' : 'border-black/5 bg-white/50'} py-8 px-4 gap-8 overflow-y-auto`}>

                    {/* Phase 1 SemesterManager Integration */}
                    <div className="w-full">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-ghost/40 mb-4 px-2">Semesters</h3>
                        <SemesterManager />
                    </div>

                    <div className="w-full mt-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-ghost/40 mb-4 px-2">Views</h3>
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold ${activeView === item.id
                                        ? 'bg-plasma text-white shadow-[0_4px_20px_-5px_#7B61FF]'
                                        : `text-ghost/60 hover:bg-white/5 hover:text-ghost`
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* MOBILE NAVIGATION (Bottom Bar) */}
                <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t ${darkMode ? 'bg-void border-white/10' : 'bg-ghost border-black/10'} px-2 py-3 flex justify-around items-center pb-safe`}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeView === item.id ? 'text-plasma' : 'text-ghost/50 hover:text-ghost/80'
                                }`}
                        >
                            {item.icon}
                            <span className="text-[10px] font-semibold">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* MOBILE DRAWER (Semesters & Profile) */}
                {mobileMenuOpen && (
                    <div className={`md:hidden fixed inset-0 z-30 pt-20 ${darkMode ? 'bg-void' : 'bg-ghost'} flex flex-col p-6`}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-plasma text-white flex items-center justify-center text-xl font-bold">
                                {profile?.name?.[0] || 'U'}
                            </div>
                            <div>
                                <div className="font-bold text-lg">{profile?.name || 'Student'}</div>
                                <div className="text-sm font-mono text-ghost/50">Target SGPA: {profile?.target_sgpa || 9.0}</div>
                            </div>
                        </div>

                        <h3 className="text-xs font-mono uppercase tracking-widest text-ghost/40 mb-4">Semesters</h3>
                        <SemesterManager />

                        <button
                            onClick={handleSignOut}
                            className="mt-auto flex items-center justify-center gap-2 w-full py-4 text-red-500 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors font-bold"
                        >
                            <LogOut size={20} /> Sign Out
                        </button>
                    </div>
                )}

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 overflow-y-auto pb-24 md:pb-8 relative">

                    {/* Always show SGPACalculator header for some views? 
              The spec suggests SGPA Calculator and CourseManager might be shown together,
              but "Active view state: Managed locally ... values: 'courses' | 'analytics' | 'goals' | 'heatmap'".
              Let's render them conceptually separately based on state. 
              The SGPA Calculator and WhatIfSimulator are in their own module. Let's show them in the 'courses' view at the top. */}

                    {activeView === 'courses' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <SGPACalculator />
                            <CourseManager />
                        </div>
                    )}

                    {activeView === 'analytics' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <AnalyticsDashboard />
                        </div>
                    )}

                    {activeView === 'goals' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <GoalTracker />
                        </div>
                    )}

                    {/* 'heatmap' is part of Analytics in the spec, but the navbar mentions it separately.
              I will render the AnalyticsDashboard but perhaps anchor to heatmap or just show the same view.
              Let's render AnalyticsDashboard for both, it's better UX. */}
                    {activeView === 'heatmap' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <AnalyticsDashboard />
                        </div>
                    )}

                    {activeView === 'scanner' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ExamScanner />
                        </div>
                    )}
                </main>
            </div>

            <AIAdvisorModule />

            {/* We need `print.css` injected globally or in index.html, handled elsewhere */}
        </div>
    );
}
