import React, { useState, useRef, useLayoutEffect } from 'react';
import { supabase } from '../../lib/supabase';
import useGradeStore from '../../store/useGradeStore';
import gsap from 'gsap';
import { Loader2 } from 'lucide-react';

export default function AuthModule() {
    const [view, setView] = useState('signin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo('.auth-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        }, containerRef);
        return () => ctx.revert();
    }, [view]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null); setSuccess(null);

        try {
            if (view === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({
                    email: e.target.email.value,
                    password: e.target.password.value,
                });
                if (error) throw error;
            } else if (view === 'signup') {
                const email = e.target.email.value;
                const password = e.target.password.value;
                const name = e.target.name.value;
                const currentSem = parseInt(e.target.semester.value, 10);

                const { data, error } = await supabase.auth.signUp({
                    email, password
                });
                if (error) throw error;

                if (data?.user) {
                    await supabase.from('profiles').insert({
                        id: data.user.id, name, current_semester: currentSem
                    });
                    await supabase.from('semesters').insert({
                        student_id: data.user.id, semester_number: 1, label: 'Semester 1'
                    });
                    setSuccess('Account created! Logging you in...');
                }
            } else if (view === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(e.target.email.value);
                if (error) throw error;
                setSuccess('Password reset sent to your email.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A14] text-[#F0EFF4] px-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#7B61FF]/10 to-[#0A0A14]/0 pointer-events-none" />

            <div className="auth-card w-full max-w-md bg-[#12121A] rounded-[2rem] p-8 shadow-[0_20px_60px_-15px_rgba(123,97,255,0.2)] border border-[#7B61FF]/20 relative overflow-hidden">
                <h1 className="text-4xl font-sora font-bold text-center mb-6 tracking-tight">GradeOS</h1>

                {error && <div className="text-red-400 text-sm mb-4 text-center font-fira">{error}</div>}
                {success && <div className="text-green-400 text-sm mb-4 text-center font-fira">{success}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    {view === 'signup' && (
                        <>
                            <input name="name" type="text" placeholder="Full Name" required className="bg-[#0A0A14]/50 border border-[#7B61FF]/30 rounded-2xl px-4 py-3 text-[#F0EFF4] focus:border-[#7B61FF] outline-none focus:ring-1 focus:ring-[#7B61FF] transition-colors font-sora" />
                            <select name="semester" required className="bg-[#0A0A14]/50 border border-[#7B61FF]/30 rounded-2xl px-4 py-3 text-[#F0EFF4]/70 focus:border-[#7B61FF] outline-none appearance-none font-sora">
                                <option value="" disabled selected>Current Semester</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-[#12121A] text-[#F0EFF4]">Semester {s}</option>)}
                            </select>
                        </>
                    )}

                    <input name="email" type="email" placeholder="Email Address" required className="bg-[#0A0A14]/50 border border-[#7B61FF]/30 rounded-2xl px-4 py-3 text-[#F0EFF4] focus:border-[#7B61FF] outline-none focus:ring-1 focus:ring-[#7B61FF] transition-colors font-sora" />

                    {view !== 'forgot' && (
                        <input name="password" type="password" placeholder="Password" required className="bg-[#0A0A14]/50 border border-[#7B61FF]/30 rounded-2xl px-4 py-3 text-[#F0EFF4] focus:border-[#7B61FF] outline-none focus:ring-1 focus:ring-[#7B61FF] transition-colors font-sora" />
                    )}

                    <button type="submit" disabled={loading} className="mt-4 btn-plasma w-full disabled:opacity-50">
                        <span className="relative z-10 flex items-center justify-center font-sora">
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                view === 'signin' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'
                            )}
                        </span>
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-[#F0EFF4]/50 flex flex-col space-y-2 font-sora">
                    {view === 'signin' ? (
                        <>
                            <button onClick={() => setView('signup')} className="hover:text-[#7B61FF] transition-colors">Don't have an account? Sign up</button>
                            <button onClick={() => setView('forgot')} className="hover:text-[#7B61FF] transition-colors">Forgot password?</button>
                        </>
                    ) : view === 'signup' ? (
                        <button onClick={() => setView('signin')} className="hover:text-[#7B61FF] transition-colors">Already have an account? Sign in</button>
                    ) : (
                        <button onClick={() => setView('signin')} className="hover:text-[#7B61FF] transition-colors">Back to Sign in</button>
                    )}
                </div>
            </div>
        </div>
    );
}
