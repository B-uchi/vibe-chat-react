import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="bg-[#313131] w-full h-[8vh]">
      <div className="container mx-auto text-white flex justify-between items-center p-3">
        <div
          onClick={() => {
            navigate("/");
          }}
          className="cursor-pointer"
        >
          <h1 className="font-bold font-rowdies text-2xl">Vibe Chat</h1>
        </div>
        <div className="font-poppins">User</div>
      </div>
    </nav>
  );
};

export default Navbar;
