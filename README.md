# Hajj Medical Center — landing page

Static, dependency-free landing page (`index.html`, `styles.css`, `script.js`).

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Deploy on Render

**Blueprint:** New → Blueprint → select this repo. `render.yaml` sets it up as a static site.

**Manual:** New → Static Site → select this repo. Leave the build command empty and set the publish directory to `.`.

## Before going live

- Replace the placeholders: `[Opening hours]`, `[Address]`, `[Email]`, `[Hours]` and `[Dr. First Last]`.
- The booking and contact forms only work in the browser for now. Connect them to a form backend (e.g. Formspree) or an email service to receive submissions.

Photos are loaded from [Unsplash](https://unsplash.com) under the Unsplash License.
