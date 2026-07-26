# CI/CD Practice — A Tiny Node.js App

![CI/CD Pipeline](https://github.com/${{ github.repository }}/workflows/CI/CD%20Pipeline/badge.svg)
> A minimal JavaScript math app + tests, built for the **sole purpose of learning CI/CD**.
> Everything is kept **dependency-free** so the pipeline stays simple and readable.

---

## What's inside

| File | What it is |
|------|------------|
| `src/index.js` | The app — a tiny math module |
| `test/index.test.js` | Automated tests (Node's built-in runner) |
| `package.json` | Project metadata + the `test` script |
| `CLAUDE.md` | Project rules (e.g. no push without permission) |
| `.github/workflows/ci.yml` | The CI/CD pipeline (**you create this** — see below) |
| `README.md` | This file |
| `NEXT_STEPS.md` | **Learning roadmap** — what to study next (start here tomorrow) |

## Project structure

```
ci-cd-practice/
├── .github/
│   └── workflows/
│       └── ci.yml            # the CI/CD pipeline (create this file)
├── src/
│   └── index.js             # the app
├── test/
│   └── index.test.js        # the tests
├── package.json
├── CLAUDE.md
└── README.md
```

---

## The app

`src/index.js` exports four small **pure** functions:

```js
add(a, b)        // returns a + b
subtract(a, b)   // returns a - b
multiply(a, b)   // returns a * b
divide(a, b)     // returns a / b; throws "Cannot divide by zero" if b === 0
```

It uses **ES modules** (`"type": "module"` in `package.json`), so files use `import` / `export`.

## The tests

`test/index.test.js` uses Node's **built-in** test runner (`node:test`) — there is **no test library to install**. Five tests cover all four functions, including the divide-by-zero error.

---

## Run it locally

**Prerequisites:** Node.js 18+ (this was built on v20).

```bash
# Run the test suite — this is exactly what CI will call
npm test

# Run the app directly (ES module → use a dynamic import)
node -e "import('./src/index.js').then(m => console.log(m.add(2,3)))"

# Or make a tiny script and run it:
#   // run.js
#   import { add } from './src/index.js';
#   console.log(add(2, 3));
# then:  node run.js
```

No `npm install` is needed locally — there are **zero dependencies**.

---

## CI/CD, explained

- **CI (Continuous Integration):** every code change is automatically built and tested.
- **CD (Continuous Delivery/Deployment):** once tests pass, code is automatically shipped.

A typical pipeline:

```
1. Trigger     → push / pull request
2. Checkout    → download the repo onto the runner
3. Environment → install runtime + dependencies
4. Build       → compile (none needed for plain JS)
5. Test        → run tests               ← the quality gate
6. Deploy      → ship it                 ← the "CD" part
```

For this project, steps **2–5** are the whole thing (no build, no real deploy yet).

---

## The GitHub Actions workflow

GitHub Actions only runs **in the cloud, on a GitHub repo** — the YAML file does nothing on your machine. It is a set of instructions GitHub follows after you push.

### Create the file

Save this as **`.github/workflows/ci.yml`**:

```yaml
name: ci-practice

on:
  push:
    branches:
      - main
      - master

jobs:
  run-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: setup node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test

  deploy:
    runs-on: ubuntu-latest
    needs: run-test
    steps:
      - name: deploy
        run: echo "deploying"
```

### What each part means

| Part | Meaning |
|------|---------|
| `name` | Workflow label (cosmetic — shown in the Actions tab) |
| `on` | **Required.** The trigger. Runs on push to `main` or `master` |
| `jobs` | **Required.** The work. Two jobs: `run-test` and `deploy` |
| `runs-on: ubuntu-latest` | The cloud machine. Must be a GitHub runner label (`ubuntu-latest`, `windows-latest`, `macos-latest`). **Not** a Docker image like `alpine:latest` |
| `steps` | **Required per job.** Ordered commands/actions |
| `uses: actions/checkout@v4` | Reuse GitHub's official action to clone your repo |
| `uses: actions/setup-node@v4` | Reuse GitHub's action to install Node.js |
| `with: node-version: 20` | Arguments passed into that action |
| `run: npm test` | Run a shell command. If it fails (non-zero exit), the build goes **red** |
| `needs: run-test` | `deploy` waits for `run-test` to pass. If tests fail, `deploy` is **skipped** — this arrow is the CI → CD bridge |

### YAML rules to remember

- **Indentation matters** (space-sensitive, like Python).
- Every step needs **`uses` OR `run`** — not both, not neither.
- `name` is **optional** everywhere — just a label for the UI.
- A job runs on its **own fresh machine**; jobs do **not** share files or state.
- `actions/checkout` is literally a public repo (`github.com/actions/checkout`) — `uses:` just points to it; GitHub downloads and runs it at runtime.

---

## Get it running on GitHub

1. Save the workflow above as `.github/workflows/ci.yml`.
2. Initialize git and push to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Add app, tests, and CI workflow"
   # create a repo on GitHub, then:
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
   > ⚠️ Per `CLAUDE.md`, **no code is pushed to GitHub without explicit permission.**
   > Run the push yourself, or tell me "push it" and I will.
3. Open the **Actions** tab → watch `run-test` go green, then `deploy` run automatically.

---

## Try breaking it (learning exercise)

1. In `test/index.test.js`, change an expectation, e.g.:
   `assert.equal(add(2, 3), 5)` → `assert.equal(add(2, 3), 6)`
2. Commit and push.
3. Watch the build go **red**, and `deploy` get **skipped**. That's the gate protecting you.
4. Revert the change so tests are green again.

---

## Next challenges

> 📌 **Full learning roadmap is in [`NEXT_STEPS.md`](./NEXT_STEPS.md)** — the topics our toy pipeline
> skipped (PRs & branch protection, secrets, artifacts, matrix, real deploy, caching, and more),
> organized in tiers with a recommended order. **Start there tomorrow.**

- **Matrix** — test against Node 18 *and* 20 at once:
  ```yaml
  run-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
  ```
- **Parallel jobs** — add a `lint` job next to `run-test` (no `needs`).
- **Real deploy** — replace the `echo` with an actual publish (npm, a server, etc.).

---

## Glossary (reference for later)

| Term | Meaning |
|------|---------|
| **CI** | Continuous Integration — auto-build & test on every change |
| **CD** | Continuous Delivery/Deployment — auto-ship after tests pass |
| **Workflow** | A `.yml` file describing the pipeline |
| **Job** | A unit of work on one machine; runs in parallel by default |
| **Step** | One action or command inside a job |
| **`uses`** | Run a prebuilt action (e.g. `actions/checkout`) |
| **`run`** | Run a shell command |
| **`needs`** | Make a job wait for another job to succeed |
| **`runs-on`** | Which machine/OS the job runs on |
| **`matrix`** | Run one job across multiple variations |
| **Action** | Reusable packaged code, published as a GitHub repo |
| **Artifact** | A file passed between jobs (since jobs don't share state) |

---

## Rules

See `CLAUDE.md`: **do not push to GitHub without the user's explicit permission.**
