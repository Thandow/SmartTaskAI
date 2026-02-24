import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import NotificationBell from "./components/notifications/NotificationBell";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  BarChart3,
  Settings,
  Sparkles,
  Menu,
  X,
  Zap,
  Trophy,
  Layers,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Tasks", icon: ListTodo, page: "Tasks" },
  { name: "Projects", icon: Layers, page: "Projects" },
  { name: "Calendar", icon: CalendarDays, page: "Calendar" },
  { name: "Insights", icon: BarChart3, page: "Insights" },
  { name: "Achievements", icon: Trophy, page: "Achievements" },
  { name: "Notifications", icon: Bell, page: "Notifications" },
  { name: "Settings", icon: Settings, page: "Settings" },
];

function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=logo in, 1=text in, 2=fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => onDone(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a1a]"
      style={{ transition: "opacity 0.5s ease", opacity: phase === 2 ? 0 : 1 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px] translate-x-16" />
      </div>

      {/* Logo */}
      <div
        className="relative flex items-center justify-center mb-6"
        style={{
          transform: phase >= 0 ? "scale(1) translateY(0)" : "scale(0.5) translateY(20px)",
          opacity: phase >= 0 ? 1 : 0,
          transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
        }}
      >
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/40">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        {/* Orbiting dot */}
        <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-spin" style={{ animationDuration: "3s" }}>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
        </div>
      </div>

      {/* Text */}
      <div
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">SmartTask</h1>
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase mt-1">AI Assistant</p>
        <div className="mt-4 flex items-center gap-1.5 justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-violet-400"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem("splashShown"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSplashDone = () => {
    sessionStorage.setItem("splashShown", "1");
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <style>{`
        :root {
          --accent: #7c3aed;
          --accent-light: #a78bfa;
          --accent-cyan: #06b6d4;
          --surface: rgba(255,255,255,0.04);
          --surface-hover: rgba(255,255,255,0.08);
          --border: rgba(255,255,255,0.08);
        }
        * { scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.3) transparent; }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 3px; }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm">SmartTask AI</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-white/5">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-[#0d0d24] border-b border-white/5 p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  currentPageName === item.page
                    ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] flex-col bg-[#0d0d24]/80 backdrop-blur-xl border-r border-white/5 z-40">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">SmartTask</h1>
              <span className="text-[10px] font-semibold tracking-widest text-cyan-400 uppercase">AI Assistant</span>
            </div>
          </div>
          <NotificationBell user={user} />
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-1">
          {navItems.map((item) => {
            const active = currentPageName === item.page;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-white shadow-inner"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "text-violet-400")} />
                {item.name}
                {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-semibold text-white/80">AI Powered</span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed">Your intelligent productivity coach, always learning and adapting.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[260px] pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
