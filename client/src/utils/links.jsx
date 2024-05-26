import React from "react";

import { MdQueryStats, MdOutlinePriceChange } from "react-icons/md";
import { ImProfile } from "react-icons/im";

const links = [
  {
    text: "users",
    path: ".",
    icon: <ImProfile />,
  },
  {
    text: "transactions",
    path: "transactions",
    icon: <MdQueryStats />,
  },
  {
    text: "Anti Embarrassment",
    path: "antiEmbAmount",
    icon: <MdOutlinePriceChange />,
  },
];

export default links;
