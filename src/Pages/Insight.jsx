import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { BarChart3, Sparkles, Loader2, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import moment from "moment";

const COLORS = ["#7c3aed", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#ec4899", "#8b5cf6"];

export default function Insights() {
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 500),
  });

  // Tasks completed per day (last 7 days)
  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, "days");
      const dayStr = date.format("YYYY-MM-DD");
      const completed = tasks.filter(t => t.completed_date?.startsWith(dayStr)).length;
      const created = tasks.filter(t => t.created_date?.startsWith(dayStr)).length;
      days.push({ day: date.format("ddd"), completed, created });
    }
    return days;
  }, [tasks]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      const cat = t.category || "other";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [tasks]);

  // Priority breakdown
  const priorityData = useMemo(() => {
    const map = { low: 0, medium: 0, high: 0, critical: 0 };
    tasks.forEach(t => { if (t.priority) map[t.priority]++; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // Completion rate over time
  const completionTrend = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = moment().subtract(i, "days");
      const dayStr = date.format("YYYY-MM-DD");
      const total = tasks.filter(t => t.created_date?.startsWith(dayStr)).length;
      const done = tasks.filter(t => t.completed_date?.startsWith(dayStr)).length;
      days.push({ day: date.format("M/D"), rate: total > 0 ? Math.round((done / total) * 100) : 0 });
    }
    return days;
  }, [tasks]);

  const totalCompleted = tasks.filter(t => t.status === "done").length;
  const totalMissed = tasks.filter(t => t.status === "missed" || (t.due_date && new Date(t.due_date) < new Date() && t.status !== "done")).length;
  const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  const getAIInsights = async () => {
    setLoadingAI(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this productivity data and provide insights:
- Total tasks: ${tasks.length}
- Completed: ${totalCompleted}
- Missed/Overdue: ${totalMissed}
- Completion rate: ${completionRate}%
- Categories: ${categoryData.map(c => `${c.name}: ${c.value}`).join(", ")}
- Weekly completed: ${weeklyData.map(d => `${d.day}: ${d.completed}`).join(", ")}

Provide 4 specific, actionable productivity insights. Be encouraging but honest.`,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                type: { type: "string", enum: ["positive", "improvement", "tip", "warning"] }
              }
            }
          },
          productivity_score: { type: "number" },
          summary: { type: "string" }
        }
      }
    });
    setAiInsights(res);
    setLoadingAI(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1a1a3a] border border-white/10 rounded-lg p-3 text-xs">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white">{p.name}: <span className="font-bold">{p.value}</span></p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Insights</h1>
            <p className="text-xs text-white/40">AI-powered productivity analytics</p>
          </div>
        </div>
        <Button onClick={getAIInsights} disabled={loadingAI} className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/20 text-xs">
          {loadingAI ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
          AI Analysis
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks", value: tasks.length, color: "text-violet-400" },
          { label: "Completed", value: totalCompleted, color: "text-emerald-400" },
          { label: "Overdue", value: totalMissed, color: "text-red-400" },
          { label: "Completion Rate", value: `${completionRate}%`, color: "text-cyan-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
            <p className="text-xs text-white/40">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Activity */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Weekly Activity</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Completed" />
              <Bar dataKey="created" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Created" opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Category Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {categoryData.map((c, i) => (
              <span key={c.name} className="text-[10px] text-white/40 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Completion Trend */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Completion Trend (14 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={completionTrend}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" stroke="#7c3aed" fill="url(#grad)" name="Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/5 border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">AI Insights</h3>
          </div>
          {!aiInsights ? (
            <div className="text-center py-8">
              <p className="text-xs text-white/30">Click "AI Analysis" to get personalized insights</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiInsights.productivity_score && (
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-violet-400">{aiInsights.productivity_score}/100</p>
                  <p className="text-xs text-white/30">Productivity Score</p>
                </div>
              )}
              {aiInsights.insights?.map((ins, i) => {
                const typeColors = {
                  positive: "border-emerald-500/20 bg-emerald-500/5",
                  improvement: "border-amber-500/20 bg-amber-500/5",
                  tip: "border-cyan-500/20 bg-cyan-500/5",
                  warning: "border-red-500/20 bg-red-500/5",
                };
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-xl border ${typeColors[ins.type] || ""}`}>
                    <p className="text-xs font-medium text-white">{ins.title}</p>
                    <p className="text-[11px] text-white/40 mt-1">{ins.description}</p>
                  </motion.div>
                );
              })}
              {aiInsights.summary && (
                <p className="text-xs text-white/30 italic mt-2">{aiInsights.summary}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
