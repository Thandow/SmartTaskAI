import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Plus, Users, Trash2, CheckCircle2, Circle, MessageSquare, UserCheck, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import TaskCommentsPanel from "../components/collaboration/TaskCommentsPanel";
import AssignTaskDialog from "../components/collaboration/AssignTaskDialog";
import { notifyTaskAssigned, notifyProjectUpdate } from "../components/notifications/notificationHelpers";
import moment from "moment";

const COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

function ProjectForm({ project, onSave, onClose }) {
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    color: project?.color || "#7c3aed",
    members: (project?.members || []).join(", "),
  });

  const handleSave = () => {
    if (!form.name.trim()) return;
    const members = form.members.split(",").map(e => e.trim()).filter(Boolean);
    onSave({ ...form, members });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white/60 text-xs">Project Name</Label>
        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Website Redesign"
          className="bg-white/5 border-white/10 text-white mt-1" />
      </div>
      <div>
        <Label className="text-white/60 text-xs">Description</Label>
        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          className="bg-white/5 border-white/10 text-white mt-1 h-16" />
      </div>
      <div>
        <Label className="text-white/60 text-xs">Team Members (comma-separated emails)</Label>
        <Input value={form.members} onChange={e => setForm({ ...form, members: e.target.value })}
          placeholder="alice@example.com, bob@example.com"
          className="bg-white/5 border-white/10 text-white mt-1" />
      </div>
      <div>
        <Label className="text-white/60 text-xs">Color</Label>
        <div className="flex gap-2 mt-1">
          {COLORS.map(c => (
            <button key={c} onClick={() => setForm({ ...form, color: c })}
              className={`h-7 w-7 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-white/30" : "hover:scale-110"}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose} className="text-white/50">Cancel</Button>
        <Button onClick={handleSave} className="bg-gradient-to-r from-violet-600 to-indigo-600">
          {project?.id ? "Update" : "Create"} Project
        </Button>
      </div>
    </div>
  );
}

export default function Projects() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [commentTask, setCommentTask] = useState(null);
  const [assignTask, setAssignTask] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date", 50),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 200),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["task_comments"],
    queryFn: () => base44.entities.TaskComment.list("-created_date", 500),
  });

  const projectTasks = tasks.filter(t => t.project_id === selectedProject?.id);
  const commentCountByTask = comments.reduce((acc, c) => {
    acc[c.task_id] = (acc[c.task_id] || 0) + 1;
    return acc;
  }, {});

  const saveProject = async (data) => {
    if (editProject?.id) {
      await base44.entities.Project.update(editProject.id, data);
      // Notify members of update
      const otherMembers = (data.members || []).filter(e => e !== user?.email);
      if (otherMembers.length > 0) {
        await notifyProjectUpdate({
          project: { id: editProject.id, name: data.name },
          memberEmails: otherMembers,
          actorName: user?.full_name || user?.email || "Someone",
          message: `${user?.full_name || "Someone"} updated the project "${data.name}"`,
        });
      }
    } else {
      const created = await base44.entities.Project.create(data);
      setSelectedProject(created);
      // Notify members they were added
      const otherMembers = (data.members || []).filter(e => e !== user?.email);
      if (otherMembers.length > 0) {
        await notifyProjectUpdate({
          project: { id: created.id, name: data.name },
          memberEmails: otherMembers,
          actorName: user?.full_name || user?.email || "Someone",
          message: `${user?.full_name || "Someone"} added you to the project "${data.name}"`,
        });
      }
    }
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    setFormOpen(false);
    setEditProject(null);
  };

  const deleteProject = async (project) => {
    await base44.entities.Project.delete(project.id);
    if (selectedProject?.id === project.id) setSelectedProject(null);
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const toggleTask = async (task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    await base44.entities.Task.update(task.id, {
      status: newStatus,
      ...(newStatus === "done" ? { completed_date: new Date().toISOString() } : {})
    });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleAssign = async (taskId, data) => {
    await base44.entities.Task.update(taskId, data);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-5">
      {/* Projects sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-base font-bold text-white">Projects</h1>
          </div>
          <Button size="icon" onClick={() => { setEditProject(null); setFormOpen(true); }}
            className="h-7 w-7 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="space-y-1 flex-1 overflow-y-auto">
          {projects.length === 0 && (
            <p className="text-white/20 text-xs text-center py-8">No projects yet</p>
          )}
          {projects.map(p => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedProject(p)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group ${
                selectedProject?.id === p.id ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-sm font-medium text-white flex-1 truncate">{p.name}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button onClick={e => { e.stopPropagation(); setEditProject(p); setFormOpen(true); }}
                  className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white">
                  <Pencil className="h-3 w-3" />
                </button>
                <button onClick={e => { e.stopPropagation(); deleteProject(p); }}
                  className="p-1 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Board area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {!selectedProject ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Layers className="h-12 w-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Select or create a project to get started</p>
            </div>
          </div>
        ) : (
          <>
            {/* Project header */}
            <div className="flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                <h2 className="text-lg font-bold text-white">{selectedProject.name}</h2>
                {selectedProject.members?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-white/30">
                    <Users className="h-3.5 w-3.5" />
                    {selectedProject.members.length} members
                  </div>
                )}
              </div>
              <AddToProjectButton projectId={selectedProject.id} projectName={selectedProject.name} onAdded={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })} user={user} />
            </div>

            {/* Task board */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {projectTasks.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-white/20 text-sm">No tasks in this project yet</p>
                </div>
              ) : (
                <AnimatePresence>
                  {projectTasks.map((task, i) => {
                    const isDone = task.status === "done";
                    const commentCount = commentCountByTask[task.id] || 0;
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`group rounded-xl border p-4 transition-all hover:bg-white/[0.03] ${
                          isDone ? "bg-white/[0.01] border-white/5 opacity-60" : "bg-white/[0.02] border-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleTask(task)} className="mt-0.5 flex-shrink-0">
                            {isDone
                              ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              : <Circle className="h-5 w-5 text-white/20 hover:text-white/40" />
                            }
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isDone ? "line-through text-white/40" : "text-white"}`}>
                              {task.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <Badge className="text-[10px] px-1.5 py-0 bg-violet-500/10 text-violet-300 border-violet-500/20">
                                {task.priority}
                              </Badge>
                              {task.due_date && (
                                <span className="text-[11px] text-white/30">{moment(task.due_date).fromNow()}</span>
                              )}
                              {task.assigned_to_name && (
                                <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" />
                                  {task.assigned_to_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setAssignTask(task); setAssignOpen(true); }}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white/20 hover:text-cyan-400 transition-colors"
                              title="Assign"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setCommentTask(commentTask?.id === task.id ? null : task)}
                              className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 ${commentTask?.id === task.id ? "text-violet-400" : "text-white/20 hover:text-violet-400"}`}
                              title="Comments"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              {commentCount > 0 && <span className="text-[10px]">{commentCount}</span>}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </>
        )}
      </div>

      {/* Comments side panel */}
      <AnimatePresence>
        {commentTask && (
          <motion.div
            initial={{ opacity: 0, x: 40, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 320 }}
            exit={{ opacity: 0, x: 40, width: 0 }}
            className="flex-shrink-0 rounded-2xl bg-[#0d0d24] border border-white/5 overflow-hidden flex flex-col"
            style={{ width: 320 }}
          >
            <TaskCommentsPanel task={commentTask} onClose={() => setCommentTask(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-[#12122a] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editProject?.id ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <ProjectForm project={editProject} onSave={saveProject} onClose={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <AssignTaskDialog
        task={assignTask}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssign={handleAssign}
        currentUser={user}
      />
    </div>
  );
}

function AddToProjectButton({ projectId, projectName, onAdded, user }) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const all = await base44.entities.Task.list("-created_date", 200);
    setTasks(all.filter(t => !t.project_id || t.project_id === projectId));
    setLoading(false);
  };

  const filtered = tasks.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()));

  const addTask = async (task) => {
    await base44.entities.Task.update(task.id, { project_id: projectId, project_name: projectName });
    onAdded();
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, project_id: projectId } : t));
  };

  return (
    <>
      <Button size="sm" onClick={() => { setOpen(true); load(); }}
        className="bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/20 text-xs">
        <Plus className="h-3.5 w-3.5 mr-1" /> Add Task
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#12122a] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Tasks to Project</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm" />
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {filtered.map(t => {
              const inProject = t.project_id === projectId;
              return (
                <button key={t.id}
                  onClick={() => !inProject && addTask(t)}
                  disabled={inProject}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                    inProject ? "bg-emerald-500/10 border border-emerald-500/20 cursor-default" : "hover:bg-white/5"
                  }`}
                >
                  {inProject
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    : <Circle className="h-4 w-4 text-white/20 flex-shrink-0" />
                  }
                  <span className="text-sm text-white truncate">{t.title}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
