# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Routing Policy (Cloudflare Pages)

This project uses an Apache-like policy with minimal redirects.

- Redirects:
    - Only `/index.html -> /` (301)
- Rewrites:
    - `/content/* -> /content/:splat` (200) to serve markdown/static assets directly

SPA entry (`/index.html`) is served by middleware only when the mapped markdown exists.

## 404 Rules

In `functions/_middleware.js`, URL paths are validated against markdown content files.

- For URL path `/foo/bar`, middleware checks `/content/foo/bar.md`.
- If the file does not exist, middleware returns `404 Not Found`.
- `/` resolves to `/content/index.md`.
- Legacy `.html/.htm` URLs are treated as content routes for lookup, without redirecting.
