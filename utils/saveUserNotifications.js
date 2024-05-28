import User from "../models/UserModel.js";

export const saveUserNotifications = async (msg, date, time, userId) => {
  const user = await User.findOne({ _id: userId });
  user.notifications.push({ message: msg, date, time });
  await user.save();
};
