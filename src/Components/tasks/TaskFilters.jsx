import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function TaskFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Filter className="h-4 w-4 text-white/30" />
      <Select value={filters.status} onValueChange={v => set("status", v)}>
        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white text-xs h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a3a] border-white/10">
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="missed">Missed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.priority} onValueChange={v => set("priority", v)}>
        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white text-xs h-9">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a3a] border-white/10">
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.category} onValueChange={v => set("category", v)}>
        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white text-xs h-9">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a3a] border-white/10">
          <SelectItem value="all">All Categories</SelectItem>
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
  );
}
