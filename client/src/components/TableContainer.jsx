import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { useAllUsersContext } from "../pages/AllUsers";
import Wrapper from "../assets/wrappers/TableWrapper";
import customFetch from "../utils/customFetch";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BlockPopUp, PopUpModal } from ".";

const TableContainer = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [openBlockPopUp, setOpenBlockPopUp] = React.useState(false);
  const handleOpenBlockPopUP = () => setOpenBlockPopUp(true);
  const handleCloseBlockPopUP = () => setOpenBlockPopUp(false);
  const [state, setState] = useState({});

  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const getSingleUser = async (state) => {
    try {
      const { data: user } = await customFetch.get(
        `/admin/single-user/${state.target.id}`
      );
      setUser(user);
      handleOpen();
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
  };

  const handleUserStatus = async (state) => {
    setState(state);
    handleOpenBlockPopUP();
  };

  const columns = [
    {
      name: "First Name",
      selector: (row) => row.firstName,
    },
    {
      name: "Last Name",
      selector: (row) => row.lastName,
    },
    {
      name: "Email",
      selector: (row) => row.email,
    },
    {
      name: "Cnic",
      selector: (row) => row.cnic,
    },
    {
      name: "Credit Score",
      selector: (row) => row.credit_score,
    },
    {
      name: "Kyc Status",
      selector: (row) => row.kycStatus,
    },
    {
      name: "Phone Number",
      selector: (row) => row.phoneNumber,
    },
    {
      selector: (row) => (
        <button className="btn" onClick={getSingleUser} id={row._id}>
          View
        </button>
      ),
    },
    {
      selector: (row) => (
        <button
          className="btn danger-btn"
          onClick={handleUserStatus}
          id={row._id}
        >
          {row.isBlocked ? "Unblock" : "Block"}
        </button>
      ),
    },
  ];

  const { users: users } = useAllUsersContext();
  return (
    <Wrapper>
      <DataTable columns={columns} data={users.users} pagination />
      <PopUpModal open={open} handleClose={handleClose} data={user} />
      <BlockPopUp
        open={openBlockPopUp}
        handleClose={handleCloseBlockPopUP}
        state={state}
      />
    </Wrapper>
  );
};

export default TableContainer;
