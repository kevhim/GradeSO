import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { supabase } from '../../lib/supabase';
import useGradeStore from '../../store/useGradeStore';

export default function OnboardingTour() {
    const { profile, setProfile } = useGradeStore();

    useEffect(() => {
        if (profile && profile.onboarded === false) {
            const tour = driver({
                showProgress: true,
                popoverClass: 'driverjs-theme', // We will style this via index.css
                steps: [
                    {
                        element: '#semester-manager',
                        popover: { title: 'Semesters', description: 'Start here. Add or select your semester.' }
                    },
                    {
                        element: '#course-manager',
                        popover: { title: 'Add Courses', description: 'Enter your subject name, credits, and grade. GradeOS handles all the math.' }
                    },
                    {
                        element: '#sgpa-badge',
                        popover: { title: 'Live SGPA', description: 'Your live SGPA. Updates the moment you type.' }
                    },
                    {
                        element: '#ai-advisor-trigger',
                        popover: { title: 'AI Advisor', description: 'Ask your AI advisor anything about your transcript — it reads your actual grades.' }
                    }
                ],
                onDestroyStarted: () => {
                    if (!tour.hasNextStep() || confirm('Are you sure you want to exit the tour?')) {
                        tour.destroy();
                        supabase.from('profiles').update({ onboarded: true }).eq('id', profile.id).then(() => {
                            setProfile({ ...profile, onboarded: true });
                        });
                    }
                }
            });
            setTimeout(() => tour.drive(), 500);
        }
    }, [profile]);

    return null;
}
