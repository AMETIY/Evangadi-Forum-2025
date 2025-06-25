import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SharedLayOut from "./Components/SharedLayOut/SharedLayOut";
import Home from "./pages/Home/Home";
import AuthPage from "./pages/AuthPage/AuthPage";
import QuestionPage from "./pages/QuestionPage/QuestionPage";
import { useAuth } from "./context/AuthContext";
import { Spinner } from "react-bootstrap";
import HowItWork from "./pages/HowItWork.jsx/HowItWork";
import AskQuestionPage from "./pages/AskQuestionPage/AskQuestionPage";
import EditQuestionPage from "./pages/EditQuestionPage/EditQuestionPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage";
// import LandingPage from "./pages/LandingPage/LandingPage";

//Protected Route Component
const ProtectedRoute = ({ children, msg }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Spinner animation="border" variant="success" size="lg" role="status">
        Loading...
      </Spinner>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

//Public Route (redirect to home if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Spinner animation="border" variant="success" size="lg" role="status">
        Loading...
      </Spinner>
    );
  }

  // if (!isAuthenticated) {
  //   return <Navigate to = '/' />
  // }

  // return !isAuthenticated ? <Navigate to = '/' : children   />
  return children;
};

// Landing Route - Redirect authenticated users to home
// const LandingRoute = ({children}) => {

//   const {isAuthenticated, loading} = useAuth();

//   if (loading) {
//     return <Spinner animation="border" variant="success" size="lg" role="status">Loading...</Spinner>
//   }

//   // If user is authenticated, redirect to home
//   if (isAuthenticated) {
//     return <Navigate to="/" />;
//   }

//   return children;

// }

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Route - With out shared Layout */}
        {/* <Route 
        path = '/landing'
        element = {
          <LandingRoute>
            <LandingPage />
          </LandingRoute>
        }
        /> */}

        {/* Main App Routes with SharedLayout */}
        <Route path="/" element={<SharedLayOut />}>
          {/* Home Page - Protected */}
          <Route
            index
            element={
              <ProtectedRoute msg="Welcome to Evangadi Forum">
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Authentication Page - Public */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* Question Page - Protected */}
          <Route
            path="/question/:id"
            element={
              <ProtectedRoute>
                <QuestionPage />
              </ProtectedRoute>
            }
          />

          {/* Ask Question Page - Protected */}
          <Route
            path="/askQuestion"
            element={
              <ProtectedRoute>
                <AskQuestionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditQuestionPage />
              </ProtectedRoute>
            }
          />

          {/* Password Reset Routes - Public */}
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />

          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />

          {/* How It Works Page - Public */}
          <Route path="/How" element={<HowItWork />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
