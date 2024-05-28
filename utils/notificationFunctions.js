import ONE_SIGNAL_CONFIG from "../config/app.config.js";
import pushNotificationService from "../services/push-notifications.services.js";

const SendNotification = (msg) => {
  var message = {
    app_id: ONE_SIGNAL_CONFIG.APP_ID,
    contents: {
      en: msg,
    },
    included_segments: ["All"],
    content_available: true,
    small_icon: "ic_notification_icon",
    data: {
      PushTitle: "CUSTOM NOTIFICATION",
    },
  };

  pushNotificationService.SendNotification(message, (error, results) => {
    if (error) {
      console.log(error);
    }

    console.log(results);
  });
};

const SendNotificationToDevice = (msg, devices) => {
  console.log("---> ", devices);

  var message = {
    app_id: ONE_SIGNAL_CONFIG.APP_ID,
    contents: {
      en: msg,
    },
    // included_segments: ["Subscribed Users"],
    // include_subscription_ids: ['e97b64ed-5da9-4c25-ac14-9309a838e088'],
    target_channel: "push",
    include_aliases: { onesignal_id: devices },
    content_available: true,
    small_icon: "ic_notification_icon",
    data: {
      PushTitle: "CUSTOM NOTIFICATION",
    },
  };

  pushNotificationService.SendNotification(message, (error, results) => {
    if (error) {
      console.log(error);
    }

    console.log(results);
  });
};

export { SendNotification, SendNotificationToDevice };
