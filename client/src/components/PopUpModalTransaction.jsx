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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
            Transaction Information
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Merchant : ${data?.transaction?.merchant}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Amount : ${data?.transaction?.amount}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Transaction Status : ${data?.transaction?.transactionStatus}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`UserId : ${data?.transaction?.performedBy}`}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {`Date : ${formatDate(data?.transaction?.createdAt)}`}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
