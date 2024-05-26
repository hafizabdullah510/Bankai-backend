import {
  UNAUTHENTICATED_ERROR,
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import Transaction from "../models/Transaction.js";
import VirtualCard from "../models/VirtualCard.js";
import { StatusCodes } from "http-status-codes";
import BankaiConstants from "../models/BankaiConstants.js";

export const getAllUsers = async (req, res) => {
  let users = [];
  let totalUsers = 0;
  console.log(req.query);
  if (Object.keys(req.query).length > 0) {
    const {
      search,
      kycStatus,
      sort,
      creditScore,
      userStatus,
      virtualCardStatus,
    } = req.query;

    let queryObject = {
      role: "user",
    };

    if (search) {
      {
        queryObject.$or = [
          { email: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { cnic: { $regex: search, $options: "i" } },
        ];
      }
    }

    if (kycStatus && kycStatus !== "all") {
      if (kycStatus === "verified") {
        queryObject.kycStatus = "verified";
      } else if (kycStatus === "unverified") {
        queryObject.kycStatus = "not_initiated";
      } else {
        queryObject.kycStatus = "pending";
      }
    }
    if (virtualCardStatus && virtualCardStatus !== "all") {
      console.log(virtualCardStatus);
      if (virtualCardStatus === "issued") {
        queryObject.cards = { $exists: true, $ne: [], $not: { $size: 0 } };
      } else {
        queryObject.cards = { $size: 0 };
      }
    }

    const sortOptions = {
      newest: "-createdAt",
      oldest: "createdAt",
    };
    const sortKey = sortOptions[sort] || sortOptions.newest;

    queryObject.credit_score = creditScore;

    if (userStatus && userStatus !== "all") {
      if (userStatus === "blocked") {
        queryObject.isBlocked = true;
      } else {
        queryObject.isBlocked = false;
      }
    }

    users = await User.find(queryObject).sort(sortKey);
    totalUsers = await User.countDocuments(queryObject);
  } else {
    users = await User.find({ role: "user" });
    totalUsers = await User.countDocuments({ role: "user" });
  }

  const filteredUsers = users.map((user) => user.delPassword());
  res.status(StatusCodes.OK).json({ users: filteredUsers, totalUsers });
};

export const getAllTransactions = async (req, res) => {
  console.log(req.query);
  const { month, search, amount_sort, status, cnic } = req.query;
  let transactions = [];
  const sortOptions = {
    ascending: "amount",
    descending: "-amount",
  };

  const sortKey = sortOptions[amount_sort] || sortOptions.ascending;
  //if date not provided
  if (Object.keys(req.query).length === 0) {
    const date = new Date();
    const year = date.getFullYear();
    const monthOfYear = (date.getMonth() + 1).toString().padStart(2, "0");
    const startDate = new Date(`${year}-${monthOfYear}`);
    const endDate = new Date(`${year}-${monthOfYear}`);
    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1, 0);
    transactions = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
    ]).sort(sortKey);
  } else {
    const justMonthDate = month.slice(0, 7);
    console.log(justMonthDate);
    const startDate = new Date(justMonthDate);
    const endDate = new Date(justMonthDate);

    // Get the start and end of the month
    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1, 0);

    console.log(startDate, endDate);
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { merchant: { $regex: search, $options: "i" } },
            // Add other fields you want to search in
          ],
        },
      });
    }
    if (cnic) {
      const user = await User.findOne({ cnic: cnic.toString() });
      console.log(user);
      if (user) {
        pipeline.push({
          $match: {
            performedBy: user._id.toString(),
          },
        });
      }
    }
    if (status && status !== "all") {
      pipeline.push({
        $match: {
          transactionStatus: status,
        },
      });
    }

    // MongoDB aggregation pipeline to filter transactions based on month
    transactions = await Transaction.aggregate(pipeline).sort(sortKey);
  }

  res.status(StatusCodes.OK).json({ transactions: transactions });
};

export const getSingleTransaction = async (req, res) => {
  const { id } = req.params;
  const transaction = await Transaction.findOne({ _id: id });
  res.status(StatusCodes.OK).json({ transaction });
};

export const getSingleUserTransactions = async (req, res) => {
  const { id } = req.params;
  const { month } = req.body;
  const startDate = new Date(month);
  const endDate = new Date(month);

  // Get the start and end of the month
  startDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + 1, 0);

  console.log(startDate, endDate);
  // MongoDB aggregation pipeline to filter transactions based on month
  const transactions = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        performedBy: id.toString(),
      },
    },
  ]);

  res.status(StatusCodes.OK).json({ transactions: transactions });
};

export const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const singleUser = await User.findOne({ _id: id });
  const user = singleUser.delPassword();

  res.status(StatusCodes.OK).json({ user });
};

export const blockUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate({ _id: id });
  user.isBlocked = true;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "User has been blocked!" });
};
export const UnBlockUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate({ _id: id });
  user.isBlocked = false;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "User has been un-blocked!" });
};

export const setAntiEmbarrassmentAmount = async (req, res) => {
  const { amount } = req.body;
  if (!amount) {
    throw new BAD_REQUEST_ERROR("Please provide amount");
  }

  const count = await BankaiConstants.countDocuments({});
  if (count > 0) {
    await BankaiConstants.findOneAndUpdate(
      {},
      { $set: { anti_embarrassment_amount: amount } },
      { new: true }
    );
  } else {
    await BankaiConstants.create({ anti_embarrassment_amount: amount });
  }
  res
    .status(StatusCodes.OK)
    .json({ msg: "Anti-embarrassment amount updated!" });
};
