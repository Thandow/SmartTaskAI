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
 
