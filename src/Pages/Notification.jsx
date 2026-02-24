import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Trash2, UserCheck, MessageSquare, Clock, Layers, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

const typeConfig = {
  task_assigned: { icon: UserCheck, color: "text-cyan-400", bg: "bg-cyan-500/10", label: "Assignment" },
  task_comment: { icon: MessageSquare, color: "text-violet-400", bg: "bg-violet-500/10", label: "Comment" },
  deadline_soon: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", label: "Deadline" },
  project_update: { icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Project" },
};

const filters = ["all", "task_assigned", "task_comment", "deadline_soon", "project_update"];

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    base44.entities.Notification.filter({ recipient_email: user.email }, "-created_date", 100)
      .then(data => { setNotifications(data); setLoading(false); })
      .catch(() => setLoading(false));

    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.recipient_email !== user.email) return;
      if (event.type === "create") setNotifications(prev => [event.data, ...prev]);
      if (event.type === "update") setNotifications(prev => prev.map(n => n.id === event.id ? event.data : n));
      if (event.type === "delete") setNotifications(prev => prev.filter(n => n.id !== event.id));
    });
    return unsub;
  }, [user?.email]);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (n) => {
    if (n.is_read) return;
    await base44.entities.Notification.update(n.id, { is_read: true });
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
  };

  const dismiss = async (n) => {
    await base44.entities.Notification.delete(n.id);
    setNotifications(prev => prev.filter(x => x.id !== n.id));
  };

  const clearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    await Promise.all(notifications.map(n => base44.entities.Notification.delete(n.id)));
    setNotifications([]);
  };

  const filtered = activeFilter === "all" ? notifications : notifications.filter(n => n.type === activeFilter);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Notifications</h1>
            <p className="text-xs text-white/40">{unreadCount} unread</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllRead} variant="ghost" size="sm"
              className="text-white/40 hover:text-white text-xs gap-1.5">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button onClick={clearAll} variant="ghost" size="sm"
              className="text-white/30 hover:text-red-400 text-xs gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === f
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {f === "all" ? "All" : typeConfig[f]?.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="h-10 w-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/20 text-sm">No notifications</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((n, i) => {
              const cfg = typeConfig[n.type] || typeConfig.task_assigned;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => markRead(n)}
                  className={`flex items-start gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 cursor-pointer hover:bg-white/[0.02] transition-colors group ${
                    !n.is_read ? "bg-white/[0.015]" : ""
                  }`}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${n.is_read ? "text-white/50" : "text-white"}`}>
                        {n.title}
                      </p>
                      {!n.is_read && <div className="h-2 w-2 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-white/30 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-white/20">{moment(n.created_date).fromNow()}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white/60 transition-all flex-shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
