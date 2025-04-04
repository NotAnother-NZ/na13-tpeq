// Module for insights sorting functionality
export function initializeInsightsSorting() {
    if (!document.querySelector("#insights-overview-section")) return;
    
    function parseDate(dateStr) {
      var parts = dateStr.split("/");
      var day = parts[0];
      var month = parts[1];
      var year = parts[2].length === 2 ? "20" + parts[2] : parts[2];
      return new Date(year, month - 1, day);
    }
    
    function sortCards(sortType, container) {
      var cards = Array.from(container.querySelectorAll('[role="listitem"]'));
      cards.sort(function (a, b) {
        if (sortType === "latest" || sortType === "oldest") {
          var dateA = parseDate(
            a.querySelector("[data-dt-date-zero]").textContent.trim()
          );
          var dateB = parseDate(
            b.querySelector("[data-dt-date-zero]").textContent.trim()
          );
          return sortType === "latest" ? dateB - dateA : dateA - dateB;
        } else if (sortType === "az" || sortType === "za") {
          var titleA = a
            .querySelector(".insights-overview-card-content h2")
            .textContent.trim()
            .toLowerCase();
          var titleB = b
            .querySelector(".insights-overview-card-content h2")
            .textContent.trim()
            .toLowerCase();
          if (titleA < titleB) return sortType === "az" ? -1 : 1;
          if (titleA > titleB) return sortType === "az" ? 1 : -1;
          return 0;
        }
        return 0;
      });
      
      cards.forEach(function (card) {
        container.appendChild(card);
      });
    }
    
    var sortButtons = document.querySelectorAll("[data-dt-sort-cms]");
    sortButtons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var targetSelector = btn.getAttribute("data-dt-sort-cms");
        var container = document.querySelector(targetSelector);
        var sortType = btn.getAttribute("data-dt-sort");
        var allButtons = btn.parentElement.querySelectorAll(
          ".filter-sort-button"
        );
        
        allButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        
        btn.classList.add("active");
        container.style.transition = "filter 0.5s ease";
        container.style.filter = "blur(8px) opacity(0.5)";
        
        setTimeout(function () {
          sortCards(sortType, container);
          container.style.filter = "none";
        }, 300);
      });
    });
  }