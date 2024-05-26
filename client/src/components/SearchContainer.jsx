import { FormRow, FormRowSelect, SubmitBtn } from ".";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { Form, useSubmit, Link } from "react-router-dom";
import { useAllUsersContext } from "../pages/AllUsers";
import {
  KYC_STATUS,
  USER_SORT_BY,
  CREDIT_SCORE,
  USER_STATUS,
  VIRTUAL_CARD_STATUS,
} from "../utils/constants";
const SearchContainer = () => {
  const { searchValues } = useAllUsersContext();
  const {
    search,
    kycStatus,
    sort,
    creditScore,
    userStatus,
    virtualCardStatus,
  } = searchValues;
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

          <FormRowSelect
            labelText="kyc status"
            name="kycStatus"
            list={["all", ...Object.values(KYC_STATUS)]}
            defaultValue={kycStatus || "all"}
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
          />
          <FormRowSelect
            labelText="sort"
            name="sort"
            list={[...Object.values(USER_SORT_BY)]}
            defaultValue={sort || "newest"}
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
          />
          <FormRowSelect
            labelText="credit score/loan payment status"
            name="creditScore"
            defaultValue={creditScore || 5}
            list={[...Object.values(CREDIT_SCORE)]}
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
          />
          <FormRowSelect
            labelText="user status"
            name="userStatus"
            defaultValue={userStatus || "all"}
            list={["all", ...Object.values(USER_STATUS)]}
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
          />
          <FormRowSelect
            labelText="virtual card status"
            name="virtualCardStatus"
            defaultValue={virtualCardStatus || "all"}
            list={["all", ...Object.values(VIRTUAL_CARD_STATUS)]}
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
export default SearchContainer;
