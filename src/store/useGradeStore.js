import { create } from 'zustand';

const useGradeStore = create((set, get) => ({
    // Auth
    session: null,
    profile: null,
    setSession: (session) => set({ session }),
    setProfile: (profile) => set({ profile }),

    // Semesters
    semesters: [],
    activeSemesterId: null,
    setSemesters: (semesters) => set({ semesters }),
    setActiveSemesterId: (id) => set({ activeSemesterId: id }),
    addSemester: (semester) => set((s) => ({ semesters: [...s.semesters, semester] })),

    // Courses (keyed by semesterId)
    coursesBySemester: {},
    setCourses: (semesterId, courses) =>
        set((s) => ({ coursesBySemester: { ...s.coursesBySemester, [semesterId]: courses } })),
    addCourse: (semesterId, course) =>
        set((s) => ({
            coursesBySemester: {
                ...s.coursesBySemester,
                [semesterId]: [...(s.coursesBySemester[semesterId] || []), course],
            },
        })),
    updateCourse: (semesterId, courseId, updates) =>
        set((s) => ({
            coursesBySemester: {
                ...s.coursesBySemester,
                [semesterId]: s.coursesBySemester[semesterId].map((c) =>
                    c.id === courseId ? { ...c, ...updates } : c
                ),
            },
        })),
    deleteCourse: (semesterId, courseId) =>
        set((s) => ({
            coursesBySemester: {
                ...s.coursesBySemester,
                [semesterId]: s.coursesBySemester[semesterId].filter((c) => c.id !== courseId),
            },
        })),

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
