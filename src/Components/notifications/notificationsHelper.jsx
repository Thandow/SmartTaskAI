import { base44 } from "@/api/base44Client";

async function getEmailPrefs(email) {
  if (!email) return {};
  const profiles = await base44.entities.UserProfile.filter({ created_by: email }, "-created_date", 1).catch(() => []);
  return profiles[0]?.notification_preferences || {};
}

export async function notifyTaskAssigned({ task, assignedToEmail, actorName }) {
  if (!assignedToEmail) return;
  await base44.entities.Notification.create({
    recipient_email: assignedToEmail,
    type: "task_assigned",
    title: "Task assigned to you",
    message: `${actorName} assigned you "${task.title}"`,
    task_id: task.id,
    task_title: task.title,
    project_id: task.project_id || "",
    project_name: task.project_name || "",
    actor_name: actorName,
    is_read: false,
  });
  const prefs = await getEmailPrefs(assignedToEmail);
  if (prefs.email_task_assigned !== false) {
    await base44.integrations.Core.SendEmail({
      to: assignedToEmail,
      subject: `SmartTask: Task assigned to you — "${task.title}"`,
      body: `Hi,\n\n${actorName} has assigned you a task:\n\n📌 "${task.title}"\n\nLog in to SmartTask to view it.\n\n— SmartTask AI`,
    }).catch(() => {});
  }
}

export async function notifyTaskComment({ task, commenterName, commentPreview, ownerEmail, currentUserEmail }) {
  const preview = `${commentPreview.slice(0, 60)}${commentPreview.length > 60 ? "…" : ""}`;
  const recipients = new Set();
  if (ownerEmail && ownerEmail !== currentUserEmail) recipients.add(ownerEmail);
  if (task.assigned_to && task.assigned_to !== currentUserEmail) recipients.add(task.assigned_to);
  await Promise.all([...recipients].map(async (email) => {
    await base44.entities.Notification.create({
      recipient_email: email,
      type: "task_comment",
      title: "New comment on a task",
      message: `${commenterName}: "${preview}"`,
      task_id: task.id,
      task_title: task.title,
      actor_name: commenterName,
      is_read: false,
    });
    const prefs = await getEmailPrefs(email);
    if (prefs.email_task_comment !== false) {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `SmartTask: New comment on "${task.title}"`,
        body: `Hi,\n\n${commenterName} commented on the task "${task.title}":\n\n"${preview}"\n\nLog in to SmartTask to reply.\n\n— SmartTask AI`,
      }).catch(() => {});
    }
  }));
}

export async function notifyDeadlineSoon({ task, recipientEmail }) {
  if (!recipientEmail) return;
  await base44.entities.Notification.create({
    recipient_email: recipientEmail,
    type: "deadline_soon",
    title: "Task deadline approaching",
    message: `"${task.title}" is due soon. Don't miss it!`,
    task_id: task.id,
    task_title: task.title,
    is_read: false,
  });
}

export async function notifyProjectUpdate({ project, memberEmails, actorName, message }) {
  if (!memberEmails?.length) return;
  await Promise.all(memberEmails.map(email =>
    base44.entities.Notification.create({
      recipient_email: email,
      type: "project_update",
      title: `Project update: ${project.name}`,
      message,
      project_id: project.id,
      project_name: project.name,
      actor_name: actorName,
      is_read: false,
    })
  ));
}
