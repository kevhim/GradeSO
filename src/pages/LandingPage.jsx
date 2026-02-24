import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AuthModule from '../modules/Auth/AuthModule';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);
    const containerRef = useRef(null);
    const navRef = useRef(null);

    useGSAP(() => {
        // --- NAVBAR SCROLL MORPH ---
        ScrollTrigger.create({
            start: 'top -50',
            end: 99999,
            toggleClass: {
                targets: navRef.current,
                className: 'bg-[#0A0A14]/80 backdrop-blur-xl border-white/10 shadow-lg'
            }
        });

        // --- HERO ANIMATION ---
        gsap.fromTo('.hero-reveal',
            { y: 60, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                stagger: 0.15,
                duration: 1.2,
                ease: 'power3.out',
                delay: 0.2
            }
        );

        // --- FEATURES ANIMATIONS ---
        // 1. Reveal the Feature Cards on scroll
        gsap.fromTo('.feature-card',
            { y: 50, opacity: 0 },
            {
                y: 0, opacity: 1, stagger: 0.15, duration: 1, ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#features',
                    start: 'top 75%'
                }
            }
        );

        // 2. Diagnostic Shuffler (Continuous vertical cycle)
        const shufflerCards = gsap.utils.toArray('.shuffler-card');
        if (shufflerCards.length) {
            // Initial positioning
            gsap.set(shufflerCards, {
                y: (i) => i * 15,
                scale: (i) => 1 - (i * 0.05),
                opacity: (i) => 1 - (i * 0.2),
                zIndex: (i) => 10 - i
            });

            // Need a timeline that repeats
            const tl = gsap.timeline({ repeat: -1 });
            tl.to(shufflerCards[0], { y: -40, opacity: 0, scale: 1.05, duration: 0.6, ease: "power2.inOut", delay: 2 })
                .set(shufflerCards[0], { y: 30, scale: 0.9, zIndex: 7 })
                .to(shufflerCards[1], { y: 0, scale: 1, opacity: 1, zIndex: 10, duration: 0.5, ease: "cubic-bezier(0.34, 1.56, 0.64, 1)" }, "<")
                .to(shufflerCards[2], { y: 15, scale: 0.95, opacity: 0.8, zIndex: 9, duration: 0.5, ease: "cubic-bezier(0.34, 1.56, 0.64, 1)" }, "<")
                .to(shufflerCards[0], { opacity: 0.6, duration: 0.3 }, "<")

                .to(shufflerCards[1], { y: -40, opacity: 0, scale: 1.05, duration: 0.6, ease: "power2.inOut", delay: 2 })
                .set(shufflerCards[1], { y: 30, scale: 0.9, zIndex: 7 })
                .to(shufflerCards[2], { y: 0, scale: 1, opacity: 1, zIndex: 10, duration: 0.5, ease: "cubic-bezier(0.34, 1.56, 0.64, 1)" }, "<")
                .to(shufflerCards[0], { y: 15, scale: 0.95, opacity: 0.8, zIndex: 9, duration: 0.5, ease: "cubic-bezier(0.34, 1.56, 0.64, 1)" }, "<")
                .to(shufflerCards[1], { opacity: 0.6, duration: 0.3 }, "<")

                .to(shufflerCards[2], { y: -40, opacity: 0, scale: 1.05, duration: 0.6, ease: "power2.inOut", delay: 2 })
                .set(shufflerCards[2], { y: 30, scale: 0.9, zIndex: 7 })
                .to(shufflerCards[0], { y: 0, scale: 1, opacity: 1, zIndex: 10, duration: 0.5, ease: "cubic-bezier(0.34, 1.56, 0.64, 1)" }, "<")
                .to(shufflerCards[1], { y: 15, scale: 0.95, opacity: 0.8, zIndex: 9, duration: 0.5, ease: "cubic-bezier(0.34, 1.56, 0.64, 1)" }, "<")
                .to(shufflerCards[2], { opacity: 0.6, duration: 0.3 }, "<");
        }

        // 3. Cursor Protocol Scheduler Animation
        gsap.to('.fake-cursor', {
            x: 80,
            y: 40,
            duration: 1.5,
            delay: 1,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 2,
            yoyo: true,
            onStart: () => {
                gsap.to('.scheduler-cell:nth-child(13)', { backgroundColor: '#7B61FF', delay: 1.6, duration: 0.2 });
            }
        });

        // 4. Philosophy Section
        gsap.to('.philosophy-bg', {
            yPercent: 30,
            ease: "none",
            scrollTrigger: {
                trigger: '#philosophy',
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        gsap.fromTo('.philosophy-text',
            { y: 30, opacity: 0 },
            {
                y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#philosophy',
                    start: 'top 60%'
                }
            }
        );

        // 5. Protocol Sticky Stacking Cards
        const cards = gsap.utils.toArray('.protocol-card');
        cards.forEach((card, index) => {
            if (index === cards.length - 1) return; // Don't shrink the last card

            gsap.to(card, {
                scale: 0.9,
                opacity: 0.5,
                filter: 'blur(10px)',
                ease: "none",
                scrollTrigger: {
                    trigger: cards[index + 1],
                    start: "top 60%", // When the NEXT card reaches 60% of viewport
                    end: "top 30%",   // Finish shrinking when NEXT card is at 30%
                    scrub: true
                }
            });
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="bg-[#0A0A14] text-[#F0EFF4] min-h-screen font-sora selection:bg-[#7B61FF]/30 overflow-hidden">
            {showAuth && <AuthModule />}

            {/* NAVBAR — "The Floating Island" */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-40 transition-all duration-500 rounded-full border border-transparent" ref={navRef}>
                <div className="px-6 h-14 flex items-center justify-between">
                    <div className="font-bold text-lg tracking-tight flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#7B61FF] flex items-center justify-center text-[10px] text-white shadow-[0_0_15px_#7B61FF]">G</div>
                        GradeOS
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="nav-link">Intelligence</a>
                        <a href="#philosophy" className="nav-link">Philosophy</a>
                        <a href="#protocol" className="nav-link">Protocol</a>
                    </div>

                    <button onClick={() => setShowAuth(true)} className="text-sm font-bold text-white bg-white/5 hover:bg-white/10 px-5 py-2 rounded-full transition-all duration-300 border border-white/10 hover:border-white/20">
                        Launch
                    </button>
                </div>
            </nav>

            {/* HERO SECTION — "The Opening Shot" */}
            <section className="relative h-[100dvh] w-full flex items-end pb-24 px-6 md:px-12 lg:px-24">
                {/* Background Image (Unsplash Neon Biotech Mood) + Heavy Gradient Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop")' }}
                ></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0A0A14] via-[#0A0A14]/80 to-transparent"></div>

                {/* Content */}
                <div className="relative z-10 max-w-4xl">
                    <h1 className="hero-reveal text-5xl md:text-7xl lg:text-8xl flex flex-col gap-2 mb-8">
                        <span className="font-sora font-semibold tracking-tight text-[#F0EFF4]">
                            Academic tracking beyond
                        </span>
                        <span className="font-instrument italic text-[#7B61FF] leading-[0.9] text-[1.4em]">
                            intuition.
                        </span>
                    </h1>

                    <p className="hero-reveal text-lg md:text-xl text-gray-400 font-sora font-light max-w-xl mb-10 leading-relaxed">
                        Precision tracking powered by biological data mapping. Remove the guesswork from your GPA and secure your outcomes.
                    </p>

                    <div className="hero-reveal flex items-center gap-6">
                        <button onClick={() => setShowAuth(true)} className="btn-plasma shadow-[0_0_30px_rgba(123,97,255,0.4)]">
                            <span className="relative z-10 flex items-center gap-2">
                                Initialize Protocol <span className="text-xl">→</span>
                            </span>
                        </button>
                    </div>

                </div>
            </section>

            {/* FEATURES SECTION — "Interactive Functional Artifacts" */}
            <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/5">
                <div className="mb-20">
                    <h2 className="text-4xl md:text-5xl font-sora font-bold text-white mb-4">Functional clarity.</h2>
                    <p className="text-gray-400 font-fira text-sm max-w-xl">
                        // System modules engaged. Extracting performance analytics and forecasting trajectories.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Card 1: Diagnostic Shuffler */}
                    <div className="feature-card bg-[#0A0A14] border border-[#7B61FF]/20 rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_10px_40px_-10px_rgba(123,97,255,0.1)]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7B61FF]/10 blur-3xl rounded-full"></div>
                        <h3 className="text-xl font-bold font-sora mb-2">Live GPA Engine</h3>
                        <p className="text-gray-400 text-sm mb-12">Calculate SGPA/CGPA with real-time dependency tracking.</p>

                        <div className="relative h-48 w-full perspective-1000 shuffler-container">
                            {[1, 2, 3].map((card, i) => (
                                <div key={card} className={`shuffler-card card-${card} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] bg-[#12121A] border border-white/10 rounded-2xl p-4 shadow-xl flex items-center justify-between`}>
                                    <div>
                                        <div className="text-xs font-fira text-gray-500 mb-1">{
                                            i === 0 ? 'Data Structures' :
                                                i === 1 ? 'Algorithms' :
                                                    'Database Systems'
                                        }</div>
                                        <div className="font-bold text-[#F0EFF4]">Credits: {i === 0 ? 4 : 3}</div>
                                    </div>
                                    <div className="text-[#7B61FF] font-fira font-bold text-xl">{
                                        i === 0 ? 'A+' :
                                            i === 1 ? 'A' :
                                                'B+'
                                    }</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 2: Telemetry Typewriter */}
                    <div className="feature-card bg-[#0A0A14] border border-[#7B61FF]/20 rounded-[2rem] p-8 relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(123,97,255,0.1)] flex flex-col">
                        <h3 className="text-xl font-bold font-sora mb-2">AI Study Advisor</h3>
                        <p className="text-gray-400 text-sm mb-8">Gemini-powered insights generated directly from your academic telemetry.</p>

                        <div className="flex-1 bg-black/50 border border-white/5 rounded-xl p-4 font-fira text-xs text-[#7B61FF] relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-gray-500 text-[10px] tracking-widest uppercase">Live Feed</span>
                            </div>
                            <div className="typewriter-text text-gray-300 leading-relaxed font-light">
                                <span className="text-[#7B61FF]">~%</span> Analyzing past performance...<br /><br />
                                <span className="text-[#7B61FF]">→</span> Warning: Mathematics IV requires intervention to maintain CGPA &gt; 8.5.<br />
                                <span className="text-[#7B61FF]">→</span> Recommendation: Shift 3 study hours from Electives to Math.<span className="cursor inline-block w-2 h-3 bg-[#7B61FF] ml-1 animate-pulse"></span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Cursor Protocol Scheduler */}
                    <div className="feature-card bg-[#0A0A14] border border-[#7B61FF]/20 rounded-[2rem] p-8 relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(123,97,255,0.1)]">
                        <h3 className="text-xl font-bold font-sora mb-2">Goal Forecasting</h3>
                        <p className="text-gray-400 text-sm mb-8">Map your required grades. See exactly what it takes to hit honors.</p>

                        <div className="relative w-full aspect-square max-h-48 bg-black/50 border border-white/5 rounded-xl p-4 overflow-hidden">
                            <div className="grid grid-cols-7 gap-1 h-3/4 mb-4">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                    <div key={i} className="text-[10px] text-gray-600 font-fira text-center">{day}</div>
                                ))}
                                {Array(21).fill(0).map((_, i) => (
                                    <div key={i} className={`rounded-sm scheduler-cell ${i === 12 ? 'bg-[#7B61FF]/20 border border-[#7B61FF]/50' : 'bg-white/5'}`}></div>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <button className="scheduler-save text-[10px] font-fira bg-[#7B61FF] text-white px-3 py-1 rounded">Save Target</button>
                            </div>

                            {/* Animated Fake Cursor */}
                            <div className="fake-cursor absolute top-4 left-4 w-4 h-4 text-white z-10 pointer-events-none drop-shadow-md">
                                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5.5 2.5L20 12L12.5 14L15.5 22L11.5 23L8.5 15.5L2.5 18L5.5 2.5Z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* PHILOSOPHY SECTION — "The Manifesto" */}
                    <section id="philosophy" className="relative py-40 bg-[#0A0A14] overflow-hidden">
                        {/* Parallaxing organic texture background */}
                        <div
                            className="philosophy-bg absolute inset-0 opacity-10 bg-cover bg-center mix-blend-screen"
                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518778922434-51341d18d15a?q=80&w=2000&auto=format&fit=crop")' }}
                        ></div>

                        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                            <p className="philosophy-text text-xl md:text-2xl text-gray-500 font-sora mb-6">
                                Most academic tools focus on static logging.
                            </p>
                            <p className="philosophy-text text-5xl md:text-7xl lg:text-8xl font-instrument italic text-[#F0EFF4] leading-[0.9]">
                                We focus on <span className="text-[#7B61FF]">dynamic intelligence.</span>
                            </p>
                        </div>
                    </section>

                    {/* PROTOCOL — "Sticky Stacking Archive" */}
                    <section id="protocol" className="relative pb-32">
                        <div className="max-w-5xl mx-auto px-6 pt-32 mb-16">
                            <h2 className="text-4xl md:text-5xl font-sora font-bold text-white mb-4">The Methodology.</h2>
                            <p className="text-gray-400 font-fira text-sm">Sequence initiated. Follow the defined path to honors.</p>
                        </div>

                        <div className="protocol-container relative max-w-5xl mx-auto px-6 h-[300vh]">

                            {/* Card 1 */}
                            <div className="protocol-card protocol-card-1 sticky top-32 flex flex-col md:flex-row bg-[#12121A] border border-white/10 rounded-[2rem] h-[60vh] overflow-hidden shadow-2xl origin-top">
                                <div className="flex-1 p-12 flex flex-col justify-center">
                                    <span className="font-fira text-[#7B61FF] mb-4 text-sm tracking-widest uppercase">Phase 01</span>
                                    <h3 className="text-4xl font-sora font-bold mb-6 text-white">Ingest Telemetry</h3>
                                    <p className="text-gray-400 text-lg leading-relaxed">Import your current semester data. GradeOS instantly maps your baseline and identifies critical dependencies.</p>
                                </div>
                                <div className="flex-1 bg-black/50 border-l border-white/5 relative overflow-hidden flex items-center justify-center">
                                    {/* Geometric Motif */}
                                    <div className="w-48 h-48 border border-[#7B61FF]/30 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center relative">
                                        <div className="absolute inset-2 border border-[#7B61FF]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                                        <div className="w-2 h-2 bg-[#7B61FF] rounded-full shadow-[0_0_15px_#7B61FF]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="protocol-card protocol-card-2 sticky top-32 flex flex-col md:flex-row bg-[#12121A] border border-white/10 rounded-[2rem] h-[60vh] overflow-hidden shadow-2xl origin-top mt-[20vh]">
                                <div className="flex-1 p-12 flex flex-col justify-center">
                                    <span className="font-fira text-[#7B61FF] mb-4 text-sm tracking-widest uppercase">Phase 02</span>
                                    <h3 className="text-4xl font-sora font-bold mb-6 text-white">Define Target</h3>
                                    <p className="text-gray-400 text-lg leading-relaxed">Set your desired CGPA. The calculation engine works backward to output the exact grades required per subject.</p>
                                </div>
                                <div className="flex-1 bg-black/50 border-l border-white/5 relative overflow-hidden flex items-center justify-center">
                                    {/* Laser Scan Grid */}
                                    <div className="grid grid-cols-10 grid-rows-10 gap-1 w-48 h-48 relative">
                                        {Array(100).fill(0).map((_, i) => <div key={i} className="bg-white/5 rounded-sm"></div>)}
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#7B61FF] shadow-[0_0_10px_#7B61FF] animate-[bounce_4s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="protocol-card protocol-card-3 sticky top-32 flex flex-col md:flex-row bg-[#12121A] border border-white/10 rounded-[2rem] h-[60vh] overflow-hidden shadow-2xl origin-top mt-[20vh]">
                                <div className="flex-1 p-12 flex flex-col justify-center">
                                    <span className="font-fira text-[#7B61FF] mb-4 text-sm tracking-widest uppercase">Phase 03</span>
                                    <h3 className="text-4xl font-sora font-bold mb-6 text-white">Execute Directives</h3>
                                    <p className="text-gray-400 text-lg leading-relaxed">Follow Gemini AI's micro-adjustments to your study schedule. Track progress in real-time until target is secured.</p>
                                </div>
                                <div className="flex-1 bg-black/50 border-l border-white/5 relative overflow-hidden flex items-center justify-center">
                                    {/* Waveform */}
                                    <svg className="w-full h-32 px-8" viewBox="0 0 200 50" preserveAspectRatio="none">
                                        <path
                                            d="M0,25 Q10,25 20,25 T40,25 T60,25 T80,0 T100,25 T120,50 T140,25 T160,25 T180,25 T200,25"
                                            fill="none"
                                            stroke="#7B61FF"
                                            strokeWidth="2"
                                            className="animate-pulse"
                                        />
                                    </svg>
                                </div>
                            </div>

                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
}
