import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { renewLimit } from "./controllers/CardController.js";
import { payLoan } from "./controllers/TransactionController.js";
import schedule from "node-schedule";
const app = express();

//Routes
import AuthRouter from "./routes/AuthRoutes.js";
import UserRouter from "./routes/UserRoutes.js";
import CardRouter from "./routes/CardRoutes.js";
import TransactionRouter from "./routes/TransactionRoutes.js";

//Middlewares
import errorHandlerMiddleware from "./middlewares/errorHandlerMiddleware.js";
import { authenticationMiddleware } from "./middlewares/authMiddleware.js";

app.use(express.json());

app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// to pay loan of virtual cards
const renewRule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 40;
rule.second = 0;
rule.tz = "Etc/GMT-5";
const renewLimitJob = schedule.scheduleJob(renewRule, renewLimit);
const payLoanRule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 40;
rule.second = 50;
rule.tz = "Etc/GMT-5";
const payLoanJob = schedule.scheduleJob(payLoanRule, payLoan);

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/user", authenticationMiddleware, UserRouter);
app.use("/api/v1/card", authenticationMiddleware, CardRouter);
app.use("/api/v1/transaction", TransactionRouter);

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
