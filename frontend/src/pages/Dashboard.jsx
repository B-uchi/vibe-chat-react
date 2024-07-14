import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
    const navigate = useNavigate();
    const [authLoading, setAuthLoading] = useState(null);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.data()?.userName) {
              setLoading(false);
              navigate("/");
            } else {
              setLoading(false);
            }
          } catch (error) {
            toast.error('An error occured, please refresh page')
          }
        } else {
          setLoading(false);
          navigate("/sign-in");
        }
        setAuthLoading(false); // Auth state check complete
      });
  
      return () => unsubscribe();
    }, [navigate]);
    
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard