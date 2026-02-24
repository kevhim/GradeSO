import React, { useState } from 'react';
import useGradeStore from '../store/useGradeStore';
import DashboardLayout from '../layouts/DashboardLayout';
import SkeletonCard from '../components/SkeletonCard';
import { Target, TrendingUp, CheckCircle, AlertTriangle, Brain } from 'lucide-react';

export default function Dashboard() {
    const [activePage, setActivePage] = useState('dashboard');
    const { profile, activeSemesterId, coursesBySemester, getSGPA, getCGPA, semesters } = useGradeStore();

    // Derived stats
    const sgpa = activeSemesterId ? getSGPA(activeSemesterId) : 0;
    const cgpa = getCGPA();

    // Flatten all courses
    const allCourses = Object.values(coursesBySemester).flat();
    const creditsCompleted = allCourses.reduce((sum, c) => sum + (c.cp || 0), 0);
    const backlogs = allCourses.filter(c => c.acu === 0).length;

    // Recent telemetry
    const recentCourses = [...allCourses].reverse().slice(0, 5);
    const activeSemesterName = semesters.find(s => s.id === activeSemesterId)?.label || 'Active Semester';

    const renderDashboardHome = () => {
        return (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Welcome Banner */}
                <div className="w-full rounded-[2rem] p-8 bg-gradient-to-br from-[#12121A] via-[#0A0A14] to-[#0A0A14] border border-[#7B61FF]/20 shadow-[0_10px_40px_-10px_rgba(123,97,255,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B61FF] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-sora font-bold text-[#F0EFF4] mb-2 tracking-tight">
                            Good morning, {profile?.name || 'Student'} <span className="text-2xl animate-pulse inline-block">👋</span>
                        </h2>
                        <p className="text-gray-400 font-fira text-sm mt-3 border-l-2 border-[#7B61FF] pl-3">
                            // {activeSemesterName} telemetry loaded. Keep up the momentum.
                        </p>
                    </div>
                </div>

                {/* KPI Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div className="bg-[#12121A] border border-[#7B61FF]/10 rounded-[2rem] p-6 flex flex-col justify-between transition-colors hover:border-[#7B61FF]/40 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#7B61FF]/10 text-[#7B61FF] flex items-center justify-center transition-transform group-hover:scale-110">
                                <Target size={22} />
                            </div>
                            <div className="flex items-center text-[#7B61FF] font-fira text-[10px] font-bold bg-[#7B61FF]/10 px-3 py-1.5 rounded-full border border-[#7B61FF]/20">
                                <TrendingUp size={12} className="mr-1" />
                                +0.2
                            </div>
                        </div>
                        <div>
                            <div className="font-fira text-[10px] uppercase tracking-widest text-gray-500 mb-2">Current SGPA</div>
                            <div className="text-4xl font-sora font-bold text-[#F0EFF4]">{sgpa.toFixed(2)}</div>
                        </div>
                    </div>

                    <div className="bg-[#12121A] border border-[#7B61FF]/10 rounded-[2rem] p-6 flex flex-col justify-between transition-colors hover:border-[#7B61FF]/40 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#7B61FF]/10 text-[#7B61FF] flex items-center justify-center transition-transform group-hover:scale-110">
                                <TrendingUp size={22} />
                            </div>
                            <div className="flex items-center text-[#7B61FF] font-fira text-[10px] font-bold bg-[#7B61FF]/10 px-3 py-1.5 rounded-full border border-[#7B61FF]/20">
                                <TrendingUp size={12} className="mr-1" />
                                +0.1
                            </div>
                        </div>
                        <div>
                            <div className="font-fira text-[10px] uppercase tracking-widest text-gray-500 mb-2">Current CGPA</div>
                            <div className="text-4xl font-sora font-bold text-[#F0EFF4]">{cgpa.toFixed(2)}</div>
                        </div>
                    </div>

                    <div className="bg-[#12121A] border border-[#7B61FF]/10 rounded-[2rem] p-6 flex flex-col justify-between transition-colors hover:border-[#7B61FF]/40 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#7B61FF]/10 text-[#7B61FF] flex items-center justify-center transition-transform group-hover:scale-110">
                                <CheckCircle size={22} />
                            </div>
                        </div>
                        <div>
                            <div className="font-fira text-[10px] uppercase tracking-widest text-gray-500 mb-2">Credits Completed</div>
                            <div className="text-4xl font-sora font-bold text-[#F0EFF4]">{creditsCompleted}</div>
                        </div>
                    </div>

                    <div className="bg-[#12121A] border border-[#7B61FF]/10 rounded-[2rem] p-6 flex flex-col justify-between transition-colors hover:border-red-500/40 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/5 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100"></div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center transition-transform group-hover:scale-110">
                                <AlertTriangle size={22} />
                            </div>
                            <div className="flex items-center text-red-400 font-fira text-[10px] font-bold bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                                Attention
                            </div>
                        </div>
                        <div className="relative z-10">
                            <div className="font-fira text-[10px] uppercase tracking-widest text-gray-500 mb-2">Backlogs</div>
                            <div className="text-4xl font-sora font-bold text-[#F0EFF4]">{backlogs > 0 ? backlogs : '--'}</div>
                        </div>
                    </div>

                </div>

                {/* Lower Section (Charts & Tips placeholders) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 bg-[#12121A] border border-[#7B61FF]/10 rounded-[2rem] p-6 min-h-[300px] flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7B61FF]/5 blur-3xl rounded-full"></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-2 h-2 bg-[#7B61FF] rounded-full shadow-[0_0_10px_#7B61FF]"></div>
                            <h3 className="text-xl font-sora font-bold text-[#F0EFF4]">Performance Trend</h3>
                        </div>
                        <div className="flex-1 border border-dashed border-[#7B61FF]/20 rounded-2xl flex items-center justify-center bg-[#0A0A14]/50 relative z-10">
                            <span className="font-fira text-[10px] text-gray-500 uppercase tracking-widest drop-shadow">GPA Trend Chart Slot</span>
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-[#12121A] border border-[#7B61FF]/10 rounded-[2rem] p-6 min-h-[300px] flex flex-col relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#7B61FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-2 mb-6 relative z-10">
                            <Brain size={20} className="text-[#7B61FF]" />
                            <h3 className="text-xl font-sora font-bold text-[#F0EFF4]">AI Advisor</h3>
                        </div>
                        <div className="flex-1 border border-dashed border-[#7B61FF]/20 rounded-2xl flex items-center justify-center bg-[#0A0A14]/50 p-4 text-center relative z-10">
                            <span className="font-fira text-[10px] text-gray-500 uppercase tracking-widest drop-shadow">AI Advisor Quick Tips Slot</span>
                        </div>
                    </div>

                </div>

                {/* Recent Activity Table Placeholder */}
                <div className="bg-[#12121A] border border-[#7B61FF]/10 rounded-[2rem] overflow-hidden mt-4 shadow-lg">
                    <div className="px-8 py-6 border-b border-[#7B61FF]/10 flex items-center justify-between">
                        <h3 className="text-lg font-sora font-bold text-[#F0EFF4]">Recent Telemetry</h3>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#0A0A14] font-fira text-[10px] tracking-widest text-[#7B61FF] uppercase">
                                <tr>
                                    <th className="px-8 py-4 font-bold rounded-tl-[2rem]">Activity</th>
                                    <th className="px-8 py-4 font-bold">Semester</th>
                                    <th className="px-8 py-4 font-bold text-right rounded-tr-[2rem]">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#7B61FF]/5 font-sora text-sm">
                                {recentCourses.length > 0 ? (
                                    recentCourses.map((course, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-5 text-[#F0EFF4]">
                                                {course.name} <span className="text-[#7B61FF]/60 font-fira ml-2">[{course.code}]</span>
                                            </td>
                                            <td className="px-8 py-5 text-gray-500 font-fira text-xs uppercase">
                                                {semesters.find(s => s.id === course.semester_id)?.label || course.semester_id}
                                            </td>
                                            <td className="px-8 py-5 text-right flex justify-end text-[#7B61FF] font-fira font-bold">
                                                +{course.cp} CP
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-8 text-center text-gray-500 italic opacity-50 relative">
                                            <div className="absolute inset-0 bg-[#7B61FF]/5 blur-lg rounded-full w-full max-w-sm mx-auto h-full mix-blend-screen pointer-events-none"></div>
                                            No telemetry recorded yet. Awaiting data broadcast...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        );
    };

    return (
        <DashboardLayout activePage={activePage} onNavChange={setActivePage}>
            {activePage === 'dashboard' ? (
                renderDashboardHome()
            ) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-2 capitalize">{activePage}</h3>
                        <p className="text-gray-500">This module is part of Phase 2.</p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
