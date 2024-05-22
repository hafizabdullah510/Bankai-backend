import React, { useContext, useEffect, useReducer } from "react";
import reducer from "./reducer";
import axios from "axios";
import {
  DISPLAY_ALERT,
  CLEAR_ALERT,
  LOGIN_USER_BEGIN,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERROR,
  TOGGLE_SIDEBAR,
  LOGOUT_USER,
  HANDLE_CHANGE,
  CLEAR_VALUES,
  CLEAR_FILTERS,
  CHANGE_PAGE,
  CURRENT_USER_BEGIN,
  CURRENT_USER_SUCCESS,
  ALL_USERS_BEGIN,
  ALL_USERS_SUCCESS,
  ALL_USERS_ERROR,
} from "./actions";

export const initialState = {
  userLoading: true,
  isLoading: false,
  showAlert: false,
  alertText: "",
  alertType: "",
  user: null,
  bankaiUsers: [],
  showSideBar: true,
  numOfPages: 1,
  page: 1,
  search: "",
  sort: "latest",
  sortOptions: ["latest", "oldest", "a-z", "z-a"],
};

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const authFetch = axios.create({
    baseURL: "/api/v1",
  });

  //Response
  authFetch.interceptors.response.use(
    (response) => {
      return response;
    },
    (err) => {
      if (err.response.status === 401) {
        logoutUser();
      }
      return Promise.reject(err);
    }
  );

  const displayAlert = () => {
    dispatch({ type: DISPLAY_ALERT });
    clearAlert();
  };
  const clearAlert = () => {
    setTimeout(() => {
      dispatch({ type: CLEAR_ALERT });
    }, 3000);
  };

  const handleChange = ({ name, value }) => {
    dispatch({ type: HANDLE_CHANGE, payload: { name, value } });
  };

  const loginUser = async (currentUser) => {
    dispatch({ type: LOGIN_USER_BEGIN });
    try {
      const { data } = await axios.post("/api/v1/auth/login", currentUser);
      // console.log(response);
      console.log(data);
      const { user } = data;
      dispatch({
        type: LOGIN_USER_SUCCESS,
        payload: { user },
      });
      // Add user to local storage
    } catch (err) {
      dispatch({ type: LOGIN_USER_ERROR, payload: err.response.data.msg });
    }
    clearAlert();
  };

  const toggleSidebar = () => {
    dispatch({ type: TOGGLE_SIDEBAR });
  };

  const logoutUser = async () => {
    await authFetch.get("/auth/logout");
    dispatch({ type: LOGOUT_USER });
  };

  const clearValues = () => {
    dispatch({ type: CLEAR_VALUES });
  };

  const clearFilters = () => {
    dispatch({ type: CLEAR_FILTERS });
  };

  const changePage = (page) => {
    dispatch({ type: CHANGE_PAGE, payload: { page } });
  };

  const getCurrentUser = async () => {
    dispatch({ type: CURRENT_USER_BEGIN });
    try {
      const { data } = await authFetch.get("/user/bankai/current-user");
      const { user, location } = data;
      dispatch({ type: CURRENT_USER_SUCCESS, payload: { user, location } });
    } catch (err) {
      if (err.response.status === 401) return;
      logoutUser();
    }
  };

  const getAllUsers = async () => {
    dispatch({ type: ALL_USERS_BEGIN });
    try {
      const { data } = await authFetch.get("/admin/all-users");

      const { users } = data;
      dispatch({ type: ALL_USERS_SUCCESS, payload: { users } });
    } catch (err) {
      dispatch({ type: ALL_USERS_ERROR, payload: err.response.data.msg });
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        displayAlert,
        loginUser,
        toggleSidebar,
        logoutUser,
        handleChange,
        clearValues,
        clearFilters,
        changePage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppProvider, AppContext };
