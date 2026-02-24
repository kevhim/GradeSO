import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MessageCircle, X, Send, Cpu } from 'lucide-react';
import useGradeStore from '../../store/useGradeStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.');
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const transcriptCtx = buildTranscriptContext();
            const systemPrompt = `You are GradeOS Advisor, an expert academic AI assistant. You have access to the student's full transcript data below. Use it to give personalized, actionable advice. Be concise, use markdown formatting (bold, lists). Always reference specific courses, grades, and GPAs from the transcript when relevant.\n\nTRANSCRIPT DATA:\n${transcriptCtx}`;

            // Build Gemini chat history from our store
            const geminiHistory = chatHistory.slice(-10).map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: 'Understood. I have access to your full transcript. How can I help you today?' }] },
                    ...geminiHistory
                ]
            });

            const result = await chat.sendMessage(msgText);
            const replyText = result.response.text();

            addChatMessage({ role: 'model', content: replyText });

        } catch (err) {
            console.error('AI Error:', err);
            addChatMessage({ role: 'model', content: `**Connection Error:** ${err.message || 'Failed to connect to GradeOS Advisor network.'}` });
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
                    className="w-96 h-[520px] bg-[#12121A] border border-[#7B61FF]/20 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(123,97,255,0.3)] mb-4 flex flex-col overflow-hidden pointer-events-auto origin-bottom-right"
                >
                    {/* Header */}
                    <div className="bg-[#0A0A14] p-4 flex justify-between items-center border-b border-[#7B61FF]/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#7B61FF]/20 flex items-center justify-center text-[#7B61FF] border border-[#7B61FF]/50 relative">
                                <Cpu size={16} />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#0A0A14]"></div>
                            </div>
                            <div>
                                <h3 className="font-bold font-sora text-sm text-white">GradeOS Advisor</h3>
                                <span className="text-[10px] text-[#7B61FF] font-fira uppercase tracking-wider">Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-[#F0EFF4]/50 hover:text-white transition-colors p-1">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

                        {chatHistory.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="w-16 h-16 rounded-full bg-[#7B61FF]/10 flex items-center justify-center text-[#7B61FF] mb-4">
                                    <Cpu size={32} />
                                </div>
                                <h4 className="font-sora font-bold text-lg mb-2 text-[#F0EFF4]">How can I assist?</h4>
                                <p className="text-[#F0EFF4]/50 text-xs mb-6">I automatically read your real transcript data to provide precise insights.</p>

                                <div className="flex flex-col gap-2 w-full">
                                    {quickActions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(action)}
                                            className="text-left px-4 py-2 bg-white/5 hover:bg-[#7B61FF]/10 border border-[#7B61FF]/10 rounded-full text-xs transition-colors text-[#F0EFF4]/80 hover:text-[#7B61FF] hover:border-[#7B61FF]/30"
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
                                    ? 'bg-[#7B61FF] text-white rounded-br-sm'
                                    : 'bg-[#0A0A14] text-[#F0EFF4]/90 border border-[#7B61FF]/10 rounded-tl-sm'
                                    }`}>
                                    {msg.role === 'model' ? renderMarkdown(msg.content) : (
                                        <span className="text-sm">{msg.content}</span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="self-start max-w-[85%] px-4 py-4 rounded-[1.5rem] bg-[#0A0A14] border border-[#7B61FF]/10 rounded-tl-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-[#7B61FF] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-[#7B61FF] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-[#7B61FF] rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#0A0A14]/50 border-t border-[#7B61FF]/10">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2 bg-[#0A0A14] rounded-full px-4 py-2 border border-[#7B61FF]/20 focus-within:border-[#7B61FF]/50 transition-colors"
                        >
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask about your grades..."
                                className="flex-1 bg-transparent text-sm text-[#F0EFF4] outline-none placeholder:text-[#F0EFF4]/30 py-1 font-sora"
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isTyping}
                                className="text-[#7B61FF] disabled:text-[#F0EFF4]/20 hover:text-white transition-colors p-1"
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
                className={`w-14 h-14 rounded-full bg-[#7B61FF] text-white flex items-center justify-center shadow-[0_0_20px_#7B61FF] hover:scale-110 transition-transform duration-300 pointer-events-auto relative ${isOpen ? 'rotate-180 scale-90 shadow-none bg-[#12121A] border border-[#7B61FF]/20' : ''}`}
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
