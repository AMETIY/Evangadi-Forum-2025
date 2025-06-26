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
import LandingPage from "./pages/LandingPage/LandingPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";

//Protected Route Component
const ProtectedRoute = ({ children, msg }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100vw",
          background: "rgba(255,255,255,0.7)",
          zIndex: 9999,
        }}
      >
        <Spinner animation="border" variant="success" size="lg" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

//Public Route (redirect to home if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100vw",
          background: "rgba(255,255,255,0.7)",
          zIndex: 9999,
        }}
      >
        <Spinner animation="border" variant="success" size="lg" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return children;
};

const Router = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100vw",
          background: "rgba(255,255,255,0.7)",
          zIndex: 9999,
        }}
      >
        <Spinner animation="border" variant="success" size="lg" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing or Home */}
        <Route
          path="/"
          element={isAuthenticated ? <SharedLayOut /> : <LandingPage />}
        >
          {isAuthenticated && (
            <Route
              index
              element={
                <ProtectedRoute msg="Welcome to Evangadi Forum">
                  <Home />
                </ProtectedRoute>
              }
            />
          )}
        </Route>

        {/* Auth Page - always available */}
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Protected Nested Routes under SharedLayOut */}
        {isAuthenticated && (
          <Route element={<SharedLayOut />}>
            <Route
              path="question/:id"
              element={
                <ProtectedRoute>
                  <QuestionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="askQuestion"
              element={
                <ProtectedRoute>
                  <AskQuestionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectedRoute>
                  <EditQuestionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>
        )}

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
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
