import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import Layout from "./components/common/Layout";
import ProtectedRoute from "./utils/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import RequestsPage from "./pages/RequestsPage";
import ConnectionsPage from "./pages/ConnectionsPage";

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="feed" element={<FeedPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="connections" element={<ConnectionsPage />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
