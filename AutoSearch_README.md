# AutoSearch (Frontend-Only)

AutoSearch is a tiny **React + TypeScript** app (Vite) that shows **real-time Google search suggestions** using **JSONP**.  
No API keys, no backend server — just download, install, and run.

---

## 📦 Download & Setup

1) Extract the project to a folder (e.g., `C:\Users\<you>\PycharmProjects\AutoSearch` or `~/Projects/AutoSearch`).  
2) Open that folder in your editor (PyCharm/VS Code/WebStorm).  
3) From the project root (where `package.json` lives), run:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**). Type in the box to see suggestions.

> **PyCharm Tip (Windows):** Use the built-in Terminal. Make sure you are in the folder that contains `package.json` before running the commands.

---

## ✅ Requirements

- **Node.js** ≥ 18 (Node 20/22 recommended)
- A browser that allows loading `<script>` from `https://suggestqueries.google.com`  
  (If your environment uses a strict Content Security Policy, see **CSP** note below.)

---

## 🗂️ Project Structure

```
AutoSearch/
├─ index.html                 # Vite entry (loads /src/main.tsx)
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
└─ src/
   ├─ main.tsx                # Mounts the app and SearchBar
   └─ components/
      └─ SearchBar.tsx        # JSONP Google Suggest component
```

---

## 🔧 How It Works (JSONP)

The `SearchBar` calls Google Suggest via JSONP to avoid CORS and keys:

```
https://suggestqueries.google.com/complete/search
  ?client=chrome
  &q=<query>
  &hl=<lang>
  &gl=<region>
  &ds=<vertical?>
  &callback=<generated_fn>
```

The endpoint returns a JavaScript snippet invoking the given `callback` with suggestions.  
We parse that into a list of `{ id, title }` and render them in an ARIA-compliant listbox.

### Props you can tweak
- `hl`: language (`"en"`, `"es"`, ...)
- `gl`: region (`"us"`, `"gb"`, ...)
- `ds`: vertical (`""`=Web, `"yt"`=YouTube, `"news"`, `"books"`, ...)
- `minChars`, `limit`, `placeholder`
- `onSelect` callback when a suggestion is chosen

---

## 🧪 Build & Preview

```bash
npm run build     # Type-check & build for production
npm run preview   # Preview the production build locally (serves /dist)
```

---

## 🛡️ CSP / Network Notes

If your org enforces a strict **Content Security Policy**, you may need to allow:
```
script-src https://suggestqueries.google.com 'self'
```
This is required because JSONP loads suggestions via a `<script>` tag.

---

## 🩺 Troubleshooting

**npm ERR! enoent Could not read package.json**  
→ You are not in the project root. `cd` into the folder that contains `package.json` first.

**TypeScript errors about React or Promise types**  
→ Ensure dependencies are installed and `tsconfig.json` includes:
```json
{ "lib": ["ES2020","DOM","DOM.Iterable"], "jsx": "react-jsx", "moduleResolution": "bundler" }
```
Then re-run `npm install`.

**No suggestions appear**  
- Open DevTools → Console for JSONP errors/timeouts.  
- Try typing more characters.  
- Check if CSP is blocking `suggestqueries.google.com`.

---

## 🧹 Recommended .gitignore

```
node_modules
dist
.vscode
.idea
.DS_Store
```

---

## 📝 License

MIT — use freely for learning, tests, and demos.
