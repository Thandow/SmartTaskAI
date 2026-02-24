import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Mic, MicOff, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function AIChatBot({ tasks = [] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your SmartTask AI assistant 🤖\n\nI can help you:\n- **Prioritize** your tasks\n- **Plan** your day\n- **Suggest** what to work on next\n- Answer productivity questions\n\nWhat would you like help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    const taskSummary = tasks.slice(0, 15).map(t =>
      `- "${t.title}" [${t.priority} priority, ${t.status}, ${t.category}${t.due_date ? `, due ${new Date(t.due_date).toLocaleDateString()}` : ""}]`
    ).join("\n");

    const history = newMessages.slice(-8).map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are SmartTask AI, a friendly and intelligent productivity assistant. Be concise, helpful, and motivating.

User's current tasks:
${taskSummary || "No tasks yet."}

Conversation history:
${history}

Respond helpfully to the user's latest message. Use markdown for formatting. Keep responses focused and under 200 words unless detail is needed.`,
    });

    setMessages(prev => [...prev, { role: "assistant", content: res }]);
    setLoading(false);
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      sendMessage(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-violet-500/30 flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6 text-white" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-cyan-400 border-2 border-[#0a0a1a] animate-pulse" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl bg-[#0f0f2a] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-gradient-to-r from-violet-500/10 to-indigo-500/5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">SmartTask AI</p>
                <p className="text-[10px] text-cyan-400">Always online · Powered by AI</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-7 w-7 text-white/40 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="h-6 w-6 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="h-3 w-3 text-violet-400" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                    msg.role === "user"
                      ? "bg-violet-600/30 text-white rounded-tr-sm"
                      : "bg-white/5 text-white/80 rounded-tl-sm"
                  )}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        className="prose prose-sm prose-invert max-w-none [&>p]:my-0.5 [&>ul]:my-1 [&>ul]:ml-3 [&>li]:my-0"
                        components={{ p: ({ children }) => <p className="text-xs leading-relaxed">{children}</p> }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center">
                  <div className="h-6 w-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-violet-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm px-3 py-2 flex gap-1">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                        className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
                  placeholder="Ask your AI assistant..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/20 text-xs h-9 rounded-xl"
                  disabled={loading}
                />
                <Button
                  onClick={toggleVoice}
                  variant="ghost" size="icon"
                  className={cn("h-9 w-9 rounded-xl border", listening ? "border-red-500/30 text-red-400 bg-red-500/10 animate-pulse" : "border-white/10 text-white/30 hover:text-white")}
                >
                  {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  size="icon"
                  className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
