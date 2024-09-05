import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { FiPlus } from "react-icons/fi";
import Chats from "../components/Chats";
import ChatWindow from "../components/ChatWindow";
import { IoSearch } from "react-icons/io5";
import { IoMdArrowBack } from "react-icons/io";
import { useAuth } from "../lib/hooks/useAuth";
import { setActiveChat } from "../redux/chatReducer/chatAction";
import { connect } from "react-redux";

const Dashboard = () => {
  const [addPersonModal, setAddPersonModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [chatCreated, setChatCreated] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = useAuth().user;

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
      setLoading(false);
      setUsers(data.otherUsers);
    } else {
      setLoading(false);
    }
  };

  const createChat = async (id, username, profilePhoto, onlineStatus) => {
    const idToken = await user.getIdToken(true);
    const response = await fetch("http://localhost:5000/api/chat/createChat", {
      method: "POST",
      body: JSON.stringify({ otherUserId: id }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (response.status == 201) {
      toast.success("Chat created");
      const data = await response.json();
      setChatCreated(!chatCreated);
      setActiveChat({
        username,
        profilePhoto,
        onlineStatus,
        chatId: data.chatId,
        participantId: id,
      });
      setAddPersonModal(false);
    } else {
      if (response.status == 409) {
        return toast("chat already exists");
      }
      toast.error("Error creating chat");
      console.log("Error creating chat");
    }
  };

  return (
    <div className=" h-full flex bg-[#efefef] relative">
      <Toaster richColors position="top-right" />
      <div className="bg-[#ffffff] lg:w-[30%] relative w-full md:w-[50%] border-r-[1px] border-r-[#d3d2d2]">
        <Chats chatCreated={chatCreated} />
        <div className="absolute right-10 bottom-10">
          <div>
            <button
              onClick={() => {
                setAddPersonModal(true);
                fetchOtherUsers();
              }}
              className="shadow-lg p-2 flex justify-center items-center rounded-full bg-[#313131] text-white hover:bg-[#686868] transition-all"
            >
              <FiPlus size={40} />
            </button>
          </div>
        </div>
      </div>
      <div className="md:flex-grow hidden md:block md:w-[50%] border-r-[1px] border-r-[#d3d2d2]">
        {window.innerWidth > 768 && <ChatWindow />}
      </div>
      {addPersonModal && (
        <div className="bg-[rgba(0,0,0,0.4)] bg-opacity-50 w-full h-full absolute flex justify-center items-center">
          <div className="relative bg-white rounded-md border-[1px] border-[#e1e1e1] lg:w-1/3 h-[80%] overflow-auto p-3 flex flex-col">
            <div className="flex gap-4 items-center border-b-[1px] border-[#e1e1e1] mb-2">
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
            <div className="flex-grow relative">
              {loading ? (
                <div className="loader-black absolute right-[50%] bottom-[50%] translate-x-[50%]"></div>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <div
                    onClick={() => {
                      createChat(
                        user.id,
                        user.username,
                        user.profilePhoto,
                        user.onlineStatus
                      );
                    }}
                    key={user.id}
                    className="hover:bg-[#e1e1e1] bg-[#efefef] mb-2 rounded-md p-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePhoto}
                        alt=""
                        className="w-[50px] h-[50px] rounded-full"
                      />
                      <div className="">
                        <p className="font-poppins">{user.username}</p>
                        <p className="font-poppins text-sm line-clamp-1 font-bold">
                          Bio: <span className="font-normal">{user.bio}</span>
                        </p>
                      </div>{" "}
                    </div>
                  </div>
                ))
              ) : (
                <p className="absolute right-[50%] bottom-[50%] translate-x-[50%]">
                  No users found
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setActiveChat: () => dispatch(setActiveChat()),
});

export default connect(null, mapDispatchToProps)(Dashboard);
