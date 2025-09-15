import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const AdminProtectedRoute = ({ children }) => {
  const { user, loading, subscription } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user )) {
      toast.error("You do not have permission to view this page.");
      navigate('/');
    } else if (!loading && user && subscription?.status !== 'active') {
      toast.error('Activate a subscription to access the dashboard.');
      navigate('/billing');
    }
  }, [user, loading, navigate]);

  return loading || !user  || subscription?.status !== 'active' ? (
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl text-gray-500">Loading...</p>
    </div>
  ) : (
    children
  );
};

export default AdminProtectedRoute;