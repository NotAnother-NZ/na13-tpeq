// Module for service slider functionality
export function initializeServiceSlider() {
    // Get the buttons and slider nav
    const buttons = document.querySelectorAll(
      "#service-overview-button-wrapper .service-overview-button"
    );
    const sliderNav = document.querySelector(
      ".service-overview-slider .w-slider-nav"
    );
  
    if (!buttons.length || !sliderNav) return;
  
    // Get all the dots even though they have "hide" class
    const sliderDots = sliderNav.querySelectorAll(".w-slider-dot");
  
    if (!sliderDots.length) return;
  
    // Create a global variable to keep track of current active button
    window.serviceSliderState = window.serviceSliderState || {
      activeIndex: 0,
      isInitialized: false,
    };
  
    // Function to force update button states
    function forceUpdateButtonStates(activeIndex) {
      // Force class updates by removing all active classes first
      buttons.forEach((btn) => {
        btn.classList.remove("active");
      });
  
      // Then add active class to the selected button
      if (buttons[activeIndex]) {
        buttons[activeIndex].className =
          buttons[activeIndex].className.replace(/\bactive\b/g, "") + " active";
        window.serviceSliderState.activeIndex = activeIndex;
      }
    }
  
    // Function to activate a button and its corresponding slide
    function activateButton(index) {
      // Store the active index globally
      window.serviceSliderState.activeIndex = index;
  
      // First update button states immediately
      forceUpdateButtonStates(index);
  
      // Then click the slider dot (with a slight delay to ensure UI is updated)
      setTimeout(() => {
        if (sliderDots[index]) {
          sliderDots[index].click();
        }
      }, 10);
    }
  
    // Monitor for Webflow's slide change and keep buttons in sync
    const sliderObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target.classList.contains("w-slider-dot")
        ) {
          // Find which dot is now active
          const activeDotIndex = Array.from(sliderDots).findIndex((dot) =>
            dot.classList.contains("w-active")
          );
  
          if (
            activeDotIndex !== -1 &&
            activeDotIndex !== window.serviceSliderState.activeIndex
          ) {
            // Update our state and button UI
            forceUpdateButtonStates(activeDotIndex);
          }
        }
      });
    });
  
    // Observe all slider dots for class changes
    sliderDots.forEach((dot) => {
      sliderObserver.observe(dot, { attributes: true });
    });
  
    // Add both click and touchend events to each button
    buttons.forEach((button, index) => {
      // Use delegated event handling for both mouse and touch
      const handleInteraction = function(e) {
        e.preventDefault();
        e.stopPropagation();
        activateButton(index);
      };
  
      // Remove any existing listeners first to prevent duplicates
      button.removeEventListener("click", handleInteraction);
      button.removeEventListener("touchend", handleInteraction);
  
      // Add fresh event listeners
      button.addEventListener("click", handleInteraction);
      button.addEventListener("touchend", handleInteraction);
    });
  
    // Initialize by activating the first button if not already done
    if (!window.serviceSliderState.isInitialized) {
      setTimeout(() => {
        activateButton(0);
        window.serviceSliderState.isInitialized = true;
      }, 100);
    }
  
    // Re-sync active state when window is resized
    window.addEventListener("resize", () => {
      forceUpdateButtonStates(window.serviceSliderState.activeIndex);
    });
  }