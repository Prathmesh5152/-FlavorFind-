const container = document.getElementById('favorites-container');
const detail = document.getElementById('meal-detail');
const loader = document.getElementById('loader');

const favoriteIds = JSON.parse(localStorage.getItem('favoriteMeals')) || [];

if (favoriteIds.length === 0) {
  container.innerHTML = '<p>No favorites found.</p>';
} else {
  loader.style.display = 'flex';

  Promise.all(
    favoriteIds.map(id =>
      fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(res => res.json())
        .then(data => data.meals[0])
    )
  ).then(meals => {
    loader.style.display = 'none';
    container.innerHTML = meals.map(meal => `
      <div class="meal">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" onclick="showMealDetail(${meal.idMeal})">
        <div class="meal-info">
          <h3>${meal.strMeal}</h3>
          <p>${meal.strArea} • ${meal.strCategory}</p>
          <button onclick="removeFavorite(${meal.idMeal})">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    `).join('');
  });
}

function removeFavorite(id) {
  let favs = JSON.parse(localStorage.getItem('favoriteMeals')) || [];
  favs = favs.filter(mid => mid !== id);
  localStorage.setItem('favoriteMeals', JSON.stringify(favs));
  location.reload();
}

function showMealDetail(id) {
  loader.style.display = 'flex';
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(res => res.json())
    .then(data => {
      const meal = data.meals[0];
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
          ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`);
        } else break;
      }

      loader.style.display = 'none';
      detail.innerHTML = `
        <h2>${meal.strMeal}</h2>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:100%; border-radius:10px;">
        <p><strong>Category:</strong> ${meal.strCategory}</p>
        <p><strong>Area:</strong> ${meal.strArea}</p>
        <h3>Steps</h3>
        <ol>
          ${meal.strInstructions
            .split(/(?:\r?\n)+|(?<=\.)\s+/)
            .filter(step => step.trim() !== '')
            .map(step => `<li>${step.trim()}</li>`).join('')}
        </ol>
        <h3>Ingredients</h3>
        <ul>${ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
        <p><a href="${meal.strYoutube}" target="_blank">Watch on YouTube</a></p>
        <button onclick="detail.innerHTML = ''" style="margin-top:20px; background:#f67280; color:white; border:none; padding:10px; border-radius:5px;">Back</button>
      `;
    });
}
