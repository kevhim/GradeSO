import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM_PROMPT = `You are GradeOS Advisor — a precise, data-driven academic performance AI.
You receive a student's complete grade transcript and answer their questions.

Rules:
- Always ground answers in the actual data provided. Never give generic advice.
- Identify specific subjects with lowest GP and explain their mathematical impact on SGPA.
- When predicting, base it on the student's trend across semesters.
- Give specific, actionable study advice tied to actual subject names in the data.
- Celebrate genuine improvements with specific numbers.
- Never give vague motivational fluff.
- Format responses with clear markdown (bold headers, bullet points).
- Keep responses under 300 words unless the student asks to elaborate.
- If only one semester exists, say so and work with what's available.`;

serve(async (req) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const authHeader = req.headers.get("Authorization");
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader?.replace("Bearer ", "") ?? ""
        );
        if (authError || !user) return new Response("Unauthorized", { status: 401 });

        const { message, history, transcriptContext } = await req.json();

        const contents = [
            { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nStudent Transcript:\n${transcriptContext}` }] },
            { role: "model", parts: [{ text: "Understood. I have your complete transcript. What would you like to know?" }] },
            ...history.map((m: any) => ({ role: m.role, parts: [{ text: m.content }] })),
            { role: "user", parts: [{ text: message }] },
        ];

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 600, temperature: 0.7 } }),
            }
        );

        const geminiData = await response.json();
        const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't generate a response. Please try again.";

        await supabase.from("ai_conversations").insert([
            { student_id: user.id, role: "user", content: message },
            { student_id: user.id, role: "model", content: reply },
        ]);

        const { data: allMsgs } = await supabase
            .from("ai_conversations")
            .select("id")
            .eq("student_id", user.id)
            .order("created_at", { ascending: true });

        if (allMsgs && allMsgs.length > 20) {
            const toDelete = allMsgs.slice(0, allMsgs.length - 20).map((m: any) => m.id);
            await supabase.from("ai_conversations").delete().in("id", toDelete);
        }

        return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
