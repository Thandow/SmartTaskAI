import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function TaskEditDialog({ task, open, onOpenChange, onSave }) {
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium", category: "personal",
    status: "todo", due_date: "", estimated_minutes: ""
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        category: task.category || "personal",
        status: task.status || "todo",
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : "",
        estimated_minutes: task.estimated_minutes || "",
      });
    }
  }, [task]);

  const handleSave = () => {
    const data = { ...form };
    if (!data.due_date) delete data.due_date;
    if (!data.estimated_minutes) delete data.estimated_minutes;
    else data.estimated_minutes = Number(data.estimated_minutes);
    onSave(task?.id, data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#12122a] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{task?.id ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-white/60 text-xs">Title</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-white/60 text-xs">Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1 h-20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/60 text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a3a] border-white/10">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/60 text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a3a] border-white/10">
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="errand">Errand</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/60 text-xs">Due Date</Label>
              <Input type="datetime-local" value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Est. Minutes</Label>
              <Input type="number" value={form.estimated_minutes}
                onChange={e => setForm({ ...form, estimated_minutes: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-white/60 text-xs">Status</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1a1a3a] border-white/10">
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/50">Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-violet-600 to-indigo-600">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
