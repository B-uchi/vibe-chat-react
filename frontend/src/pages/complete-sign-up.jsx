import Spinner from "../components/Spinner";
import { useAuth } from "../lib/hooks/useAuth.jsx";
import { db } from "../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CompleteSignup = () => {
  const user = useAuth().user;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.data()?.userName) {
          setLoading(false);
          navigate("/");
        } else {
          setLoading(false);
        }
      }
    };
    checkUser();
  }, [user]);

  const submitUsername = async () => {
    const usernameRegex = /^[a-zA-Z0-9]{4,16}$/;

    const idToken = await user?.getIdToken(true);

    if (!username) {
      return toast.error("Username is required");
    }
    if (!usernameRegex.test(username) || username.includes(" ")) {
      toast.error("Invalid Username");
      return setError(true);
    }

    setLoading(true);
    try {
      const response = await fetch("/api/completeSignup", {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      setLoading(false);
    } catch (error) {
      toast.error("An error occured");
      console.log(error?.message);
    }
  };
  return (
    <div className="relative h-[100vh] bg-[#efefef] flex justify-center items-center">
      <Toaster position="top-right" richColors />
      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white p-5 rounded-md border-[1px] border-[#3333333a] shadow">
          <h1 className="font-rowdies text-3xl font-bold text-[#333333]">
            Welcome Onboard...
          </h1>
          <p className="font-poppins">
            Great to have you! Now let&apos;s give you a username.
          </p>
          <div className="">
            <div className="flex items-center mt-5 gap-2">
              <p>vibe.com/@</p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="border-[1px] border-[#3333333a] p-2 flex-grow rounded-md font-rowdies"
              />
            </div>
            {error && (
              <div className="text-red-600">
                <small>Username should contain:</small>
                <ul className="list-inside list-disc">
                  <li>
                    <small>4-16 characters</small>
                  </li>
                  <li>
                    <small>Alphanumeric characters</small>
                  </li>
                  <li>
                    <small>No symbols or white space</small>
                  </li>
                </ul>
              </div>
            )}
            <button
              type="submit"
              onClick={() => submitUsername()}
              className="hover:bg-[#3333339f] bg-[#333333] text-white rounded-md font-rowdies w-full p-2 mt-5"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteSignup;
