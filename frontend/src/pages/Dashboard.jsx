import {  useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(null);


  return (
    <div className="relative h-full">
      <Toaster richColors position="top-right" />
      bbb
      <div className="absolute right-0 bottom-0"> plus</div>
    </div>
  );
};

export default Dashboard;
