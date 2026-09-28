const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;
const BASE_URL = process.env.REACT_APP_SPOONACULAR_BASE_URL || 'https://api.spoonacular.com';

if (!API_KEY) {
  console.warn('Spoonacular API key is not set. Create a .env file with REACT_APP_SPOONACULAR_API_KEY');
}

export const searchFoods = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/food/ingredients/search?query=${encodeURIComponent(query)}&number=10&apiKey=${API_KEY}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch food data');
    }
    
    const data = await response.json();
    return (data.results || []).map(item => ({
      id: item.id,
      name: item.name,
      servingUnit: 'g',
      servingQty: 100, // Default to 100g
      imageUrl: item.image ? `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` : null
    }));
  } catch (error) {
    console.error('Error searching foods:', error);
    return [];
  }
};

export const getNutritionInfo = async (foodName, servingSize) => {
  try {
    // Find matching ingredient id using Spoonacular
    const searchRes = await fetch(`${BASE_URL}/food/ingredients/search?query=${encodeURIComponent(foodName)}&number=1&apiKey=${API_KEY}`);
    if (!searchRes.ok) throw new Error('Failed to find ingredient');
    const searchData = await searchRes.json();
    const first = (searchData.results || [])[0];
    if (!first || !first.id) return null;

    const infoRes = await fetch(`${BASE_URL}/food/ingredients/${first.id}/information?amount=${servingSize}&unit=gram&apiKey=${API_KEY}`);
    if (!infoRes.ok) throw new Error('Failed to fetch nutrition data');
    const data = await infoRes.json();

    const nutrients = (data.nutrition && data.nutrition.nutrients) || [];
    const find = (name) => {
      const item = nutrients.find(n => (n.name || n.title || '').toLowerCase().includes(name));
      return item ? Math.round(item.amount) : 0;
    };

    return {
      name: data.name || foodName,
      calories: find('calories'),
      protein: find('protein'),
      carbs: find('carbohydrate') || find('carbs'),
      fat: find('fat'),
      servingSize: servingSize,
      servingUnit: 'g'
    };
  } catch (error) {
    console.error('Error getting nutrition info:', error);
    return null;
  }
};

// Helper function to determine meal category based on time
export const getMealCategoryByTime = () => {
  const hour = new Date().getHours();
  
  if (hour >= 4 && hour < 11) {
    return 'breakfast';
  } else if (hour >= 11 && hour < 15) {
    return 'lunch';
  } else if (hour >= 15 && hour < 18) {
    return 'snack';
  } else if (hour >= 18 && hour < 22) {
    return 'dinner';
  } else {
    return 'snack';
  }
};