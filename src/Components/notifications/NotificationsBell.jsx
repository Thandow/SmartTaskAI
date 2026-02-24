import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, UserCheck, MessageSquare, Clock, Layers, X } from "lucide-react";
import moment from "moment";

const typeConfig = {
  task_assigned: { icon: UserCheck, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  task_comment: { icon: MessageSquare, color: "text-violet-400", bg: "bg-violet-500/10" },
  deadline_soon: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  project_update: { icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Notification.filter({ recipient_email: user.email }, "-created_date", 30)
      .then(setNotifications)
      .catch(() => {});

    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.recipient_email !== user.email) return;
      if (event.type === "create") setNotifications(prev => [event.data, ...prev]);
      if (event.type === "update") setNotifications(prev => prev.map(n => n.id === event.id ? event.data : n));
      if (event.type === "delete") setNotifications(prev => prev.filter(n => n.id !== event.id));
    });
    return unsub;
  }, [user?.email]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter(n => !n.is_read);

  const markAllRead = async () => {
    const unreadList = notifications.filter(n => !n.is_read);
    await Promise.all(unreadList.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (n) => {
    if (n.is_read) return;
    await base44.entities.Notification.update(n.id, { is_read: true });
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
  };

  const dismiss = async (e, n) => {
    e.stopPropagation();
    await base44.entities.Notification.delete(n.id);
    setNotifications(prev => prev.filter(x => x.id !== n.id));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-violet-500 flex items-center justify-center text-[9px] font-bold text-white">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-[#12122a] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unread.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300">{unread.length} new</span>
                )}
              </div>
              {unread.length > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-white/30 hover:text-violet-400 flex items-center gap-1 transition-colors">
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-white/20 text-sm">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => {
                  const cfg = typeConfig[n.type] || typeConfig.task_assigned;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] cursor-pointer hover:bg-white/[0.03] transition-colors group ${!n.is_read ? "bg-white/[0.02]" : ""}`}
                    >
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-tight ${n.is_read ? "text-white/50" : "text-white"}`}>
                            {n.title}
                          </p>
                          {!n.is_read && <div className="h-1.5 w-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-white/20 mt-1">{moment(n.created_date).fromNow()}</p>
                      </div>
                      <button
                        onClick={(e) => dismiss(e, n)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/20 hover:text-white/60 transition-all flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
