# Imported content

From the NurseBound app (github.com/kenyanfreshy/usrn-pathway-app), imported 2026-10-13.

- `bank.json`: 1205 live NCLEX questions (active, not retired; items flagged "Debatable key" excluded).
- `ngn.json`: 8 Next Generation NCLEX unfolding case studies, 48 items.

Re-run `node content/import_nursebound.mjs <path-to-usrn-pathway-app>` to refresh. Ids are kept (prefixed nb: / ngn:).
