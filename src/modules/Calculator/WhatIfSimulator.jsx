import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const GRADE_TO_GP = {
    'A+': 10, 'A': 9, 'A-': 8,
    'B+': 7, 'B': 6, 'B-': 5,
    'C+': 4, 'C': 3, 'F': 0
};

export default function WhatIfSimulator({ currentCourses, currentSGPA }) {
    const [isOpen, setIsOpen] = useState(false);
    const [simulatedGrades, setSimulatedGrades] = useState({});
    const [simulatedSGPA, setSimulatedSGPA] = useState(currentSGPA);
    const deltaRef = useRef(null);

    useEffect(() => {
        // Reset simulated grades when active semester courses change
        const initialSimGrades = {};
        currentCourses.forEach(c => {
            initialSimGrades[c.id] = c.grade;
        });
        setSimulatedGrades(initialSimGrades);
        setSimulatedSGPA(currentSGPA);
    }, [currentCourses, currentSGPA]);

    useEffect(() => {
        if (!isOpen) return;

        // Calculate new SGPA based on simulated grades
        let totalCP = 0;
        let totalACU = 0;

        currentCourses.forEach(c => {
            const simGrade = simulatedGrades[c.id] || c.grade;
            const gp = GRADE_TO_GP[simGrade] !== undefined ? GRADE_TO_GP[simGrade] : 0;
            totalCP += gp * Number(c.acu);
            totalACU += Number(c.acu);
        });

        const newSgpa = totalACU === 0 ? 0 : parseFloat((totalCP / totalACU).toFixed(2));

        if (newSgpa !== simulatedSGPA) {
            setSimulatedSGPA(newSgpa);

            // Animate Delta
            const delta = parseFloat((newSgpa - currentSGPA).toFixed(2));
            if (delta > 0 && deltaRef.current) {
                gsap.fromTo(deltaRef.current,
                    { y: 10, opacity: 0, scale: 0.5 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }
                );
            }
        }
    }, [simulatedGrades, currentCourses, isOpen, currentSGPA, simulatedSGPA]);

    const handleSimChange = (courseId, newGrade) => {
        setSimulatedGrades(prev => ({ ...prev, [courseId]: newGrade }));
    };

    const handleReset = () => {
        const initialSimGrades = {};
        currentCourses.forEach(c => {
            initialSimGrades[c.id] = c.grade;
        });
        setSimulatedGrades(initialSimGrades);
    };

    const delta = parseFloat((simulatedSGPA - currentSGPA).toFixed(2));

    return (
        <div className="bg-graphite rounded-[2rem] border border-plasma/20 overflow-hidden transition-all duration-300">
            <div
                className="p-6 flex justify-between items-center cursor-pointer hover:bg-white/5"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <h3 className="text-xl font-bold font-sora flex items-center gap-3">
                        What-If Simulator
                        <span className="text-xs bg-plasma/20 text-plasma px-2 py-1 rounded-full font-mono uppercase tracking-wider">Experimental</span>
                    </h3>
                    <p className="text-ghost/60 text-sm mt-1">See how changing a specific grade impacts your SGPA.</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-ghost/50 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ↓
                </div>
            </div>

            {isOpen && (
                <div className="p-6 border-t border-white/5 bg-void/50">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-graphite p-4 rounded-2xl border border-white/5">
                        <div className="font-mono text-lg flex items-center gap-4">
                            <span className="text-ghost/50">Current: {currentSGPA.toFixed(2)}</span>
                            <span className="text-ghost/30">→</span>
                            <span className="font-bold">Simulated: <span className={delta >= 0 ? (delta > 0 ? 'text-green-400' : 'text-ghost') : 'text-red-400'}>{simulatedSGPA.toFixed(2)}</span></span>
                        </div>

                        {delta !== 0 && (
                            <div
                                ref={deltaRef}
                                className={`font-mono font-bold mt-2 md:mt-0 ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}
                            >
                                {delta > 0 ? '+' : ''}{delta.toFixed(2)} Impact
                            </div>
                        )}

                        <button
                            onClick={handleReset}
                            className="mt-4 md:mt-0 px-4 py-2 border border-white/10 rounded-full text-sm hover:bg-white/10 transition-colors"
                        >
                            Reset to Actuals
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentCourses.map(course => (
                            <div key={course.id} className="bg-graphite p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-sm line-clamp-1 flex-1 pr-2">{course.course_name}</span>
                                    <span className="text-ghost/50 text-xs font-mono">{course.course_code}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm font-mono text-ghost/50">{course.acu} ACU</span>
                                    <select
                                        className={`bg-[#1A1A24] text-ghost border rounded-lg p-2 outline-none appearance-none text-center cursor-pointer font-bold w-20
                      ${simulatedGrades[course.id] !== course.grade ? 'border-plasma text-plasma' : 'border-white/10'}
                    `}
                                        value={simulatedGrades[course.id] || course.grade}
                                        onChange={(e) => handleSimChange(course.id, e.target.value)}
                                    >
                                        {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'F'].map(g => (
                                            <option key={g} value={g}>{g} {g === course.grade ? '(Actual)' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                        {currentCourses.length === 0 && (
                            <div className="col-span-full py-4 text-ghost/50 text-center font-mono">No courses available to simulate.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
