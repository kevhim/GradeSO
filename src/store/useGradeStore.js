import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useGradeStore = create((set, get) => ({
    // Auth & Sync State
    session: null,
    profile: null,
    isLoading: false,
    error: null,
    setSession: (session) => set({ session }),
    setProfile: (profile) => set({ profile }),

    // Fetches all user data from Supabase
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
            console.error("Error fetching telemetry:", err);
            set({ error: err.message });
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
