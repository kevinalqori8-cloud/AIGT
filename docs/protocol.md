
# GrowSpeech Modular Agent Protocol

## 1. Skill Discovery

GET /api/skills

Returns available skill metadata.

## 2. Skill Retrieval

GET /api/skills?id=warp

Returns:
- Skill metadata
- Lua source
- Repository reference
- Version

## 3. Agent Planning

POST /api/agent

Body:
{
  "prompt": "Warp to WORLDNAME"
}

## 4. Skill Request

{
  "type": "skill_request",
  "skill": {
    "id": "warp",
    "name": "World Warp",
    "version": "1.0.0"
  },
  "args": {
    "world": "WORLDNAME"
  },
  "requires_confirmation": true
}

## 5. Execution Lifecycle

1. Discover skill.
2. Retrieve source.
3. Validate source version and integrity.
4. Validate skill parameters.
5. Request user confirmation.
6. Execute approved skill.
7. Verify result.
8. Return execution result.

## 6. Important

A skill request is not proof of execution.
A successful HTTP response is not proof of execution.
Only the GrowLauncher runtime can report the actual result.

