# Contributing

Thanks for taking an interest! This is a design study, so improvements to UX, accessibility, performance and code quality are all welcome.

## Before you start

- For anything larger than a small fix, please open an issue first so we can agree on the approach.
- The site's content and logos belong to Dokuz Eylül University (see [NOTICE.md](NOTICE.md)). Please don't add new third-party content or assets without a clear source.

## Development

```bash
corepack enable          # uses the pnpm version pinned in package.json
pnpm install
pnpm dev                 # http://localhost:3000
```

Before opening a pull request, make sure these pass. CI runs the same checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Guidelines

- **Next.js 16.** APIs differ from older versions (for example `preload` instead of `priority` on `next/image`, and async `params`). The bundled docs in `node_modules/next/dist/docs/` are the reference.
- **Match the surrounding code.** Server components by default; add `"use client"` only where interactivity needs it.
- **Motion.** Animate `transform` and `opacity`. Above-the-fold entrances use CSS keyframes (`anim-word`, `anim-fade-up`, `anim-fade` in `globals.css`), everything else uses the primitives in `src/components/motion/`. Always check the result with reduced motion turned on.
- **Brand.** Use the colour and font tokens from `globals.css`. Never rotate, recolour or add effects to the DEÜ emblem or unit logos.
- **Accessibility.** Text must reach a 4.5:1 contrast ratio; interactive elements need a visible focus state and an accessible name.
- **Language.** The UI is Turkish; code, comments and commit messages are English.

## Commits and pull requests

- Keep commits focused, with short imperative messages (`add news filters`, `fix menu focus trap`).
- Describe what changed and why in the pull request, and add before/after screenshots for visual changes.
