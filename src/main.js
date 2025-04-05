// main.js - Main file to load all modules
(function () {
  // Create namespaces
  window.App = window.App || {};

  // Register initial page load handler for early execution
  document.addEventListener("DOMContentLoaded", function () {
    // Initialize initial load animation
    if (window.App.InitialLoad) {
      window.App.InitialLoad.initialize();
    }

    // For direct page loads, initialize service slider after Webflow loads
    if (document.querySelector(".service-overview-slider")) {
      console.log("[Main] Found service slider, setting up initialization");

      // Wait a bit for Webflow to initialize
      setTimeout(function () {
        window.App.ServiceSlider.initialize();
      }, 300);
    }
  });

  // Also check on window load event (fallback)
  window.addEventListener("load", function () {
    if (document.querySelector(".service-overview-slider")) {
      console.log("[Main] Window load event - checking service slider");

      // If slider was initialized but dots aren't there, try again
      const sliderNav = document.querySelector(
        ".service-overview-slider .w-slider-nav"
      );
      const dots = sliderNav ? sliderNav.querySelectorAll(".w-slider-dot") : [];

      if (dots.length === 0) {
        console.log(
          "[Main] Slider initialized but no dots found, reinitializing"
        );
        window.App.ServiceSlider.reinitialize();
      }
    }
  });
})();
