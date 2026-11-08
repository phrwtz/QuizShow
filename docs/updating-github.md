# Updating QuizShow from this Mac

The local repository is `/Users/paulhorwitz/Code/Probability`, with `main` connected to `https://github.com/phrwtz/QuizShow.git`.

After changing code or artwork:

```sh
cd /Users/paulhorwitz/Code/Probability
python3 scripts/prepare-pages.py
node game-logic.test.mjs
git add .
git commit -m "Describe the change"
git push
```

GitHub Pages publishes `main` from the repository root. The four fixed versions share the root JavaScript, CSS, and artwork; the prepare script regenerates their HTML after changes to the root template. The root page keeps the interactive review controls.

The GitHub CLI (`gh`) provides authentication. If needed, run `gh auth login --hostname github.com --git-protocol https --web` and approve GitHub's browser authorization. Do not put passwords or tokens in source files.

Generated ZIP archives and Finder metadata are ignored by Git. All project graphics are under 2 MB each and can be pushed normally without Git LFS.
