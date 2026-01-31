import { createBrowserRouter } from "react-router";
import RouteErrorBoundary from "./common/RouteErrorBoundary";
import Root from "./Root";
import AuthenticateChecking from "./screen/AuthenticateChecking";
import Authenticated from "./screen/AuthenticateChecking/Authenticated";
import AppHeader from "./screen/AuthenticateChecking/Authenticated/AppHeader";
import DiscussPage from "./screen/AuthenticateChecking/Authenticated/AppHeader/DiscussPage";
import MyCoursesPage from "./screen/AuthenticateChecking/Authenticated/AppHeader/MyCoursesPage";
import RecommendationPage from "./screen/AuthenticateChecking/Authenticated/AppHeader/RecommendationPage";
import PublicPage from "./screen/PublicPage";
import Login from "./screen/PublicPage/Login";

export const router = createBrowserRouter([
  {
    path: "public-path",
    element: <PublicPage />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
    ],
  },

  {
    path: "",
    element: <Root />,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        path: "",
        element: <AuthenticateChecking />,
        children: [
          {
            path: "",
            element: <Authenticated />,
            children: [
              {
                path: "",
                element: <AppHeader />,
                children: [
                  {
                    path: "",
                    element: <RecommendationPage />,
                  },
                  {
                    path: "/discuss",
                    element: <DiscussPage />,
                  },
                  {
                    path: "/my-courses",
                    element: <MyCoursesPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
