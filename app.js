import express from "express";

export function getGreeting() {
  const id = process.env.APP_VERSION || process.env.BUILD_ID || "dev";
  return `Hello from Jenkins CI/CD! Mandaar Sir Build: ${id}`;
}

export function createApp() {
  const app = express();

  app.get("/", (_req, res) => {
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CI/CD Demo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: system-ui, Arial, sans-serif; margin: 2rem; }
    h1 { margin-bottom: 1rem; }
    button { padding: .6rem 1rem; border: 0; border-radius: .5rem; cursor: pointer; }
    button:hover { filter: brightness(0.95); }
  </style>
</head>
<body>
  <h1>${getGreeting()}</h1>
  <button id="pingBtn">Ping server</button>

  <script>
    document.getElementById('pingBtn').addEventListener('click', async () => {
      try {
        const r = await fetch('/ping');
        const t = await r.text();
        alert(t);
      } catch (e) {
        alert('Ping failed: ' + e);
      }
    });
  </script>
</body>
</html>`;
    res.type("html").send(html);
  });

  // Endpoint the button calls
  app.get("/ping", (_req, res) => {
    res.type("text").send("Pong! " + new Date().toLocaleString());
  });

  return app;
}

export default createApp;
