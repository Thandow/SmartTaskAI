import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Loader2, X } from "lucide-react";
import { notifyTaskComment } from "../notifications/notificationHelpers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment";

export default function TaskCommentsPanel({ task, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!task?.id) return;
    setLoading(true);
    base44.entities.TaskComment.filter({ task_id: task.id }, "created_date", 100)
      .then(setComments)
      .finally(() => setLoading(false));

    const unsub = base44.entities.TaskComment.subscribe((event) => {
      if (event.data?.task_id !== task.id) return;
      if (event.type === "create") setComments(prev => [...prev, event.data]);
      if (event.type === "delete") setComments(prev => prev.filter(c => c.id !== event.id));
    });
    return unsub;
  }, [task?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const sendComment = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    const content = text.trim();
    await base44.entities.TaskComment.create({
      task_id: task.id,
      content,
      author_email: user.email,
      author_name: user.full_name || user.email,
    });
    // Notify task owner / assignee
    await notifyTaskComment({
      task,
      commenterName: user.full_name || user.email,
      commentPreview: content,
      ownerEmail: task.created_by,
      currentUserEmail: user.email,
    });
    setText("");
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendComment();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">Comments</span>
          <span className="text-xs text-white/30">· {task?.title}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/40">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-white/20" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-white/20 text-sm">
            No comments yet. Be the first!
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((c) => {
              const isMe = c.author_email === user?.email;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${isMe ? "bg-violet-600/30 text-white" : "bg-white/5 text-white/80"}`}>
                    {!isMe && (
                      <p className="text-[10px] text-violet-300 font-medium mb-0.5">{c.author_name || c.author_email}</p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    <p className="text-[10px] text-white/20 mt-1 text-right">{moment(c.created_date).fromNow()}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex gap-2">
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Write a comment... (Enter to send)"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm resize-none h-10 min-h-[40px] max-h-24"
            rows={1}
          />
          <Button
            onClick={sendComment}
            disabled={!text.trim() || sending}
            size="icon"
            className="bg-violet-600 hover:bg-violet-700 flex-shrink-0 h-10 w-10"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
