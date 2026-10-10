# Developer Learning Hub

Discover. Learn. Build.

A vanilla JavaScript, HTML, and CSS project for BYU–Idaho WDD 330, designed as the foundation for a developer discovery platform.

## Current scope — Week 5 foundation

- Vite project setup and modular folder structure.
- Initial semantic page layout with responsive styles.
- Accessible mobile navigation with Escape support and a no-JavaScript fallback.
- Disabled, explicitly labeled search shell and honest coming-soon discovery states.

GitHub REST API, Stack Exchange API, functional search, filters, saved resources, and recent searches are **not implemented**. External discovery links go directly to the source websites.

## Local development

Use Node.js 20.19+ or 22.12+ (Node 24 is supported) and npm.

```sh
npm install
npm run dev
```

Open the printed local URL, normally `http://localhost:5173/developer-learning-hub/`. In PowerShell environments that block `npm.ps1`, use `npm.cmd` for these commands.

```sh
npm run check
npm run build
npm run preview
```

The check command validates JavaScript syntax. The build command creates `dist/`. Preview normally serves `http://localhost:4173/developer-learning-hub/`.

## Structure

```text
index.html                  Semantic layout and metadata
public/favicon.svg          Original vector brand mark
src/main.js                 Application entry
src/components/navigation.js Presentation-only navigation behavior
src/styles/tokens.css       Shared design values
src/styles/main.css         Layout and responsive styling
src/services/               Reserved for future API modules
src/utils/                  Reserved for future shared helpers
vite.config.js              GitHub Pages base path
```

The base path is `/developer-learning-hub/` in preparation for GitHub Pages. No deployment workflow or deployment has been added. There are no credentials or external font/image dependencies; visuals use original CSS and text symbols.

## Manual browser review

Review at 320px, 375px, 768px, and desktop widths; check wrapping and horizontal overflow. Use keyboard Tab and Enter to test the skip link, navigation, and external links. On mobile, test opening the menu, selecting a link, and pressing Escape. Check that focus is visible, headings and labels read correctly with a screen reader, reduced motion is respected, and disabled search is explained. Disable JavaScript to check that navigation remains available. Review the production preview and favicon under the configured base path.

This foundation has no automated browser or accessibility test suite. JavaScript syntax and production build checks do not replace browser review.
