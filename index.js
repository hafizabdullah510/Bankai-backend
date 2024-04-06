import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";
import { renewLimit } from "./controllers/CardController.js";
import { payLoan } from "./controllers/TransactionController.js";
import User from "./models/UserModel.js";
const app = express();

//Routes
import AuthRouter from "./routes/AuthRoutes.js";
import UserRouter from "./routes/UserRoutes.js";
import CardRouter from "./routes/CardRoutes.js";
import TransactionRouter from "./routes/TransactionRoutes.js";
import UserTransactionsRouter from "./routes/UserTransactions.js";

//Middlewares
import errorHandlerMiddleware from "./middlewares/errorHandlerMiddleware.js";
import { authenticationMiddleware } from "./middlewares/authMiddleware.js";

app.use(express.json());

app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// to pay loan of virtual cards
// const renewRule = new schedule.RecurrenceRule();
// rule.hour = 0;
// rule.minute = 40;
// rule.second = 0;
// rule.tz = "Etc/GMT-5";
// const renewLimitJob = schedule.scheduleJob(renewRule, renewLimit);
// const payLoanRule = new schedule.RecurrenceRule();
// rule.hour = 0;
// rule.minute = 40;
// rule.second = 50;
// rule.tz = "Etc/GMT-5";
// const payLoanJob = schedule.scheduleJob(payLoanRule, payLoan);

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/user", authenticationMiddleware, UserRouter);
app.use("/api/v1/card", authenticationMiddleware, CardRouter);
app.use("/api/v1/transaction", TransactionRouter);
app.use(
  "/api/v1/user_transactions",
  authenticationMiddleware,
  UserTransactionsRouter
);
//Onfido verification
app.post("/api/v1/onfido_verification", async (req, res) => {
  const { payload } = req.body;
  if (payload.action === "workflow_task.completed") {
    const userCnic = payload.resource?.input?.custom_data?.document_number;
    if (userCnic) {
      const user = await User.findOne({ cnic: userCnic });
      user.kycStatus = "pending";
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
        await user.save();
      }
    }
  }
  res.status(StatusCodes.OK).json({ msg: "ok" });
});

//cron jobs
app.use("/renew_limit", renewLimit);
app.use("/pay_loan", payLoan);

app.use("*", (req, res) => {
  res.status(404).json({ msg: "Routes does not exists" });
});
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5200;

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`server is listening at port ${port}`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
