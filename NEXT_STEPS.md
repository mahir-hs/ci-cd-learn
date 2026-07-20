# CI/CD Learning Roadmap — What's Next

> Pick up here tomorrow. These are the parts of CI/CD our toy pipeline **skipped**.
> Suggested order: **A → C → B → D**, then Tier 3 whenever.
> Everything here is **free** to do on GitHub.

---

## ✅ What's already done (recap)

- Workflow structure: `on` / `jobs` / `steps`
- `uses` vs `run`, `name`, `needs`
- GitHub-hosted runner (`ubuntu-latest`), YAML rules
- A `run-test` job + a placeholder `deploy` job gated by `needs`
- Core idea: **code change → automated test → automated ship**

---

## 🟥 TIER 1 — The *real* CI gate (do these first)

### A) Pull Requests + Branch Protection  ⭐ start here
**Why:** We pushed straight to `main`. Real CI runs on **PRs** and *blocks the merge* until checks pass. This is the actual point of CI.

**Steps:**
1. Make sure the workflow triggers on PRs (it already does):
   ```yaml
   on:
     pull_request:
       branches: [main]
   ```
2. On GitHub: **Settings → Branches → Add branch protection rule** for `main`.
3. Enable **"Require status checks to pass before merging"** and select `run-test`.
4. Test it: create a branch, open a PR, and see the check block/allow the merge.
   ```bash
   git checkout -b feature/test-ci
   # make a small change, commit, push
   git push -u origin feature/test-ci
   # open a PR on GitHub
   ```

### C) Artifacts (build → deploy handoff)
**Why:** Jobs run on separate machines and **don't share files**. Artifacts pass files between them.

**Steps:**
```yaml
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "hello" > output.txt
      - uses: actions/upload-artifact@v4
        with:
          name: my-build
          path: output.txt

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: my-build
      - run: cat output.txt   # now it's here!
```

### B) Secrets + a real deploy (GitHub Pages)
**Why:** Our deploy was just `echo`. Real deploys need tokens/keys — **never hardcode them.**

**Steps:**
1. Store a secret: **Settings → Secrets and variables → Actions → New repository secret**.
2. Use it in a step:
   ```yaml
   - name: deploy
     run: ./deploy.sh
     env:
       API_TOKEN: ${{ secrets.API_TOKEN }}
   ```
3. For a *real free deploy target*, try **GitHub Pages** (great for a static site) or
   `npm publish` / **Netlify** / **Vercel** actions. GitHub Pages needs no external secret.

### D) Matrix (cross-version testing)
**Why:** Run the same tests across multiple Node versions at once — catches version-specific bugs.

**Steps:**
```yaml
  run-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
```

---

## 🟧 TIER 2 — Making it production-like

| Topic | What to add | Key thing |
|-------|-------------|-----------|
| **Caching** | `actions/cache` for `node_modules` | Speeds up CI by skipping re-downloads |
| **Lint** | a `lint` job running ESLint | Extra quality gate, runs parallel to tests |
| **Security scan** | `run: npm audit` | Flags vulnerable dependencies |
| **Environments + approvals** | `environment: production` | Adds a **manual approval button** before prod deploy |

**Caching example:**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'      # simplest built-in cache
```

---

## 🟨 TIER 3 — Scale & polish (later)

| Topic | What it is |
|-------|------------|
| **Reusable workflows** | `workflow_call` — share one pipeline across many repos |
| **Self-hosted runners / containers** | Run jobs on your own machine or inside a custom Docker image (the `alpine` idea done right, via `container:`) |
| **Other triggers** | `schedule` (cron / nightly runs), `workflow_dispatch` (manual "Run" button) |
| **Concurrency** | Cancel redundant/duplicate runs automatically |
| **Notifications** | Ping Slack/email/Discord on failure |
| **Local testing** | `nektos/act` — run your workflow locally *before* pushing |

---

## 🎯 Recommended next mini-project

> Build a **PR-based flow with branch protection (A)**, pass a build between jobs with **artifacts (C)**, do a **real GitHub Pages deploy using a secret (B)**, and run tests across a **matrix (D)**.

That single project touches the 4 biggest gaps at once — all free.

---

## Quick reference links (look these up)

- GitHub Actions docs: https://docs.github.com/actions
- Marketplace (find actions): https://github.com/marketplace?type=actions
- `actions/checkout`, `actions/setup-node`, `actions/cache`,
  `actions/upload-artifact`, `actions/download-artifact` — all official

---

## ⚠️ Reminder

Per `CLAUDE.md`: **no code is pushed to GitHub without your explicit permission.**
To work on this "on another machine," this repo (including this file) must be on GitHub —
so you'll need to push it first (`git push`) when you're ready.
