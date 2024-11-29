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
import { toast, Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Settings from "./pages/Settings";
import { connect, useDispatch, useSelector } from "react-redux";
import { setCurrentUser } from "./redux/userReducer/userAction";
import MobileChatWindow from "./pages/MobileChatWindow";
import ResetPassword from "./pages/ResetPassword";
import { SocketProvider } from './context/SocketContext';

const AuthChecker = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        handleSessionExpired();
        return;
      }
  
      await fetchUserData(user);
    });
  
    return () => {
      unsubscribe();
    };
  }, [reload]);
  
  const handleSessionExpired = () => {
    setLoading(false);
    toast.error("Session expired. Please sign in again.");
    navigate("/sign-in");
  };
  
  const fetchUserData = async (user) => {
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/getUser`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Network error");
      }
  
      const data = await response.json();
      dispatch(setCurrentUser(data.userData));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(true);
      toast.error(error.message || "Network error");
    }
  };

  if (loading) {
    return (
      <div className="relative h-[100vh]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-[100vh]">
        <Toaster richColors position="top-right" />
        <div className="flex flex-col justify-center items-center h-full gap-2">
          <h1 className="text-lg">An error occured</h1>
          <button
            onClick={() => setReload(!reload)}
            className="p-3 rounded-md bg-[#313131] text-white font-bold"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider userId={auth.currentUser?.uid}>
      {children}
    </SocketProvider>
  );
};

function App() {
  const location = useLocation();
  const hideNavbarRoutes = ["/sign-in", "/complete-sign-up", '/reset-password'];
  const hideNavbar =
    hideNavbarRoutes.includes(location.pathname) ||
    /^\/chat\/[^/]+$/.test(location.pathname);

  return (
    <AuthChecker>
      <div className="flex flex-col min-h-screen h-screen w-full overflow-x-hidden">
        {/* {!hideNavbar && (
          <header className="sticky top-0 z-30 w-full">
            <Navbar />
          </header>
        )} */}
        <main className="flex-1 relative">
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/complete-sign-up" element={<CompleteSignup />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {window.innerWidth < 769 && (
              <Route path="/chat/:chatId" element={<MobileChatWindow />} />
            )}
          </Routes>
        </main>
      </div>
    </AuthChecker>
  );
}

const mapDispatchToProps = (dispatch) => ({
  setCurrentUser: (user) => dispatch(setCurrentUser(user)),
});
export default connect(null, mapDispatchToProps)(App);
