
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
    // click on the backdrop closes the modal
    if (event.target === modal) modal.close();
  });

  async function runSearch(query) {
    // 6. Erase previous results and start fresh from the top of the page
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