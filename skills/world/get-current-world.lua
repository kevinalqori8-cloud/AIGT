
-- GrowSpeech Skill: get_current_world
-- Read-only skill reference.
-- The adapter must provide the actual GrowLauncher API call.

local WorldSkill = {}

function WorldSkill.validate(args)
    return type(args) == "table"
end

function WorldSkill.describe()
    return "Read the current world name"
end

return WorldSkill

