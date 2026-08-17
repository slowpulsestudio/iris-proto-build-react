# How to create a skill

---

## Bundling files with a skill

Some skills need to copy actual files into the project (e.g. a UI component library). To bundle files with a skill:

**1. Add the files** to `skill-resources/{skill-name}/` in this repo, in a named subfolder. The subfolder name becomes the source in the mapping. Mirror the `skills/` path — e.g. `skills/platform/iris-react.md` → `skill-resources/platform/iris-react/`.

For example, the iris-react skill bundles the iris-ui library at:

```
skill-resources/
└── platform/
    └── iris-react/
        └── iris-ui-main/       ← source folder
            ├── Components/
            ├── Icons/
            └── Tokens/
```

**2. Add a `## Resources` section** to the skill's `.md` file, with one directory mapping per line:

```
## Resources
iris-ui-main/ -> src/iris-ui/
```

The left side is relative to `skill-resources/{skill-name}/`. The right side is the destination in the project root.

When `/skill-me-up` runs, it reads the `## Resources` section, downloads the up-skill repo as a zip archive, extracts the matching files, and copies them into the new project at the specified paths. Files that already exist and differ are skipped with a warning.
