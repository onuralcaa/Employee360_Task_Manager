import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser } from "../api/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect component that checks token and redirects to appropriate panel
  useEffect(() => {
    // First check if we already have user data in location state (from login)
    if (location.state && location.state.role) {
      const { role } = location.state;
      
      // Direct redirect based on role from state
      redirectBasedOnRole(role, location.state);
      return;
    }

    // If no state, try to fetch from token
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await getUser(userId);
        if (!response || !response.data) {
          throw new Error("Failed to load user data");
        }
        
        const userData = response.data;
        // Include both id formats to prevent inconsistencies
        const userState = {
          ...userData,
          id: userData._id || userData.id,
          _id: userData._id || userData.id
        };
        
        // Redirect based on role
        redirectBasedOnRole(userData.role, userState);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("Failed to load user data. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsLoading(false);
        
        // Give user time to see error before redirecting
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    };

    fetchUserData();
  }, [navigate, location.state]);

  // Helper function to handle redirects based on role
  const redirectBasedOnRole = (role, userState) => {
    // Normalize role to lowercase for case-insensitive comparison
    const normalizedRole = role.toLowerCase();
    
    if (normalizedRole === "admin") {
      navigate("/admin-panel", { replace: true, state: userState });
    } else if (normalizedRole === "team_leader") {
      navigate("/team-panel", { replace: true, state: userState });
    } else if (normalizedRole === "personel" || normalizedRole === "personnel") {
      navigate("/user-panel", { replace: true, state: userState });
    } else {
      setError(`Unknown role: ${role}`);
      setIsLoading(false);
      
      // Remove invalid credentials after a delay
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login", { replace: true });
      }, 3000);
    }
  };

  // Show loading or error states
  return (
    <div className="dashboard-container">
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      ) : (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate("/login")}>Giriş Sayfasına Dön</button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
