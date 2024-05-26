import { FormRow, FormRowSelect, SubmitBtn } from ".";
import React, { useState } from "react";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { Form, useSubmit, Link } from "react-router-dom";
import { useTransactionsContext } from "../pages/Transactions";
import { AMOUNT_SORT, TRANSACTION_STATUS } from "../utils/constants";
import { format } from "date-fns";

const SearchContainerTransactions = () => {
  const { searchValues } = useTransactionsContext();
  const { search, amount_sort, month, status, cnic } = searchValues;
  const currentDate = format(new Date(), "yyyy-MM-dd");
  console.log(currentDate);
  const submit = useSubmit();

  const debounce = (onChange) => {
    let timeout;
    return (e) => {
      const form = e.currentTarget.form;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        onChange(form);
      }, 2000);
    };
  };
  return (
    <Wrapper>
      <Form className="form">
        <h5 className="form-title">search form</h5>
        <div className="form-center">
          <FormRow
            type="search"
            name="search"
            defaultValue={search || ""}
            onChange={debounce((form) => {
              submit(form);
            })}
          />
          <FormRow
            type="search"
            name="cnic"
            defaultValue={cnic || ""}
            onChange={debounce((form) => {
              submit(form);
            })}
          />
          <FormRow
            labelText="date"
            type="date"
            name="month"
            defaultValue={month || currentDate}
            onChange={debounce((form) => {
              submit(form);
            })}
          />

          <FormRowSelect
            labelText="amount"
            name="amount_sort"
            list={[...Object.values(AMOUNT_SORT)]}
            defaultValue={amount_sort || "ascending"}
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
          />

          <FormRowSelect
            labelText="transaction status"
            name="status"
            list={["all", ...Object.values(TRANSACTION_STATUS)]}
            defaultValue={status || "all"}
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
          />

          <Link to="/dashboard" className="btn form-btn delete-btn">
            Reset Search Values
          </Link>
        </div>
      </Form>
    </Wrapper>
  );
};
export default SearchContainerTransactions;
