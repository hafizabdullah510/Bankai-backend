export const getFormattedDateAndTime = () => {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Karachi",
  });
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
  });

  return { formattedDate, formattedTime };
};
