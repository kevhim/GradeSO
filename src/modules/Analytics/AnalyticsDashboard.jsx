import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import useGradeStore from '../../store/useGradeStore';

export default function AnalyticsDashboard() {
    const { semesters, coursesBySemester, getSGPA, getCGPA, activeSemesterId } = useGradeStore();

    const cgpa = getCGPA();
    const sortedSemesters = [...semesters].sort((a, b) => a.semester_number - b.semester_number);

    // Chart 1: Trend Line Data
    const trendData = sortedSemesters.map(s => ({
        name: s.label,
        sgpa: getSGPA(s.id)
    }));

    // Chart 2: Radar Data (Current Semester Subjects)
    const currentCourses = coursesBySemester[activeSemesterId] || [];
    const radarData = currentCourses.map(c => ({
        subject: c.course_code,
        gp: c.gp,
        fullMark: 10
    }));

    // Chart 3: Credit Distribution Data
    const allCourses = Object.values(coursesBySemester).flat();
    const totalECU = allCourses.reduce((sum, c) => sum + c.ecu, 0);
    const totalACU = allCourses.reduce((sum, c) => sum + c.acu, 0);
    const lost = Math.max(0, totalACU - totalECU);
    const donutData = [
        { name: 'Earned', value: totalECU },
        { name: 'Lost', value: lost }
    ];
    const donutColors = ['#7B61FF', '#EF4444'];

    // Chart 4: Grade Distribution Data
    const gradeCounts = { 'A+': 0, 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0, 'C+': 0, 'C': 0, 'F': 0 };
    allCourses.forEach(c => {
        if (gradeCounts[c.grade] !== undefined) gradeCounts[c.grade]++;
    });
    const gradeData = Object.keys(gradeCounts).map(g => ({
        grade: g,
        count: gradeCounts[g]
    }));

    // Chart 5: Best vs Worst Semester
    let bestSem = null;
    let worstSem = null;
    if (sortedSemesters.length > 0) {
        let bestSGPA = -1;
        let worstSGPA = 11;
        sortedSemesters.forEach(s => {
            const sgpa = getSGPA(s.id);
            if (sgpa > bestSGPA) { bestSGPA = sgpa; bestSem = s; }
            if (sgpa < worstSGPA) { worstSGPA = sgpa; worstSem = s; }
        });
    }

    // Heatmap Data (Smart Subject Weakness matrix)
    // Rows: Subject Names/Codes, Cols: Semesters, Cells: GP
    const subjectMatrix = {};
    sortedSemesters.forEach(sem => {
        const semCourses = coursesBySemester[sem.id] || [];
        semCourses.forEach(c => {
            const code = c.course_code || c.course_name.substring(0, 6).toUpperCase();
            if (!subjectMatrix[code]) subjectMatrix[code] = {};
            subjectMatrix[code][sem.label] = c.gp;
        });
    });

    const getHeatmapColor = (gp) => {
        if (gp === undefined) return 'bg-[#18181B] border-white/5'; // graphite empty
        if (gp >= 8) return 'bg-[#7B61FF]/80 text-white'; // plasma
        if (gp >= 6) return 'bg-amber-500/80 text-white'; // amber
        return 'bg-red-500/80 text-white'; // red
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
            <h2 className="text-2xl font-bold font-sora">Performance Intelligence</h2>

            {/* Top Row: Best/Worst + Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Best vs Worst */}
                <div className="flex flex-col gap-6">
                    <div className="bg-graphite p-6 rounded-[2rem] border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)] h-full flex flex-col justify-center relative overflow-hidden">
                        <h3 className="text-ghost/50 font-mono text-sm uppercase tracking-widest mb-1 z-10">Best Semester</h3>
                        <div className="text-3xl font-sora font-bold text-white z-10">{bestSem ? bestSem.label : 'N/A'}</div>
                        <div className="text-xl font-mono text-green-400 mt-2 z-10">{bestSem ? getSGPA(bestSem.id).toFixed(2) : '-'} SGPA</div>
                        <div className="absolute -right-4 -bottom-4 text-green-500/10 text-9xl">↑</div>
                    </div>
                    <div className="bg-graphite p-6 rounded-[2rem] border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] h-full flex flex-col justify-center relative overflow-hidden">
                        <h3 className="text-ghost/50 font-mono text-sm uppercase tracking-widest mb-1 z-10">Worst Semester</h3>
                        <div className="text-3xl font-sora font-bold text-white z-10">{worstSem ? worstSem.label : 'N/A'}</div>
                        <div className="text-xl font-mono text-red-400 mt-2 z-10">{worstSem ? getSGPA(worstSem.id).toFixed(2) : '-'} SGPA</div>
                        <div className="absolute -right-4 -bottom-4 text-red-500/10 text-9xl">↓</div>
                    </div>
                </div>

                {/* Trend Line */}
                <div className="lg:col-span-2 bg-graphite p-8 rounded-[2rem] border border-white/5">
                    <h3 className="text-xl font-bold font-sora mb-6">Aggregate Trajectory</h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <XAxis dataKey="name" stroke="#F0EFF440" tick={{ fill: '#F0EFF440', fontSize: 12 }} />
                                <YAxis domain={[0, 10]} stroke="#F0EFF440" tick={{ fill: '#F0EFF440', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181B', borderColor: '#7B61FF', borderRadius: '1rem', color: '#fff' }}
                                    itemStyle={{ color: '#7B61FF', fontWeight: 'bold' }}
                                />
                                <ReferenceLine y={cgpa} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'CGPA', fill: '#F59E0B', position: 'top' }} />
                                <Line type="monotone" dataKey="sgpa" stroke="#7B61FF" strokeWidth={3} dot={{ fill: '#7B61FF', r: 6, strokeWidth: 2, stroke: '#18181B' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Middle Row: Radar, Donut, Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Radar Map */}
                <div className="bg-graphite p-6 rounded-[2rem] border border-white/5 flex flex-col items-center">
                    <h3 className="font-bold font-sora mb-4 text-center">Subject Radar (Current)</h3>
                    <div className="w-full h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#F0EFF420" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#F0EFF480', fontSize: 10 }} />
                                <PolarRadiusAxis domain={[0, 10]} angle={30} tick={false} axisLine={false} />
                                <Radar name="GP" dataKey="gp" stroke="#7B61FF" fill="#7B61FF" fillOpacity={0.3} />
                                <Tooltip contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '8px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Credit Yield Donut */}
                <div className="bg-graphite p-6 rounded-[2rem] border border-white/5 flex flex-col items-center">
                    <h3 className="font-bold font-sora mb-4 text-center">Credit Yield (All Time)</h3>
                    <div className="w-full h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none"
                                >
                                    {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={donutColors[index]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-3xl font-sora font-bold text-plasma">{totalECU}</span>
                            <span className="text-xs text-ghost/50 font-mono">/ {totalACU} ACU</span>
                        </div>
                    </div>
                </div>

                {/* Grade Distribution Bar */}
                <div className="bg-graphite p-6 rounded-[2rem] border border-white/5 flex flex-col items-center">
                    <h3 className="font-bold font-sora mb-4 text-center">Grade Distribution</h3>
                    <div className="w-full h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: '#F0EFF480', fontSize: 11 }} interval={0} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#F0EFF440', fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '8px' }} cursor={{ fill: '#F0EFF410' }} />
                                <Bar dataKey="count" fill="#7B61FF" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Heatmap Section */}
            <div className="bg-graphite p-8 rounded-[2rem] border border-white/5 overflow-x-auto">
                <div className="flex items-center gap-3 mb-6">
                    <h3 className="font-bold font-sora text-xl">Smart Subject Vulnerability Heatmap</h3>
                    <span className="text-xs font-mono bg-plasma/20 text-plasma px-2 py-1 rounded-md uppercase">Core System</span>
                </div>

                <div className="min-w-[600px]">
                    {/* Header Row */}
                    <div className="flex mb-2 pb-2 border-b border-white/10 text-ghost/50 font-mono text-sm">
                        <div className="w-32 flex-shrink-0">Subject</div>
                        <div className="flex-1 flex" style={{ display: 'grid', gridTemplateColumns: `repeat(${sortedSemesters.length}, 1fr)`, gap: '4px' }}>
                            {sortedSemesters.map(sem => (
                                <div key={sem.id} className="text-center truncate px-1">{sem.label}</div>
                            ))}
                        </div>
                    </div>

                    {/* Matrix Rows */}
                    {Object.keys(subjectMatrix).length === 0 ? (
                        <div className="text-center text-ghost/40 py-8 font-mono">No subect data available across semesters yet.</div>
                    ) : (
                        Object.keys(subjectMatrix).map(subject => (
                            <div key={subject} className="flex mb-2 group">
                                <div className="w-32 flex-shrink-0 font-bold font-mono text-sm flex items-center group-hover:text-plasma transition-colors">{subject}</div>
                                <div className="flex-1 flex" style={{ display: 'grid', gridTemplateColumns: `repeat(${sortedSemesters.length}, 1fr)`, gap: '4px' }}>
                                    {sortedSemesters.map(sem => {
                                        const gp = subjectMatrix[subject][sem.label];
                                        return (
                                            <div
                                                key={sem.id}
                                                className={`rounded-md flex items-center justify-center font-mono text-xs h-8 border transition-all ${getHeatmapColor(gp)}`}
                                                title={gp !== undefined ? `${subject} in ${sem.label}: ${gp} GP` : 'Not Enrolled'}
                                            >
                                                {gp !== undefined ? gp : '-'}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
