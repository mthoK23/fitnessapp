import React, { useContext, useState, useEffect } from "react";
import { AppContext } from './AppContext';
import UserProfileForm from './UserProfileForm';
import ComparisonModal from "../../shared/components/ComparisonModal";

import './User.css';

function User() {
   
    const [showComparison, setShowComparison] = useState(false);
   const { userProfile,unit, setUnit  } = useContext(AppContext);
    useEffect(() => {
        localStorage.setItem("unit", unit);
    }, [unit]);

     

        if (!userProfile) {
        return (
            <section className="user-container">
                <h1 className="user-title">Update Profile</h1>
                <p>Please log in to update your profile.</p>
            </section>
        );
    }

    return (
        <main className="user-container" aria-label="User Profile Main Content">
            <header aria-label="User Profile Header">
                <h1 className="user-title">Update Profile</h1>    
            </header>
            <UserProfileForm />
            <section className="user-settings-card" aria-label="User Settings & Customization">

                <h2 className="card-title">Settings & Customization</h2>

      
                <section className="setting-row" aria-label="Unit Setting">
                    <span>Units</span>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setUnit(u => u === "metric" ? "imperial" : "metric")}
                    >
                        {unit === "metric" ? "Switch to Imperial" : "Switch to Metric"}
                    </button>

        
  

                </section>


                <section className="setting-row" aria-label="Comparison Modal">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowComparison(true)}
                        >

                            View Assignment Changes
                        </button>
                        {showComparison && (
                            <ComparisonModal onClose={() => setShowComparison(false)} />
                        )}
                </section>
                
            </section>

        </main>
    );
}

export default User;

