import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Loader2, Brain, Coffee, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function AISuggestions({ tasks, mood }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    setLoading(true);
    const pendingTasks = tasks.filter(t => t.status !== "done").slice(0, 10);
    const taskSummary = pendingTasks.map(t => 
      `"${t.title}" - priority: ${t.priority}, due: ${t.due_date || "no date"}, category: ${t.category}`
    ).join("\n");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a productivity AI coach. The user's current mood is: ${mood || "normal"}.
Here are their pending tasks:
${taskSummary || "No pending tasks."}

Provide 3 short, actionable suggestions. Each should be 1-2 sentences. Be motivating and specific.
Consider their mood - if tired, suggest lighter tasks first. If energized, tackle the hardest ones.`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                icon: { type: "string", enum: ["brain", "coffee", "zap"] },
                title: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          motivational_quote: { type: "string" }
        }
      }
    });
    setSuggestions(res);
    setLoading(false);
  };

  const iconMap = { brain: Brain, coffee: Coffee, zap: Zap };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/5 border border-white/5 p-5 md:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <h3 className="font-semibold text-white">AI Suggestions</h3>
        </div>
        <Button
          onClick={getSuggestions}
          disabled={loading}
          size="sm"
          className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/20 text-xs"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
          {loading ? "Thinking..." : "Get Suggestions"}
        </Button>
      </div>

      {!suggestions && !loading && (
        <div className="text-center py-6">
          <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
            <Brain className="h-6 w-6 text-violet-400" />
          </div>
          <p className="text-sm text-white/40">Click to get personalized AI suggestions</p>
        </div>
      )}

      {suggestions && (
        <div className="space-y-3">
          {suggestions.suggestions?.map((s, i) => {
            const Icon = iconMap[s.icon] || Zap;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{s.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{s.description}</p>
                </div>
              </motion.div>
            );
          })}
          {suggestions.motivational_quote && (
            <p className="text-xs text-cyan-400/60 italic mt-3 text-center">
              "{suggestions.motivational_quote}"
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
