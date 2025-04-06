// initial-load.js - Handle first-page load animation with pulsing background
window.App = window.App || {};
window.App.InitialLoad = {
  isFirstLoad: true,

  initialize: function () {
    // Only run this once
    if (!this.isFirstLoad) return;

    // Create overlay if it doesn't exist yet
    let overlay = document.getElementById("swup-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "swup-overlay";
      document.body.appendChild(overlay);

      // Position overlay to cover the screen during initial load
      overlay.style.transform = "translateY(0)";

      // Add pulsing animation class
      overlay.classList.add("is-pulsing");
    }

    // Pause scrolling during initial load
    if (window.App.LocomotiveScroll) {
      window.App.LocomotiveScroll.pause();
    }

    // Prepare nav wrapper
    const navWrapper = document.getElementById("nav-wrapper");
    if (navWrapper) {
      // Position it 20vh outside the viewport
      navWrapper.style.transform = "translateY(-20vh)";
    }

    // Wait for content to be ready, then animate
    window.addEventListener("load", () => {
      // Remove no-js class since JavaScript is clearly working
      document.documentElement.classList.remove("no-js");

      // Short delay to ensure everything is rendered
      setTimeout(() => {
        // Stop pulsing animation
        if (overlay) {
          overlay.classList.remove("is-pulsing");
        }

        // Trigger the leaving animation for overlay
        overlay.classList.add("is-leaving");

        // Add a 0.5s delay to the nav-wrapper animation
        setTimeout(() => {
          // Animate nav wrapper in from the top
          if (navWrapper) {
            // Force a reflow before changing the transition
            navWrapper.offsetHeight;
            // Set the transition dynamically to ensure it applies
            navWrapper.style.transition =
              "transform 0.75s cubic-bezier(0.19, 1, 0.22, 1)";
            navWrapper.style.transform = "translateY(0)";
          }
        }, 500); // 0.5 second delay

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

          // Resume scrolling after animation completes
          if (window.App.LocomotiveScroll) {
            window.App.LocomotiveScroll.resume();
          }

          // Mark as no longer first load
          this.isFirstLoad = false;
        }, 800); // Slightly longer than the transition to ensure it completes
      }, 100);
    });

    // Add a timeout to stop the animation if load event never fires
    setTimeout(() => {
      if (this.isFirstLoad && overlay) {
        console.log("[InitialLoad] Fallback timeout triggered");
        overlay.classList.remove("is-pulsing");
        overlay.classList.add("is-leaving");

        if (window.App.LocomotiveScroll) {
          window.App.LocomotiveScroll.resume();
        }

        // Mark as no longer first load
        this.isFirstLoad = false;
      }
    }, 8000); // 8 seconds max waiting time
  },
};

// Run the initialization
document.addEventListener("DOMContentLoaded", function () {
  window.App.InitialLoad.initialize();
});
