import { confirmPasswordReset, sendPasswordResetEmail } from "firebase/auth";
import React, { useRef, useState } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { auth } from "../lib/firebaseConfig";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("mail");

  const sendRecoveryMail = (e) => {
    setLoading(true);
    e.preventDefault();
    if (!email) {
      setLoading(false);
      return toast.error("Email field is required.");
    }

    const emailRegex = /^[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(email) == true) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          toast.success("Mail sent.");
          setPage("message");
        })
        .catch((e) => {
          console.log("An error occured while sending mail: ", e);
          toast.error("Couldn't send recovery mail");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      return toast.error("Invalid email");
    }
  };

  return (
    <div className="flex w-full h-[100vh] justify-center items-center">
      <Toaster position="top-right" richColors />
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
      <div className="w-1/2 h-auto flex justify-center items-center">
        <div className="border-[1px] rounded-md border-[#efefef] p-5 lg:w-[500px] w-[95%] shadow-sm">
          {page == "mail" ? (
            <>
              <h1 className="font-poppins lg:block font-bold text-3xl text-center mb-5">
                Password Recovery
              </h1>
              <form className="" onSubmit={(e) => sendRecoveryMail(e)}>
                <div className="">
                  <label className="flex flex-col">
                    Email:
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      className="border-slate-300 border-[1px] p-2 rounded-md mt-1"
                      placeholder="Enter email associated with account"
                    />
                  </label>
                </div>
                <div className="mt-3 text-center flex flex-col">
                  <button
                    onClick={(e) => sendRecoveryMail(e)}
                    type="submit"
                    className="p-2 w-full text-center py-3 bg-[#313131] rounded-md text-white font-bold font-poppins flex justify-center gap-3"
                  >
                    Send recovery mail{" "}
                    {loading && <div className="loader"></div>}
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
                  onClick={() => navigate("/sign-in")}
                  className="p-2 w-full py-3 rounded-md text-black border-[#313131] border-[1px] font-poppins flex items-center gap-2 justify-center"
                >
                  Go back
                </button>
              </div>
            </>
          ) : null}
          {page == "message" ? (
            <>
              <h1 className="font-poppins lg:block font-bold text-3xl text-center mb-5">
                Mail sent
              </h1>
              <div className="">
                <div className="flex">
                  <FaRegCheckCircle size={50} className="mx-auto mb-5" />
                </div>
                <p>
                  Follow the instructions sent to <strong>{email}</strong> to
                  reset your account password. Then you can sign in again with
                  the new password.
                </p>
                <div className="mt-3 text-center flex flex-col">
                  <button
                    onClick={(e) => navigate("/sign-in")}
                    type="submit"
                    className="p-2 w-full text-center py-3 bg-[#313131] rounded-md text-white font-bold font-poppins flex justify-center gap-3"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
