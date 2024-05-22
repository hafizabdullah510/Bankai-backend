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

import { initialState } from "./AppContext";

const reducer = (state, action) => {
  if (action.type === DISPLAY_ALERT) {
    return {
      ...state,
      showAlert: true,
      alertType: "danger",
      alertText: "Please provide all the values!",
    };
  }
  if (action.type === CLEAR_ALERT) {
    return {
      ...state,
      showAlert: false,
      alertType: "",
      alertText: "",
    };
  }

  if (action.type === LOGIN_USER_BEGIN) {
    return { ...state, isLoading: true };
  }

  if (action.type === LOGIN_USER_SUCCESS) {
    return {
      ...state,
      isLoading: false,
      user: action.payload.user,

      userLocation: action.payload.location,
      jobLocation: action.payload.location,
      showAlert: true,
      alertType: "success",
      alertText: "Login Successful! Redirecting...",
    };
  }

  if (action.type === LOGIN_USER_ERROR) {
    return {
      ...state,
      isLoading: false,
      showAlert: true,
      alertType: "danger",
      alertText: action.payload,
    };
  }

  if (action.type === TOGGLE_SIDEBAR) {
    return { ...state, showSideBar: !state.showSideBar };
  }
  if (action.type === LOGOUT_USER) {
    return {
      ...state,
      userLoading: false,
      user: null,
      userLocation: "",
      jobLocation: "",
    };
  }
  if (action.type === HANDLE_CHANGE) {
    return {
      ...state,
      page: 1,
      [action.payload.name]: action.payload.value,
    };
  }
  if (action.type === CLEAR_VALUES) {
    const initialState = {
      isEditing: false,
      editJobId: "",
      company: "",
      position: "",
      jobLocation: state.userLocation,
      status: "pending",
      jobType: "full-time",
    };

    return { ...state, ...initialState };
  }

  if (action.type === CLEAR_FILTERS) {
    return {
      ...state,
      search: "",
      searchStatus: "all",
      searchType: "all",
      sort: "latest",
    };
  }
  if (action.type === CHANGE_PAGE) {
    return { ...state, page: action.payload.page };
  }
  if (action.type === CURRENT_USER_BEGIN) {
    return { ...state, userLoading: true, showAlert: false };
  }
  if (action.type === CURRENT_USER_SUCCESS) {
    return {
      ...state,
      userLoading: false,
      user: action.payload.user,
      userLocation: action.payload.location,
      jobLocation: action.payload.location,
    };
  }

  if (action.type === ALL_USERS_BEGIN) {
    return {
      ...state,
      userLoading: true,
      showAlert: false,
    };
  }

  if (action.type === ALL_USERS_SUCCESS) {
    return {
      ...state,
      bankaiUsers: action.payload.users,
    };
  }

  if (action.type === ALL_USERS_ERROR) {
    return {
      ...state,
      isLoading: false,
      showAlert: true,
      alertType: "danger",
      alertText: action.payload,
    };
  }
  throw new Error(`No such action : ${action.type}`);
};

export default reducer;
