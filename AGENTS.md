# AGENTS.md

<INSTRUCTIONS>
Project overview:
- Static portfolio site (no build step).
- Key files: index.html, project.html, style.css, app.js, projects.json, assets/.
- Projects are data-driven via projects.json and rendered by app.js.

Editing rules:
- Preserve the existing visual style unless the user asks for a redesign.
- Keep copy in French unless the user requests another language.
- Avoid deleting or renaming assets unless explicitly requested.

Projects.json schema (keep fields consistent):
- id, title, subtitle, excerpt, featured, cover, images, tags, highlights, description, powerbi_embed_url
- cover and images should point to files under assets/.

When adding sections:
- Add an anchor id for nav links.
- Update style.css with matching styles and responsive rules.
- If a section needs dynamic data, add it in app.js.

QA:
- No automated tests. Validate by opening index.html and project.html in a browser.
</INSTRUCTIONS>
