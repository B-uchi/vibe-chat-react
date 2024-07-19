import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { FiPlus } from "react-icons/fi";
import Chats from "../components/Chats";
import ChatWindow from "../components/ChatWindow";
import { IoSearch } from "react-icons/io5";
import { IoMdArrowBack } from "react-icons/io";
import { useAuth } from "../lib/hooks/useAuth";

const Dashboard = () => {
  const [addPersonModal, setAddPersonModal] = useState(true);
  const [users, setUsers] = useState([]);
  const user = useAuth().user;
  console.log(users);

  useEffect(() => {
    const fetchOtherUsers = async () => {
      const idToken = await user.getIdToken(true);
      const response = await fetch(
        "http://localhost:5000/api/user/getOtherUsers",
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (response.status == 200) {
        const data = await response.json();
        setUsers(data.otherUsers);
      }
    };
    fetchOtherUsers();
  }, [addPersonModal]);

  return (
    <div className="relative h-full flex bg-[#efefef]">
      <Toaster richColors position="top-right" />
      <div className="bg-[#ffffff] w-[30%] border-r-[1px] border-r-[#d3d2d2]">
        <Chats />
      </div>
      <div className="flex-grow border-r-[1px] border-r-[#d3d2d2]">
        <ChatWindow />
      </div>
      <div className="absolute right-10 bottom-10">
        <div>
          <button
            onClick={() => setAddPersonModal(true)}
            className="shadow-lg p-2 flex justify-center items-center rounded-full bg-[#313131] text-white hover:bg-[#686868] transition-all"
          >
            <FiPlus size={40} />
          </button>
        </div>
      </div>
      {addPersonModal && (
        <div className="bg-[rgba(0,0,0,0.4)] bg-opacity-50 w-full h-full absolute flex justify-center items-center">
          <div className="relative bg-white rounded-md border-[1px] border-[#e1e1e1] w-1/3 h-[80%] p-3">
            <div className="flex items-center border-b-[1px] border-[#e1e1e1]">
              <button className="mr-2" onClick={() => setAddPersonModal(false)}>
                <IoMdArrowBack size={25} />
              </button>
              <h1 className="font-rowdies text-xl w-1/3">Start a Chat</h1>
              <div className="flex-grow p-1 bg-[#efefef] rounded-md flex items-center">
                <IoSearch size={25} className="mr-2" />
                <input
                  type="text"
                  placeholder="Search users"
                  className="bg-transparent flex-grow p-1 outline-none"
                />
              </div>
            </div>
            {users && users.length > 0 ? (
              <div>dddd</div>
            ) : (
              <p className="absolute right-[50%] bottom-[50%] translate-x-[50%]">
                No users found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
