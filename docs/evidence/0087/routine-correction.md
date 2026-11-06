# Canonical routine test correction

Reproduced the exact e02a747 town failure. The assertion required the fallback hook ID even though the town map supplies an authored xiao-li hook. Compiler diagnostics were empty because suppression is intentional.

The actual-map test now requires the canonical actor's authored identity and uniqueness when provided. It checks sampled collision safety, arrival clearance, exit clearance, nonstatic motion and dwell phases. If no authored hook exists, it requires the fallback. A separate real-town fixture removes authored xiao-li hooks and verifies exactly one valid moving office fallback. No actor is added to satisfy an incidental ID, and no zero-actor case is accepted.

Verification used cloud Node 22.23.4 through an ephemeral official npm runtime. The focused six tests passed with --maxWorkers=1; TypeScript passed. Exact JSON is routine-correction.json. The complete assembly merge keeps published landscape-owner 6732017 files intact and foundation e02a747 shared consumers. No external-owner source was hand-edited.

Production life acceptance remains open. New canonical silhouettes at 01e67d2 and four delivered sole-map hooks are consumed in this proof branch; town courier delivery remains pending in the fetched map source. Ordinary-input production proof is prepared under life/production.spec.ts.
