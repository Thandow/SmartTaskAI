import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import moment from "moment";

const priorityColors = {
  low: "bg-blue-500", medium: "bg-amber-500", high: "bg-orange-500", critical: "bg-red-500",
};

export default function Calendar() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [aiSchedule, setAiSchedule] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 200),
  });

  const startOfMonth = currentDate.clone().startOf("month");
  const endOfMonth = currentDate.clone().endOf("month");
  const startDay = startOfMonth.clone().startOf("week");
  const endDay = endOfMonth.clone().endOf("week");

  const days = useMemo(() => {
    const d = [];
    const day = startDay.clone();
    while (day.isSameOrBefore(endDay, "day")) {
      d.push(day.clone());
      day.add(1, "day");
    }
    return d;
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (t.due_date) {
        const key = moment(t.due_date).format("YYYY-MM-DD");
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    });
    return map;
  }, [tasks]);

  const selectedTasks = tasksByDate[selectedDate] || [];

  const generateSchedule = async () => {
    setLoadingAI(true);
    const pendingTasks = tasks.filter(t => t.status !== "done" && t.status !== "missed").slice(0, 15);
    const taskList = pendingTasks.map(t =>
      `"${t.title}" - priority: ${t.priority}, due: ${t.due_date || "flexible"}, est: ${t.estimated_minutes || 30}min, category: ${t.category}`
    ).join("\n");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a smart scheduling AI. Create an optimal daily schedule for today (${moment().format("MMMM D, YYYY")}).

Tasks:
${taskList || "No pending tasks"}

Create a time-blocked schedule from 8am to 8pm. Include breaks. Prioritize urgent/important tasks for peak hours (9am-12pm). Suggest lighter tasks for afternoon.`,
      response_json_schema: {
        type: "object",
        properties: {
          schedule: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string" },
                task: { type: "string" },
                type: { type: "string", enum: ["task", "break", "suggestion"] },
                note: { type: "string" }
              }
            }
          },
          tip: { type: "string" }
        }
      }
    });
    setAiSchedule(res);
    setLoadingAI(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Smart Calendar</h1>
            <p className="text-xs text-white/40">AI-powered scheduling</p>
          </div>
        </div>
        <Button onClick={generateSchedule} disabled={loadingAI} className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/20 text-xs">
          {loadingAI ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
          Generate Daily Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-5">
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white" onClick={() => setCurrentDate(currentDate.clone().subtract(1, "month"))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-white">{currentDate.format("MMMM YYYY")}</h2>
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white" onClick={() => setCurrentDate(currentDate.clone().add(1, "month"))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-[10px] text-white/30 font-medium py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = day.format("YYYY-MM-DD");
              const isToday = day.isSame(moment(), "day");
              const isSelected = key === selectedDate;
              const isCurrentMonth = day.isSame(currentDate, "month");
              const dayTasks = tasksByDate[key] || [];

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={cn(
                    "relative p-2 rounded-xl text-sm transition-all min-h-[60px] text-left",
                    !isCurrentMonth && "opacity-30",
                    isSelected ? "bg-violet-500/20 border border-violet-500/30" : "hover:bg-white/5 border border-transparent",
                    isToday && !isSelected && "border-cyan-500/30"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium",
                    isToday ? "text-cyan-400" : "text-white/60"
                  )}>
                    {day.format("D")}
                  </span>
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap">
                      {dayTasks.slice(0, 3).map((t, i) => (
                        <div key={i} className={cn("h-1.5 w-1.5 rounded-full", priorityColors[t.priority] || "bg-white/30")} />
                      ))}
                      {dayTasks.length > 3 && <span className="text-[8px] text-white/30">+{dayTasks.length - 3}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              {moment(selectedDate).format("MMMM D, YYYY")}
            </h3>
            {selectedTasks.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-4">No tasks scheduled</p>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", priorityColors[t.priority])} />
                      <span className={cn("text-sm font-medium", t.status === "done" ? "line-through text-white/40" : "text-white")}>{t.title}</span>
                    </div>
                    {t.estimated_minutes && (
                      <span className="text-[10px] text-white/30 ml-4">~{t.estimated_minutes}min</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Schedule */}
          {aiSchedule && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/5 border border-white/5 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">AI Daily Plan</h3>
              </div>
              <div className="space-y-2">
                {aiSchedule.schedule?.map((s, i) => (
                  <div key={i} className={cn(
                    "flex gap-3 p-2 rounded-lg",
                    s.type === "break" ? "bg-green-500/5" : s.type === "suggestion" ? "bg-cyan-500/5" : "bg-white/[0.02]"
                  )}>
                    <span className="text-[11px] text-white/30 font-mono w-14 flex-shrink-0">{s.time}</span>
                    <div>
                      <p className="text-xs text-white/70">{s.task}</p>
                      {s.note && <p className="text-[10px] text-white/30 mt-0.5">{s.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {aiSchedule.tip && (
                <p className="text-[11px] text-cyan-400/60 italic mt-3">💡 {aiSchedule.tip}</p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
