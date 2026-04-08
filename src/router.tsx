import { createBrowserRouter } from 'react-router';
import RouteErrorBoundary from './common/RouteErrorBoundary';
import Root from './Root';
import AuthenticateChecking from './screen/AuthenticateChecking';
import Authenticated from './screen/AuthenticateChecking/Authenticated';
import AppHeader from './screen/AuthenticateChecking/Authenticated/AppHeader';
import CourseDetailPage from './screen/AuthenticateChecking/Authenticated/AppHeader/CourseDetailPage';
import CoursesPage from './screen/AuthenticateChecking/Authenticated/AppHeader/CoursesPage';
import DiscussPage from './screen/AuthenticateChecking/Authenticated/AppHeader/DiscussPage';
import MyCoursesPage from './screen/AuthenticateChecking/Authenticated/AppHeader/MyCoursesPage';
import RecommendationPage from './screen/AuthenticateChecking/Authenticated/AppHeader/RecommendationPage';
import SurveyPage from './screen/AuthenticateChecking/Authenticated/AppHeader/SurveyPage';
import PublicPage from './screen/PublicPage';
import LoginPage from './screen/PublicPage/LoginPage';
import RegisterPage from './screen/PublicPage/RegisterPage';

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
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
