{
  "name": "Project",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Project name"
    },
    "description": {
      "type": "string"
    },
    "color": {
      "type": "string",
      "default": "#7c3aed"
    },
    "members": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of member emails"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "archived"
      ],
      "default": "active"
    }
  },
  "required": [
    "name"
  ]
}
