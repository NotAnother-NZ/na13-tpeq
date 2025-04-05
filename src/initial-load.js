// initial-load.js - Handle first-page load animation
window.App = window.App || {};
window.App.InitialLoad = {
  isFirstLoad: true,

  initialize: function () {
    // Only run this once
    if (!this.isFirstLoad) return;

    // Mark as loading
    document.documentElement.classList.add("is-initial-loading");

    // Initialize the overlay element if it doesn't exist yet
    let overlay = document.getElementById("swup-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "swup-overlay";
      document.body.appendChild(overlay);

      // Position overlay to cover the screen during initial load
      overlay.style.transform = "translateY(0)";
    }

    // Wait for content to be ready, then animate
    window.addEventListener("load", () => {
      // Short delay to ensure everything is rendered
      setTimeout(() => {
        // Trigger the leaving animation
        overlay.classList.add("is-leaving");

        // Remove loading class to show content
        document.documentElement.classList.remove("is-initial-loading");

        // Reset overlay after animation completes
        setTimeout(() => {
          // Only reset if we're not in the middle of a Swup transition
          if (!document.documentElement.classList.contains("is-animating")) {
            overlay.classList.remove("is-leaving");
            overlay.style.transition = "none";
            overlay.style.transform = "translateY(-100%)";

            // Force a reflow to ensure the transition is applied
            overlay.offsetHeight;

            // Restore the smooth transition for page changes
            overlay.style.transition =
              "transform 0.65s cubic-bezier(0.76, 0, 0.24, 1)";
          }

          // Mark as no longer first load
          this.isFirstLoad = false;
        }, 800); // Slightly longer than the transition to ensure it completes
      }, 100);
    });
  },
};

// Run the initialization
window.App.InitialLoad.initialize();
