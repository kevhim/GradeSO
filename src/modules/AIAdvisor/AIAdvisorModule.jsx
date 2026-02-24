import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MessageCircle, X, Send, Cpu } from 'lucide-react';
import useGradeStore from '../../store/useGradeStore';
import { supabase } from '../../lib/supabase';

// Simple Markdown Renderer
const renderMarkdown = (text) => {
    if (!text) return null;

    // Handle basic bold **text**
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle basic lists -item
    html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/s, '<ul class="list-disc pl-4 space-y-1 my-2">$1</ul>'); // Very basic wrap

    // Handle line breaks
    html = html.replace(/\n\n/g, '<br/><br/>');
    html = html.replace(/\n(?!(<li|<\/ul>))/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: html }} className="text-sm leading-relaxed" />;
};

export default function AIAdvisorModule() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const { chatHistory, setChatHistory, addChatMessage, semesters, coursesBySemester, getSGPA, getCGPA, profile } = useGradeStore();

    const panelRef = useRef(null);
    const messagesEndRef = useRef(null);

    const buildTranscriptContext = () => {
        let ctx = `Student: ${profile?.name || 'Student'} | CGPA: ${getCGPA()}\n\n`;
        semesters.forEach(sem => {
            const courses = coursesBySemester[sem.id] || [];
            ctx += `${sem.label} — SGPA: ${getSGPA(sem.id)}\n`;
            courses.forEach(c => {
                ctx += `  ${c.course_name} (ACU:${c.acu}, Grade:${c.grade}, GP:${c.gp}, CP:${c.cp})\n`;
            });
            ctx += '\n';
        });
        return ctx;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isTyping]);

    useEffect(() => {
        if (isOpen && panelRef.current) {
            gsap.fromTo(panelRef.current,
                { y: 50, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
            );
        }
    }, [isOpen]);

    const handleSend = async (text) => {
        const msgText = text || inputMessage;
        if (!msgText.trim()) return;

        const userMsg = { role: 'user', content: msgText };
        addChatMessage(userMsg);
        setInputMessage('');
        setIsTyping(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            // In Phase 2 stub mode, session might be null or URL might be placeholder
            // So we wrap the active fetch in try-catch and simulate a response if it fails
            let replyText = '';

            try {
                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-advisor`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token || 'stub'}`,
                    },
                    body: JSON.stringify({
                        message: msgText,
                        history: chatHistory.slice(-10),
                        transcriptContext: buildTranscriptContext(),
                    }),
                });

                if (!response.ok) throw new Error('API Error');
                const data = await response.json();
                replyText = data.reply;
            } catch (err) {
                console.warn('AI Advisor API call failed. Simulating response in stub mode.', err);
                // Simulate thinking time
                await new Promise(r => setTimeout(r, 1500));
                replyText = "**Phase 2 Stub Mode:** I can see your transcript. You have a CGPA of " + getCGPA() + ". \n\n*Note: The real Gemini connection requires Phase 1 Edge Function to be merged and deployed.*";
            }

            addChatMessage({ role: 'model', content: replyText });

        } catch (err) {
            console.error("AI Error:", err);
            addChatMessage({ role: 'model', content: "System offline. Failed to connect to GradeOS Advisor network." });
        } finally {
            setIsTyping(false);
        }
    };

    const quickActions = [
        "What's pulling my GPA down?",
        "Predict my next SGPA",
        "Give me a study plan",
        "Compare my semesters"
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Expanded Panel */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className="w-96 h-[520px] bg-graphite border border-white/10 rounded-[2rem] shadow-2xl mb-4 flex flex-col overflow-hidden pointer-events-auto origin-bottom-right"
                >
                    {/* Header */}
                    <div className="bg-void p-4 flex justify-between items-center border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-plasma/20 flex items-center justify-center text-plasma border border-plasma/50 relative">
                                <Cpu size={16} />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-void"></div>
                            </div>
                            <div>
                                <h3 className="font-bold font-sora text-sm text-white">GradeOS Advisor</h3>
                                <span className="text-[10px] text-plasma font-mono uppercase tracking-wider">Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-ghost/50 hover:text-white transition-colors p-1">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

                        {chatHistory.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="w-16 h-16 rounded-full bg-plasma/10 flex items-center justify-center text-plasma mb-4">
                                    <Cpu size={32} />
                                </div>
                                <h4 className="font-sora font-bold text-lg mb-2">How can I assist?</h4>
                                <p className="text-ghost/50 text-xs mb-6">I automatically read your real transcript data to provide precise insights.</p>

                                <div className="flex flex-col gap-2 w-full">
                                    {quickActions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(action)}
                                            className="text-left px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs transition-colors text-ghost/80"
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                                <div className={`px-4 py-3 rounded-[1.5rem] ${msg.role === 'user'
                                        ? 'bg-plasma text-white rounded-br-sm'
                                        : 'bg-[#1A1A24] text-ghost/90 border border-white/5 rounded-tl-sm'
                                    }`}>
                                    {msg.role === 'model' ? renderMarkdown(msg.content) : (
                                        <span className="text-sm">{msg.content}</span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="self-start max-w-[85%] px-4 py-4 rounded-[1.5rem] bg-[#1A1A24] border border-white/5 rounded-tl-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-plasma rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-plasma rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-plasma rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-void/50 border-t border-white/5">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2 bg-[#1A1A24] rounded-full px-4 py-2 border border-white/10 focus-within:border-plasma/50 transition-colors"
                        >
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask about your grades..."
                                className="flex-1 bg-transparent text-sm text-ghost outline-none placeholder:text-ghost/30 py-1"
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isTyping}
                                className="text-plasma disabled:text-ghost/20 hover:text-white transition-colors p-1"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                id="ai-advisor-trigger"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full bg-plasma text-white flex items-center justify-center shadow-[0_0_20px_#7B61FF] hover:scale-110 transition-transform duration-300 pointer-events-auto relative ${isOpen ? 'rotate-180 scale-90 shadow-none bg-graphite border border-white/20' : ''}`}
            >
                {isOpen ? <X size={24} /> : (
                    <>
                        <MessageCircle size={24} />
                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" style={{ animationDuration: '3s' }} />
                    </>
                )}
            </button>

        </div>
    );
}
