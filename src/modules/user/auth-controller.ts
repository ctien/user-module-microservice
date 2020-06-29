import { Request, Response, NextFunction } from "express";
import { promisify } from "util";
import jwt from "jsonwebtoken";

import { catchAsync, AppError } from "../../utils";
import { User, IUser } from "../user";
import {
  JWT_COOKIE_EXPIRES_IN,
  JWT_EXPIRES_IN,
  JWT_SECRET,
} from "../../config/env";

interface IDecoded {
  id?: string;
  iat?: number;
  exp?: number;
}

const getToken = (req: Request) => {
  let token: string;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  return token;
};

const decodeToken = async (token: string): Promise<IDecoded> => {
  return await promisify<string, string, IDecoded>(jwt.verify)(
    token,
    JWT_SECRET
  );
};

const signToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const createSendToken = (
  user: IUser,
  statusCode: number,
  req: Request,
  res: Response
) => {
  // 1) Create token
  const token = signToken(user._id);

  // 2) Send token
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // ===> Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token: string = getToken(req);

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded: IDecoded = await decodeToken(token);

  // 3) Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.body.user = user;
  next();
});

export const signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, req, res);
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return res.send("Please enter email and password!");
  }

  // 2) Check if user exists && password is correct
  const user: IUser = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.send("Email can not found!");
  }

  const correct: boolean = await user.correctPassword(password, user.password);

  if (!correct) {
    return res.send("password error!");
  }

  // 3) If everything ok, create and send token to client
  createSendToken(user, 200, req, res);
});

export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    // await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

export const isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verification token
      const decoded: IDecoded = await decodeToken(req.cookies.jwt);

      // 2) Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = user;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.body.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

export const updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordCurrent, passwordConfirm } = req.body;

  // 1) check new password with current password
  if (password === passwordCurrent) {
    return next(
      new AppError("new password should be different old password.", 401)
    );
  }

  // 2) Get and decode token
  let token: string = getToken(req);
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded: IDecoded = await decodeToken(token);

  // 3) Check if user still exists
  const user: IUser = await User.findById(decoded.id).select("+password");

  if (!user) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
  res.send(req.body);
});

// export const resetPassword = catchAsync(async (req, res, next) => {
//   // 1) Get user based on the token
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   // 2) If token has not expired, and there is user, set the new password
//   if (!user) {
//     return next(new AppError("Token is invalid or has expired", 400));
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();

//   // 3) Update changedPasswordAt property for the user
//   // 4) Log the user in, send JWT
//   createSendToken(user, 200, req, res);
// });
