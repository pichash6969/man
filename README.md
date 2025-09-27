# Fixed Random Number Generator (Admin Control)

This is a static website (HTML/CSS/JS) that provides two generators:
- 00 - 99 (2 digits)
- 000 - 999 (3 digits)

It includes a client-side **Admin Panel** protected by a password (client-side). Settings are saved in the browser's `localStorage`, so they persist per-browser on the machine where the admin sets them.

**Important:** This is a static, client-side solution intended for use on GitHub Pages or similar static hosts. Admin password and settings are stored client-side (not secure for sensitive uses). For production security, a proper backend is required.

## How to use
1. Open `index.html` in a browser to test locally.
2. Edit `script.js` to change the default admin password (line near the top).
3. Upload the three files (`index.html`, `style.css`, `script.js`) to a GitHub repository.
4. Enable GitHub Pages for the repository (branch `main`, folder `/`).
5. Visit `https://your-username.github.io/your-repo-name/` to see the site live.

## Files
- index.html
- style.css
- script.js
- README.md
