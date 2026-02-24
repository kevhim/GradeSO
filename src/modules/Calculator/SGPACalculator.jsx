import React, { useEffect, useRef } from 'react';
import useGradeStore from '../../store/useGradeStore';
import { gsap } from 'gsap';
import { Printer } from 'lucide-react';
import WhatIfSimulator from './WhatIfSimulator';

export default function SGPACalculator() {
    const { activeSemesterId, semesters, getSGPA, getCGPA, coursesBySemester } = useGradeStore();
    const sgpaRef = useRef(null);

    const currentSGPA = getSGPA(activeSemesterId);
    const currentCGPA = getCGPA();

    // Animate SGPA number when it changes
    useEffect(() => {
        if (sgpaRef.current) {
            gsap.to(sgpaRef.current, {
                innerText: currentSGPA,
                duration: 0.6,
                snap: { innerText: 0.01 },
            });
        }
    }, [currentSGPA]);

    const handleExportPDF = () => {
        window.print();
    };

    const getSGPAConditionalColor = (val) => {
        if (val >= 9.0) return 'text-plasma drop-shadow-[0_0_20px_#7B61FF]';
        if (val >= 7.0) return 'text-green-400';
        if (val >= 5.0) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div className="w-full flex flex-col items-center gap-8 py-8 px-4 md:px-8">
            {/* Live SGPA Badge */}
            <div className="flex flex-col items-center justify-center p-8 bg-graphite rounded-[2rem] border border-white/5 shadow-2xl min-w-[300px]">
                <span className="text-ghost/60 font-mono text-sm tracking-widest mb-2 uppercase">Live SGPA</span>
                <div
                    id="sgpa-badge"
                    ref={sgpaRef}
                    className={`font-sora font-bold text-6xl md:text-8xl transition-colors duration-500 ${getSGPAConditionalColor(currentSGPA)}`}
                >
                    {currentSGPA.toFixed(2)}
                </div>
            </div>

            {/* Transcript Panel */}
            <div id="print-transcript" className="w-full max-w-6xl">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold font-sora">Transcript Overview</h2>
                        <p className="font-mono text-ghost/50 mt-1 flex items-center gap-4">
                            Cumulative CGPA: <span className="text-white text-xl font-bold ml-1">{currentCGPA.toFixed(2)}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-ghost font-mono text-sm rounded-full transition-colors"
                    >
                        <Printer size={16} /> Export PDF
                    </button>
                </div>

                <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                    {semesters.map((sem) => {
                        const semSgpa = getSGPA(sem.id);
                        const semCourses = coursesBySemester[sem.id] || [];
                        const semCredits = semCourses.reduce((sum, c) => sum + c.acu, 0);

                        return (
                            <div
                                key={sem.id}
                                className={`flex-none w-72 p-6 rounded-[2rem] border transition-all snap-start
                  ${activeSemesterId === sem.id ? 'bg-plasma/10 border-plasma/50' : 'bg-graphite border-white/5'}`}
                            >
                                <h3 className="text-lg font-bold font-sora mb-1">{sem.label}</h3>
                                <div className="text-3xl font-bold font-mono my-4" style={{ color: semSgpa >= 9 ? '#7B61FF' : 'white' }}>
                                    {semSgpa.toFixed(2)}
                                </div>
                                <div className="flex justify-between text-ghost/50 font-mono text-xs">
                                    <span>Courses: {semCourses.length}</span>
                                    <span>Credits: {semCredits}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-full max-w-6xl mt-8">
                <WhatIfSimulator currentCourses={coursesBySemester[activeSemesterId] || []} currentSGPA={currentSGPA} />
            </div>
        </div>
    );
}
