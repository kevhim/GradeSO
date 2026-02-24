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

            // Hero stagger
            gsap.fromTo('.hero-anim',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: 'power3.out', delay: 0.2 }
            );

            // Philosophy reveal
            gsap.fromTo('.philosophy-word',
                { y: 20, opacity: 0 },
                {
                    y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power2.out',
                    scrollTrigger: { trigger: '#philosophy', start: 'top 70%' }
                }
            );

            // Protocol Sticky Stacking
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

            // Feature Shuffler
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
                            ease: 'power3.inOut' // Apprx spring
                        });
                    });
                }, 3000);
            }

            // Typewriter
            const tw = document.getElementById('typewriter-text');
            if (tw) {
                const msgs = ["> Scanning transcript...", "> Grade dip: B+ → B- in CSE302", "> CP loss detected: -6 this semester"];
                let mIdx = 0, cIdx = 0;
                let pTask = null;
                const type = () => {
                    if (cIdx < msgs[mIdx].length) {
                        tw.innerHTML = msgs[mIdx].substring(0, cIdx + 1);
                        cIdx++;
                        pTask = setTimeout(type, 50);
                    } else {
                        pTask = setTimeout(() => {
                            cIdx = 0;
                            mIdx = (mIdx + 1) % msgs.length;
                            type();
                        }, 2000);
                    }
                };
                type();
                return () => clearTimeout(pTask);
            }

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-void text-ghost min-h-screen font-sora selection:bg-plasma/30">
            {showAuth && <AuthModule />}

            {/* Navbar */}
            <nav className="navbar fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between px-6 py-3 rounded-full border border-transparent transition-colors duration-500 w-[90%] max-w-5xl">
                <span className="font-bold tracking-tight text-xl">GradeOS</span>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ghost/70">
                    <a href="#features" className="hover:text-plasma transition-colors">Features</a>
                    <a href="#philosophy" className="hover:text-plasma transition-colors">How It Works</a>
                </div>
                <button onClick={() => setShowAuth(true)} className="bg-plasma text-white px-5 py-2 rounded-full text-sm font-semibold transition-transform duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-plasma/20">
                    Launch Dashboard
                </button>
            </nav>

            {/* Hero */}
            <section className="relative h-[100dvh] flex items-end pb-32 px-6 md:px-20 bg-[url('https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-4xl">
                    <h1 className="hero-anim text-5xl md:text-7xl font-bold tracking-tight">Grades beyond</h1>
                    <h1 className="hero-anim text-6xl md:text-8xl font-serif text-plasma mt-2">guesswork.</h1>
                    <p className="hero-anim text-ghost/70 text-lg md:text-xl max-w-md mt-6">
                        GradeOS reads your academic data and tells you exactly where you stand — and where you're headed.
                    </p>
                    <button onClick={() => setShowAuth(true)} className="hero-anim mt-10 bg-plasma text-white px-8 py-4 rounded-full text-lg font-bold transition-transform duration-300 hover:scale-[1.03] overflow-hidden group">
                        <span className="relative z-10">Launch Your Dashboard</span>
                    </button>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-32 px-6 md:px-20 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Card 1: Shuffler */}
                    <div className="bg-graphite rounded-4xl p-8 border border-plasma/10 h-80 flex flex-col justify-between shadow-xl relative overflow-hidden">
                        <div>
                            <h3 className="text-xl font-bold">Predict performance</h3>
                            <p className="text-sm text-ghost/60 mt-2">Real-time SGPA outcomes.</p>
                        </div>
                        <div className="relative h-32 flex items-end justify-center perspective-1000">
                            {['SGPA Forecast: 8.7', 'Exam Risk: Low', 'Trend: Rising ↑'].map((lbl, i) => (
                                <div key={i} className={`shuffler-card absolute w-full max-w-[200px] bg-void border border-plasma/30 rounded-2xl p-4 text-center text-sm font-mono shadow-xl`} style={{ zIndex: 3 - i }}>
                                    {lbl}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 2: Typewriter */}
                    <div className="bg-graphite rounded-4xl p-8 border border-plasma/10 h-80 flex flex-col justify-between shadow-xl">
                        <div>
                            <h3 className="text-xl font-bold">Identify weak subjects</h3>
                            <p className="text-sm text-ghost/60 mt-2">Micro-analytics on credit loss.</p>
                        </div>
                        <div className="bg-void rounded-2xl p-4 border border-plasma/20 relative">
                            <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] font-mono font-bold text-plasma">
                                <span className="w-2 h-2 rounded-full bg-plasma animate-pulse" /> LIVE FEED
                            </div>
                            <div className="font-mono text-sm text-ghost mt-6 min-h-[40px]">
                                <span id="typewriter-text"></span><span className="text-plasma animate-pulse">_</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Scheduler */}
                    <div className="bg-graphite rounded-4xl p-8 border border-plasma/10 h-80 flex flex-col justify-between shadow-xl overflow-hidden relative">
                        <div>
                            <h3 className="text-xl font-bold">AI study plan</h3>
                            <p className="text-sm text-ghost/60 mt-2">Your AI study plan. Set it. Hit it.</p>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mt-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[10px] font-mono text-ghost/50">{d}</div>)}
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i} className={`aspect-square rounded border border-white/5 ${i === 4 ? 'bg-plasma shadow-[0_0_10px_#7B61FF] border-plasma' : 'bg-white/5'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section id="philosophy" className="py-40 px-6 bg-graphite relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-fixed" />
                <div className="relative z-10 max-w-4xl mx-auto">
                    <p className="text-ghost/50 text-xl font-medium mb-4">Most grade apps record the past.</p>
                    <h2 className="text-5xl md:text-7xl font-serif">
                        {`GradeOS engineers the `.split(' ').map((w, i) => <span key={i} className="philosophy-word inline-block mr-3">{w}</span>)}
                        <span className="philosophy-word inline-block text-plasma">future.</span>
                    </h2>
                </div>
            </section>

            {/* Protocol Sticky Sequence */}
            <section className="bg-void relative h-[300vh]">
                <div className="sticky top-0 h-screen overflow-hidden">

                    <div className="protocol-card absolute inset-0 bg-void flex items-center justify-center p-6">
                        <div className="max-w-2xl text-center">
                            <div className="text-plasma font-mono text-sm tracking-widest mb-6 border border-plasma/30 rounded-full inline-block px-4 py-1">01 / INPUT</div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Add courses, credits, grades. Done in 60 seconds.</h2>
                            {/* Fake SVG representation */}
                            <div className="w-32 h-32 mx-auto rounded-full border border-plasma/40 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                                <div className="w-20 h-20 rounded-full border border-plasma flex items-center justify-center animate-[spin_5s_reverse_linear_infinite]">
                                    <div className="w-8 h-8 bg-plasma rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="protocol-card absolute inset-0 bg-void flex items-center justify-center p-6">
                        <div className="max-w-2xl text-center">
                            <div className="text-plasma font-mono text-sm tracking-widest mb-6 border border-plasma/30 rounded-full inline-block px-4 py-1">02 / ANALYZE</div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">GradeOS pinpoints exactly which subjects are bleeding your CGPA.</h2>
                            <div className="w-full max-w-xs mx-auto h-8 border border-plasma/40 bg-graphite relative rounded overflow-hidden">
                                <div className="absolute top-0 bottom-0 w-8 bg-plasma/80 blur-sm shadow-[0_0_15px_#7B61FF]" style={{ animation: 'scan 2s infinite ease-in-out alternate' }} />
                                <style>{`@keyframes scan { from { left: 0%; } to { left: calc(100% - 2rem); } }`}</style>
                            </div>
                        </div>
                    </div>

                    <div className="protocol-card absolute inset-0 bg-void flex items-center justify-center p-6">
                        <div className="max-w-2xl text-center">
                            <div className="text-plasma font-mono text-sm tracking-widest mb-6 border border-plasma/30 rounded-full inline-block px-4 py-1">03 / ELEVATE</div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Your AI advisor builds a plan from your real data. No fluff.</h2>
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 3, 2, 1].map((v, i) => (
                                    <div key={i} className="w-1 bg-plasma rounded-full animate-pulse" style={{ height: v * 12 + 'px', animationDelay: i * 0.1 + 's' }} />
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Get Started */}
            <section className="py-40 px-6 text-center max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold mb-10">Your academic intelligence layer is ready.</h2>
                <button onClick={() => setShowAuth(true)} className="bg-plasma text-white px-10 py-5 rounded-full text-xl font-bold transition-transform duration-300 hover:scale-[1.03] shadow-[0_0_30px_#7B61FF55]">
                    Launch GradeOS — It's Free
                </button>
                <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 font-mono text-sm text-ghost/60">
                    <span>● No credit card</span>
                    <span>● Free forever</span>
                    <span>● Supabase secured</span>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-graphite rounded-t-[4rem] px-10 py-20 mt-20 text-center md:text-left">
                <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto border-b border-plasma/10 pb-10">
                    <div>
                        <div className="font-bold text-2xl tracking-tight mb-2">GradeOS</div>
                        <div className="text-ghost/50 text-sm">Your academic intelligence layer.</div>
                    </div>
                    <div className="flex flex-col gap-3 text-sm text-ghost/70">
                        <span className="font-bold text-ghost">App</span>
                        <a href="#" className="hover:text-plasma">Features</a>
                        <a href="#" className="hover:text-plasma">Login</a>
                    </div>
                    <div className="flex flex-col gap-3 text-sm text-ghost/70">
                        <span className="font-bold text-ghost">Legal</span>
                        <a href="#" className="hover:text-plasma">Privacy Policy</a>
                        <a href="#" className="hover:text-plasma">Terms of Service</a>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto pt-6 flex items-center justify-center md:justify-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22C55E] animate-pulse" />
                    <span className="font-mono text-xs font-bold text-ghost/80 tracking-widest">GRADEOS SYSTEM OPERATIONAL</span>
                </div>
            </footer>
        </div>
    );
}
