import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Loader2, Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";

export default function SmartTaskInput({ onTaskCreated }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [listening, setListening] = useState(false);

  const parseWithAI = async (inputText) => {
    if (!inputText.trim()) return;
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Parse this task description into structured data. Today's date is ${today}.
Input: "${inputText}"
Extract the task name, deadline (as ISO date-time string if mentioned), priority (low/medium/high/critical), category (work/personal/study/health/meeting/errand/other), and estimated minutes to complete. If no deadline, leave empty. If no priority is mentioned, infer from context.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          due_date: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          category: { type: "string", enum: ["work", "personal", "study", "health", "meeting", "errand", "other"] },
          estimated_minutes: { type: "number" },
          ai_notes: { type: "string" }
        }
      }
    });
    setParsed(res);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (parsed) {
      const taskData = { ...parsed, status: "todo", points: parsed.priority === "critical" ? 25 : parsed.priority === "high" ? 20 : parsed.priority === "medium" ? 15 : 10 };
      if (!taskData.due_date) delete taskData.due_date;
      await base44.entities.Task.create(taskData);
      onTaskCreated?.();
      setText("");
      setParsed(null);
    }
  };

  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      setListening(false);
      parseWithAI(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  const priorityColors = {
    low: "bg-blue-500/20 text-blue-300",
    medium: "bg-amber-500/20 text-amber-300",
    high: "bg-orange-500/20 text-orange-300",
    critical: "bg-red-500/20 text-red-300",
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white/70">Smart Task Input</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 ml-auto">AI Powered</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && parseWithAI(text)}
            placeholder='Try: "Submit report tomorrow at 5pm" or "Buy groceries this weekend"'
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pr-10 h-11 rounded-xl focus-visible:ring-violet-500/40"
          />
        </div>
        <Button
          onClick={startVoice}
          variant="outline"
          size="icon"
          className={`border-white/10 h-11 w-11 rounded-xl ${listening ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse" : "text-white/40 hover:text-white"}`}
        >
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button
          onClick={() => parseWithAI(text)}
          disabled={!text.trim() || loading}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 h-11 rounded-xl px-5"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {parsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-xl bg-violet-500/5 border border-violet-500/10 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40">AI parsed your task:</span>
              <Button
                onClick={handleSubmit}
                size="sm"
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/20 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Task
              </Button>
            </div>
            <p className="text-white font-medium mb-2">{parsed.title}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className={priorityColors[parsed.priority]}>{parsed.priority}</Badge>
              <Badge className="bg-white/5 text-white/50">{parsed.category}</Badge>
              {parsed.due_date && (
                <Badge className="bg-cyan-500/20 text-cyan-300">
                  Due: {new Date(parsed.due_date).toLocaleDateString()}
                </Badge>
              )}
              {parsed.estimated_minutes && (
                <Badge className="bg-white/5 text-white/50">~{parsed.estimated_minutes}min</Badge>
              )}
            </div>
            {parsed.ai_notes && (
              <p className="text-xs text-white/30 mt-2 italic">{parsed.ai_notes}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
