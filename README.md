# Pinecone RoofShield

An interactive, illustrative model-house demo of an adaptive roof. Move the environment sliders to see the roof shingles change position and read the simulated system telemetry.

## Run locally

Serve the `dist` directory with any static HTTP server. For example:

```sh
python3 -m http.server 4173 --directory dist
```

Then open `http://localhost:4173/`.

## Deploy

The site is published from the root of the `gh-pages` branch. In **Settings → Pages**, choose **Deploy from a branch**, then `gh-pages` and `/(root)`.

After changing `dist/` on `main`, publish an update with:

```sh
git subtree push --prefix dist origin gh-pages
```

The environmental readings, roof response, and temperature estimates are simulated for demonstration, not measured building performance. The installed Boston Angel font is used when available; other visitors see the system-font fallback. Device image attribution is included in the demo's “Image sources” panel.
