import React, { useState } from 'react';
import { searchFoods, getNutritionInfo } from '../../services/nutritionixService';
import '../styles/FoodSearch.css';

const FoodSearch = ({ onFoodSelect }) => {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingSize, setServingSize] = useState(100);
  const [nutritionInfo, setNutritionInfo] = useState(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    const results = await searchFoods(query);
    setFoods(results);
    setLoading(false);
  };

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setServingSize(100); // Reset to default serving size
    setNutritionInfo(null);
  };

  const handleGetNutrition = async () => {
    if (!selectedFood) return;
    
    setLoadingNutrition(true);
    const info = await getNutritionInfo(selectedFood.name, servingSize);
    setNutritionInfo(info);
    setLoadingNutrition(false);
  };

  const handleAddFood = () => {
    if (nutritionInfo) {
      onFoodSelect(nutritionInfo);
      
      // Reset form
      setQuery('');
      setFoods([]);
      setSelectedFood(null);
      setServingSize(100);
      setNutritionInfo(null);
    }
  };

  return (
    <section className="food-search" aria-label="Food Search">
      <form
        className="search-container"
        onSubmit={e => {
          e.preventDefault();
          handleSearch();
        }}
        role="search"
        aria-label="Search for food"
      >
        <label htmlFor="food-search-input" className="sr-only">
          Search for a food
        </label>
        <input
          id="food-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a food (e.g. chicken pizza)"
          className="search-input"
          aria-label="Food search input"
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading}
          aria-label="Search"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {foods.length > 0 && !selectedFood && (
        <section className="search-results" aria-label="Search Results">
          <header>
            <h4 className="results-title">Results</h4>
          </header>
          <ul className="results-list" aria-live="polite">
            {foods.map(food => (
              <li
                key={food.id}
                className="result-item"
                onClick={() => handleFoodSelect(food)}
                tabIndex={0}
                role="button"
                aria-pressed="false"
                aria-label={`Select ${food.name}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleFoodSelect(food);
                }}
              >
                {food.imageUrl && (
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="food-image"
                  />
                )}
                <span className="food-name">{food.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selectedFood && (
        <section className="selected-food" aria-label="Selected Food Details">
          <header>
            <h4 className="selected-title">{selectedFood.name}</h4>
          </header>

          <div className="serving-control">
            <label className="serving-label" htmlFor="serving-size-input">
              Serving size (g):
            </label>
            <input
              id="serving-size-input"
              type="number"
              value={servingSize}
              onChange={(e) => setServingSize(Number(e.target.value))}
              min="1"
              className="serving-input"
              aria-label="Serving size in grams"
            />
            <button
              onClick={handleGetNutrition}
              className="nutrition-button"
              disabled={loadingNutrition}
              aria-label="Get Nutrition Info"
            >
              {loadingNutrition ? 'Loading...' : 'Get Nutrition'}
            </button>
          </div>

          {nutritionInfo && (
            <section className="nutrition-info" aria-label="Nutrition Information">
              <div className="nutrition-item">
                <span className="nutrition-label">Calories:</span>
                <span className="nutrition-value">{nutritionInfo.calories} kcal</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Protein:</span>
                <span className="nutrition-value">{nutritionInfo.protein}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Carbs:</span>
                <span className="nutrition-value">{nutritionInfo.carbs}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Fat:</span>
                <span className="nutrition-value">{nutritionInfo.fat}g</span>
              </div>
            </section>
          )}

          <div className="button-group">
            <button
              onClick={() => setSelectedFood(null)}
              className="cancel-button"
              aria-label="Cancel"
            >
              Cancel
            </button>
            {nutritionInfo && (
              <button
                onClick={handleAddFood}
                className="add-button"
                aria-label="Add Food"
              >
                Add Food
              </button>
            )}
          </div>
        </section>
      )}
    </section>
  );
};

export default FoodSearch;