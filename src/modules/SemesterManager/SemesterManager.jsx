import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useGradeStore from '../../store/useGradeStore';
import { Plus } from 'lucide-react';

export default function SemesterManager() {
    const { profile, semesters, setSemesters, activeSemesterId, setActiveSemesterId } = useGradeStore();

    useEffect(() => {
        if (!profile?.id) return;

        const fetchSemesters = async () => {
            const { data } = await supabase
                .from('semesters')
                .select('*')
                .eq('student_id', profile.id)
                .order('semester_number');

            if (data) {
                setSemesters(data);
                if (data.length > 0 && !activeSemesterId) {
                    setActiveSemesterId(data[0].id);
                }
            }
        };

        fetchSemesters();
    }, [profile?.id]);

    const handleAddSemester = async () => {
        if (semesters.length >= 8) return;
        const next = semesters.length + 1;
        const { data } = await supabase
            .from('semesters')
            .insert({ student_id: profile.id, semester_number: next, label: `Semester ${next}` })
            .select().single();

        if (data) {
            setSemesters([...semesters, data]);
            setActiveSemesterId(data.id);
        }
    };

    return (
        <div id="semester-manager" className="w-full md:w-64 flex md:flex-col bg-graphite dark:bg-void md:border-r border-plasma/10 p-4 md:h-full md:min-h-[calc(100vh-80px)] overflow-x-auto md:overflow-y-auto gap-2 scrollbar-none">
            <h2 className="hidden md:block text-ghost/50 text-xs font-mono mb-4 uppercase tracking-wider">Semesters</h2>

            <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
                {semesters.map((sem) => (
                    <button
                        key={sem.id}
                        onClick={() => setActiveSemesterId(sem.id)}
                        className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 text-left whitespace-nowrap md:whitespace-normal
              ${activeSemesterId === sem.id
                                ? 'bg-plasma text-white shadow-lg shadow-plasma/20'
                                : 'text-ghost/70 hover:bg-white/5 dark:hover:bg-white/10 hover:text-ghost'}`}
                    >
                        {sem.label}
                    </button>
                ))}

                <button
                    onClick={handleAddSemester}
                    disabled={semesters.length >= 8}
                    className="px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 text-plasma border border-plasma/30 hover:bg-plasma/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors whitespace-nowrap"
                >
                    <Plus size={16} /> Add Semester
                </button>
            </div>
        </div>
    );
}
