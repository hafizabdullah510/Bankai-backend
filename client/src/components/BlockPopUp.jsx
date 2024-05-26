import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import customFetch from "../utils/customFetch";
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

export default function BasicModal({ open, handleClose, state }) {
  const navigate = useNavigate();
  const handleUserBlockingStatus = async () => {
    console.log(state);
    try {
      if (state.target.innerText === "Block") {
        await customFetch.get(`/admin/block-user/${state.target.id}`);
        toast.success("User Blocked");
      } else {
        await customFetch.get(`/admin/un-block-user/${state.target.id}`);
        toast.success("User UnBlocked Successfully");
      }
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
    handleClose();
  };
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
            {`Are you sure you want to ${state?.target?.innerText} the user?`}
          </Typography>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <button className="btn" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="btn danger-btn"
              onClick={handleUserBlockingStatus}
            >
              Yes
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
