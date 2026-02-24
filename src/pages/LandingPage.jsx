import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AuthModule from '../modules/Auth/AuthModule';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Navbar morphing
            ScrollTrigger.create({
                start: 'top -50',
                end: 99999,
                toggleClass: { className: 'bg-void/60 backdrop-blur-xl border-plasma/20', targets: '.navbar' }
            });

            // Hero Animation
            gsap.fromTo('.hero-anim',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: 'power3.out', delay: 0.1 }
            );

            // Button Magnetic Hover
            const buttons = gsap.utils.toArray('.magnetic-btn');
            buttons.forEach(btn => {
                btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.03, duration: 0.3, ease: 'power2.out' }));
                btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out' }));
            });

            // Philosophy Reveal
            gsap.fromTo('.philosophy-word',
                { y: 30, opacity: 0 },
                {
                    y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: 'power3.out',
                    scrollTrigger: { trigger: '#philosophy', start: 'top 65%' }
                }
            );

            // Shuffler Animation
            const shufflers = gsap.utils.toArray('.shuffler-card');
            if (shufflers.length === 3) {
                let cycle = 0;
                setInterval(() => {
                    cycle++;
                    shufflers.forEach((el, index) => {
                        const shift = (index + cycle) % 3;
                        gsap.to(el, {
                            y: shift * -15,
                            scale: 1 - (shift * 0.05),
                            zIndex: 3 - shift,
                            opacity: 1 - (shift * 0.2),
                            duration: 0.6,
                            ease: 'power3.inOut'
                        });
                    });
                }, 3000);
            }

            // Typewriter Animation
            const tw = document.getElementById('typewriter-text');
            if (tw) {
                const msgs = [
                    "> System initialized...",
                    "> Analyzing semantic gaps in fluid dynamics...",
                    "> SGPA impact: -12.5% projected.",
                    "> Recommend immediate intervention."
                ];
                let mIdx = 0, cIdx = 0;
                let pTask = null;
                const type = () => {
                    if (cIdx < msgs[mIdx].length) {
                        tw.innerHTML = msgs[mIdx].substring(0, cIdx + 1);
                        cIdx++;
                        pTask = setTimeout(type, Math.random() * 50 + 30);
                    } else {
                        pTask = setTimeout(() => {
                            cIdx = 0;
                            mIdx = (mIdx + 1) % msgs.length;
                            type();
                        }, 2500);
                    }
                };
                type();
                return () => clearTimeout(pTask);
            }

            // Cursor Protocol Scheduler Animation
            const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
            tl.set('#svg-cursor', { x: 0, y: 150, opacity: 0, scale: 1 })
                .to('#svg-cursor', { opacity: 1, duration: 0.3 })
                .to('#svg-cursor', { x: 120, y: 40, duration: 1, ease: 'power2.inOut' }) // Move to a day
                .to('#svg-cursor', { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 }) // Click
                .to('#day-cell-4', { backgroundColor: '#7B61FF', borderColor: '#7B61FF', boxShadow: '0 0 15px #7B61FF', duration: 0.2 }, "-=0.1")
                .to('#svg-cursor', { x: 180, y: 120, duration: 0.8, ease: 'power2.inOut', delay: 0.3 }) // Move to Save button
                .to('#svg-cursor', { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 }) // Click Save
                .to('#save-btn-bg', { x: '100%', duration: 0.3 }, "-=0.1")
                .to('#svg-cursor', { opacity: 0, duration: 0.3, delay: 0.5 })
                .to('#day-cell-4', { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.05)', boxShadow: 'none', duration: 0.5 }, "+=0.5")
                .to('#save-btn-bg', { x: '-100%', duration: 0.1 });


            // Stacking Protocol Cards
            const cards = gsap.utils.toArray('.protocol-card');
            if (cards.length) {
                cards.forEach((card, i) => {
                    ScrollTrigger.create({
                        trigger: card,
                        start: 'top top',
                        pin: true,
                        pinSpacing: false,
                        end: '+=100%',
                    });
                    if (i > 0) {
                        gsap.to(cards[i - 1], {
                            scale: 0.9, opacity: 0.5, filter: 'blur(20px)',
                            scrollTrigger: {
                                trigger: card,
                                start: 'top bottom',
                                end: 'top top',
                                scrub: true,
                            }
                        });
                    }
                });
            }

            // EKG Waveform Path Animation
            gsap.to('#ekg-path', {
                strokeDashoffset: 0,
                duration: 2,
                repeat: -1,
                ease: 'linear'
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-void text-ghost min-h-screen font-sora selection:bg-plasma/30 overflow-x-hidden">
            {showAuth && <AuthModule />}

            {/* Navbar - The Floating Island */}
            <nav className="navbar fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between px-6 py-3 rounded-full border border-transparent transition-colors duration-500 w-[90%] max-w-5xl">
                <span className="font-bold tracking-tight text-xl">GradeOS</span>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ghost/70">
                    <a href="#features" className="hover:text-plasma transition-colors hover:-translate-y-px inline-block">Architecture</a>
                    <a href="#protocol" className="hover:text-plasma transition-colors hover:-translate-y-px inline-block">Protocol</a>
                </div>
                <button onClick={() => setShowAuth(true)} className="magnetic-btn bg-plasma text-white px-5 py-2 rounded-[2rem] text-sm font-semibold overflow-hidden group relative">
                    <span className="absolute inset-0 bg-white/20 -translate-x-full transition-transform duration-300 ease-out group-hover:translate-x-0" />
                    <span className="relative z-10 transition-transform duration-300 inline-block group-hover:scale-105">Initialize</span>
                </button>
            </nav>

            {/* Hero Section - The Opening Shot */}
            <section className="relative h-[100dvh] flex items-end pb-32 px-6 md:px-20 bg-[url('https://images.unsplash.com/photo-1518063065603-9bb828373305?auto=format&fit=crop&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-4xl flex flex-col justify-end h-full w-full">
                    <h1 className="hero-anim text-5xl md:text-7xl font-bold tracking-tight">Intelligence beyond</h1>
                    <h1 className="hero-anim text-6xl md:text-8xl font-serif text-plasma mt-2 tracking-tight italic">guesswork.</h1>
                    <p className="hero-anim text-ghost/70 text-lg md:text-xl max-w-md mt-6">
                        GradeOS — A biometric-inspired, AI-driven academic cockpit for real-time performance tracking and predictive diagnostics.
                    </p>
                    <button onClick={() => setShowAuth(true)} className="hero-anim magnetic-btn mt-10 w-fit bg-plasma text-white px-8 py-4 rounded-[2rem] text-lg font-bold overflow-hidden group relative">
                        <span className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
                        <span className="relative z-10 transition-transform duration-300 inline-block group-hover:-translate-y-px">Engage Cockpit</span>
                    </button>
                </div>
            </section>

            {/* Features - Interactive Functional Artifacts */}
            <section id="features" className="py-32 px-6 md:px-20 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Card 1: Diagnostic Shuffler */}
                    <div className="bg-graphite rounded-[2rem] p-8 border border-white/5 h-80 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-plasma/30 transition-colors duration-500">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Predictive Analytics</h3>
                            <p className="text-sm text-ghost/60 mt-2">Real-time sub-grade simulation and dynamic SGPA outcome forecasting.</p>
                        </div>
                        <div className="relative h-32 flex items-end justify-center perspective-1000">
                            {[
                                'Target SGPA: 8.7 ↑',
                                'Risk Factor: 12% Anomalous',
                                'A+ Buffer: +15 CP Required'
                            ].map((lbl, i) => (
                                <div key={i} className={`shuffler-card absolute w-full max-w-[200px] bg-void border border-plasma/30 rounded-2xl p-4 text-center text-sm font-mono shadow-xl`} style={{ zIndex: 3 - i }}>
                                    {lbl}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 2: Telemetry Typewriter */}
                    <div className="bg-graphite rounded-[2rem] p-8 border border-white/5 h-80 flex flex-col justify-between shadow-2xl group hover:border-plasma/30 transition-colors duration-500">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">AI Diagnostics Network</h3>
                            <p className="text-sm text-ghost/60 mt-2">Vision-powered exam scanning to locate knowledge gaps algorithmically.</p>
                        </div>
                        <div className="bg-void rounded-2xl p-4 border border-plasma/20 relative shadow-inner overflow-hidden flex-1 mt-4">
                            <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] font-mono font-bold text-plasma">
                                <span className="w-2 h-2 rounded-full bg-plasma animate-pulse" /> LIVE TELEMETRY
                            </div>
                            <div className="font-mono text-sm text-ghost/90 mt-6 h-full flex items-start leading-relaxed">
                                <div><span id="typewriter-text" className="drop-shadow-[0_0_8px_rgba(123,97,255,0.8)]"></span><span className="text-plasma animate-pulse drop-shadow-[0_0_8px_rgba(123,97,255,1)]">_</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Cursor Protocol Scheduler */}
                    <div className="bg-graphite rounded-[2rem] p-8 border border-white/5 h-80 flex flex-col justify-between shadow-2xl overflow-hidden relative group hover:border-plasma/30 transition-colors duration-500">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Automated Trajectory</h3>
                            <p className="text-sm text-ghost/60 mt-2">Daily operational directives injected straight into your academic routine.</p>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5 mt-4 relative z-0">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[10px] font-mono text-ghost/50">{d}</div>)}
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div id={i === 4 ? "day-cell-4" : `day-cell-${i}`} key={i} className={`aspect-square rounded border border-white/5 bg-white/5 transition-colors`} />
                            ))}

                            {/* SVG Animated Cursor */}
                            <svg id="svg-cursor" className="absolute top-0 left-0 w-6 h-6 z-20 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translate(0px, 150px)', opacity: 0 }}>
                                <polygon points="3 3 10.5 21 13.5 13.5 21 10.5 3 3" fill="white" stroke="white" strokeWidth="1" />
                            </svg>

                            {/* Faux Save Button inside the grid area */}
                            <div className="absolute bottom-0 right-0 w-20 h-6 border border-white/10 bg-void rounded text-[10px] font-mono flex items-center justify-center font-bold overflow-hidden">
                                <span className="relative z-10">SAVE TGT</span>
                                <div id="save-btn-bg" className="absolute inset-0 bg-plasma -translate-x-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy - The Manifesto */}
            <section id="philosophy" className="py-40 px-6 bg-graphite relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582298538104-e5932a321ea4?auto=format&fit=crop&q=80')] opacity-[0.03] bg-cover bg-fixed brightness-150 contrast-150 grayscale" />
                <div className="relative z-10 max-w-5xl mx-auto">
                    <p className="text-ghost/40 text-sm md:text-lg font-medium mb-6 uppercase tracking-widest font-mono">Most academic software focuses on: recording the past.</p>
                    <h2 className="text-4xl md:text-7xl font-serif leading-tight">
                        {`We focus on: `.split(' ').map((w, i) => <span key={i} className="philosophy-word inline-block mr-3 md:mr-4">{w}</span>)}
                        <span className="philosophy-word inline-block text-plasma italic drop-shadow-[0_0_15px_rgba(123,97,255,0.5)]">predictive intelligence.</span>
                    </h2>
                </div>
            </section>

            {/* Protocol Sticky Stacking Archive */}
            <section id="protocol" className="bg-void relative h-[300vh]">
                <div className="sticky top-0 h-screen overflow-hidden">

                    {/* Card 1: Motif */}
                    <div className="protocol-card absolute inset-0 bg-void flex flex-col items-center justify-center p-6 border-b border-plasma/5">
                        <div className="max-w-3xl text-center flex flex-col items-center">
                            <div className="text-plasma font-mono text-xs tracking-[0.2em] mb-8 border border-plasma/30 rounded-full px-5 py-2 inline-block bg-plasma/5 shadow-[0_0_15px_rgba(123,97,255,0.1)]">PHASE 01 // INGESTION</div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-10 tracking-tight">Sync courses and credits. Calibrate the system in under 60 seconds.</h2>
                            <div className="w-40 h-40">
                                <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_15s_linear_infinite]">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#7B61FF" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
                                    <circle cx="50" cy="50" r="35" fill="none" stroke="#7B61FF" strokeWidth="1" opacity="0.8" />
                                    <polygon points="50,20 76,70 24,70" fill="none" stroke="#F0EFF4" strokeWidth="1.5" className="animate-[spin_8s_reverse_linear_infinite]" style={{ transformOrigin: '50px 52px' }} />
                                    <circle cx="50" cy="50" r="3" fill="#7B61FF" className="animate-ping" style={{ animationDuration: '3s' }} />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Laser Scan */}
                    <div className="protocol-card absolute inset-0 bg-void flex flex-col items-center justify-center p-6 border-b border-plasma/5">
                        <div className="max-w-3xl text-center flex flex-col items-center">
                            <div className="text-plasma font-mono text-xs tracking-[0.2em] mb-8 border border-plasma/30 rounded-full px-5 py-2 inline-block bg-plasma/5 shadow-[0_0_15px_rgba(123,97,255,0.1)]">PHASE 02 // DIAGNOSTICS</div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-10 tracking-tight">GradeOS pinpoints the exact modules bleeding your overall metrics.</h2>
                            <div className="w-full max-w-sm h-24 border border-white/10 bg-graphite relative rounded overflow-hidden flex wrap p-2 gap-1 content-start">
                                {/* Grid cells */}
                                {Array.from({ length: 45 }).map((_, i) => (
                                    <div key={i} className="w-4 h-4 rounded-sm bg-white/5" />
                                ))}
                                {/* Moving Laser Line */}
                                <div className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-plasma to-transparent mix-blend-screen opacity-80" style={{ animation: 'laser 3s infinite ease-in-out alternate' }} />
                                <style>{`@keyframes laser { from { left: -20%; } to { left: 110%; } }`}</style>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: EKG Waveform */}
                    <div className="protocol-card absolute inset-0 bg-void flex flex-col items-center justify-center p-6">
                        <div className="max-w-3xl text-center flex flex-col items-center">
                            <div className="text-plasma font-mono text-xs tracking-[0.2em] mb-8 border border-plasma/30 rounded-full px-5 py-2 inline-block bg-plasma/5 shadow-[0_0_15px_rgba(123,97,255,0.1)]">PHASE 03 // OPTIMIZATION</div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-10 tracking-tight">Your neural advisor synthesizes a recovery path based on empirical history.</h2>
                            <div className="w-full max-w-sm h-32 relative flex items-center justify-center">
                                <svg viewBox="0 0 300 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(123,97,255,0.8)]">
                                    <path
                                        id="ekg-path"
                                        d="M 0 50 L 50 50 L 60 20 L 70 80 L 80 10 L 90 90 L 100 50 L 300 50"
                                        fill="none"
                                        stroke="#7B61FF"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray="600"
                                        strokeDashoffset="600"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Get Started */}
            <section className="py-40 px-6 text-center max-w-4xl mx-auto border-t border-white/5">
                <h2 className="text-4xl md:text-6xl font-bold mb-10 tracking-tight">The intelligence layer is online.</h2>
                <button onClick={() => setShowAuth(true)} className="magnetic-btn bg-plasma text-white px-10 py-5 rounded-[2.5rem] text-xl font-bold overflow-hidden shadow-[0_0_30px_#7B61FF55] group relative transition-transform">
                    <span className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
                    <span className="relative z-10 font-sora inline-block group-hover:-translate-y-px transition-transform duration-300">Access GradeOS — Free Iteration</span>
                </button>
                <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 font-mono text-xs text-ghost/50 tracking-widest uppercase">
                    <span>— Zero latency</span>
                    <span>— Local telemetry</span>
                    <span>— End-to-end encrypted</span>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#05050A] rounded-t-[4rem] px-10 py-16 mt-20 border-t border-white/5 text-center md:text-left">
                <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto border-b border-white/10 pb-12">
                    <div className="md:col-span-2">
                        <div className="font-bold text-2xl tracking-tight mb-2 font-sora">GradeOS</div>
                        <div className="text-ghost/40 text-sm font-mono tracking-wide">Biological data logic applied to academics.</div>
                    </div>
                    <div className="flex flex-col gap-3 text-sm text-ghost/60">
                        <span className="font-bold text-ghost font-mono text-xs tracking-widest uppercase mb-2">Platform</span>
                        <a href="#features" className="hover:text-plasma transition-colors">Architecture</a>
                        <a href="#protocol" className="hover:text-plasma transition-colors">Protocol Specs</a>
                        <span onClick={() => setShowAuth(true)} className="hover:text-plasma transition-colors cursor-pointer">Terminal Login</span>
                    </div>
                    <div className="flex flex-col gap-3 text-sm text-ghost/60">
                        <span className="font-bold text-ghost font-mono text-xs tracking-widest uppercase mb-2">Compliance</span>
                        <a href="#" className="hover:text-plasma transition-colors">Data Privacy</a>
                        <a href="#" className="hover:text-plasma transition-colors">Terms of Operations</a>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22C55E] animate-pulse" />
                        <span className="font-mono text-[10px] font-bold text-ghost/80 tracking-widest uppercase">Nodes Operational</span>
                    </div>
                    <div className="text-ghost/30 text-[10px] font-mono">
                        © {new Date().getFullYear()} GRADEOS. ALL SYSTEMS REAL-TIME.
                    </div>
                </div>
            </footer>
        </div>
    );
}
