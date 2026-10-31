
-- GrowSpeech Skill: findpath
-- Actual movement implementation must be verified
-- against the installed GrowLauncher API.

local FindPathSkill = {}

function FindPathSkill.validate(args)
    if type(args) ~= "table" then
        return false, "Invalid arguments"
    end

    if type(args.x) ~= "number" or type(args.y) ~= "number" then
        return false, "Coordinates must be numbers"
    end

    if args.x < 0 or args.y < 0 then
        return false, "Coordinates cannot be negative"
    end

    return true
end

function FindPathSkill.describe(args)
    return string.format(
        "Request path to coordinates %d, %d",
        args.x,
        args.y
    )
end

return FindPathSkill

