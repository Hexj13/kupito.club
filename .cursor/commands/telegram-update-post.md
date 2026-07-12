# Telegram: post about unreleased updates for Kupito.club

From the current branch, determine unreleased changes, then write a short Telegram post about how the product is evolving. Output only the post text; no explanations or technical details.

## 1. Find unreleased changes

From repo root, compare current branch with the release branch (`origin/main` or your main branch):

```bash
git diff origin/main...HEAD
git log --oneline origin/main...HEAD
```

Treat the diff and commits as the set of unreleased changes.

## 2. Post requirements

- **Language:** Russian, for non-technical users. No file names, components, diffs, endpoints.
- **Focus:** What changed for the user—easier, faster, clearer, more reliable, or safer.
- **Tone:** Calm and neutral, no marketing fluff.

## 3. Post format

- First line: `Обновления по Kupito.club.`
- Then 2–6 sections. Each section:
  - starts with `📍` and a short one-line subheading;
  - is followed by 1–3 short sentences that explain the change and its benefit in simple language.

Example (structure only, do not copy text):

```
Обновления по Kupito.club.

📍Фото-галерея прямо в карточках
...

📍Маскировка номерных знаков (повышение точности)
...
```

## 4. Output

Return **only** the final post text in the format above. No extra explanations, comments, or technical details.
