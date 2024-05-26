import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { useTransactionsContext } from "../pages/Transactions";
import Wrapper from "../assets/wrappers/TableWrapper";
import customFetch from "../utils/customFetch";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { PopUpModalTransaction } from ".";

const TableContainer = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [transaction, setTransaction] = useState({});
  const getSingleTransaction = async (state) => {
    console.log(state.target.id);
    try {
      const { data: transaction } = await customFetch.get(
        `/admin/single-transaction/${state.target.id}`
      );
      setTransaction(transaction);
      handleOpen();
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
  };

  const columns = [
    {
      name: "Merchant",
      selector: (row) => row.merchant,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
    },
    {
      name: "Status",
      selector: (row) => row.transactionStatus,
    },
    {
      name: "UserID",
      selector: (row) => row.performedBy,
    },
    {
      name: "Date",
      selector: (row) => row.createdAt,
    },

    {
      selector: (row) => (
        <button className="btn" onClick={getSingleTransaction} id={row._id}>
          View
        </button>
      ),
    },
  ];

  const { transactions: transactions } = useTransactionsContext();
  return (
    <Wrapper>
      <DataTable
        columns={columns}
        data={transactions.transactions}
        pagination
      />
      <PopUpModalTransaction
        open={open}
        handleClose={handleClose}
        data={transaction}
      />
    </Wrapper>
  );
};

export default TableContainer;
