import { createApp } from "./app.js";
const port = process.env.PORT || 3000;
const app = createApp();
app.listen(port, "0.0.0.0", () => console.log(`App listening on ${port}`));
