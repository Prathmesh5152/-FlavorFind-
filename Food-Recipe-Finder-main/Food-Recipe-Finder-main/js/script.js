const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const searchButton = document.getElementById('search-button');
const mealResults = document.getElementById('meal-results');
const mealDetail = document.getElementById('meal-detail');

// Check login status and show welcome message if logged in
const username = localStorage.getItem('loggedInUser');
if (username) {
  const header = document.querySelector('h1');
  const welcomeDiv = document.createElement('div');
  welcomeDiv.style.textAlign = 'center';
  welcomeDiv.innerHTML = `<p>Welcome, <strong>${username}</strong>! <button id="logout-button">Logout</button></p>`;
  header.insertAdjacentElement('afterend', welcomeDiv);

  document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    location.reload();
  });
}
const favCountEl = document.getElementById('favorites-count');
if (favCountEl) {
  const favorites = JSON.parse(localStorage.getItem('favoriteMeals')) || [];
  favCountEl.textContent = favorites.length;
}


searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  const category = filterSelect.value;
  const area = document.getElementById('area-select').value;

  document.getElementById('trending-title').style.display = 'none';
  mealResults.innerHTML = '';
  mealDetail.innerHTML = '';
  loader.style.display = 'flex';

  const fetchUrl = query
    ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    : category
      ? `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
      : area
        ? `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`
        : null;

  if (!fetchUrl) {
    loader.style.display = 'none';
    mealResults.innerHTML = '<p>Please enter a search query or select a filter.</p>';
    return;
  }

  fetch(fetchUrl)
    .then(res => res.json())
    .then(async data => {
      if (!data.meals) {
        loader.style.display = 'none';
        mealResults.innerHTML = '<p>No results found.</p>';
        return;
      }

      let meals = data.meals;

      // If from filter (not search), get full data for each meal
      if (!query) {
        const detailedMeals = await Promise.all(
          meals.map(meal =>
            fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
              .then(res => res.json())
              .then(fullData => fullData.meals[0])
          )
        );
        meals = detailedMeals;
      }

      // Further filter if both category & area are selected
      if (query && category) meals = meals.filter(meal => meal.strCategory === category);
      if (query && area) meals = meals.filter(meal => meal.strArea === area);

      loader.style.display = 'none';
      mealResults.innerHTML = meals.map(meal => `
        <div class="meal">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" onclick="loadMealDetail(${meal.idMeal})">
          <div class="meal-info">
            <h3>${meal.strMeal}</h3>
            <p>${meal.strArea || ''} • ${meal.strCategory || ''}</p>
            <button onclick="toggleFavorite(event, ${meal.idMeal})">
              <i class="fas fa-heart"></i> Favorite
            </button>
          </div>
        </div>
      `).join('');
    })
    .catch(() => {
      loader.style.display = 'none';
      mealResults.innerHTML = '<p>Error fetching results.</p>';
    });
});




function toggleFavorite(event, id) {
  event.stopPropagation();
  let favorites = JSON.parse(localStorage.getItem('favoriteMeals')) || [];
  if (!favorites.includes(id)) {
    favorites.push(id);
    alert('Added to favorites');
  } else {
    favorites = favorites.filter(mealId => mealId !== id);
    alert('Removed from favorites');
  }
  localStorage.setItem('favoriteMeals', JSON.stringify(favorites));
}

function loadMealDetail(id) {
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(res => res.json())
    .then(data => {
      const meal = data.meals[0];
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
          ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`);
        } else {
          break;
        }
      }

      // Clear search results
      mealResults.innerHTML = '';

      // Show meal details
      mealDetail.innerHTML = `
        <h2>${meal.strMeal}</h2>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:100%; border-radius: 10px; margin-top: 10px;">
        <p><strong>Category:</strong> ${meal.strCategory}</p>
        <p><strong>Area:</strong> ${meal.strArea}</p>
        <h3>Steps</h3>
<ol>
  ${meal.strInstructions
          .split(/(?:\r?\n)+|(?<=\.)\s+/)
          .filter(step => step.trim() !== '')
          .map(step => `<li>${step.trim()}</li>`)
          .join('')}
</ol>

        <h3>Ingredients</h3>
        <ul>${ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
        <p><a href="${meal.strYoutube}" target="_blank">Watch on YouTube</a></p>

        <div id="feedback-section">
          <h3>Leave Feedback</h3>
          <textarea id="feedback-text" placeholder="Your feedback..."></textarea>
          <button onclick="submitFeedback(${id})">Submit</button>
          <ul id="feedback-list"></ul>
        </div>

        <button id="back-button" style="margin-top: 20px; background-color:#f67280; color:white; padding:10px; border:none; border-radius:5px;">Back to Search</button>
      `;

      loadFeedback(id);

      // Back button functionality
      document.getElementById('back-button').addEventListener('click', () => {
        mealDetail.innerHTML = '';

      });
    });
}


function submitFeedback(id) {
  const input = document.getElementById('feedback-text');
  const text = input.value.trim();
  const list = document.getElementById('feedback-list');
  if (text) {
    let feedbacks = JSON.parse(localStorage.getItem('feedbacks_' + id)) || [];
    feedbacks.push(text);
    localStorage.setItem('feedbacks_' + id, JSON.stringify(feedbacks));
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
    input.value = '';
  }
}

function loadFeedback(id) {
  const list = document.getElementById('feedback-list');
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks_' + id)) || [];
  list.innerHTML = '';
  feedbacks.forEach(f => {
    const li = document.createElement('li');
    li.textContent = f;
    list.appendChild(li);
  });
}
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchButton.click(); // Trigger the search button's click event
  }
});
const micButton = document.getElementById('mic-button');
const micStatus = document.getElementById('mic-status');

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  micButton.addEventListener('click', () => {
    recognition.start();
  });

  recognition.addEventListener('start', () => {
    micButton.classList.add('listening');
    micStatus.innerText = 'Listening...';
  });

  recognition.addEventListener('result', (e) => {
    let transcript = e.results[0][0].transcript;
    transcript = transcript.replace(/[\p{P}\p{S}]+$/gu, ''); // Remove punctuation from end
    searchInput.value = transcript;
    searchButton.click();
  });

  recognition.addEventListener('end', () => {
    micButton.classList.remove('listening');
    micStatus.innerText = '';
  });
} else {
  micButton.style.display = 'none';
  console.warn('Voice recognition not supported.');
}

window.addEventListener('DOMContentLoaded', loadTrendingMeals);

function loadTrendingMeals() {
  mealResults.innerHTML = '';
  mealDetail.innerHTML = '';
  loader.style.display = 'flex';

  const requests = [];
  for (let i = 0; i < 6; i++) {
    requests.push(fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(res => res.json()));
  }

  Promise.all(requests)
    .then(results => {
      loader.style.display = 'none';
      const meals = results.map(r => r.meals[0]);
      mealResults.innerHTML = meals.map(meal => `
        <div class="meal">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" onclick="loadMealDetail(${meal.idMeal})">
          <div class="meal-info">
            <h3>${meal.strMeal}</h3>
            <p>${meal.strArea} • ${meal.strCategory}</p>
            <button onclick="toggleFavorite(event, ${meal.idMeal})">
              <i class="fas fa-heart"></i> Favorite
            </button>
          </div>
        </div>
      `).join('');
    })
    .catch(() => {
      loader.style.display = 'none';
      mealResults.innerHTML = '<p>Error loading trending meals.</p>';
    });
}
