import "./config/env.js";
import connectDB from "../config/db.js";
import { app } from "./app.js";
import { startImageCleanup } from "./services/imageCleanup.js";

if (!process.env.JWT_SECRET) throw new Error("Set JWT_SECRET in packages/server/.env");
if (process.env.NODE_ENV === "production" && !process.env.CLIENT_ORIGINS) throw new Error("Set CLIENT_ORIGINS to your HTTPS frontend origin");
const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  const stopCleanup = startImageCleanup();
  const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  for (const signal of ["SIGTERM", "SIGINT"]) process.once(signal, () => {
    stopCleanup();
    server.close(() => process.exit(0));
  });
});
