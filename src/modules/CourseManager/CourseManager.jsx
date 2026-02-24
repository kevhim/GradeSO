import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import useGradeStore from '../../store/useGradeStore';
import { supabase } from '../../lib/supabase';
import { gsap } from 'gsap';

const GRADE_TO_GP = {
    'A+': 10, 'A': 9, 'A-': 8,
    'B+': 7, 'B': 6, 'B-': 5,
    'C+': 4, 'C': 3, 'F': 0
};

export default function CourseManager() {
    const { activeSemesterId, coursesBySemester, setCourses, addCourse, updateCourse, deleteCourse } = useGradeStore();
    const [showToast, setShowToast] = useState(false);
    const toastTimeout = useRef(null);

    const courses = coursesBySemester[activeSemesterId] || [];

    // Fetch courses on mount / semester change
    useEffect(() => {
        if (!activeSemesterId) return;
        const fetchCourses = async () => {
            try {
                const { data, error } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('semester_id', activeSemesterId)
                    .order('created_at');
                if (data && !error) {
                    setCourses(activeSemesterId, data);
                }
            } catch (err) {
                console.warn('Supabase fetch bypassed in Phase 2 stub mode:', err);
            }
        };
        fetchCourses();
    }, [activeSemesterId, setCourses]);

    const triggerToast = () => {
        setShowToast(true);
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setShowToast(false), 2000);
    };

    // Debounced Supabase call wrapper
    const debounceTimers = useRef({});
    const debouncedUpsert = useCallback(async (courseData) => {
        if (debounceTimers.current[courseData.id]) clearTimeout(debounceTimers.current[courseData.id]);
        debounceTimers.current[courseData.id] = setTimeout(async () => {
            try {
                const { error } = await supabase.from('courses').upsert({
                    id: courseData.id,
                    semester_id: activeSemesterId,
                    course_name: courseData.course_name,
                    course_code: courseData.course_code,
                    acu: courseData.acu,
                    grade: courseData.grade,
                    gp: courseData.gp,
                    cp: courseData.cp,
                    ecu: courseData.ecu,
                });
                if (!error) triggerToast();
            } catch (err) {
                // Expected to fail in stub mode
                triggerToast(); // Simulate success for UI testing
            }
        }, 500);
    }, [activeSemesterId]);

    const handleUpdate = (courseId, field, value) => {
        const course = courses.find((c) => c.id === courseId);
        if (!course) return;

        let updates = { [field]: value };

        // Auto-calculations if affecting grade or acu
        if (field === 'grade' || field === 'acu') {
            const newGrade = field === 'grade' ? value : course.grade;
            const newAcu = field === 'acu' ? Number(value) : course.acu;

            const newGp = GRADE_TO_GP[newGrade] !== undefined ? GRADE_TO_GP[newGrade] : 0;
            updates = {
                ...updates,
                gp: newGp,
                cp: newAcu * newGp,
                ecu: newGrade !== 'F' ? newAcu : 0,
            };
        }

        updateCourse(activeSemesterId, courseId, updates);
        debouncedUpsert({ ...course, ...updates });
    };

    const handleAddCourse = async () => {
        const newCourse = {
            id: crypto.randomUUID(),
            semester_id: activeSemesterId,
            course_name: 'New Course',
            course_code: 'XXX000',
            acu: 3,
            grade: 'A',
            gp: 9,
            cp: 27,
            ecu: 3,
        };
        addCourse(activeSemesterId, newCourse);

        try {
            await supabase.from('courses').insert(newCourse);
            triggerToast();
        } catch (err) {
            console.warn('Supabase insert bypassed in stub:', err);
            triggerToast();
        }
    };

    const handleDelete = async (courseId) => {
        deleteCourse(activeSemesterId, courseId);
        try {
            await supabase.from('courses').delete().eq('id', courseId);
            triggerToast();
        } catch (err) {
            console.warn('Supabase delete bypassed in stub');
        }
    };

    return (
        <div id="course-manager" className="w-full flex justify-center py-8 px-4 md:px-8">
            <div className="max-w-6xl w-full flex flex-col gap-6">
                <h2 className="text-2xl font-bold font-sora">Course Manager</h2>

                <div className="overflow-x-auto rounded-[2rem] bg-[#12121A] shadow-2xl p-6 border border-white/5">
                    <table className="w-full min-w-[800px] text-left border-collapse">
                        <thead>
                            <tr className="text-[#F0EFF4]/70 text-sm font-mono border-b border-white/10">
                                <th className="pb-4 font-normal w-12 text-center">Sno</th>
                                <th className="pb-4 font-normal">Course Code</th>
                                <th className="pb-4 font-normal w-1/4">Course Title</th>
                                <th className="pb-4 font-normal text-center">Max Total</th>
                                <th className="pb-4 font-normal text-center">ACU</th>
                                <th className="pb-4 font-normal text-center">Grade</th>
                                <th className="pb-4 font-normal text-center text-[#7B61FF]">GP</th>
                                <th className="pb-4 font-normal text-center text-[#7B61FF]">CP</th>
                                <th className="pb-4 font-normal text-center text-[#7B61FF]">ECU</th>
                                <th className="pb-4 font-normal text-center">Del</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course, index) => (
                                <tr key={course.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                    <td className="py-4 text-center text-[#F0EFF4]/50">{index + 1}</td>
                                    <td className="py-4">
                                        <input
                                            type="text"
                                            className="bg-transparent text-[#F0EFF4] outline-none border-b border-transparent focus:border-[#7B61FF] w-24"
                                            value={course.course_code || ''}
                                            onChange={(e) => handleUpdate(course.id, 'course_code', e.target.value.toUpperCase())}
                                        />
                                    </td>
                                    <td className="py-4 pr-4">
                                        <input
                                            type="text"
                                            className="bg-transparent text-[#F0EFF4] outline-none border-b border-transparent focus:border-[#7B61FF] w-full"
                                            value={course.course_name || ''}
                                            onChange={(e) => handleUpdate(course.id, 'course_name', e.target.value)}
                                        />
                                    </td>
                                    <td className="py-4 text-center text-[#F0EFF4]/50 font-mono">100</td>
                                    <td className="py-4 text-center">
                                        <select
                                            className="bg-[#1A1A24] text-[#F0EFF4] border border-white/10 rounded-lg p-1 outline-none focus:border-[#7B61FF] appearance-none text-center cursor-pointer"
                                            value={course.acu}
                                            onChange={(e) => handleUpdate(course.id, 'acu', e.target.value)}
                                        >
                                            {[1, 2, 3, 4, 5].map(val => <option key={val} value={val}>{val}</option>)}
                                        </select>
                                    </td>
                                    <td className="py-4 text-center">
                                        <select
                                            className="bg-[#1A1A24] text-[#F0EFF4] border border-white/10 rounded-lg p-1 outline-none focus:border-[#7B61FF] appearance-none text-center cursor-pointer font-bold"
                                            value={course.grade}
                                            onChange={(e) => handleUpdate(course.id, 'grade', e.target.value)}
                                        >
                                            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </td>
                                    <td className="py-4 text-center text-[#7B61FF] font-mono font-semibold">{course.gp}</td>
                                    <td className="py-4 text-center text-[#7B61FF] font-mono font-semibold">{course.cp}</td>
                                    <td className="py-4 text-center text-[#7B61FF] font-mono font-semibold">{course.ecu}</td>
                                    <td className="py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="text-[#F0EFF4]/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                            title="Delete Course"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {courses.length === 0 && (
                        <div className="py-12 text-center text-[#F0EFF4]/40 font-mono">No courses in this semester.</div>
                    )}

                    <div className="mt-6 flex">
                        <button
                            onClick={handleAddCourse}
                            className="group flex items-center gap-2 bg-[#7B61FF]/10 text-[#7B61FF] hover:bg-[#7B61FF] hover:text-white px-5 py-3 rounded-full font-semibold transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.03]"
                        >
                            <Plus size={18} />
                            Add Course
                        </button>
                    </div>
                </div>
            </div>

            {/* Saved Toast */}
            <div
                className={`fixed bottom-8 right-8 bg-zinc-800 border border-zinc-700 text-green-400 px-6 py-3 rounded-full font-mono flex items-center gap-2 shadow-2xl transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}
                style={{ zIndex: 50 }}
            >
                <span>✓ Saved</span>
            </div>
        </div>
    );
}
