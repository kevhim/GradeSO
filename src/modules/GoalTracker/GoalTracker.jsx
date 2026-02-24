import React, { useState, useEffect } from 'react';
import useGradeStore from '../../store/useGradeStore';
import { supabase } from '../../lib/supabase';

export default function GoalTracker() {
    const { activeSemesterId, semesters, getSGPA, goalBySemester, setGoal, coursesBySemester, profile } = useGradeStore();
    const [targetSGPA, setTargetSGPA] = useState(goalBySemester[activeSemesterId] || 9.0);

    const currentSGPA = getSGPA(activeSemesterId);
    const courses = coursesBySemester[activeSemesterId] || [];

    useEffect(() => {
        setTargetSGPA(goalBySemester[activeSemesterId] || 9.0);
    }, [activeSemesterId, goalBySemester]);

    const handleTargetChange = async (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;
        if (val > 10) val = 10;
        if (val < 0) val = 0;

        setTargetSGPA(val);
        setGoal(activeSemesterId, val);

        try {
            await supabase.from('profiles').update({ target_sgpa: val }).eq('id', profile?.id);
        } catch (err) {
            // Bypassed in stub mode
        }
    };

    // Calculations for missing CP
    const totalACU = courses.reduce((sum, c) => sum + Number(c.acu), 0);
    const currentCP = courses.reduce((sum, c) => sum + Number(c.cp), 0);
    const targetCP = targetSGPA * totalACU;
    const missingCP = Math.max(0, targetCP - currentCP);

    // SVG Progress Arc logic
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const progress = targetSGPA === 0 ? 0 : Math.min(currentSGPA / targetSGPA, 1);
    const strokeDashoffset = circumference - progress * circumference;

    const isGoalMet = currentSGPA >= targetSGPA && targetSGPA > 0;

    // Streak Logic
    const sortedSemesters = [...semesters].sort((a, b) => a.semester_number - b.semester_number);
    let streak = 0;
    let bestDelta = 0;
    let bestDeltaText = "";

    for (let i = 1; i < sortedSemesters.length; i++) {
        const prev = getSGPA(sortedSemesters[i - 1].id);
        const curr = getSGPA(sortedSemesters[i].id);
        const delta = curr - prev;

        if (delta > bestDelta) {
            bestDelta = delta;
            bestDeltaText = `Best growth: ${sortedSemesters[i - 1].label} → ${sortedSemesters[i].label} (+${delta.toFixed(2)} SGPA)`;
        }
    }

    // Calculate current active streak backwards
    for (let i = sortedSemesters.length - 1; i > 0; i--) {
        const curr = getSGPA(sortedSemesters[i].id);
        const prev = getSGPA(sortedSemesters[i - 1].id);
        if (curr > prev) {
            streak++;
        } else {
            break;
        }
    }

    return (
        <div className="flex flex-col gap-6 md:gap-8 w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
            <h2 className="text-2xl font-bold font-sora">Goals & Streaks</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Tracker Panel */}
                <div className="bg-[#12121A] rounded-[2rem] p-8 border border-white/5 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-bold font-sora mb-6 text-[#F0EFF4]/80">Semester Target</h3>

                    <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                        {/* Background Ring */}
                        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                            <circle
                                cx="96" cy="96" r={radius}
                                stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none"
                            />
                            {/* Progress Ring */}
                            <circle
                                cx="96" cy="96" r={radius}
                                stroke={isGoalMet ? '#22C55E' : '#7B61FF'}
                                strokeWidth="12" fill="none"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000 ease-in-out"
                                style={{
                                    filter: isGoalMet ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' : 'none'
                                }}
                            />
                        </svg>

                        {/* Center Text */}
                        <div className="flex flex-col items-center">
                            <span className={`text-3xl font-bold font-sora ${isGoalMet ? 'text-green-400' : 'text-[#7B61FF]'}`}>
                                {currentSGPA.toFixed(2)}
                            </span>
                            <div className="w-8 h-[1px] bg-ghost/20 my-1"></div>
                            <span className="text-[#F0EFF4]/50 text-sm font-mono">{targetSGPA.toFixed(2)}</span>
                        </div>

                        {isGoalMet && (
                            <div className="absolute inset-0 rounded-full border-2 border-green-500/20 animate-ping" />
                        )}
                    </div>

                    <div className="flex items-center gap-3 bg-[#0A0A14]/50 px-4 py-2 rounded-xl mb-4 border border-white/5">
                        <label className="text-[#F0EFF4]/70 font-mono text-sm">Target:</label>
                        <input
                            type="number" step="0.1" min="0" max="10"
                            value={targetSGPA}
                            onChange={handleTargetChange}
                            className="bg-transparent text-white font-bold w-16 outline-none text-center"
                        />
                    </div>

                    <p className="text-sm font-mono text-[#F0EFF4]/50 h-10">
                        {totalACU === 0
                            ? 'Add courses to see progress.'
                            : isGoalMet
                                ? 'Goal achieved! You are ahead of schedule.'
                                : missingCP > 0
                                    ? `You need ${missingCP.toFixed(2)} more CP to hit your target.`
                                    : 'You are on track!'}
                    </p>
                </div>

                {/* Streak Panel */}
                <div className="bg-[#12121A] rounded-[2rem] p-8 border border-white/5 flex flex-col justify-center">
                    <h3 className="text-xl font-bold font-sora mb-6 text-[#F0EFF4]/80">Consistency Engine</h3>

                    <div className="flex items-center gap-4 bg-[#0A0A14]/30 p-6 rounded-2xl border border-white/5 mb-6">
                        <div className="text-5xl">🔥</div>
                        <div>
                            <div className="text-2xl font-bold font-sora text-white">
                                {streak} Semester Streak
                            </div>
                            <p className="text-[#F0EFF4]/50 text-sm mt-1">
                                {streak >= 2 ? `You've improved your SGPA for ${streak} consecutive semesters!` : 'Keep pushing to build your improvement streak.'}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-mono text-xs text-[#F0EFF4]/50 tracking-widest uppercase mb-4">Historical Deltas</h4>
                        <div className="flex items-end gap-2 h-24">
                            {sortedSemesters.map((sem, i) => {
                                if (i === 0) return null; // No delta for first semester
                                const prevS = getSGPA(sortedSemesters[i - 1].id);
                                const currS = getSGPA(sem.id);
                                const delta = currS - prevS;
                                const height = Math.min(Math.abs(delta) * 50, 100); // Scale for graph
                                const isPositive = delta > 0;

                                return (
                                    <div key={sem.id} className="flex-1 flex flex-col items-center gap-2 group">
                                        <span className={`text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                            {delta > 0 ? '+' : ''}{delta.toFixed(2)}
                                        </span>
                                        <div
                                            className={`w-full rounded-sm ${isPositive ? 'bg-green-500/50 hover:bg-green-500' : 'bg-red-500/50 hover:bg-red-500'} transition-all`}
                                            style={{ height: `${height}px`, minHeight: '4px' }}
                                        />
                                        <span className="text-[10px] text-[#F0EFF4]/30">S{sem.semester_number}</span>
                                    </div>
                                );
                            })}
                            {sortedSemesters.length <= 1 && (
                                <div className="w-full text-center text-sm text-[#F0EFF4]/30 font-mono mt-8">Need more semesters to show history.</div>
                            )}
                        </div>
                    </div>

                    {bestDeltaText && (
                        <div className="text-sm font-mono text-[#7B61FF] bg-[#7B61FF]/10 px-4 py-2 rounded-lg text-center mt-auto">
                            {bestDeltaText}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
