{
  "name": "UserProfile",
  "type": "object",
  "properties": {
    "total_points": {
      "type": "number",
      "default": 0
    },
    "current_streak": {
      "type": "number",
      "default": 0
    },
    "longest_streak": {
      "type": "number",
      "default": 0
    },
    "level": {
      "type": "number",
      "default": 1
    },
    "tasks_completed": {
      "type": "number",
      "default": 0
    },
    "current_mood": {
      "type": "string",
      "enum": [
        "energized",
        "focused",
        "normal",
        "tired",
        "overwhelmed"
      ],
      "default": "normal"
    },
    "preferred_work_hours": {
      "type": "string",
      "default": "morning"
    },
    "daily_task_limit": {
      "type": "number",
      "default": 10
    },
    "last_active_date": {
      "type": "string",
      "format": "date"
    },
    "achievements": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "earned_date": {
            "type": "string"
          }
        }
      }
    },
    "notification_preferences": {
      "type": "object",
      "properties": {
        "smart_reminders": {
          "type": "boolean",
          "default": true
        },
        "daily_summary": {
          "type": "boolean",
          "default": true
        },
        "achievement_alerts": {
          "type": "boolean",
          "default": true
        }
      }
    }
  },
  "required": []
}
