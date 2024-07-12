import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast, Toaster } from "sonner";
import { auth, db } from "../lib/firebaseConfig.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
// import { useAuth } from "../lib/hooks/useAuth.tsx";
import Spinner from "../components/Spinner.jsx";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [page, setPage] = useState("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  // const user = useAuth()?.user;
  const navigate = useNavigate();

  const signIn = async () => {
    setLoading(true);
    e.preventDefault();
    if (!email || !password) {
      setLoading(false);
      return toast.error("All fields are required");
    }
    await signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.data()?.userName) {
          setLoading(false);
          navigate("/");
          return;
        } else {
          setLoading(false);
          navigate("/complete-sign-up");
        }
      })
      .catch((error) => {
        console.log(error.message);
        toast.error(error.message);
      });
  };

  const signUp = async () => {
    setLoading(true);
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      return toast.error("All fields are required");
    }
    await createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        try {
          const user = userCredential.user;
          sendEmailVerification(user);

          const userDoc = await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            email: user.email,
            firstName,
            lastName,
            createdAt: new Date().toISOString(),
          });
          setLoading(false);
          toast.info(
            "Account created successfully. Check inbox for verification email"
          );
          navigate("/complete-sign-up");
        } catch (error) {
          setLoading(false);
          toast.error("Failed, please try again");
          console.log(error);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log(error.message);
        toast.error(error.message);
      });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setLoading(false);
          return;
        } else {
          console.log("new user");
          const userDoc = await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            email: user.email,
            firstName: user.displayName?.split(" ")[0],
            lastName: user.displayName?.split(" ")[1],
            createdAt: new Date().toISOString(),
          });
          navigate("/complete-sign-up");
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        toast.error("An error occured");
      });
  };

  return (
    <main className="w-full h-[100vh] flex relative">
      <Toaster position="top-right" richColors />
      {loading && <Spinner />}
      <div className="h-full w-1/2 bg-[#313131] flex justify-center items-center">
        <div className="text-center">
          <h1 className="font-rowdies text-6xl font-extrabold text-white">
            Vibe Chat
          </h1>
          <small className="text-white font-poppins">
            Start a chat, catch a vibe...
          </small>
        </div>
      </div>
      <div className="w-1/2 p-5 justify-center items-center flex">
        {page === "signin" ? (
          <div className="border-[1px] rounded-md border-[#efefef] p-5 w-[500px] shadow-sm">
            <h1 className="font-poppins font-bold text-3xl text-center mb-5">
              Sign In
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
            <h1 className="font-poppins font-bold text-3xl text-center mb-5">
              Sign Up
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