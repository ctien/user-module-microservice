import mongoose from "mongoose";
import { MONGO_URL } from "../config/env";

export default () => {
  console.log("Connecting database...");

  mongoose.connect(
    MONGO_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (error) => {
      if (error) {
        console.error("Please make sure Mongodb is installed and running!");
        throw error;
      }
    }
  );
  mongoose.set("useCreateIndex", true);
};
