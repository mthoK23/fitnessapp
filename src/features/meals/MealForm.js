import React, { useState, useContext } from 'react';
import { AppContext } from '../user/AppContext';
import FoodSearch from '../../shared/components/FoodSearch';
import { getMealCategoryByTime } from '../../services/nutritionixService';
import './MealForm.css';

const MealForm = () => {
  const { addMeal, meals } = useContext(AppContext);
  const [isCustomMeal, setIsCustomMeal] = useState(true);
  const [mealData, setMealData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });

   const handleChange = (e) => {
    const { name, value } = e.target;
    setMealData({
      ...mealData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Determine meal category if not specified
    let category = mealData.category;
    if (!category) {
      category = determineCategory();
    }
    
    addMeal({
      ...mealData,
      category
    });
    
    setMealData({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      time: '',
      date: new Date().toISOString().split('T')[0],
      category: ''
    });
  };

  const determineCategory = () => {
    // Check if there are any meals for today
    const today = new Date().toISOString().split('T')[0];
    const todaysMeals = meals.filter(meal => meal.date === today);
    
    if (todaysMeals.length === 0) {
      // First meal of the day
      return getMealCategoryByTime();
    } else {
      // Look at the most recent meal category
      const categories = ['breakfast', 'lunch', 'dinner', 'snack'];
      const existingCategories = todaysMeals.map(meal => meal.category?.toLowerCase());
      
      // Find the next logical meal
      for (const cat of categories) {
        if (!existingCategories.includes(cat)) {
          return cat;
        }
      }
      
      // If all categories are used, default to snack
      return 'snack';
    }
  };

  const handleFoodSelect = (food) => {
    const category = determineCategory();
    
    addMeal({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: mealData.date,
      category
    });
    
    setIsCustomMeal(true); // Switch back to the form view
  };

  return (
    <div className="meal-form-container">
      <h3 className="form-title">Add New Meal</h3>
      
      <section className="form-tabs">
        <button 
          className={`tab-button ${isCustomMeal ? 'active' : ''}`}
          type="button"
          onClick={() => setIsCustomMeal(true)}
        >
          Custom Meal
        </button>
        <button 
          className={`tab-button ${!isCustomMeal ? 'active' : ''}`}
          type="button"
          onClick={() => setIsCustomMeal(false)}
        >
          Search Food Database
        </button>
      </section>
      
      {isCustomMeal ? (
        <form onSubmit={handleSubmit} className="meal-form">
          <section className="form-grid">
            <section className="form-group">
              <label className="form-label">Meal Name</label>
              <input
                type="text"
                name="name"
                value={mealData.name}
                onChange={handleChange}
                placeholder="Chicken Burger"
                className="form-input"
                required
              />
            </section>
            
            <section className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={mealData.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Auto-select</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </section>
            
            <section className="form-group">
              <label className="form-label">Time</label>
              <input
                type="text"
                name="time"
                value={mealData.time}
                onChange={handleChange}
                placeholder="e.g., 8:00 AM"
                className="form-input"
              />
            </section>

            <section className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                value={mealData.date}
                onChange={handleChange}
                className="form-input"
              />
            </section>
            
            <section className="form-group">
              <label className="form-label">Calories</label>
              <input
                type="number"
                name="calories"
                value={mealData.calories}
                onChange={handleChange}
                className="form-input"
              />
            </section>
            
            <section className="form-group">
              <label className="form-label">Protein (g)</label>
              <input
                type="number"
                name="protein"
                value={mealData.protein}
                onChange={handleChange}
                className="form-input"
              />
            </section>
            
            <section className="form-group">
              <label className="form-label">Carbs (g)</label>
              <input
                type="number"
                name="carbs"
                value={mealData.carbs}
                onChange={handleChange}
                className="form-input"
              />
            </section>
            
            <section className="form-group">
              <label className="form-label">Fat (g)</label>
              <input
                type="number"
                name="fat"
                value={mealData.fat}
                onChange={handleChange}
                className="form-input"
              />
            </section>
          </section>
          
          <button
            type="submit"
            className="submit-button"
          >
            Add Meal
          </button>
        </form>
      ) : (
        <FoodSearch onFoodSelect={handleFoodSelect} />
      )}
    </div>
  );
};

export default MealForm;