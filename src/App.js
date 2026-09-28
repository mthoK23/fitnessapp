import React from 'react';
import { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './shared/components/Navbar';
import Dashboard from './features/dashboard/Dashboard';
import Meals from './features/meals/Meals';
import Workouts from './features/workouts/Workouts';
import Progress from './features/progress/Progress';
import User from './features/user/User';
import LoginModal from './features/user/LoginModal';
import NotFound from './shared/components/NotFound';
import WorkoutDetails from './features/workouts/WorkoutDetails';
import { AuthContext } from './features/user/AuthContext';
import {useNavigate} from "react-router-dom";

function App() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isLoading, isAuthenticated]);


  //Keyboard Navigation between pages
  useEffect(()=>{
    const handleKeyDown = (e) =>{
      if (e.altKey){
        switch (e.key) {
          case "1":
            navigate("/dashboard");
            break;
          case "2":
            navigate("/meals");
            break;
          case "3":
            navigate("/workouts");
            break;
          case "4":
            navigate("/progress");
            break;
          case "5":
            navigate("/profile");
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
  

  if (isLoading) {
    return <section>Loading</section>;
  }

  return (
    <section>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/meals" element={isAuthenticated ? <Meals /> : <Navigate to="/" />} />
        <Route path="/workouts" element={isAuthenticated ? <Workouts /> : <Navigate to="/" />} />
        <Route path="/workouts/:id" element={isAuthenticated ? <WorkoutDetails /> : <Navigate to="/" />} />
        <Route path="/progress" element={isAuthenticated ? <Progress /> : <Navigate to="/" />} />
        <Route path="/user" element={<User/>} />
        <Route path="*" element={<NotFound/>}/>
      </Routes>
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </section>
  );
}

export default App;