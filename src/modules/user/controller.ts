import { Request, Response } from "express";
import * as factory from "../common/handler-factory";
import { User } from "./model/model";
import { catchAsync, AppError } from "../../utils";

export const getAll = factory.getAll(User);
export const getOne = factory.getOne(User);
export const createOne = factory.createOne(User);
export const deleteOne = factory.deleteOne(User);
export const updateOne = factory.updateOne(User);

export const getMe = (req: Request, res: Response) => {
  res.send(req.body.user);
};

export const deleteMe = catchAsync(async (req, res, next) => {
  const { _id } = req.body.user;
  try {
    await User.deleteOne({ _id });
  } catch (error) {
    return next(new AppError(error.message, 401));
  }

  res.send("User Deleted!");
});
