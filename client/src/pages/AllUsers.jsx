import { SearchContainer, TableContainer } from "../components";
import customFetch from "../utils/customFetch";
import { useLoaderData } from "react-router-dom";
import { useContext, createContext } from "react";

const AllUsersContext = createContext();

export const loader = async ({ request }) => {
  const params = Object.fromEntries([
    ...new URL(request.url).searchParams.entries(),
  ]);
  const { data: users } = await customFetch.get("/admin/all-users", { params });
  return { searchValues: { ...params }, users };
};

const AllUsers = () => {
  const { searchValues, users } = useLoaderData();
  console.log(searchValues, users);
  return (
    <AllUsersContext.Provider value={{ searchValues, users }}>
      <SearchContainer />
      <TableContainer />
    </AllUsersContext.Provider>
  );
};
export const useAllUsersContext = () => useContext(AllUsersContext);

export default AllUsers;
