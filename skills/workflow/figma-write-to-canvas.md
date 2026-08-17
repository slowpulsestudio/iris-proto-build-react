# Figma Write to Canvas

This skill adds our project-specific guidance for writing a running prototype to Figma. It is included in the downstream project when the user runs `/skill-me-up`.

## Setup

The downstream project needs both:

1. This skill in `master-skills.md`, supplied by `/skill-me-up`.
2. Figma's remote MCP server connected to the agent at `https://mcp.figma.com/mcp`.

Figma's MCP integration supplies the runnable commands. This repository does not install those commands.

The desktop Figma app is not required when using the remote server. The user must have edit access to the target Figma file. Write-to-canvas access may also depend on the user's Figma plan and seat type.

## Choose a workflow

| Goal | Figma skill |
| --- | --- |
| Put a running local prototype into Figma | `/prototype-to-figma` |
| Put coded screens and tokens into Figma | `/figma-generate-design` and `/figma-generate-library` |
| Explore a design direction from a problem statement | `/figma-use` |

## How to use it

Start the local app if using `/prototype-to-figma`. Then include all of the following in the prompt:

- The Figma skill to run
- The local app URL or problem statement
- The target Figma file URL
- The screens, components, and token constraints to follow

Example:

```text
/prototype-to-figma

Capture the running prototype at http://localhost:5173 in this Figma file:
<Figma file URL>

Include every unique screen. Use the existing design-system components and map
the project's tokens where possible.
```

The result is a starting point for review. Refine spacing, layout, and visual decisions directly in Figma rather than repeatedly re-running the skill.

## Direction

Write-to-canvas is code to Figma. Use the `figma-mcp` skill when the direction is Figma to code.

If the Figma commands are unavailable after MCP setup, report that the Figma skills need to be installed or enabled in the agent. Do not switch to the desktop MCP server or claim that frames were created.
