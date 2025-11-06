import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import NotFound from "pages/NotFound";
import { AuthProvider } from "contexts/AuthContext";
import { EventPlanningProvider } from "contexts/EventPlanningContext";
import Login from "pages/login";
import Signup from "pages/signup";
import ForgotPassword from "pages/forgot-password";
import ResetPassword from "pages/reset-password";
import EventPlanDetails from "pages/event-plan-details";
import BudgetCalculator from "pages/budget-calculator";
import TaskBoardManagement from "pages/task-board-management";
import MarketingMaterials from "pages/marketing-materials";
import EventPlanningDashboard from "pages/event-planning-dashboard";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventPlanningProvider>
          <ErrorBoundary>
            <ScrollToTop />
            <RouterRoutes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/event-planning-dashboard"
              element={
                <ProtectedRoute>
                  <EventPlanningDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/event-plan-details"
              element={
                <ProtectedRoute>
                  <EventPlanDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budget-calculator"
              element={
                <ProtectedRoute>
                  <BudgetCalculator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task-board-management"
              element={
                <ProtectedRoute>
                  <TaskBoardManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketing-materials"
              element={
                <ProtectedRoute>
                  <MarketingMaterials />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
        </EventPlanningProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
