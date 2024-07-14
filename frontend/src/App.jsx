import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
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
  return (
    <Router>
      <AuthChecker>
        <div className="h-[100vh]">
          <Navbar />
          <div className="h-[92vh]">
            <Routes>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/complete-sign-up" element={<CompleteSignup />} />
            </Routes>
          </div>
        </div>
      </AuthChecker>
    </Router>
  );
}

export default App;
