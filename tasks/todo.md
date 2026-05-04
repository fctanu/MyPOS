# Release Readiness Plan

## Plan
- [x] Capture the current failure state and identify whether the broken source can be repaired or should be restored from a known-good commit.
- [x] Restore a coherent source tree with minimal necessary changes so the app can typecheck and build again.
- [x] Clean the repository for publishing by removing obvious generated noise from tracking scope and documenting deployment expectations.
- [x] Verify the final state with dependency install, typecheck, and production build.
- [x] Add a short review section with findings, decisions, and remaining deployment steps.

## Review
- The `ee5f5fd` source tree was not deployable: `src/main.tsx` imported a missing `src/App.tsx`, and multiple `src/app`, `src/features`, and `src/shared` files referenced modules that were not present in the repository.
- The cleanest recovery baseline was commit `b6ff6a7`, which is the last self-contained app before the incomplete redesign fragments landed.
- The working tree was cleaned by removing tracked browser capture artifacts, generated logs, and generated `dist/` output from the publishable source snapshot.
- Verification completed successfully with `npm ci`, `npm audit fix`, `npm run lint`, and `npm run build`.
- Remaining publish step: push branch `codex/release-cleanup` to GitHub, then deploy the repo on Vercel using the Vite defaults.
