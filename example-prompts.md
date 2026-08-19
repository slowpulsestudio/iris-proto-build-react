# Example Prompts

A collection of example prompts for Designers who are new to this prototype system. Copy one, paste it into Copilot chat, and adjust the details (screen name, Figma link, etc.) to match your project.

---

## Auditing Figma vs. the built prototype

```
Do a full audit on the discrepancies between my Figma screen and the built prototype. Pay close attention to Iris components and tokens from the Figma MCP.
```

```
Check whether every component on the [screen name] screen is a real bound Iris UI component, or just something styled to look like one. Give me a checklist with a tick or cross for each one.
```

```
The code for [screen name] already exists — make sure it references the same tokens as Figma, not new ones. Also double-check you audited the right screen; it looks like you compared against [wrong screen] instead of [correct screen].
```

```
Why isn't this using design system components from the connected libraries and tokens? Check whether it fell back to plain styled elements instead of real Iris instances.
```

---

## Building new screens from Figma

```
Here's a Figma link for a new prototype screen: <Figma URL>

Build it using real Iris components, tokens, and icons only — resolve them the same way you always do, never invent one.

Place it inside the existing app shell (top bar + left nav), under the [product name] product.

Then wire it into the scaffold: create a new scenario file for it, make sure it shows up on the Welcome page, and don't touch Git branches directly.
```

```
Here's a Figma link for a new prototype screen: <Figma URL>

Build it the same way as always — real Iris components, tokens, and icons, wired into the scaffold.

Your very next message must be the Build Verification Checklist from AGENTS.md, filled in — nothing else before it. If you get blocked for any reason, still reply with that same checklist, every box marked failed, and a brief summary underneath explaining what happened, what's blocking it, what you need to continue, and the exact tool calls you made up to the point of failure.
```

```
Pull the full variable set for the [screen name] screen from Figma before you build anything. Show me the token list first so I can confirm it's right.
```

---

## Putting the prototype back into Figma

```
Capture the running prototype at localhost and put it into this Figma file: <Figma file URL>. Do the rough reference version first, then tell me before you start linking up real Iris components and tokens.
```

---

## Working with tokens and components

```
Is this colour/spacing value coming from an Iris token, or is it hardcoded? If it's hardcoded, tell me which token it should be using instead.
```

```
List every Iris UI component we're currently using in this prototype, and flag anything that doesn't have a real Iris equivalent.
```

```
When you click on the [component name], the content just pops back into place instantly instead of animating. Can you make it use the exit motion token with proper easing to slide back down, and check it's consistent on [page name] too?
```

```
Use the motion design Iris tokens to move the [component name] up and down — enter and exit easing tokens applied appropriately. When scrolling to the bottom item, leave a single row-height gap so the last row scrolls above the [component name]. Apply the same behaviour on both [first screen] and [second screen], and add an extra [component name] action for '[action name]'. Ask me first if anything needs clarifying.
```

```
Check the motion design tokens in Figma for this — it should use the motion-move easing token when resizing [element] vertically, not a default transition.
```

```
Make a light and dark mode version of [screen name]. Also get rid of the '[old variant name]' variant and just make it '[new variant name]'.
```

```
Add proper padding above [element] — the [logo/element] and the top should get the same treatment as a 'header' too.
```

---

## Fixing specific UI bugs

```
You didn't fix the [total items] issue yet. Also, the [action bar] needs more margin at the bottom — it's sitting too close to the edge.
```

```
This isn't showing: the [indicator name] — "[label text]" should appear right-aligned in the footer when [condition].
```

```
Add an indicator after the "[count] selected" text in the [component name]. On hover, the tooltip should say '[tooltip text]'.
```

```
Make the [field name] on this screen match the styling of [field name] on [other screen] — same [colour], and the same hover behaviour to click and open the [side-sheet/panel].
```

```
You didn't need to flip the [gradient/fade element] — flip it back. The real issue is it has the same bottom margin as the [action bar]; it should sit flush against the top of the [table footer].
```

---

## Migrating existing screens to Iris

```
I have an existing screen that isn't using the Iris design system yet. Audit it first — list every component, its Iris equivalent (or note if there isn't one), and the token replacements needed. Don't change anything yet, just show me the audit.
```

```
Migrate the tokens on [screen/component name] to Iris tokens first. Don't touch the components yet — that's a separate step.
```

---

## Navigation and deep-linking

```
Make sure every node in this tree can be linked to directly with a URL, so I can start my UX Tweak tasks from a specific place & situation
```

```
If I share a link to a deeply nested item, does the tree open, expand, and scroll to it automatically? Check this and fix it if not.
```

---

## Testing and verification

```
Don't just tell me it compiles — run it and show me what actually happens on screen before you say it's done.
```

```
Test [feature] on its own first, then test it as part of the full flow, so we know exactly where it breaks if something's wrong.
```

---

## Publishing and sharing for review

```
I want to share this version with a stakeholder for feedback without affecting the live production site. Explain to me where I get my published link from again?
```

---

## General onboarding / getting unstuck

```
I don't know what to call this component. Look in the Iris component library and tell me what the closest match is called.
```

```
Something looks wrong on screen but I don't know why. Walk me through it in plain English and tell me the exact fix — no more than 3 steps at a time.
```
