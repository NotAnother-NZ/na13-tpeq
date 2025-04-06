// service-slider.js - With fade transitions and dynamic height calculation
window.App = window.App || {};
window.App.ServiceSlider = {
  debug: true,
  resizeTimeout: null,

  log: function (...args) {
    if (this.debug) {
      console.log("[ServiceSlider]", ...args);
    }
  },

  calculateAndSetSliderHeight: function () {
    const sliderElement = document.querySelector(".service-overview-slider");
    const contentPanels = document.querySelectorAll(
      ".service-overview-slider-content"
    );

    if (!sliderElement || !contentPanels.length) {
      return;
    }

    this.log("Calculating slider height");

    // Store original hide states
    const originalHideStates = Array.from(contentPanels).map((panel) =>
      panel.classList.contains("hide")
    );

    // Temporarily show all panels
    contentPanels.forEach((panel) => {
      panel.classList.remove("hide");
      panel.style.opacity = "0";
      panel.style.visibility = "hidden";
    });

    // Calculate heights including margins
    const outerHeights = Array.from(contentPanels).map((panel) => {
      const style = window.getComputedStyle(panel);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      return panel.offsetHeight + marginTop + marginBottom;
    });

    // Get maximum height and round up
    let maxHeight = Math.max(...outerHeights);
    maxHeight = Math.ceil(maxHeight);

    this.log(`Setting slider height to ${maxHeight}px`);

    // Set the height on the slider element
    sliderElement.style.height = maxHeight + "px";

    // Restore original visibility states
    contentPanels.forEach((panel, index) => {
      if (originalHideStates[index]) {
        panel.classList.add("hide");
      } else {
        panel.style.opacity = "1";
        panel.style.visibility = "visible";
      }
    });

    // Update Locomotive Scroll if available
    if (window.App.Core && window.App.Core.scrollInstance) {
      setTimeout(() => {
        window.App.Core.scrollInstance.update();
        this.log("Updated Locomotive Scroll instance");
      }, 100);
    }
  },

  initialize: function () {
    this.log("Initializing service slider");

    // Get button elements
    const buttons = document.querySelectorAll(
      "#service-overview-button-wrapper .service-overview-button"
    );

    // Get content panels
    const contentPanels = document.querySelectorAll(
      ".service-overview-slider .service-overview-slider-content"
    );

    this.log(
      `Found ${buttons.length} buttons and ${contentPanels.length} content panels`
    );

    if (!buttons.length || !contentPanels.length) {
      this.log(
        "Required elements not found. Not on homepage or DOM not ready."
      );
      return;
    }

    // First calculate and set the slider height
    this.calculateAndSetSliderHeight();

    // Set up window resize handler
    if (window.serviceSliderState && window.serviceSliderState.resizeHandler) {
      window.removeEventListener(
        "resize",
        window.serviceSliderState.resizeHandler
      );
    }

    const resizeHandler = () => {
      // Debounce resize events
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
        this.log("Window resized, recalculating slider height");
        this.calculateAndSetSliderHeight();
      }, 200);
    };

    window.addEventListener("resize", resizeHandler);

    // Set up CSS transitions for fade effects if not already applied
    contentPanels.forEach((panel) => {
      // Only set these styles if not already set
      if (panel.style.transition === "") {
        panel.style.transition = "opacity 0.5s ease, visibility 0.5s ease";
      }

      // Make sure initially hidden panels have zero opacity
      if (panel.classList.contains("hide")) {
        panel.style.opacity = "0";
        panel.style.visibility = "hidden";
      } else {
        panel.style.opacity = "1";
        panel.style.visibility = "visible";
      }
    });

    // Clear previous event listeners if they exist
    if (window.serviceSliderState && window.serviceSliderState.eventListeners) {
      this.log("Cleaning up previous listeners");
      window.serviceSliderState.eventListeners.forEach((item) => {
        if (
          item &&
          item.element &&
          typeof item.element.removeEventListener === "function"
        ) {
          item.element.removeEventListener(item.type, item.handler);
        }
      });
    }

    // Create new state object
    window.serviceSliderState = {
      activeIndex: 0,
      isAnimating: false,
      eventListeners: [],
      resizeHandler: resizeHandler,
    };

    // Function to activate a specific panel with fade transition
    const activatePanel = (index) => {
      // Don't do anything if already animating or if it's the current panel
      if (
        window.serviceSliderState.isAnimating ||
        window.serviceSliderState.activeIndex === index
      ) {
        return;
      }

      this.log(`Activating panel ${index}`);
      window.serviceSliderState.isAnimating = true;

      // Update button states immediately
      buttons.forEach((button, i) => {
        if (i === index) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      });

      // Get current and next panels
      const currentPanel = contentPanels[window.serviceSliderState.activeIndex];
      const nextPanel = contentPanels[index];

      // Fade out current panel
      if (currentPanel) {
        currentPanel.style.opacity = "0";
        currentPanel.style.visibility = "hidden";
      }

      // Prepare next panel for fade in (remove hide class but keep it invisible)
      if (nextPanel) {
        nextPanel.classList.remove("hide");
        nextPanel.style.opacity = "0";
        nextPanel.style.visibility = "hidden";

        // Force a reflow to ensure transitions work
        nextPanel.offsetHeight;

        // Fade in next panel after a short delay
        setTimeout(() => {
          nextPanel.style.opacity = "1";
          nextPanel.style.visibility = "visible";

          // Add hide class to previous panel after transition
          setTimeout(() => {
            if (currentPanel) {
              currentPanel.classList.add("hide");
            }
            window.serviceSliderState.activeIndex = index;
            window.serviceSliderState.isAnimating = false;

            // Update Locomotive Scroll after transition completes
            if (window.App.Core && window.App.Core.scrollInstance) {
              window.App.Core.scrollInstance.update();
            }
          }, 500);
        }, 100);
      } else {
        // If next panel doesn't exist, just reset animation state
        window.serviceSliderState.isAnimating = false;
      }
    };

    // Add click handlers to buttons
    buttons.forEach((button, index) => {
      const clickHandler = (e) => {
        e.preventDefault();
        activatePanel(index);
      };

      // Add click event
      button.addEventListener("click", clickHandler);
      window.serviceSliderState.eventListeners.push({
        element: button,
        type: "click",
        handler: clickHandler,
      });

      // Add touch event for mobile
      button.addEventListener("touchend", clickHandler);
      window.serviceSliderState.eventListeners.push({
        element: button,
        type: "touchend",
        handler: clickHandler,
      });
    });

    // Initialize by determining which panel should be active
    // Find which button is currently active
    const activeButtonIndex = Array.from(buttons).findIndex((btn) =>
      btn.classList.contains("active")
    );

    // If we found an active button, use its index, otherwise default to 0
    const initialIndex = activeButtonIndex !== -1 ? activeButtonIndex : 0;

    // Set initial state without animation
    buttons.forEach((button, i) => {
      if (i === initialIndex) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });

    contentPanels.forEach((panel, i) => {
      if (i === initialIndex) {
        panel.classList.remove("hide");
        panel.style.opacity = "1";
        panel.style.visibility = "visible";
      } else {
        panel.classList.add("hide");
        panel.style.opacity = "0";
        panel.style.visibility = "hidden";
      }
    });

    window.serviceSliderState.activeIndex = initialIndex;
    this.log("Service slider initialized successfully");
  },

  reinitialize: function () {
    this.log("Reinitializing service slider");

    // Simple approach: just re-run the initialization
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      this.initialize();
    }, 100);
  },
};
