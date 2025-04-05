// insights-sorting.js - Insights sorting functionality
window.App = window.App || {};
window.App.InsightsSorting = {
  initialize: function () {
    if (!document.querySelector("#insights-overview-section")) return;

    const sortButtons = document.querySelectorAll("[data-dt-sort-cms]");
    sortButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const targetSelector = btn.getAttribute("data-dt-sort-cms");
        const container = document.querySelector(targetSelector);
        const sortType = btn.getAttribute("data-dt-sort");
        const allButtons = btn.parentElement.querySelectorAll(
          ".filter-sort-button"
        );

        allButtons.forEach((b) => {
          b.classList.remove("active");
        });

        btn.classList.add("active");
        container.style.transition = "filter 0.5s ease";
        container.style.filter = "blur(8px) opacity(0.5)";

        setTimeout(() => {
          this.sortCards(sortType, container);
          container.style.filter = "none";
        }, 300);
      });
    });
  },

  parseDate: function (dateStr) {
    const parts = dateStr.split("/");
    const day = parts[0];
    const month = parts[1];
    const year = parts[2].length === 2 ? "20" + parts[2] : parts[2];
    return new Date(year, month - 1, day);
  },

  sortCards: function (sortType, container) {
    const cards = Array.from(container.querySelectorAll('[role="listitem"]'));

    cards.sort((a, b) => {
      if (sortType === "latest" || sortType === "oldest") {
        const dateA = this.parseDate(
          a.querySelector("[data-dt-date-zero]").textContent.trim()
        );
        const dateB = this.parseDate(
          b.querySelector("[data-dt-date-zero]").textContent.trim()
        );
        return sortType === "latest" ? dateB - dateA : dateA - dateB;
      } else if (sortType === "az" || sortType === "za") {
        const titleA = a
          .querySelector(".insights-overview-card-content h2")
          .textContent.trim()
          .toLowerCase();
        const titleB = b
          .querySelector(".insights-overview-card-content h2")
          .textContent.trim()
          .toLowerCase();
        if (titleA < titleB) return sortType === "az" ? -1 : 1;
        if (titleA > titleB) return sortType === "az" ? 1 : -1;
        return 0;
      }
      return 0;
    });

    cards.forEach((card) => {
      container.appendChild(card);
    });
  },
};
