import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebaseConfig";
import SignIn from "./pages/SignIn";
import CompleteSignup from "./pages/complete-sign-up";
import "../style.css";
import Dashboard from "./pages/Dashboard";
import Spinner from "./components/Spinner";
import { toast } from "sonner";
import Navbar from "./components/Navbar";
import Settings from "./pages/Settings";

const AuthChecker = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false);
      } else {
        setLoading(false);
        toast.error("Session expired. Please sign in again.");
        navigate("/sign-in");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="relative h-[100vh]">
        <Spinner />
      </div>
    );
  }

  return children;
};

function App() {
  const location = useLocation();
  const hideNavbarRoutes = ["/sign-in", "/complete-sign-up"];

  return (
    <AuthChecker>
      <div className="flex flex-col h-screen">
        {!hideNavbarRoutes.includes(location.pathname) && (
          <div className="sticky top-0 z-30">
            <Navbar />
          </div>
        )}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/complete-sign-up" element={<CompleteSignup />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </AuthChecker>
  );
}

export default App;
