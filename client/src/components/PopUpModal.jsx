import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 16,
  borderRadius: 4,
  p: 4,
};

export default function BasicModal({ open, handleClose, data }) {
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            User Information
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`First Name : ${data?.user?.firstName}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Last Name : ${data?.user?.lastName}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Email : ${data?.user?.email}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Phone Number : ${data?.user?.phoneNumber}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`CNIC : ${data?.user?.cnic}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`User Subscription : ${
              data?.user?.isPremiumUser ? "Premium" : "Free-trial"
            }`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Kyc Status : ${data?.user?.kycStatus}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Credit Score : ${data?.user?.credit_score}`}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
