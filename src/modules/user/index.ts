import router from "./router";
import { User, IUser, IUserModel } from "./model/model";
import * as auth from "./auth-controller";

export { User, IUser, IUserModel, router as userRouter, auth };
export default router;
