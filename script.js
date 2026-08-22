
(() => {
  "use strict";

  const API_BASE = "https://www.themealdb.com/api/json/v1/1/search.php";
  const INITIAL_VISIBLE = 5;

  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const grid = document.getElementById("results-grid");
  const statusMessage = document.getElementById("status-message");
  const showAllBtn = document.getElementById("show-all-btn");
  const modal = document.getElementById("recipe-modal");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  
  let currentMeals = [];

  document.getElementById("year").textContent = new Date().getFullYear();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    runSearch(query);
  });
  showAllBtn.addEventListener("click", () => {
    renderMeals(currentMeals, { revealAll: true });
    showAllBtn.hidden = true;
  });

  modalClose.addEventListener("click", () => modal.close());
  modal.addEventListener("click", (event) => {
    
    if (event.target === modal) modal.close();
  });

  async function runSearch(query) {
    
    resetResults();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStatus(`Flipping through the box for “${query}”…`);

    try {
      const url = `${API_BASE}?s=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const meals = data.meals || [];
      currentMeals = meals;

      if (meals.length === 0) {
        setStatus(`No cards in the box for “${query}”. Try another word.`, "error");
        return;
      }

      setStatus(
        `${meals.length} card${meals.length === 1 ? "" : "s"} found for “${query}”.`
      );
      renderMeals(meals, { revealAll: false });
    } catch (error) {
      console.error(error);
      setStatus(
        "Something went wrong reaching TheMealDB. Check your connection and try again.",
        "error"
      );
    }
  }
  function resetResults() {
    grid.innerHTML = "";
    showAllBtn.hidden = true;
    currentMeals = [];
    setStatus("");
  }

  function setStatus(message, tone = "normal") {
    statusMessage.textContent = message;
    if (tone === "error") {
      statusMessage.setAttribute("data-tone", "error");
    } else {
      statusMessage.removeAttribute("data-tone");
    }
  }

  function renderMeals(meals, { revealAll }) {
    grid.innerHTML = "";

    const visibleMeals = revealAll ? meals : meals.slice(0, INITIAL_VISIBLE);
    const fragment = document.createDocumentFragment();

    visibleMeals.forEach((meal) => {
      fragment.appendChild(buildCard(meal));
    });

    grid.appendChild(fragment);

    // 5. Show "SHOW ALL" only when there are more than 5 results and they're hidden
    const hasMore = meals.length > INITIAL_VISIBLE;
    showAllBtn.hidden = !(hasMore && !revealAll);
  }
  function buildCard(meal) {
    const card = document.createElement("article");
    card.className = "recipe-card";

    const instructions = (meal.strInstructions || "").trim();
    const shortInstructions =
      instructions.length > 220 ? `${instructions.slice(0, 220).trim()}…` : instructions;

    card.innerHTML = `
      <div class="recipe-card__image-wrap">
        <img src="${escapeHtml(meal.strMealThumb)}" alt="${escapeHtml(meal.strMeal)}" loading="lazy" />
        <span class="recipe-card__id">ID ${escapeHtml(meal.idMeal)}</span>
      </div>
      <div class="recipe-card__body">
        <h3 class="recipe-card__name">${escapeHtml(meal.strMeal)}</h3>
        <div class="recipe-card__tags">
          ${meal.strCategory ? `<span class="tag tag--category">${escapeHtml(meal.strCategory)}</span>` : ""}
          ${meal.strArea ? `<span class="tag tag--area">${escapeHtml(meal.strArea)}</span>` : ""}
        </div>
        <p class="recipe-card__instructions">${escapeHtml(shortInstructions) || "No instructions provided."}</p>
        <div class="recipe-card__footer">
          <button type="button" class="recipe-card__link">Read full recipe →</button>
        </div>
      </div>
    `;
    card.querySelector(".recipe-card__link").addEventListener("click", () => openModal(meal));

    return card;
  }

  function openModal(meal) {
    modalBody.innerHTML = `
      <img src="${escapeHtml(meal.strMealThumb)}" alt="${escapeHtml(meal.strMeal)}" />
      <p style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--ink-soft);">
        MEAL ID ${escapeHtml(meal.idMeal)}
      </p>
      <h2>${escapeHtml(meal.strMeal)}</h2>
      <div class="recipe-modal__meta">
        ${meal.strCategory ? `<span class="tag tag--category">${escapeHtml(meal.strCategory)}</span>` : ""}
        ${meal.strArea ? `<span class="tag tag--area">${escapeHtml(meal.strArea)}</span>` : ""}
      </div>
      <p class="recipe-modal__instructions">${escapeHtml(meal.strInstructions || "No instructions provided.")}</p>
      ${
        meal.strYoutube
          ? `<p><a href="${escapeHtml(meal.strYoutube)}" target="_blank" rel="noopener">Watch on YouTube ↗</a></p>`
          : ""
      }
    `;
    modal.showModal();
  }
  unction escapeHtml(value) {
    if (value === undefined || value === null) return "";
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }
})();


