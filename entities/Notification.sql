{
  "name": "Notification",
  "type": "object",
  "properties": {
    "recipient_email": {
      "type": "string",
      "description": "Email of the user to notify"
    },
    "type": {
      "type": "string",
      "enum": [
        "task_assigned",
        "task_comment",
        "deadline_soon",
        "project_update"
      ],
      "description": "Notification type"
    },
    "title": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "task_id": {
      "type": "string"
    },
    "task_title": {
      "type": "string"
    },
    "project_id": {
      "type": "string"
    },
    "project_name": {
      "type": "string"
    },
    "is_read": {
      "type": "boolean",
      "default": false
    },
    "actor_name": {
      "type": "string",
      "description": "Who triggered this notification"
    }
  },
  "required": [
    "recipient_email",
    "type",
    "title",
    "message"
  ]
}
