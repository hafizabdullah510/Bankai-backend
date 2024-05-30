import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";
import { renewLimit } from "./controllers/CardController.js";
import { payLoan } from "./controllers/TransactionController.js";
import User from "./models/UserModel.js";
import { SendNotification } from "./utils/notificationFunctions.js";
import { getFormattedDateAndTime } from "./utils/dateAndTime.js";
import { saveUserNotifications } from "./utils/saveUserNotifications.js";

//Routes
import AuthRouter from "./routes/AuthRoutes.js";
import UserRouter from "./routes/UserRoutes.js";
import CardRouter from "./routes/CardRoutes.js";
import AdminRouter from "./routes/AdminRoutes.js";
import TransactionRouter from "./routes/TransactionRoutes.js";
import UserTransactionsRouter from "./routes/UserTransactions.js";

//Middlewares
import errorHandlerMiddleware from "./middlewares/errorHandlerMiddleware.js";
import {
  authenticationMiddleware,
  isUserBlocked,
} from "./middlewares/authMiddleware.js";

//app initialization
const app = express();

//app Middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//APIs
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/user", authenticationMiddleware, UserRouter);
app.use("/api/v1/admin", authenticationMiddleware, AdminRouter);
app.use("/api/v1/card", authenticationMiddleware, isUserBlocked, CardRouter);
app.use("/api/v1/transaction", TransactionRouter);
app.use(
  "/api/v1/user_transactions",
  authenticationMiddleware,
  UserTransactionsRouter
);

//Onfido verification
app.post("/api/v1/onfido_verification", async (req, res) => {
  let message = "";
  const { payload } = req.body;
  if (payload.action === "workflow_task.completed") {
    const userCnic = payload.resource?.input?.custom_data?.document_number;
    if (userCnic) {
      const user = await User.findOne({ cnic: userCnic });
      user.kycStatus = "pending";
      message = "Your KYC is being verified.Please Wait";
      await saveUserNotifications(
        message,
        getFormattedDateAndTime().formattedDate,
        getFormattedDateAndTime().formattedTime,
        user._id
      );
      SendNotification(message);
      await user.save();
    }
  }
  if (payload.action === "workflow_run.completed") {
    const { object } = payload;
    const applicantId = payload.resource?.applicant_id;
    if (applicantId) {
      const user = await User.findOne({ applicantId });
      if (object.status === "approved") {
        user.kycStatus = "verified";
        message = "Your KYC has been verified";
        await saveUserNotifications(
          message,
          getFormattedDateAndTime().formattedDate,
          getFormattedDateAndTime().formattedTime,
          user._id
        );
        SendNotification(message);
        await user.save();
      }
    }
  }
  res.status(StatusCodes.OK).json({ msg: "ok" });
});

//.well-known for app binding
app.get("/.well-known/assetlinks.json", (req, res) => {
  fs.readFile(process.cwd() + "/.well-known/assetlinks.json", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }
    // Parse the JSON data
    const jsonData = JSON.parse(data);
    // Set response headers
    res.writeHead(200, { "Content-Type": "application/json" });
    // Send the JSON data as response
    res.end(JSON.stringify(jsonData));
  });
});

//cron jobs
app.use("/renew_limit", renewLimit);
app.use("/pay_loan", payLoan);

//No Route Exists
app.use("*", (req, res) => {
  res.status(404).json({ msg: "Routes does not exists" });
});
//Handles errors other than Route does not exists
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5200;

//DB connection
try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`server is listening at port ${port}`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
