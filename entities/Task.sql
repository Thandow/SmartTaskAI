{
  "name": "Task",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Task title"
    },
    "description": {
      "type": "string",
      "description": "Detailed description"
    },
    "status": {
      "type": "string",
      "enum": [
        "todo",
        "in_progress",
        "done",
        "missed"
      ],
      "default": "todo"
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high",
        "critical"
      ],
      "default": "medium"
    },
    "category": {
      "type": "string",
      "enum": [
        "work",
        "personal",
        "study",
        "health",
        "meeting",
        "errand",
        "other"
      ],
      "default": "personal"
    },
    "due_date": {
      "type": "string",
      "format": "date-time"
    },
    "suggested_time": {
      "type": "string"
    },
    "estimated_minutes": {
      "type": "number"
    },
    "points": {
      "type": "number",
      "default": 10
    },
    "completed_date": {
      "type": "string",
      "format": "date-time"
    },
    "ai_notes": {
      "type": "string"
    },
    "mood_tag": {
      "type": "string",
      "enum": [
        "energized",
        "normal",
        "tired",
        "overwhelmed"
      ]
    },
    "assigned_to": {
      "type": "string",
      "description": "Email of the user this task is assigned to"
    },
    "assigned_to_name": {
      "type": "string",
      "description": "Display name of assigned user"
    },
    "project_id": {
      "type": "string",
      "description": "ID of the project this task belongs to"
    },
    "project_name": {
      "type": "string",
      "description": "Name of the project"
    }
  },
  "required": [
    "title"
  ]
}
