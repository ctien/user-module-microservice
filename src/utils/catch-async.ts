import { Handler, Request, Response, NextFunction } from "express";

const catchAsync = (fn: Handler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
export default catchAsync;
