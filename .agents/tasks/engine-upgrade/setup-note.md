# Engine Upgrade — Pre-Implementation Setup Note

## Git state
- Branch: `master`
- HEAD short SHA: `8a32d35`
- Note: the repo's prior two feature commits were made directly on `master` with no worktree. Whether that convention stands is a decision for the plan step, not this setup step.

## Baseline test run
Command: `node test/smoke.mjs` (run from repo root; equivalent to `npm test`). Test file was NOT modified.

Result: **all 7 assertions passed**, no errors thrown.

```
smoke: OK — page loaded, inline script executed, #out rendered, no errors thrown
golden (8.1): OK — flight dt=20:00 peak-window Return_Deadline renders "Back by 3:55 PM"
golden (8.2a): OK — zero vibes selected, Maggi stop present alongside a Mountain_Trip stop
golden (8.2b): OK — vibe "food" (matches Maggi tag) selected, Maggi stop present
golden (8.2c): OK — vibe "adventure" (no shared tag) selected, Maggi stop absent
golden (8.3): OK — .bar absent initially, present after a fine-tune change, absent again after a mode change
golden (8.4): OK — mlc/ycf deleted and absent, ama/hig renamed names present, rdr/koi unchanged with placeholder hr text
```

(Output file is UTF-16 encoded by the test harness; terminal direct capture garbled display characters but content was verified by reading the raw file.)

## Absolute paths of record
- Repo root: `c:\Users\Lenovo\OneDrive\Desktop\Vs code folders\Recommendation system(scd)`
- Main runtime file (single self-contained HTML page, inline `<style>` + inline `<script>` IIFE, no build step/framework/bundler): `c:\Users\Lenovo\OneDrive\Desktop\Vs code folders\Recommendation system(scd)\scd-explore-doon.html`
- Test harness (jsdom pinned as the only dev dependency, run manually via `node test/smoke.mjs`): `c:\Users\Lenovo\OneDrive\Desktop\Vs code folders\Recommendation system(scd)\test\smoke.mjs`
- Spec docs (current baseline):
  - `c:\Users\Lenovo\OneDrive\Desktop\Vs code folders\Recommendation system(scd)\.kiro\specs\scd-explore-doon\requirements.md`
  - `c:\Users\Lenovo\OneDrive\Desktop\Vs code folders\Recommendation system(scd)\.kiro\specs\scd-explore-doon\design.md`
  - `c:\Users\Lenovo\OneDrive\Desktop\Vs code folders\Recommendation system(scd)\.kiro\specs\scd-explore-doon\tasks.md`
- Artifact directory for this run: `c:\Users\Lenovo\OneDrive\Desktop\Vs code folders\Recommendation system(scd)\.agents\tasks\engine-upgrade`

## No source changes
No application code or engine logic was modified in this step.
