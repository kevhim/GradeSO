import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// ── Grade-Point Mapping ─────────────────────────────────────
const GRADE_TO_GP = {
    'A+': 10, 'A': 9, 'A-': 8,
    'B+': 7, 'B': 6, 'B-': 5,
    'C+': 4, 'C': 3, 'F': 0
};

function mkCourse(id, semId, name, code, acu, grade) {
    const gp = GRADE_TO_GP[grade];
    return { id, semester_id: semId, course_name: name, course_code: code, acu, grade, gp, cp: acu * gp, ecu: grade !== 'F' ? acu : 0 };
}

// ── Demo Fallback Data (3 semesters of B.Tech CSE) ──────────
const DEMO_SEMESTERS = [
    { id: 'demo-sem-1', student_id: 'demo', semester_number: 1, label: 'Sem 1_2023' },
    { id: 'demo-sem-2', student_id: 'demo', semester_number: 2, label: 'Sem 2_2023' },
    { id: 'demo-sem-3', student_id: 'demo', semester_number: 3, label: 'Sem 3_2024' },
];

const DEMO_COURSES_BY_SEM = {
    'demo-sem-1': [
        mkCourse('d1c1', 'demo-sem-1', 'Engineering Mathematics I', 'MTH101', 4, 'A'),
        mkCourse('d1c2', 'demo-sem-1', 'Physics I', 'PHY101', 3, 'A-'),
        mkCourse('d1c3', 'demo-sem-1', 'Programming in C', 'CSE101', 4, 'A+'),
        mkCourse('d1c4', 'demo-sem-1', 'Engineering Drawing', 'MEE101', 3, 'B+'),
        mkCourse('d1c5', 'demo-sem-1', 'Communication Skills', 'HUM101', 2, 'A'),
        mkCourse('d1c6', 'demo-sem-1', 'Chemistry', 'CHM101', 3, 'A-'),
    ],
    'demo-sem-2': [
        mkCourse('d2c1', 'demo-sem-2', 'Engineering Mathematics II', 'MTH201', 4, 'A-'),
        mkCourse('d2c2', 'demo-sem-2', 'Data Structures', 'CSE201', 4, 'A+'),
        mkCourse('d2c3', 'demo-sem-2', 'Digital Electronics', 'ECE201', 3, 'A'),
        mkCourse('d2c4', 'demo-sem-2', 'Discrete Mathematics', 'MTH202', 3, 'A'),
        mkCourse('d2c5', 'demo-sem-2', 'Object Oriented Programming', 'CSE202', 4, 'A'),
        mkCourse('d2c6', 'demo-sem-2', 'Environmental Science', 'HUM201', 2, 'B+'),
    ],
    'demo-sem-3': [
        mkCourse('d3c1', 'demo-sem-3', 'Database Management Systems', 'CSE301', 4, 'A+'),
        mkCourse('d3c2', 'demo-sem-3', 'Operating Systems', 'CSE302', 4, 'A'),
        mkCourse('d3c3', 'demo-sem-3', 'Computer Networks', 'CSE303', 3, 'A-'),
        mkCourse('d3c4', 'demo-sem-3', 'Probability & Statistics', 'MTH301', 3, 'A'),
        mkCourse('d3c5', 'demo-sem-3', 'Theory of Computation', 'CSE304', 3, 'B+'),
        mkCourse('d3c6', 'demo-sem-3', 'Software Engineering', 'CSE305', 3, 'A'),
    ],
};

const DEMO_PROFILE = { id: 'demo', name: 'Yash Sharma', target_sgpa: 9.0, current_semester: 3 };

const useGradeStore = create((set, get) => ({
    // Auth & Sync State
    session: null,
    profile: null,
    isLoading: false,
    error: null,
    setSession: (session) => set({ session }),
    setProfile: (profile) => set({ profile }),

    // Fetches all user data from Supabase — falls back to demo data if tables are missing
    fetchTelemetryData: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (profileError) throw profileError;

            set({ profile: profileData });

            // Fetch Semesters
            const { data: semestersData, error: semestersError } = await supabase
                .from('semesters')
                .select('*')
                .eq('student_id', userId)
                .order('semester_number', { ascending: true });
            if (semestersError) throw semestersError;

            set({ semesters: semestersData });

            // Set active semester to the latest one or current_semester from profile
            if (semestersData.length > 0) {
                const activeSem = profileData?.current_semester
                    ? semestersData.find(s => s.semester_number === profileData.current_semester)
                    : semestersData[semestersData.length - 1];
                if (activeSem) set({ activeSemesterId: activeSem.id });
            }

            // Fetch Courses for all these semesters
            const semesterIds = semestersData.map(s => s.id);
            if (semesterIds.length > 0) {
                const { data: coursesData, error: coursesError } = await supabase
                    .from('courses')
                    .select('*')
                    .in('semester_id', semesterIds);
                if (coursesError) throw coursesError;

                // Group courses by semesterId
                const coursesBySem = {};
                coursesData.forEach(course => {
                    if (!coursesBySem[course.semester_id]) {
                        coursesBySem[course.semester_id] = [];
                    }
                    coursesBySem[course.semester_id].push(course);
                });

                set({ coursesBySemester: coursesBySem });
            }

        } catch (err) {
            console.warn("Supabase fetch failed, loading demo data:", err.message);
            // ── Fallback: hydrate with demo data ────────────
            set({
                profile: { ...DEMO_PROFILE, id: userId || 'demo' },
                semesters: DEMO_SEMESTERS,
                activeSemesterId: 'demo-sem-3',
                coursesBySemester: DEMO_COURSES_BY_SEM,
                error: null, // Clear the error — demo data is fine
            });
        } finally {
            set({ isLoading: false });
        }
    },

    // Semesters
    semesters: [],
    activeSemesterId: null,
    setSemesters: (semesters) => set({ semesters }),
    setActiveSemesterId: (id) => set({ activeSemesterId: id }),

    addSemester: async (semester) => {
        set((s) => ({ semesters: [...s.semesters, semester] }));
        const { error } = await supabase.from('semesters').insert(semester);
        if (error) {
            console.error("Failed to add semester:", error);
            set((s) => ({ semesters: s.semesters.filter(sem => sem.id !== semester.id) }));
        }
    },

    // Courses (keyed by semesterId)
    coursesBySemester: {},
    setCourses: (semesterId, courses) =>
        set((s) => ({ coursesBySemester: { ...s.coursesBySemester, [semesterId]: courses } })),

    addCourse: async (semesterId, course) => {
        set((s) => ({
            coursesBySemester: {
                ...s.coursesBySemester,
                [semesterId]: [...(s.coursesBySemester[semesterId] || []), course],
            },
        }));

        const { error } = await supabase.from('courses').insert({
            ...course,
            semester_id: semesterId
        });

        if (error) {
            console.error("Failed to add course:", error);
            set((s) => ({
                coursesBySemester: {
                    ...s.coursesBySemester,
                    [semesterId]: s.coursesBySemester[semesterId].filter(c => c.id !== course.id)
                }
            }));
        }
    },

    updateCourse: async (semesterId, courseId, updates) => {
        const previousCourses = get().coursesBySemester[semesterId] || [];
        set((s) => ({
            coursesBySemester: {
                ...s.coursesBySemester,
                [semesterId]: s.coursesBySemester[semesterId].map((c) =>
                    c.id === courseId ? { ...c, ...updates } : c
                ),
            },
        }));

        const { error } = await supabase.from('courses').update(updates).eq('id', courseId);
        if (error) {
            console.error("Failed to update course:", error);
            set((s) => ({
                coursesBySemester: {
                    ...s.coursesBySemester,
                    [semesterId]: previousCourses
                }
            }));
        }
    },

    deleteCourse: async (semesterId, courseId) => {
        const previousCourses = get().coursesBySemester[semesterId] || [];
        set((s) => ({
            coursesBySemester: {
                ...s.coursesBySemester,
                [semesterId]: s.coursesBySemester[semesterId].filter((c) => c.id !== courseId),
            },
        }));

        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) {
            console.error("Failed to delete course:", error);
            set((s) => ({
                coursesBySemester: {
                    ...s.coursesBySemester,
                    [semesterId]: previousCourses
                }
            }));
        }
    },

    // Computed SGPA (derived client-side — never from DB)
    getSGPA: (semesterId) => {
        const courses = get().coursesBySemester[semesterId] || [];
        if (!courses.length) return 0;
        const totalCP = courses.reduce((sum, c) => sum + Number(c.cp || 0), 0);
        const totalACU = courses.reduce((sum, c) => sum + Number(c.acu || 0), 0);
        return totalACU === 0 ? 0 : parseFloat((totalCP / totalACU).toFixed(2));
    },
    getCGPA: () => {
        const { semesters, getSGPA } = get();
        if (semesters.length === 0) return 0;
        const total = semesters.reduce((sum, sem) => sum + getSGPA(sem.id), 0);
        return parseFloat((total / semesters.length).toFixed(2));
    },

    // Goal
    goalBySemester: {},
    setGoal: (semesterId, target) =>
        set((s) => ({ goalBySemester: { ...s.goalBySemester, [semesterId]: target } })),

    // AI Chat
    chatHistory: [],
    setChatHistory: (history) => set({ chatHistory: history }),
    addChatMessage: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),

    // UI
    darkMode: true,
    toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));

export default useGradeStore;
