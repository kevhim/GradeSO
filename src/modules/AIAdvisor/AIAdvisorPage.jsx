import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Send, Cpu, Sparkles } from 'lucide-react';
import useGradeStore from '../../store/useGradeStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple Markdown Renderer
const renderMarkdown = (text) => {
    if (!text) return null;
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/s, '<ul class="list-disc pl-4 space-y-1 my-2">$1</ul>');
    html = html.replace(/\n\n/g, '<br/><br/>');
    html = html.replace(/\n(?!(<li|<\/ul>))/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} className="text-sm leading-relaxed" />;
};

export default function AIAdvisorPage() {
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const { chatHistory, addChatMessage, semesters, coursesBySemester, getSGPA, getCGPA, profile } = useGradeStore();
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

    const handleSend = async (text) => {
        const msgText = text || inputMessage;
        if (!msgText.trim()) return;

        addChatMessage({ role: 'user', content: msgText });
        setInputMessage('');
        setIsTyping(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set.');

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const transcriptCtx = buildTranscriptContext();
            const systemPrompt = `You are GradeOS Advisor, an expert academic AI assistant. You have access to the student's full transcript data below. Use it to give personalized, actionable advice. Be concise, use markdown formatting (bold, lists). Always reference specific courses, grades, and GPAs from the transcript when relevant.\n\nTRANSCRIPT DATA:\n${transcriptCtx}`;

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
            addChatMessage({ role: 'model', content: result.response.text() });
        } catch (err) {
            console.error('AI Error:', err);
            addChatMessage({ role: 'model', content: `**Connection Error:** ${err.message || 'Failed to connect.'}` });
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
        <div className="w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#7B61FF]/20 flex items-center justify-center text-[#7B61FF] border border-[#7B61FF]/30 relative">
                    <Cpu size={24} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A14]"></div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-sora">GradeOS Advisor</h2>
                    <p className="text-[#F0EFF4]/50 text-sm font-fira flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Powered by Gemini Flash 1.5 · Reading your transcript
                    </p>
                </div>
            </div>

            {/* Chat Container */}
            <div className="bg-[#12121A] border border-[#7B61FF]/20 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(123,97,255,0.15)]">

                {/* Messages Area */}
                <div className="h-[500px] overflow-y-auto p-6 flex flex-col gap-4">

                    {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-20 h-20 rounded-full bg-[#7B61FF]/10 flex items-center justify-center text-[#7B61FF] mb-6 border border-[#7B61FF]/20">
                                <Sparkles size={36} />
                            </div>
                            <h4 className="font-sora font-bold text-xl mb-2 text-[#F0EFF4]">How can I assist you today?</h4>
                            <p className="text-[#F0EFF4]/40 text-sm mb-8 max-w-md">
                                I have access to your full transcript data across all semesters. Ask me anything about your academic performance.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                                {quickActions.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(action)}
                                        className="text-left px-5 py-3 bg-white/5 hover:bg-[#7B61FF]/10 border border-[#7B61FF]/10 rounded-2xl text-sm transition-all text-[#F0EFF4]/80 hover:text-[#7B61FF] hover:border-[#7B61FF]/30 hover:scale-[1.02]"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex max-w-[80%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                            <div className={`px-5 py-3 rounded-[1.5rem] ${msg.role === 'user'
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
                        <div className="self-start max-w-[80%] px-5 py-4 rounded-[1.5rem] bg-[#0A0A14] border border-[#7B61FF]/10 rounded-tl-sm">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#0A0A14]/60 border-t border-[#7B61FF]/10">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-center gap-3 bg-[#12121A] rounded-full px-5 py-3 border border-[#7B61FF]/20 focus-within:border-[#7B61FF]/50 transition-colors"
                    >
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask about your grades, get study advice..."
                            className="flex-1 bg-transparent text-sm text-[#F0EFF4] outline-none placeholder:text-[#F0EFF4]/30 py-1 font-sora"
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim() || isTyping}
                            className="text-[#7B61FF] disabled:text-[#F0EFF4]/20 hover:text-white transition-colors p-2 bg-[#7B61FF]/10 rounded-full hover:bg-[#7B61FF]/20"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
