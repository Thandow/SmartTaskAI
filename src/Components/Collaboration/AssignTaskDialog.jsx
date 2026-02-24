import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { UserCheck, Search, Loader2 } from "lucide-react";
import { notifyTaskAssigned } from "../notifications/notificationHelpers";

export default function AssignTaskDialog({ task, open, onOpenChange, onAssign, currentUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    base44.entities.User.list()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const assign = async (user) => {
    setSaving(true);
    await onAssign(task.id, { assigned_to: user.email, assigned_to_name: user.full_name || user.email });
    await notifyTaskAssigned({
      task,
      assignedToEmail: user.email,
      actorName: currentUser?.full_name || currentUser?.email || "Someone",
    });
    setSaving(false);
    onOpenChange(false);
  };

  const unassign = async () => {
    setSaving(true);
    await onAssign(task.id, { assigned_to: "", assigned_to_name: "" });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#12122a] border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-violet-400" />
            Assign Task
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-white/40 -mt-1 truncate">"{task?.title}"</p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 h-9 text-sm"
          />
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-white/20" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">No users found</p>
          ) : (
            filtered.map(u => {
              const isAssigned = task?.assigned_to === u.email;
              return (
                <button
                  key={u.id}
                  onClick={() => assign(u)}
                  disabled={saving}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isAssigned ? "bg-violet-500/20 border border-violet-500/30" : "hover:bg-white/5"
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(u.full_name || u.email)?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.full_name || u.email}</p>
                    <p className="text-[11px] text-white/30 truncate">{u.email}</p>
                  </div>
                  {isAssigned && <UserCheck className="h-4 w-4 text-violet-400 flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {task?.assigned_to && (
          <Button
            onClick={unassign}
            disabled={saving}
            variant="ghost"
            className="text-white/30 hover:text-red-400 text-xs w-full"
          >
            Remove assignment
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
