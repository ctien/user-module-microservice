import express, { Application } from "express";

import connectDatabase from "./setup/connect-database";
import loadModules from "./setup/load-modules";
import loadRouter from "./setup/load-router";
import startServer from "./setup/start-server";

const server: Application = express();

loadModules(server);
connectDatabase();
loadRouter(server);
startServer(server);
