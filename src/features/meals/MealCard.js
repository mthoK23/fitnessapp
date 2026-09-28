import React from 'react';
import './MealCard.css';

const MealCard = ({ meal, onDelete }) => {
  // Get category class for styling
  const getCategoryClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'breakfast': return 'category-breakfast';
      case 'lunch': return 'category-lunch';
      case 'dinner': return 'category-dinner';
      case 'snack': return 'category-snack';
      default: return 'category-other';
    }
  };

  return (
      <article
      className={`meal-card ${getCategoryClass(meal.category)}`}
      aria-label={`Meal: ${meal.name}${meal.category ? `, ${meal.category}` : ''}`}
    >
      <header className="meal-header">
        <h3 className="meal-title">{meal.name}</h3>
        {meal.category && (
          <span className="meal-category" aria-label={`Category: ${meal.category}`}>{meal.category}</span>
        )}
      </header>
      <section className="meal-info">
        {meal.time && <time className="meal-time" dateTime={meal.time}>{meal.time}</time>}
      </section>
      <section className="meal-stats" aria-label="Meal Nutrition">
        <p className="meal-calories">{meal.calories} kcal</p>
        <section className="meal-macros">
          {meal.protein && <span className="macro protein">{meal.protein}g protein</span>}
          {meal.carbs && <span className="macro carbs">{meal.carbs}g carbs</span>}
          {meal.fat && <span className="macro fat">{meal.fat}g fat</span>}
        </section>
      </section>
      {onDelete && (
        <button
          onClick={() => onDelete(meal.id)}
          className="meal-delete-btn"
          aria-label={`Delete meal: ${meal.name}`}
        >
          Delete
        </button>
      )}
    </article>
  );
};

MealCard.defaultProps = {
  onDelete: null
};

export default MealCard;