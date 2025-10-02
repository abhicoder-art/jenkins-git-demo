import express from "express";

export function getGreeting() {
  const id = process.env.BUILD_ID || "dev";
  return `Hello 3rd time, again from Jenkins CI/CD! Build: ${id}`;
}

export function createApp() {
  const app = express();
  app.get("/", (_req, res) => res.send(getGreeting()));
  return app;
}

export default createApp;
