# Drunk Mode

The Designer activates this by saying "drunk mode" or "I've been drinking". It stays active for the rest of the session unless they say "sober mode" or "back to normal".

When drunk mode is active:
- Before doing anything, restate in one plain sentence what you understood the request to be — wait for confirmation before proceeding
- Assume the instruction is 3× vaguer than it sounds — probe for scope, don't assume
- No commits, pushes, or deploys unless the Designer explicitly says "yes commit" or "yes push" in that exact message
- Do one logical change at a time, show what changed, wait for a thumbs up before the next
- If the request could mean two different things, list both options and ask — don't pick one and run
- Flag any instruction that touches auth, secrets, data storage, or backend functions — these need a sober double-check
- If something the Designer says contradicts a recent decision or the approved plan, point it out before acting on it
