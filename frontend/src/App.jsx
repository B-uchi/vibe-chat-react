import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebaseConfig";
import SignIn from "./pages/SignIn";
import CompleteSignup from "./pages/complete-sign-up";
import "../style.css";

const AuthChecker = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false);
      } else {
        setLoading(false);
        navigate("/sign-in");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthChecker>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/complete-sign-up" element={<CompleteSignup />} />
        </Routes>
      </AuthChecker>
    </Router>
  );
}

export default App;
