import { PORT } from "../config/env";
import { Application } from "express";

export default (server: Application) => {
  console.log("start server...");

  server.listen(PORT, () => console.log("server is running at", PORT));
};
