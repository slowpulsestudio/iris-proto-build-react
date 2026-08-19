# Example Prompts

A collection of example prompts for Designers who are new to this prototype system. Copy one, paste it into Copilot chat, and adjust the details (screen name, Figma link, etc.) to match your project.

---

## Good initial review for refining discrepencies

```
Do a full audit on the discrepancies between my Figma screen and the built prototype. Pay close attention to Iris components and tokens from the Figma MCP.
```

---

## Push your refined prototype, back into a Figma design with all the Iris components and tokens connected

```
Push my prototype back into this Figma file: <Figma file URL>. Follow the figma-write-to-canvas skill.
```


---

## Building new screens from Figma

```
Here's a Figma link for a new prototype screen: <Figma URL>

Build it using real Iris components, tokens, and icons only — resolve them the same way you always do, never invent one.

Place it inside the existing app shell (top bar + left nav), under the [product name] product.

Use the wired Figma prototype links to get the basic interactivity and we can refine later.

```

---


## If tokens seem to be missing

```
Is this colour/spacing value coming from an Iris token, or is it hardcoded? If it's hardcoded, tell me which token it should be using instead.
```

```
List every Iris UI component we're currently using in this prototype, and flag anything that doesn't have a real Iris equivalent.
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

---

## Navigation and deep-linking

```
Make sure every link in this breadcrumb can be linked to directly with a URL, so I can start my UX Tweak tasks from a specific place & situation
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
