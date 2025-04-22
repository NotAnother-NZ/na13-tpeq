// insights-sorting.js - Filtering with blur animations, dynamic empty state messaging, dropdown integration
window.App = window.App || {};
window.App.InsightsSorting = {
  initialize: function () {
    // Exit if insights container doesn't exist
    const insightsContainer = document.querySelector("#insights");
    if (!insightsContainer) return;

    // Initialize dropdown filtering
    this.initFilterDropdown();

    // Initialize button filtering functionality
    this.initFiltering();

    console.log(
      `Insights filtering initialized at 2025-04-14 17:57:01 by Druhin13`
    );
  },

  initFilterDropdown: function () {
    // Get the select element
    const selectElement = document.querySelector("#insights-filter-select");
    if (!selectElement) return;

    // Clear existing options (except the first "All" option)
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }

    // Get all filter buttons to extract available filter types
    const filterButtons = document.querySelectorAll(
      "[data-dt-filter-cms='#insights']"
    );
    if (!filterButtons.length) return;

    // Create a Set to store unique filter types
    const filterTypes = new Set();

    // Extract filter types and names
    const filterOptions = [];

    filterButtons.forEach((button) => {
      const filterType = button.getAttribute("data-dt-filter");
      if (filterType && filterType !== "all") {
        // Get the filter name from the button
        const filterName = this.getFilterButtonText(button);

        // Store the type and name if unique
        if (!filterTypes.has(filterType)) {
          filterTypes.add(filterType);
          filterOptions.push({ value: filterType, text: filterName });
        }
      }
    });

    // Sort options alphabetically
    filterOptions.sort((a, b) => a.text.localeCompare(b.text));

    // Create and append options to the select element
    filterOptions.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      selectElement.appendChild(optionElement);
    });

    // Set up change event listener
    selectElement.addEventListener("change", (e) => {
      const selectedFilter = e.target.value;
      const filterName = e.target.options[e.target.selectedIndex].text;

      // Apply the selected filter
      this.applyFilteringWithBlur(selectedFilter || "all", filterName || "All");

      // Update the active class on the corresponding button
      this.updateActiveFilterButton(selectedFilter || "all");
    });
  },

  updateActiveFilterButton: function (filterType) {
    // Find all filter buttons
    const filterButtons = document.querySelectorAll(
      "[data-dt-filter-cms='#insights']"
    );

    // Remove active class from all buttons
    filterButtons.forEach((btn) => btn.classList.remove("active"));

    // Add active class to the button matching the selected filter
    const activeButton = Array.from(filterButtons).find(
      (btn) => btn.getAttribute("data-dt-filter") === filterType
    );

    if (activeButton) {
      activeButton.classList.add("active");
    }
  },

  initFiltering: function () {
    const filterButtons = document.querySelectorAll(
      "[data-dt-filter-cms='#insights']"
    );
    if (!filterButtons.length) return;

    // Add click handlers to all filter buttons
    filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();

        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"));

        // Add active class to clicked button
        button.classList.add("active");

        // Get filter type
        const filterType = button.getAttribute("data-dt-filter");

        // Get filter name (button text content)
        const filterName = this.getFilterButtonText(button);

        // Update the dropdown to match the selected filter
        this.updateDropdownSelection(filterType);

        // Apply filtering with blur animation
        this.applyFilteringWithBlur(filterType, filterName);
      });
    });
  },

  updateDropdownSelection: function (filterType) {
    const selectElement = document.querySelector("#insights-filter-select");
    if (!selectElement) return;

    // Set the dropdown value to match the clicked button
    selectElement.value = filterType === "all" ? "" : filterType;
  },

  getFilterButtonText: function (button) {
    // Extract the filter name from the button text
    try {
      const textElement = button.querySelector(".body1-1");
      return textElement
        ? textElement.textContent.trim()
        : button.textContent.trim();
    } catch (e) {
      console.warn("Error getting filter button text:", e);
      return "selected filter";
    }
  },

  applyFilteringWithBlur: function (filterType, filterName) {
    // Get insights container and cards
    const insightsContainer = document.querySelector("#insights");
    if (!insightsContainer) return;

    const allCards = insightsContainer.querySelectorAll(
      ".insights-overview-card"
    );
    if (!allCards.length) return;

    // Get the empty state element
    const emptyStateElement = document.querySelector("#insights-empty");

    try {
      // Step 1: Apply blur to all cards (blur out)
      this.applyBlurToCards(allCards, true);

      // If empty state exists, blur it too for consistency
      if (emptyStateElement) {
        emptyStateElement.style.transition =
          "filter 0.3s ease-out, opacity 0.3s ease-out";
        emptyStateElement.style.filter = "blur(5px)";
        emptyStateElement.style.opacity = "0";
      }

      // Step 2: After a short delay, apply filtering and remove blur
      setTimeout(() => {
        // Apply filtering
        let visibleCount = 0;
        allCards.forEach((card) => {
          const shouldShow =
            filterType === "all" || this.cardHasTag(card, filterType);
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) visibleCount++;
        });

        // Handle empty state display and messaging
        if (emptyStateElement) {
          if (visibleCount === 0) {
            // Update empty state message based on filter
            this.updateEmptyStateMessage(
              emptyStateElement,
              filterType,
              filterName
            );

            // Show empty state
            emptyStateElement.style.display = "block";

            // Unblur it
            setTimeout(() => {
              emptyStateElement.style.transition =
                "filter 0.3s ease-in, opacity 0.3s ease-in";
              emptyStateElement.style.filter = "blur(0)";
              emptyStateElement.style.opacity = "1";
            }, 50);
          } else {
            // Hide empty state if there are visible cards
            emptyStateElement.style.display = "none";
          }
        }

        // Get visible cards
        const visibleCards = Array.from(allCards).filter(
          (card) => window.getComputedStyle(card).display !== "none"
        );

        // Step 3: Remove blur from visible cards (blur in)
        setTimeout(() => {
          this.applyBlurToCards(visibleCards, false);

          // Step 4: Update locomotive scroll
          this.updateLocomotiveScroll();

          // Step 5: AFTER unblurring, scroll to top
          // Add a slight delay to ensure unblur animation has completed
          setTimeout(() => {
            this.scrollToTop();
          }, 100);
        }, 50);
      }, 300);
    } catch (e) {
      console.error("Error applying filtering:", e);
    }
  },

  scrollToTop: function () {
    try {
      // If locomotive scroll exists, use it to scroll to top
      if (window.App.LocomotiveScroll && window.App.LocomotiveScroll.instance) {
        window.App.LocomotiveScroll.instance.scrollTo(0, {
          duration: 800,
          easing: [0.25, 0.1, 0.25, 1.0], // cubic-bezier ease
        });
      } else if (window.App.Core && window.App.Core.scrollInstance) {
        window.App.Core.scrollInstance.scrollTo(0, {
          duration: 800,
          easing: [0.25, 0.1, 0.25, 1.0],
        });
      } else {
        // Fallback to standard window scroll
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        // Also try scrolling the html and body elements (for better cross-browser support)
        document.documentElement.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        document.body.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      console.log(`[2025-04-14 17:57:01] Scrolled to top (User: Druhin13)`);
    } catch (e) {
      console.warn("Error scrolling to top:", e);
      // Last resort fallback
      window.scrollTo(0, 0);
    }
  },

  updateEmptyStateMessage: function (emptyElement, filterType, filterName) {
    try {
      // For "all" filter
      if (filterType === "all") {
        emptyElement.textContent = "There are currently no insights available.";
        return;
      }

      // Create custom message for specific filter
      const currentDate = "2025-04-14"; // Using provided date

      // Dynamic message template
      const message = `Sorry, we couldn't find any insights with the "${filterName}" tag. Please try a different filter or check back later. [${currentDate}]`;

      // Update the element
      emptyElement.textContent = message;
    } catch (e) {
      console.warn("Error updating empty state message:", e);
      // Fallback message
      emptyElement.textContent = "No matching insights found for your filter.";
    }
  },

  applyBlurToCards: function (cards, shouldBlur) {
    cards.forEach((card) => {
      if (shouldBlur) {
        // Apply blur
        card.style.transition = "filter 0.3s ease-out";
        card.style.filter = "blur(5px)";
        card.style.opacity = "0.7";
      } else {
        // Remove blur
        card.style.transition = "filter 0.3s ease-in";
        card.style.filter = "blur(0)";
        card.style.opacity = "1";
      }
    });
  },

  cardHasTag: function (card, tagType) {
    try {
      // Look for tag elements with this filter type
      const tagElements = card.querySelectorAll(
        `[data-dt-filter-tag="${tagType}"]`
      );
      return tagElements.length > 0;
    } catch (e) {
      console.warn("Error checking card tags:", e);
      return false;
    }
  },

  updateLocomotiveScroll: function () {
    // Allow a small delay for DOM updates to complete
    setTimeout(() => {
      // Try different possible locomotive scroll instances
      if (window.App.LocomotiveScroll && window.App.LocomotiveScroll.instance) {
        window.App.LocomotiveScroll.instance.update();
      } else if (window.App.Core && window.App.Core.scrollInstance) {
        window.App.Core.scrollInstance.update();
      }
    }, 100);
  },
};

// Initialize on load
document.addEventListener("DOMContentLoaded", function () {
  // Store current user for logging purposes
  window.currentUser = "Druhin13";
  window.App.InsightsSorting.initialize();
});
