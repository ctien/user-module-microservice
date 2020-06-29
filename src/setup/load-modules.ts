import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";

export default (server: Application) => {
  console.log("modules loading...");

  if (server) {
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(cors());
    server.use(express.static("public"));
  }
};
