import {
  SearchContainerTransactions,
  TableContainerTransactions,
} from "../components";
import customFetch from "../utils/customFetch";
import { useLoaderData } from "react-router-dom";
import { useContext, createContext } from "react";

const TransactionsContext = createContext();

export const loader = async ({ request }) => {
  const params = Object.fromEntries([
    ...new URL(request.url).searchParams.entries(),
  ]);
  const { data: transactions } = await customFetch.get(
    "/admin/all-transactions",
    { params }
  );
  console.log(params, transactions);
  return { searchValues: { ...params }, transactions };
};

const Transactions = () => {
  const { searchValues, transactions } = useLoaderData();
  return (
    <TransactionsContext.Provider value={{ searchValues, transactions }}>
      <SearchContainerTransactions />
      <TableContainerTransactions />
    </TransactionsContext.Provider>
  );
};
export const useTransactionsContext = () => useContext(TransactionsContext);

export default Transactions;
