/**
 * GradeOS — Supabase Seed Script
 *
 * Run after executing migration.sql in the Supabase SQL Editor.
 *
 * Usage:
 *   node supabase/seed.mjs
 *
 * This script:
 *   1. Authenticates with the existing test user
 *   2. Ensures a profile row exists
 *   3. Inserts 3 semesters with realistic B.Tech CSE courses
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dakvaiofizllqlsfufhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha3ZhaW9maXpsbHFsc2Z1ZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MTMyNzQsImV4cCI6MjA4NzQ4OTI3NH0.H_VP1qIMVP3pLRo4pv0cFHxQX4rq6t5WyyARFexqlA8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Config ──────────────────────────────────────────────────
const TEST_EMAIL = 'kevinhatoshi@gmail.com';
const TEST_PASSWORD = '1234567890';

const GRADE_TO_GP = {
    'A+': 10, 'A': 9, 'A-': 8,
    'B+': 7, 'B': 6, 'B-': 5,
    'C+': 4, 'C': 3, 'F': 0
};

function calcCourse(name, code, acu, grade) {
    const gp = GRADE_TO_GP[grade];
    return {
        course_name: name,
        course_code: code,
        acu,
        grade,
        gp,
        cp: acu * gp,
        ecu: grade !== 'F' ? acu : 0
    };
}

// ── Seed Data ───────────────────────────────────────────────
const SEMESTERS = [
    {
        number: 1,
        label: 'Sem 1_2023',
        courses: [
            calcCourse('Engineering Mathematics I', 'MTH101', 4, 'A'),
            calcCourse('Physics I', 'PHY101', 3, 'A-'),
            calcCourse('Programming in C', 'CSE101', 4, 'A+'),
            calcCourse('Engineering Drawing', 'MEE101', 3, 'B+'),
            calcCourse('Communication Skills', 'HUM101', 2, 'A'),
            calcCourse('Chemistry', 'CHM101', 3, 'A-'),
        ]
    },
    {
        number: 2,
        label: 'Sem 2_2023',
        courses: [
            calcCourse('Engineering Mathematics II', 'MTH201', 4, 'A-'),
            calcCourse('Data Structures', 'CSE201', 4, 'A+'),
            calcCourse('Digital Electronics', 'ECE201', 3, 'A'),
            calcCourse('Discrete Mathematics', 'MTH202', 3, 'A'),
            calcCourse('Object Oriented Programming', 'CSE202', 4, 'A'),
            calcCourse('Environmental Science', 'HUM201', 2, 'B+'),
        ]
    },
    {
        number: 3,
        label: 'Sem 3_2024',
        courses: [
            calcCourse('Database Management Systems', 'CSE301', 4, 'A+'),
            calcCourse('Operating Systems', 'CSE302', 4, 'A'),
            calcCourse('Computer Networks', 'CSE303', 3, 'A-'),
            calcCourse('Probability & Statistics', 'MTH301', 3, 'A'),
            calcCourse('Theory of Computation', 'CSE304', 3, 'B+'),
            calcCourse('Software Engineering', 'CSE305', 3, 'A'),
        ]
    },
];

// ── Main ────────────────────────────────────────────────────
async function main() {
    console.log('🔐 Signing in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
    });

    if (authError) {
        console.error('❌ Auth failed:', authError.message);
        process.exit(1);
    }

    const userId = authData.user.id;
    console.log(`✅ Authenticated as ${userId}`);

    // ── 1. Upsert Profile ───────────────────────────────────
    console.log('👤 Upserting profile...');
    const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            name: 'Yash Sharma',
            target_sgpa: 9.0,
            current_semester: 3
        }, { onConflict: 'id' });

    if (profileErr) {
        console.error('❌ Profile upsert failed:', profileErr.message);
        // The trigger may have already created a profile, try update instead
        const { error: updateErr } = await supabase
            .from('profiles')
            .update({ name: 'Yash Sharma', target_sgpa: 9.0, current_semester: 3 })
            .eq('id', userId);
        if (updateErr) {
            console.error('❌ Profile update also failed:', updateErr.message);
        } else {
            console.log('✅ Profile updated (was already created by trigger)');
        }
    } else {
        console.log('✅ Profile upserted');
    }

    // ── 2. Clean existing data ──────────────────────────────
    console.log('🗑  Cleaning existing semesters & courses...');
    const { data: existingSemesters } = await supabase
        .from('semesters')
        .select('id')
        .eq('student_id', userId);

    if (existingSemesters && existingSemesters.length > 0) {
        // Courses will be cascade-deleted when semesters are deleted
        const { error: delErr } = await supabase
            .from('semesters')
            .delete()
            .eq('student_id', userId);
        if (delErr) console.warn('⚠  Could not clean semesters:', delErr.message);
        else console.log(`   Cleared ${existingSemesters.length} existing semester(s)`);
    }

    // ── 3. Insert Semesters ─────────────────────────────────
    console.log('📚 Inserting semesters...');
    for (const sem of SEMESTERS) {
        const { data: semData, error: semErr } = await supabase
            .from('semesters')
            .insert({
                student_id: userId,
                semester_number: sem.number,
                label: sem.label,
            })
            .select()
            .single();

        if (semErr) {
            console.error(`❌ Failed to insert ${sem.label}:`, semErr.message);
            continue;
        }

        console.log(`   ✅ ${sem.label} (${semData.id})`);

        // ── 4. Insert Courses ───────────────────────────────
        const coursesWithSemId = sem.courses.map(c => ({
            ...c,
            semester_id: semData.id,
        }));

        const { error: courseErr } = await supabase
            .from('courses')
            .insert(coursesWithSemId);

        if (courseErr) {
            console.error(`   ❌ Failed to insert courses for ${sem.label}:`, courseErr.message);
        } else {
            console.log(`   📝 Inserted ${sem.courses.length} courses`);
        }
    }

    console.log('\n🎉 Seed complete! Refresh your GradeOS dashboard to see the data.');
    process.exit(0);
}

main();
