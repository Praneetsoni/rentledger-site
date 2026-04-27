# M1.8/M1.9 cleanup plan (run ≥ 2026-05-04)

*Drafted 2026-04-27 immediately after M1.7 cutover. The 7-day fallback window ends 2026-05-04. After that, all items below become safe to execute. A scheduled agent will fire on 2026-05-04 to run this.*

## Pre-flight before executing any item

- [ ] Verify CF Pages is still serving `https://rentledger.org/` correctly: HTTP 200, smoke test 34/34 pass via `./scripts/preview-smoke.sh https://rentledger.org`
- [ ] Verify GSC has indexed at least the 7 indexable URLs (Search Console → Sitemaps shows "Discovered URLs: 7" or higher)
- [ ] Verify CF Pages 404 logs over the past 7 days show no recurring URL patterns we missed (any pattern ≥ 3 occurrences gets a `_redirects` entry FIRST)
- [ ] Verify no rollback signal: GSC Coverage trending up, no manual actions, no de-indexing alerts

If ANY pre-flight fails, **defer the cleanup** and diagnose. Do not flip the repo private or delete the Jekyll fallback while there's an active rollback signal.

## Cleanup item 1 — Delete Jekyll source files

Strip the dead Jekyll-era artifacts. The Astro project under `src/` and `public/` is the only thing the live site needs.

```bash
cd /Users/praneetsoni/Code/Workspace/rentledger-site
git checkout main && git pull --ff-only

# Jekyll config + layouts + includes
git rm _config.yml
git rm -r _includes _layouts

# Jekyll content (all replaced by src/pages/* or src/content/*)
git rm index.md pricing.md support.md about.md changelog.md privacy.md terms.md
git rm 404.html

# Static crawler/SEO files Jekyll generated (replaced by dynamic Astro endpoints)
git rm robots.txt sitemap.xml

# GitHub Pages custom-domain config (Cloudflare Pages handles this)
git rm CNAME

# Duplicated asset files — public/ is the live serve dir; assets/ was Jekyll's
git rm -r assets

# Stale doc
git rm DESIGN_NOTES.md
```

Verify the build still produces 91 pages with `astro check` 0/0/0 and `npm run build` clean before committing.

Commit message:
```
chore(migration): remove Jekyll source files (M1.9 cleanup)

Strip the 24 dead-code Jekyll artifacts that survived the merge for
rollback purposes. 7-day fallback window ended 2026-05-04 with no
rollback signal — fallback retired, dead code now safe to delete.

Files removed:
- _config.yml, _includes/, _layouts/  (Jekyll machinery)
- index.md / pricing.md / support.md / about.md / changelog.md /
  privacy.md / terms.md  (Jekyll content; replaced by src/pages/*)
- 404.html  (replaced by src/pages/404.astro)
- robots.txt, sitemap.xml  (replaced by src/pages/robots.txt.ts +
  @astrojs/sitemap dynamic generation)
- CNAME  (GH Pages custom domain; Cloudflare Pages handles via UI)
- assets/  (duplicated in public/; public/ is the live serve dir)
- DESIGN_NOTES.md  (Jekyll-era stale doc)
```

## Cleanup item 2 — Remove the failing Jekyll build workflow

GitHub Pages auto-builds from `main` and has been failing on every push since the merge (Astro source isn't valid Jekyll). After Jekyll source is gone (item 1), it'd fail differently. Either way, the workflow is dead — it served no purpose post-fallback-window.

Note: this is the GitHub-managed `pages-build-deployment` workflow, NOT our `.github/workflows/ci.yml`. It can't be deleted from the repo because GitHub manages it. Instead:

- [ ] Cloudflare/GitHub UI step: **Settings → Pages → Source → "None"** (disables the auto-build)

This stops the failed-build noise on every push.

## Cleanup item 3 — Flip repo to private

After items 1 + 2 ship and the live site stays green:

- [ ] GitHub UI step: `rentledger-site` → **Settings → Danger Zone → Change repository visibility** → Private
- [ ] Cloudflare Pages will keep building because it has a stored OAuth token; verify by pushing a no-op commit and watching the deploy

If Cloudflare loses the token (rare): re-authorize via Workers & Pages → Settings → Git source → Reconnect.

## Cleanup item 4 — Bump DNS TTL back to default

The cutover TTL was already short (Cloudflare-managed default), so this might be a no-op. Check:

```bash
dig rentledger.org +noall +answer
```

If the TTL is < 3600, raise it in Cloudflare DNS UI. Default `Auto` is fine for most records.

## Cleanup item 5 — Confirm and close the milestone

- [ ] Update `.migration-snapshots/m1-7-cutover-result.md` "Open M1.8 tasks" sections — strike through completed items
- [ ] Add a closing note to `Marketing/SEO-PLAYBOOK.md` §5 marking the entire Phase 1 as ✅ Done
- [ ] Verify CI green on the cleanup PR before merging

## Out-of-scope follow-ups (not blockers; track separately)

- Founder headshot at `public/images/founder.webp` — graceful-degrades to 404 today; deferred until a real photo is captured
- Re-run Rich Results Test against a `/blog/*` post + a real `/compare/*` page (Article + Review schema validation) — gated on first content publish, not a Phase 1 task
- Phase 2 starts with M2.1 press kit (~3 hours) and M2.2 Tier 1 content shipping
