import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Checks once per session for tasks due within 24h and creates deadline_soon notifications
export default function DeadlineChecker({ user, tasks }) {
  useEffect(() => {
    if (!user?.email || !tasks?.length) return;
    const key = `deadlineCheck_${new Date().toISOString().split("T")[0]}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const dueSoon = tasks.filter(t => {
      if (t.status === "done" || t.status === "missed") return false;
      if (!t.due_date) return false;
      const due = new Date(t.due_date);
      return due > now && due <= in24h;
    });

    dueSoon.forEach(async (task) => {
      // Check if notification already exists today
      const existing = await base44.entities.Notification.filter({
        recipient_email: user.email,
        type: "deadline_soon",
        task_id: task.id,
      }, "-created_date", 1);

      const alreadyNotified = existing.some(n => {
        const nDate = new Date(n.created_date);
        return (now - nDate) < 24 * 60 * 60 * 1000;
      });

      if (!alreadyNotified) {
        await base44.entities.Notification.create({
          recipient_email: user.email,
          type: "deadline_soon",
          title: "Task deadline approaching",
          message: `"${task.title}" is due within 24 hours!`,
          task_id: task.id,
          task_title: task.title,
          is_read: false,
        });
      }
    });
  }, [user?.email, tasks?.length]);

  return null;
}
