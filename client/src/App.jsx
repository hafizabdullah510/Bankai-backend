import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  HomeLayout,
  Login,
  DashboardLayout,
  Error,
  AllUsers,
  Transactions,
  AntiEmbarrassment,
} from "./pages";

import { action as loginAction } from "./pages/Login";
import { loader as dashboardLoader } from "./pages/DashboardLayout";
import { loader as allUsersLoader } from "./pages/AllUsers";
import { loader as transactionLoader } from "./pages/Transactions";
import { action as embarrassmentAction } from "./pages/AntiEmbarrassment";
import ErrorElement from "./components/ErrorElement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Login />,
        action: loginAction,
      },
      {
        path: "dashboard",
        element: <DashboardLayout queryClient={queryClient} />,
        loader: dashboardLoader,
        children: [
          {
            index: true,
            element: <AllUsers />,
            loader: allUsersLoader,
          },
          {
            path: "transactions",
            element: <Transactions />,
            loader: transactionLoader,
            errorElement: <ErrorElement />,
          },
          {
            path: "antiEmbAmount",
            element: <AntiEmbarrassment />,
            action: embarrassmentAction,
            errorElement: <ErrorElement />,
          },
        ],
      },
    ],
  },
]);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
export default App;
