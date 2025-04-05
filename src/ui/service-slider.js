// service-slider.js - With Webflow reinitialization
window.App = window.App || {};
window.App.ServiceSlider = {
  debug: true,
  checkInterval: null,
  reinitAttempts: 0,
  maxReinitAttempts: 5,

  log: function (...args) {
    if (this.debug) {
      console.log("[ServiceSlider]", ...args);
    }
  },

  reinitializeWebflow: function () {
    this.log("Attempting to reinitialize Webflow...");

    if (typeof Webflow === "undefined") {
      this.log("Webflow object not found!");
      return false;
    }

    try {
      // Reset Webflow IX2
      if (Webflow.require("ix2")) {
        this.log("Reinitializing Webflow IX2");
        Webflow.require("ix2").init();
      }

      // Force Webflow to detect all sliders and initialize them
      if (Webflow.require("slider")) {
        this.log("Reinitializing Webflow sliders");
        const slider = Webflow.require("slider");

        // Try direct reinitialization if available
        if (typeof slider.ready === "function") {
          slider.ready();
        }

        // Alternative method - destroy and reinitialize
        if (
          typeof slider.destroy === "function" &&
          typeof slider.preview === "function"
        ) {
          slider.destroy();
          slider.preview();
        }
      }

      // Full page reinit as fallback
      if (typeof Webflow.ready === "function") {
        this.log("Reinitializing all Webflow components");
        Webflow.ready();
      }

      return true;
    } catch (e) {
      this.log("Error reinitializing Webflow:", e);
      return false;
    }
  },

  waitForSliderInitialization: function (callback) {
    this.log("Waiting for slider to be fully initialized");

    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    let checks = 0;
    const maxChecks = 25; // 5 seconds max

    this.checkInterval = setInterval(() => {
      checks++;

      // Look for the slider dots
      const sliderNav = document.querySelector(
        ".service-overview-slider .w-slider-nav"
      );
      const dots = sliderNav ? sliderNav.querySelectorAll(".w-slider-dot") : [];

      this.log(`Check ${checks}: Found ${dots.length} slider dots`);

      if (dots.length > 0) {
        this.log("Slider dots found! Slider is fully initialized.");
        clearInterval(this.checkInterval);
        if (typeof callback === "function") {
          callback(dots);
        }
      } else if (checks >= maxChecks) {
        this.log("Giving up waiting for slider initialization");
        clearInterval(this.checkInterval);

        // Try reinitializing Webflow if we haven't reached max attempts
        if (this.reinitAttempts < this.maxReinitAttempts) {
          this.reinitAttempts++;
          this.log(
            `Attempt ${this.reinitAttempts}/${this.maxReinitAttempts} to force reinitialize Webflow`
          );

          // Force Webflow reinitialization
          if (this.reinitializeWebflow()) {
            // If successful, start waiting again
            setTimeout(() => {
              this.waitForSliderInitialization(callback);
            }, 200);
          }
        }
      }
    }, 200);
  },

  setupCustomControls: function (sliderDots) {
    this.log("Setting up custom button controls for slider");

    const buttons = document.querySelectorAll(
      "#service-overview-button-wrapper .service-overview-button"
    );

    if (!buttons.length) {
      this.log("No custom buttons found");
      return;
    }

    // Clean up previous state
    if (
      window.serviceSliderState &&
      typeof window.serviceSliderState.cleanupListeners === "function"
    ) {
      try {
        window.serviceSliderState.cleanupListeners();
      } catch (e) {
        this.log("Error cleaning up:", e);
      }
    }

    // Create new state
    window.serviceSliderState = {
      activeIndex: 0,
      isInitialized: true,
      observers: [],
      eventListeners: [],
      cleanupListeners: function () {
        // Remove observers
        if (Array.isArray(this.observers)) {
          this.observers.forEach((observer) => {
            if (observer && typeof observer.disconnect === "function") {
              observer.disconnect();
            }
          });
          this.observers = [];
        }

        // Remove event listeners
        if (Array.isArray(this.eventListeners)) {
          this.eventListeners.forEach((item) => {
            if (
              item &&
              item.element &&
              typeof item.element.removeEventListener === "function"
            ) {
              item.element.removeEventListener(item.type, item.handler);
            }
          });
          this.eventListeners = [];
        }
      },
    };

    // Find which dot is currently active
    const activeDotIndex = Array.from(sliderDots).findIndex((dot) =>
      dot.classList.contains("w-active")
    );

    window.serviceSliderState.activeIndex =
      activeDotIndex !== -1 ? activeDotIndex : 0;

    // Update button states to match active dot
    const updateButtonStates = (activeIndex) => {
      buttons.forEach((btn, i) => {
        if (i === activeIndex) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
      window.serviceSliderState.activeIndex = activeIndex;
    };

    // Initialize button states
    updateButtonStates(window.serviceSliderState.activeIndex);

    // Watch for Webflow's internal slider changes
    const sliderObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target.classList.contains("w-slider-dot")
        ) {
          const newActiveDotIndex = Array.from(sliderDots).findIndex((dot) =>
            dot.classList.contains("w-active")
          );

          if (
            newActiveDotIndex !== -1 &&
            newActiveDotIndex !== window.serviceSliderState.activeIndex
          ) {
            this.log(`Webflow changed active slide to ${newActiveDotIndex}`);
            updateButtonStates(newActiveDotIndex);
          }
        }
      });
    });

    // Observe all dots for class changes
    sliderDots.forEach((dot) => {
      sliderObserver.observe(dot, { attributes: true });
    });

    window.serviceSliderState.observers.push(sliderObserver);

    // Set up button click handlers
    buttons.forEach((button, index) => {
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.log(`Custom button ${index} clicked`);
        updateButtonStates(index);

        // Click the corresponding Webflow dot
        if (sliderDots[index]) {
          sliderDots[index].click();
        }
      };

      button.addEventListener("click", clickHandler);
      window.serviceSliderState.eventListeners.push({
        element: button,
        type: "click",
        handler: clickHandler,
      });

      // Touch support
      button.addEventListener("touchend", clickHandler);
      window.serviceSliderState.eventListeners.push({
        element: button,
        type: "touchend",
        handler: clickHandler,
      });
    });

    this.log("Custom controls setup complete");
  },

  initialize: function () {
    this.log("Initializing service slider");
    this.reinitAttempts = 0;

    const sliderElement = document.querySelector(".service-overview-slider");
    if (!sliderElement) {
      this.log("No slider found on page");
      return;
    }

    // Wait for slider to be fully initialized, then set up our custom controls
    this.waitForSliderInitialization((dots) => {
      this.setupCustomControls(dots);
    });
  },

  reinitialize: function () {
    this.log("Reinitializing service slider after page transition");

    // Clean up any previous interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // Clean up any previous state
    if (window.serviceSliderState) {
      try {
        if (typeof window.serviceSliderState.cleanupListeners === "function") {
          window.serviceSliderState.cleanupListeners();
        }
      } catch (e) {
        this.log("Error during cleanup:", e);
      }
      window.serviceSliderState = null;
    }

    // Explicitly attempt to reinitialize Webflow components
    setTimeout(() => {
      this.reinitializeWebflow();

      // Wait a bit more for Webflow to process, then initialize our slider
      setTimeout(() => {
        this.initialize();
      }, 200);
    }, 50);
  },
};
