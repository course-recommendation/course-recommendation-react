import { createBrowserRouter } from 'react-router';
import NotFoundPage from './common/components/NotFoundPage';
import RouteErrorBoundary from './common/RouteErrorBoundary';
import Root from './Root';
import AuthenticateChecking from './screen/AuthenticateChecking';
import Authenticated from './screen/AuthenticateChecking/Authenticated';
import AppHeader from './screen/AuthenticateChecking/Authenticated/AppHeader';
import AdminHome from './screen/AuthenticateChecking/Authenticated/AppHeader/AdminHome';
import CourseDetailPage from './screen/AuthenticateChecking/Authenticated/AppHeader/CourseDetailPage';
import CourseRatingPage from './screen/AuthenticateChecking/Authenticated/AppHeader/CourseRatingPage';
import CoursesPage from './screen/AuthenticateChecking/Authenticated/AppHeader/CoursesPage';
import DiscussPage from './screen/AuthenticateChecking/Authenticated/AppHeader/DiscussPage';
import MyCoursesPage from './screen/AuthenticateChecking/Authenticated/AppHeader/MyCoursesPage';
import RecommendationPage from './screen/AuthenticateChecking/Authenticated/AppHeader/RecommendationPage';
import SurveyPage from './screen/AuthenticateChecking/Authenticated/AppHeader/SurveyPage';
import UserProfilePage from './screen/AuthenticateChecking/Authenticated/AppHeader/UserProfilePage';
import AuthenticatedStatsig from './screen/AuthenticateChecking/Authenticated/AuthenticatedStatsig';
import PublicPage from './screen/PublicPage';
import LoginPage from './screen/PublicPage/LoginPage';
import RegisterPage from './screen/PublicPage/RegisterPage';
import ResetPasswordPage from './screen/ResetPasswordPage';

export const router = createBrowserRouter([
  {
    path: 'public-path',
    element: <PublicPage />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },

      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },

  {
    path: 'reset-password',
    element: <ResetPasswordPage />,
  },

  {
    path: '',
    element: <Root />,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        path: '',
        element: <AuthenticateChecking />,
        children: [
          {
            path: '',
            element: <Authenticated />,
            children: [
              {
                path: '',
                element: <AuthenticatedStatsig />,
                children: [
                  {
                    path: '',
                    element: <AppHeader />,
                    children: [
                      {
                        path: '',
                        element: <RecommendationPage />,
                      },
                      {
                        path: '/survey',
                        element: <SurveyPage />,
                      },
                      {
                        path: '/course-rating',
                        element: <CourseRatingPage />,
                      },
                      {
                        path: '/discuss',
                        element: <DiscussPage />,
                      },
                      {
                        path: '/my-courses',
                        element: <MyCoursesPage />,
                      },
                      {
                        path: '/courses/:courseCode',
                        element: <CourseDetailPage />,
                      },
                      {
                        path: '/courses',
                        element: <CoursesPage />,
                      },
                      {
                        path: 'admin',
                        element: <AdminHome />,
                      },
                      {
                        path: '/profile',
                        element: <UserProfilePage />,
                      },
                      {
                        path: '*',
                        element: <NotFoundPage />,
                      },
                    ],
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
