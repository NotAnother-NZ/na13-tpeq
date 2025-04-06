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

    // Initialize video handler
    if (window.App.VideoLoopHandler) {
      window.App.VideoLoopHandler.initialize();
    }

    // Initialize click redirect handler
    if (window.App.ClickRedirectHandler) {
      window.App.ClickRedirectHandler.initialize();
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
    // Double-check videos are playing after full page load
    if (window.App.VideoLoopHandler) {
      window.App.VideoLoopHandler.playAllLoopingVideos();
    }

    // Reinitialize click redirect handler after full page load
    if (window.App.ClickRedirectHandler) {
      window.App.ClickRedirectHandler.reinitialize();
    }

    if (document.querySelector(".service-overview-slider")) {
      console.log("[Main] Window load event - checking service slider");

      // If slider was initialized but not working properly, try again
      setTimeout(function () {
        window.App.ServiceSlider.reinitialize();
      }, 300);
    }
  });
})();
