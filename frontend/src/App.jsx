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
import { connect, useDispatch, useSelector } from "react-redux";
import { setCurrentUser } from "./redux/userReducer/userAction";
import MobileChatWindow from "./pages/MobileChatWindow";

const AuthChecker = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const currentUser = useSelector(({ user }) => user.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!currentUser) {
          const idToken = await user.getIdToken(true);
          setLoading(false);
          try {
            const response = await fetch(
              "http://localhost:5000/api/user/getUser",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${idToken}`,
                },
              }
            );
            const data = await response.json();
            if (response.status == 200) {
              dispatch(setCurrentUser(data.userData));
            } else {
              setLoading(false);
              setError(true);
              toast.error("Network error");
            }
          } catch (error) {
            setError(true);
            toast.error("Network error");
            console.log("Error: ", error);
          }
        }
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

  if (loading) {
    return (
      <div className="relative h-[100vh]">
        <h1>An error occured</h1>
      </div>
    );
  }

  return children;
};

function App() {
  const location = useLocation();
  const hideNavbarRoutes = ["/sign-in", "/complete-sign-up"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname) || /^\/chat\/[^/]+$/.test(location.pathname);

  return (
    <AuthChecker>
      <div className="flex flex-col h-screen w-screen">
        {!hideNavbar && (
          <div className="sticky top-0 z-30">
            <Navbar />
          </div>
        )}
        <div className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/complete-sign-up" element={<CompleteSignup />} />
            <Route path="/settings" element={<Settings />} />
            {window.innerWidth < 769 && (
              <Route path="/chat/:chatId" element={<MobileChatWindow />} />
            )}
          </Routes>
        </div>
      </div>
    </AuthChecker>
  );
}

const mapDispatchToProps = (dispatch) => ({
  setCurrentUser: (user) => dispatch(setCurrentUser(user)),
});
export default connect(null, mapDispatchToProps)(App);
