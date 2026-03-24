import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage from "./pages/AdminPage";
import BooksPage from "./pages/BooksPage";
import DashboardPage from "./pages/DashboardPage";
import FriendsPage from "./pages/FriendsPage";
import LandingPage from "./pages/LandingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LoginPage from "./pages/LoginPage";
import MessagesPage from "./pages/MessagesPage";
import PaymentPendingPage from "./pages/PaymentPendingPage";
import RegisterPage from "./pages/RegisterPage";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-login",
  component: AdminLoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const paymentPendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-pending",
  component: PaymentPendingPage,
});

// Keep old route for backward compatibility
const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentPendingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const booksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/books",
  component: BooksPage,
});

const friendsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/friends",
  component: FriendsPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: LeaderboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  adminLoginRoute,
  registerRoute,
  paymentPendingRoute,
  paymentSuccessRoute,
  dashboardRoute,
  booksRoute,
  friendsRoute,
  messagesRoute,
  leaderboardRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
