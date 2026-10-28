# Post-build checklist

Run this after building any screen from a connected Figma file, before calling it done — for brand-new screens exactly the same as for updates to existing ones.

1. Build/type-check the change (e.g. `pnpm build`) before considering it done.
2. Produce a component/token review table, whether the screen is brand new or an update: every component and token used, marked with a tick (✅) for anything matched to a real Iris design-system component/token and a cross (❌) for anything that couldn't be matched, with the stand-in used noted for each ❌. Present this to the user before moving on.
3. Start (or reuse) a local dev server, open localhost to the new/updated route in the browser tool, and screenshot-compare it against the Figma frame/node for a first self-check.
4. For newly created screens, explicitly show the generated localhost route to the user and ask if they are happy with what was created before moving to any follow-up implementation.
5. Ask the user: *"Want me to commit and push this?"* — proceed only on an explicit yes.
6. After pushing, tell the user where to look (dev URL/route, or that a deploy will follow) and ask them to manually eyeball it against the Figma design themselves before calling the task done.

**A failed response looks like:**
- Declaring a build "done" without running it through a dev server and comparing it to Figma
- Only producing the ✅/❌ component/token review table for screen updates and skipping it for brand-new screens
- Finishing a newly created screen without showing its localhost route to the user first
- Committing or pushing without an explicit yes from the user
