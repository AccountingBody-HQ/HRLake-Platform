"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message { role: "user" | "assistant"; content: string; }
interface Country { iso2: string; name: string; }
interface Props {
  countries: Country[];
  userId: string | null;
  isPro: boolean;
  monthlyUsage: number;
  freeAnonLimit: number;
  freeUserLimit: number;
}

const ANON_KEY = "gpe_ai_anon_count";
function getAnonCount(): number { try { return parseInt(localStorage.getItem(ANON_KEY) || "0", 10); } catch { return 0; } }
function incrementAnonCount(): number { try { const n = getAnonCount() + 1; localStorage.setItem(ANON_KEY, String(n)); return n; } catch { return 99; } }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mt-3">
      {copied
        ? <><svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg><span className="text-green-500">Copied</span></>
        : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg><span>Copy</span></>}
    </button>
  );
}

function SignUpPrompt() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center my-2">
      <h3 className="text-slate-900 font-bold text-lg mb-1">Enjoying PayrollExpert AI?</h3>
      <p className="text-slate-500 text-sm mb-4">Create a free account for 10 questions per month.</p>
      <div className="flex gap-2 justify-center">
        <a href="/sign-up/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Create free account</a>
        <a href="/sign-in/" className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Sign in</a>
      </div>
    </div>
  );
}

function UpgradePrompt() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm my-2">
      <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600"/>
      <div className="p-6">
        <h3 className="text-slate-900 font-bold text-lg mb-1">Upgrade to Pro</h3>
        <p className="text-slate-500 text-sm mb-4">You have used your 10 free questions this month.</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {["Unlimited AI questions","Save calculations","PDF exports","Termination rules","Contractor rules","Tax treaty data","Remote work rules","Rate alerts"].map(f => (
            <div key={f} className="flex items-center gap-1.5 text-slate-600 text-xs">
              <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>{f}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <a href="/pricing/" className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-xl text-sm">Upgrade - 29/mo</a>
          <a href="/pricing/" className="text-center bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-4 py-3 rounded-xl text-sm">249/yr</a>
        </div>
      </div>
    </div>
  );
}

function AIIcon() {
  return (
    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
      </svg>
    </div>
  );
}

const SUGGESTIONS = [
  "What are the UK income tax brackets for 2025/26?",
  "Compare employer costs in Germany vs Netherlands",
  "How does social security work in Singapore?",
  "What notice period is required in France?",
];

export default function AiChatClient({ countries, userId, isPro, monthlyUsage, freeAnonLimit, freeUserLimit }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [anonCount, setAnonCount] = useState(0);
  const [showLimit, setShowLimit] = useState<"anon"|"free"|null>(null);
  const [usageCount, setUsageCount] = useState(monthlyUsage);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0 || thinking;

  useEffect(() => { setAnonCount(getAnonCount()); }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (near) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value;
    setCountryCode(code);
    setCountryName(countries.find(c => c.iso2 === code)?.name || "");
  }

  function checkLimit(): "anon"|"free"|null {
    if (isPro) return null;
    if (!userId && anonCount >= freeAnonLimit) return "anon";
    if (userId && !isPro && usageCount >= freeUserLimit) return "free";
    return null;
  }

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const limit = checkLimit();
    if (limit) { setShowLimit(limit); return; }
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    setThinking(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    if (!userId) { setAnonCount(incrementAnonCount()); } else { setUsageCount(p => p + 1); }
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(userId ? { "x-user-id": userId } : {}) },
        body: JSON.stringify({ message: msg, countryCode: countryCode || null, countryName: countryName || null, history: messages.slice(-10) }),
      });
      if (!res.ok) throw new Error();
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let txt = "";
      let first = true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        txt += decoder.decode(value, { stream: true });
        if (first) { setThinking(false); setMessages(p => [...p, { role: "assistant", content: txt }]); first = false; }
        else { setMessages(p => { const u = [...p]; u[u.length-1] = { role: "assistant", content: txt }; return u; }); }
      }
      if (!userId && getAnonCount() >= freeAnonLimit) setShowLimit("anon");
      if (userId && !isPro && usageCount + 1 >= freeUserLimit) setShowLimit("free");
    } catch {
      setThinking(false);
      setMessages(p => [...p, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally { setLoading(false); setThinking(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="border-b border-slate-200 bg-white shrink-0 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
              </svg>
            </div>
            <div>
              <div className="text-slate-900 font-bold text-sm">PayrollExpert AI</div>
              <div className="text-slate-400 text-xs">Global payroll · EOR · HR compliance</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={countryCode} onChange={handleCountryChange}
              className="bg-white border border-slate-200 text-slate-600 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 max-w-[150px]">
              <option value="">All countries</option>
              {countries.map(c => <option key={c.iso2} value={c.iso2}>{c.name}</option>)}
            </select>
            {!userId && <a href="/sign-in/" className="text-blue-600 text-xs font-semibold hover:text-blue-700">Sign in</a>}
          </div>
        </div>
      </div>

      {/* Welcome screen */}
      {!hasMessages && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                </svg>
              </div>
              <h1 className="text-slate-900 font-bold text-2xl mb-1">PayrollExpert AI</h1>
              <p className="text-slate-500 text-sm">Specialist AI for global payroll, EOR, HR compliance, and employment law</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-left bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl px-4 py-3.5 text-slate-700 text-sm transition-all shadow-sm">
                  <span className="text-blue-600 font-bold mr-1">+</span>{s}
                </button>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about global payroll, EOR, employment law..."
                  rows={1}
                  className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-sm resize-none focus:outline-none"
                  style={{ minHeight: "28px", maxHeight: "120px" }}
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white rounded-xl px-4 py-2.5 transition-colors shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-2.5 text-center">Covers payroll, EOR, HR compliance, and employment law only. Always confirm with a qualified professional.</p>
          </div>
        </div>
      )}

      {/* Chat view */}
      {hasMessages && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    <div className="max-w-[78%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 text-sm leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex-1 group">
                      <div className="flex items-center gap-2 mb-2">
                        <AIIcon />
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">PayrollExpert AI</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-6 py-5 shadow-sm">
                        <div className="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-headings:font-bold prose-strong:text-slate-900 prose-li:text-slate-700 prose-a:text-blue-600 prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        <CopyButton text={msg.content} />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {thinking && (
                <div className="flex justify-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AIIcon />
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">PayrollExpert AI</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm inline-flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}}/>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}}/>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}}/>
                      <span className="text-slate-400 text-xs ml-1">Searching verified data...</span>
                    </div>
                  </div>
                </div>
              )}

              {showLimit === "anon" && <SignUpPrompt />}
              {showLimit === "free" && <UpgradePrompt />}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white shrink-0 shadow-lg">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-3">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={showLimit ? "Create an account or upgrade to continue..." : "Ask about global payroll, EOR, employment law..."}
                    disabled={!!showLimit || loading}
                    rows={1}
                    className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-sm resize-none focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ minHeight: "28px", maxHeight: "120px" }}
                  />
                  <button onClick={() => sendMessage()} disabled={!input.trim() || loading || !!showLimit}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 transition-colors shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-2 text-center">Covers payroll, EOR, HR compliance, and employment law only. Always confirm with a qualified professional.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
