import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast, Toaster } from "sonner";
import { auth, db } from "../lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [page, setPage] = useState("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setLoading(false);
      return toast.error("All fields are required");
    }

    try {
      toast.info("Signing in...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.data()?.userName) {
        toast.success("Signed in successfully");
        setLoading(false);
        navigate("/");
      } else {
        toast.success("Signed in successfully");
        setLoading(false);
        navigate("/complete-sign-up");
      }
    } catch (error) {
      console.log("Error signing in:", error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const signUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || !firstName || !lastName) {
      setLoading(false);
      return toast.error("All fields are required");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: user.email,
        profileData: {},
        firstName,
        lastName,
        onlineStatus: false,
        createdAt: new Date().toISOString(),
      });

      toast.info(
        "Account created successfully. Check inbox for verification email"
      );
      setLoading(false);
      console.log("Navigating to '/complete-sign-up'");
      navigate("/complete-sign-up");
    } catch (error) {
      console.log("Error signing up:", error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        setLoading(false);
        navigate("/");
      } else {
        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          email: user.email,
          firstName: user.displayName?.split(" ")[0],
          lastName: user.displayName?.split(" ")[1],
          createdAt: new Date().toISOString(),
        });
        setLoading(false);
        navigate("/complete-sign-up");
      }
    } catch (error) {
      console.log("Error with Google sign-in:", error);
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  return (
    <main className="w-full h-[100vh] flex relative">
      <Toaster position="top-right" richColors />
      {loading && <Spinner />}
      <div className="h-full hidden lg:flex lg:w-1/2 bg-[#313131] justify-center items-center">
        <div className="text-center">
          <h1 className="font-rowdies text-6xl font-extrabold text-white">
            Vibe Chat
          </h1>
          <small className="text-white font-poppins">
            Start a chat, catch a vibe...
          </small>
        </div>
      </div>
      <div className="lg:w-1/2 w-full flex flex-col p-5 justify-center items-center ">
        {page === "signin" ? (
          <div className="border-[1px] rounded-md border-[#efefef] p-5 w-[500px] shadow-sm">
            <h1 className="font-poppins hidden lg:block font-bold text-3xl text-center mb-5">
              Sign In
            </h1>
            <h1 className="font-poppins lg:hidden font-bold text-3xl text-center mb-5">
              Sign Into Vibe Chat
            </h1>
            <form className="" onSubmit={(e) => signIn(e)}>
              <div className="flex flex-col">
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-300 border-[1px] p-2 rounded-md mt-1"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex flex-col mt-3">
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-300 border-[1px] p-2 rounded-md mt-1"
                  placeholder="Enter your password"
                />
              </div>
              <div className="mt-3 text-center">
                <button
                  type="submit"
                  className="p-2 w-full text-center py-3 bg-[#313131] rounded-md text-white font-bold font-poppins"
                >
                  Sign In
                </button>
                <p className="mt-2">Forgot Password?</p>
                <button className="mt-2" onClick={() => setPage("signup")}>
                  Don't have an Account?
                </button>
              </div>
            </form>
            <div className="flex items-center justify-center my-5">
              <div className="border-t border-gray-300 flex-grow mr-3"></div>
              <span className="text-gray-500 font-poppins">OR</span>
              <div className="border-t border-gray-300 flex-grow ml-3"></div>
            </div>
            <div className="mt-3">
              <button
                onClick={() => handleGoogleSignIn()}
                className="p-2 w-full py-3 rounded-md text-black border-[#313131] border-[1px] font-poppins flex items-center gap-2 justify-center"
              >
                <FcGoogle /> Sign In with Google
              </button>
            </div>
          </div>
        ) : (
          <div className="border-[1px] rounded-md border-[#efefef] p-5 w-[500px] shadow-sm">
            <h1 className="font-poppins hidden lg:block font-bold text-3xl text-center mb-5">
              Sign Up
            </h1>
            <h1 className="font-poppins lg:hidden font-bold text-3xl text-center mb-5">
              Sign up for Vibe Chat
            </h1>
            <form className="" onSubmit={(e) => signUp(e)}>
              <div className="flex">
                <div className="w-1/2">
                  <label>First Name:</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value.trim())}
                    className="border-slate-300 w-[95%] border-[1px] p-2 rounded-md mt-1"
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="w-1/2">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value.trim())}
                    className="border-slate-300 w-full border-[1px] p-2 rounded-md mt-1"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="flex flex-col mt-3">
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-300 border-[1px] p-2 rounded-md mt-1"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex flex-col mt-3">
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-300 border-[1px] p-2 rounded-md mt-1"
                  placeholder="Enter your password"
                />
              </div>
              <div className="mt-3 text-center">
                <button
                  type="submit"
                  className="p-2 w-full text-center py-3 bg-[#313131] rounded-md text-white font-bold font-poppins"
                >
                  Sign Up
                </button>
                <button className="mt-2" onClick={() => setPage("signin")}>
                  Already have an Account?
                </button>
              </div>
            </form>
            <div className="flex items-center justify-center my-5">
              <div className="border-t border-gray-300 flex-grow mr-3"></div>
              <span className="text-gray-500 font-poppins">OR</span>
              <div className="border-t border-gray-300 flex-grow ml-3"></div>
            </div>
            <div className="mt-3">
              <button className="p-2 w-full py-3 rounded-md text-black border-[#313131] border-[1px] font-poppins flex items-center gap-2 justify-center">
                <FcGoogle /> Sign Up with Google
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default SignIn;
