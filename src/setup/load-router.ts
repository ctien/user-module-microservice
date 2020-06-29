import {Application} from "express"
import routers from "./routers";

export default (server: Application) => {
  console.log("Routers loading...");

  server.use("/api/v1", routers);
};
