# Learn R/C Fixed Wing

**From mission to maiden flight** — a hands-on, calculation-backed guide to designing, building, and
flying your own fixed-wing R/C airplane. Learn by doing: size a real wing, balance a real tail, and
check your numbers with the interactive design calculator.

**Live site:** https://akanwar.github.io/learnrcfixedwing/

This is a self-contained static website: plain HTML + CSS + a little vanilla JS. No build step, no
frameworks. Open `index.html` on your own computer right now (double-click it) and everything works.

## What's in here

```
index.html            The Hangar (home page — start here)
flightplan.html       The design loop, chapter map, bench kit, safety
chapter-01.html …     Seven chapters: design → wing → tail & balance →
chapter-07.html         worked trainer → airfoils → structure → systems/test/fly
mathshelf.html        Derivations, the lift curve, induced drag, Reynolds number
designer.html         Interactive design calculator (live three-view + tradeoffs)
designer.js           The calculator's logic (MIT licensed)
worksheet.html        Printable one-page design worksheet
checklists.html       Printable build gates, preflight, and maiden-flight plan
rc-design.ipynb       The sizing chain as a Python notebook (opens in Google Colab)
hangar.css            Shared styles
```

Print any sheet with the browser's Print command — navigation hides itself automatically.
Chapter "sign-off" stamps on the home page are saved in the browser, per device.

## Publishing to GitHub Pages (one-time, ~5 minutes)

1. Push this folder to a public GitHub repository.
2. Repo **Settings → Pages** → under *Branch*, choose `main` and `/ (root)`, then **Save**.
3. Wait a minute, refresh: your site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

To change anything later, edit the file and push — the site updates within a minute.

## Contributing

Spotted an inaccuracy? Please open an issue or a pull request — corrections are the whole point
of hosting this on GitHub. See [CONTRIBUTING.md](CONTRIBUTING.md) for the two-minute version.

## Accuracy

This guide was drafted with AI assistance and reviewed by a human, but it will contain mistakes.
Treat every number as a starting point, not gospel: verify against the primary sources linked
throughout (NASA Glenn, MIT OCW 16.01, the UIUC airfoil database, the AMA safety code) and your
own measurements before you cut material or fly.

## License

- **Content** (text, diagrams, printables): [Creative Commons Attribution 4.0](LICENSE) (CC BY 4.0).
  Reuse and adapt freely — with attribution, e.g.:
  > Based on *learnrcfixedwing* by Ansh Kanwar — github.com/akanwar/learnrcfixedwing
- **Code** (`designer.js`, `rc-design.ipynb`, inline scripts): [MIT](LICENSE-CODE).
