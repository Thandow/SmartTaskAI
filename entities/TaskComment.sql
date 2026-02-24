{
  "name": "TaskComment",
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "description": "ID of the task this comment belongs to"
    },
    "content": {
      "type": "string",
      "description": "Comment text"
    },
    "author_email": {
      "type": "string"
    },
    "author_name": {
      "type": "string"
    }
  },
  "required": [
    "task_id",
    "content"
  ]
}
