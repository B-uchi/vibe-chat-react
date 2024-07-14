import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { FiPlus } from "react-icons/fi";

const Dashboard = () => {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(null);

  return (
    <div className="relative h-full flex">
      <Toaster richColors position="top-right" />
      <div className="bg-[#efefef] w-[30%] border-r-[1px] border-r-[#d3d2d2]"></div>
      <div className="absolute right-10 bottom-10">
        <div>
          <button className="shadow-lg p-2 flex justify-center items-center rounded-full bg-[#313131] text-white hover:bg-[#686868] transition-all">
            <FiPlus size={40} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
