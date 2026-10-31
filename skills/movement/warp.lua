
-- GrowSpeech Skill: warp
-- This module is a reviewed reference implementation.
-- Actual execution is handled by the GrowLauncher adapter.

local WarpSkill = {}

function WarpSkill.validate(args)
    if type(args) ~= "table" then
        return false, "Invalid arguments"
    end

    if type(args.world) ~= "string" then
        return false, "World must be a string"
    end

    if #args.world < 1 or #args.world > 24 then
        return false, "Invalid world length"
    end

    if not args.world:match("^[%w|]+$") then
        return false, "Invalid world characters"
    end

    return true
end

function WarpSkill.describe(args)
    return "Request warp to " .. args.world
end

return WarpSkill

