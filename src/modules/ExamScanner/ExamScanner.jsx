import React, { useState, useRef, useEffect } from 'react';
import { Upload, ScanLine, FileCheck2, FileWarning, Sparkles, AlertCircle, Key } from 'lucide-react';
import { gsap } from 'gsap';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Convert a File object or Blob URL to a Base64 string required by Gemini
const fileToGenerativePart = async (fileUrl, mimeType) => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({
            inlineData: {
                data: reader.result.split(',')[1],
                mimeType
            }
        });
        reader.readAsDataURL(blob);
    });
};

export default function ExamScanner() {
    const [qPaper, setQPaper] = useState(null);
    const [aSheet, setASheet] = useState(null);
    const [apiKey, setApiKey] = useState(localStorage.getItem('gradeos_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
    const [showKeyInput, setShowKeyInput] = useState(!apiKey && !import.meta.env.VITE_GEMINI_API_KEY);

    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const scannerRef = useRef(null);
    const resultRef = useRef(null);
    const scanLineRef = useRef(null);

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'q') setQPaper(url);
            else setASheet(url);
        }
    };

    const handleKeySave = (e) => {
        e.preventDefault();
        if (apiKey.trim()) {
            localStorage.setItem('gradeos_gemini_key', apiKey.trim());
            setShowKeyInput(false);
        }
    };

    const runScan = async () => {
        if (!qPaper || !aSheet) return;
        if (!apiKey) {
            setShowKeyInput(true);
            setErrorMsg("Gemini API Key is required to run the scan.");
            return;
        }

        setIsScanning(true);
        setScanResult(null);
        setErrorMsg('');

        // Scan Line Animation
        if (scanLineRef.current) {
            gsap.fromTo(scanLineRef.current,
                { y: '-10%', opacity: 1 },
                { y: '110%', duration: 1.5, repeat: -1, yoyo: true, ease: 'linear' }
            );
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey.trim());
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const qPart = await fileToGenerativePart(qPaper, 'image/jpeg'); // Assuming JPEG for simplicity; browser handles blob conversion
            const aPart = await fileToGenerativePart(aSheet, 'image/jpeg');

            const prompt = `
You are an expert exam grader and diagnostic AI. 
I am providing you with two images:
1. The first image is the Question Paper.
2. The second image is the student's Answer Sheet.

Your task is to analyze BOTH documents and output a STRICT JSON containing topics/questions that the student MISSED or FAILED TO ANSWER completely. Do not include questions they answered correctly.

You MUST respond strictly with the following JSON format (no markdown code blocks, just raw JSON, or wrap it in a markdown block but ensure it's parseable):
{
  "score": <estimated_percentage_overall>,
  "analysis": "<a 2-3 sentence overall diagnostic of their weaknesses based on what they missed>",
  "unanswered": [
    {
      "q": "<question_number_or_label>",
      "topic": "<short_subject_topic_of_the_question>",
      "marks": <estimated_marks_lost_as_integer>,
      "severity": "<critical | high | low>"
    }
  ]
}
`;

            const result = await model.generateContent([prompt, qPart, aPart]);
            const responseText = result.response.text();

            // Clean up backticks if Gemini returns Markdown formatting
            let cleanJsonStr = responseText.replace(/```json\n/g, '').replace(/```\n?/g, '').trim();

            const parsedData = JSON.parse(cleanJsonStr);
            setScanResult(parsedData);

        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Failed to analyze. Please check your API key and try again.");
        } finally {
            setIsScanning(false);
            if (scanLineRef.current) gsap.killTweensOf(scanLineRef.current);
        }
    };

    useEffect(() => {
        if (scanResult && resultRef.current) {
            gsap.fromTo(resultRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
        }
    }, [scanResult]);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-sora flex items-center gap-3">
                        Vision Scanner <span className="bg-[#7B61FF]/20 text-[#7B61FF] text-xs px-2 py-1 rounded-full border border-[#7B61FF]/30 uppercase tracking-widest font-mono">Experimental</span>
                    </h2>
                    <p className="text-[#F0EFF4]/60 mt-2 max-w-xl">Upload your Question Paper and Answer Sheet. GradeOS Vision will cross-reference both to detect exactly which topics you missed or failed to answer.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative" ref={scannerRef}>
                {/* Visual Scanning Effect Overlay */}
                {isScanning && (
                    <div className="absolute inset-x-0 -inset-y-4 z-20 pointer-events-none overflow-hidden rounded-[2rem]">
                        <div ref={scanLineRef} className="w-full h-32 bg-gradient-to-b from-transparent via-plasma/40 to-plasma shadow-[0_0_30px_#7B61FF] opacity-0" />
                    </div>
                )}

                {/* Upload Question Paper */}
                <div className={`bg-[#12121A] rounded-[2rem] border transition-all duration-300 overflow-hidden flex flex-col
                    ${qPaper ? 'border-white/10' : 'border-dashed border-white/20 hover:border-[#7B61FF]/50'}
                    ${isScanning ? 'opacity-50' : ''}
                `}>
                    {qPaper ? (
                        <div className="relative h-64 md:h-80 w-full group">
                            <img src={qPaper} alt="Question Paper" className="w-full h-full object-cover opacity-60 mix-blend-screen" />
                            <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent" />
                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <FileCheck2 className="text-[#7B61FF]" size={20} />
                                <span className="font-mono text-sm font-bold">Paper Accepted</span>
                            </div>
                            <button onClick={() => setQPaper(null)} className="absolute top-4 right-4 bg-[#0A0A14]/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100">
                                <FileWarning size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex-1 flex flex-col items-center justify-center p-12 cursor-pointer group">
                            <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-[#7B61FF]/20 group-hover:text-[#7B61FF] transition-colors flex items-center justify-center mb-4">
                                <Upload size={24} />
                            </div>
                            <span className="font-bold font-sora text-lg mb-1">Question Paper</span>
                            <span className="text-[#F0EFF4]/50 text-sm font-mono text-center">JPG, PNG, WebP up to 10MB</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'q')} disabled={isScanning} />
                        </label>
                    )}
                </div>

                {/* Upload Answer Sheet */}
                <div className={`bg-[#12121A] rounded-[2rem] border transition-all duration-300 overflow-hidden flex flex-col
                    ${aSheet ? 'border-white/10' : 'border-dashed border-white/20 hover:border-[#7B61FF]/50'}
                    ${isScanning ? 'opacity-50' : ''}
                `}>
                    {aSheet ? (
                        <div className="relative h-64 md:h-80 w-full group">
                            <img src={aSheet} alt="Answer Sheet" className="w-full h-full object-cover opacity-60 mix-blend-screen" />
                            <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent" />
                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <FileCheck2 className="text-[#7B61FF]" size={20} />
                                <span className="font-mono text-sm font-bold">Sheet Accepted</span>
                            </div>
                            <button onClick={() => setASheet(null)} className="absolute top-4 right-4 bg-[#0A0A14]/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100">
                                <FileWarning size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex-1 flex flex-col items-center justify-center p-12 cursor-pointer group">
                            <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-[#7B61FF]/20 group-hover:text-[#7B61FF] transition-colors flex items-center justify-center mb-4">
                                <Upload size={24} />
                            </div>
                            <span className="font-bold font-sora text-lg mb-1">Answer Sheet</span>
                            <span className="text-[#F0EFF4]/50 text-sm font-mono text-center">JPG, PNG, WebP up to 10MB</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'a')} disabled={isScanning} />
                        </label>
                    )}
                </div>
            </div>

            {/* API Key Configuration */}
            {showKeyInput && (
                <div className="bg-[#7B61FF]/10 border border-[#7B61FF]/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1">
                        <h4 className="font-bold flex items-center gap-2 font-sora"><Key size={18} className="text-[#7B61FF]" /> Gemini API Key Required</h4>
                        <p className="text-sm text-[#F0EFF4]/60 mt-1">
                            To run the vision model, please provide a free Gemini API key. Get one from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-[#7B61FF] underline">Google AI Studio</a>.
                        </p>
                    </div>
                    <form onSubmit={handleKeySave} className="flex w-full md:w-auto gap-2">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="bg-[#0A0A14] border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#7B61FF] w-full md:w-64"
                        />
                        <button type="submit" className="bg-[#7B61FF] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#7B61FF]/80 transition-colors">
                            Save
                        </button>
                    </form>
                </div>
            )}

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center text-sm font-mono mt-4">
                    {errorMsg}
                </div>
            )}

            {/* Action Bar */}
            <div className="flex justify-center">
                <button
                    onClick={runScan}
                    disabled={!qPaper || !aSheet || isScanning}
                    className="group relative px-8 py-4 bg-[#7B61FF] text-white rounded-full font-bold font-sora text-lg flex items-center gap-3 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_#7B61FF]"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    {isScanning ? (
                        <>
                            <ScanLine className="animate-spin" size={24} />
                            Running Neural Scan...
                        </>
                    ) : (
                        <>
                            <Sparkles size={24} />
                            Analyze Submission
                        </>
                    )}
                </button>
            </div>

            {/* Results Section */}
            {scanResult && (
                <div ref={resultRef} className="mt-8 flex flex-col gap-6">
                    <h3 className="text-2xl font-bold font-sora border-b border-white/10 pb-4">Analysis Report</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Summary Card */}
                        <div className="bg-[#7B61FF]/10 border border-[#7B61FF]/30 rounded-[2rem] p-6 lg:row-span-2">
                            <h4 className="font-mono text-xs uppercase tracking-widest text-[#7B61FF] mb-4">Diagnostics</h4>
                            <p className="text-[#F0EFF4]/80 text-sm leading-relaxed mb-6">{scanResult.analysis}</p>

                            <div className="bg-[#0A0A14]/50 rounded-xl p-4 border border-white/5">
                                <span className="font-mono text-xs text-[#F0EFF4]/50 block mb-1">Estimated Impact</span>
                                <span className="font-bold font-sora text-3xl text-red-400">-{scanResult.unanswered.reduce((s, i) => s + i.marks, 0)} Marks</span>
                            </div>
                        </div>

                        {/* Unanswered Topics List */}
                        <div className="lg:col-span-2 bg-[#12121A] rounded-[2rem] border border-white/5 p-6 flex flex-col gap-4">
                            <h4 className="font-mono text-xs uppercase tracking-widest text-[#F0EFF4]/50 flex items-center gap-2">
                                <AlertCircle size={14} className="text-amber-500" />
                                Unanswered Questions / Topics Missed
                            </h4>

                            <div className="flex flex-col gap-3">
                                {scanResult.unanswered.map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-lg">{item.q}</span>
                                            <span className="text-sm text-[#F0EFF4]/60 font-mono">{item.topic}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                            <span className={`text-xs px-2 py-1 rounded border font-mono uppercase tracking-wider
                                                ${item.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                                                    item.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                                                        'bg-white/5 text-[#F0EFF4] border-white/20'}`
                                            }>
                                                {item.severity}
                                            </span>
                                            <span className="font-bold text-[#7B61FF] w-16 text-right">-{item.marks} M</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
