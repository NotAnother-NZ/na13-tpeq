// service-slider.js - With fade transitions, dynamic height calculation, auto-slider, and circular progress
// Current Date and Time (UTC): 2025-04-17 16:18:52
// Current User's Login: Druhin13

window.App = window.App || {};
window.App.ServiceSlider = {
  debug: true,
  resizeTimeout: null,
  autoSlideInterval: null, // Track the interval for auto-sliding
  progressAnimationId: null, // For tracking the progress animation
  autoSlideDelay: 8000, // 8 seconds between slides
  progressCircle: null, // Reference to the progress circle element
  progressStartTime: 0, // Track when the progress started

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

  // Create and add the circular progress bar
  createProgressCircle: function () {
    const pauseButton = document.querySelector(".slider-pause-button");
    if (!pauseButton) return;

    // Remove any existing progress circle
    const existingCircle = document.querySelector(".progress-circle-container");
    if (existingCircle) {
      existingCircle.remove();
    }

    // Create SVG container
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "progress-circle-container");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none"; // Don't interfere with clicks
    svg.style.zIndex = "2";

    // Background circle - now solid white
    const bgCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    bgCircle.setAttribute("cx", "50");
    bgCircle.setAttribute("cy", "50");
    bgCircle.setAttribute("r", "47");
    bgCircle.setAttribute("fill", "none");
    bgCircle.setAttribute("stroke", "transparent"); // Solid white / transparent
    bgCircle.setAttribute("stroke-width", "5"); // Increased width

    // Progress circle - now dark gray/black
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("class", "progress-circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "47");
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "#8A8A8A"); // Dark color
    circle.setAttribute("stroke-width", "5"); // Increased width
    circle.setAttribute("stroke-linecap", "round");

    // Calculate circumference
    const circumference = 2 * Math.PI * 47;
    circle.setAttribute("stroke-dasharray", circumference);
    circle.setAttribute("stroke-dashoffset", circumference); // Start at 0%
    circle.style.transform = "rotate(-90deg)";
    circle.style.transformOrigin = "center";

    // Add circles to SVG
    svg.appendChild(bgCircle);
    svg.appendChild(circle);

    // Add SVG to pause button
    pauseButton.appendChild(svg);

    // Store reference to progress circle
    this.progressCircle = circle;

    return circle;
  },

  // Animate the progress circle
  animateProgressCircle: function () {
    if (!this.progressCircle) return;

    // Cancel any existing animation
    if (this.progressAnimationId) {
      cancelAnimationFrame(this.progressAnimationId);
      this.progressAnimationId = null;
    }

    const circumference = 2 * Math.PI * 47;
    this.progressStartTime = performance.now();

    const animate = (currentTime) => {
      // Calculate elapsed time
      const elapsed = currentTime - this.progressStartTime;

      // Calculate progress percentage (0 to 1)
      const progress = Math.min(elapsed / this.autoSlideDelay, 1);

      // Calculate dashoffset based on progress
      const dashoffset = circumference * (1 - progress);

      // Update circle dashoffset
      this.progressCircle.setAttribute("stroke-dashoffset", dashoffset);

      // Continue animation if not complete
      if (progress < 1) {
        this.progressAnimationId = requestAnimationFrame(animate);
      }
    };

    // Start animation
    this.progressAnimationId = requestAnimationFrame(animate);
  },

  // Reset progress circle to 0%
  resetProgressCircle: function () {
    if (!this.progressCircle) return;

    // Cancel any existing animation
    if (this.progressAnimationId) {
      cancelAnimationFrame(this.progressAnimationId);
      this.progressAnimationId = null;
    }

    // Reset to 0%
    const circumference = 2 * Math.PI * 47;
    this.progressCircle.setAttribute("stroke-dashoffset", circumference);
  },

  // Start auto-sliding functionality
  startAutoSlide: function () {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }

    this.log("Starting auto-slide");

    // Start progress animation
    this.animateProgressCircle();

    this.autoSlideInterval = setInterval(() => {
      if (!window.serviceSliderState || window.serviceSliderState.isAnimating)
        return;

      const buttons = document.querySelectorAll(
        "#service-overview-button-wrapper .service-overview-button"
      );

      if (!buttons.length) return;

      // Calculate next index (loop back to 0 if at the end)
      const nextIndex =
        (window.serviceSliderState.activeIndex + 1) % buttons.length;

      // Activate the next panel
      this.activatePanel(nextIndex, false); // false means not from a user click

      // Reset and start progress animation for next slide
      this.animateProgressCircle();
    }, this.autoSlideDelay);

    // Update button visibility
    this.updatePlayPauseButtons(true);
  },

  // Restart the auto-slide timer
  restartAutoSlide: function () {
    // Only restart if auto-slide is currently active
    if (this.autoSlideInterval) {
      this.log("Restarting auto-slide timer");

      // Stop current interval
      clearInterval(this.autoSlideInterval);

      // Reset and start progress animation
      this.resetProgressCircle();
      this.animateProgressCircle();

      // Start new interval
      this.autoSlideInterval = setInterval(() => {
        if (!window.serviceSliderState || window.serviceSliderState.isAnimating)
          return;

        const buttons = document.querySelectorAll(
          "#service-overview-button-wrapper .service-overview-button"
        );

        if (!buttons.length) return;

        // Calculate next index
        const nextIndex =
          (window.serviceSliderState.activeIndex + 1) % buttons.length;

        // Activate the next panel
        this.activatePanel(nextIndex, false);

        // Reset and start progress animation for next slide
        this.animateProgressCircle();
      }, this.autoSlideDelay);
    } else {
      // If auto-slide isn't active, start it
      this.startAutoSlide();
    }

    // Update button visibility
    this.updatePlayPauseButtons(true);
  },

  // Stop auto-sliding
  stopAutoSlide: function () {
    this.log("Stopping auto-slide");

    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }

    // Reset progress circle
    this.resetProgressCircle();

    // Cancel animation
    if (this.progressAnimationId) {
      cancelAnimationFrame(this.progressAnimationId);
      this.progressAnimationId = null;
    }

    // Update button visibility
    this.updatePlayPauseButtons(false);
  },

  // Toggle auto-sliding
  toggleAutoSlide: function () {
    if (this.autoSlideInterval) {
      this.stopAutoSlide();
    } else {
      this.restartAutoSlide(); // Use restart instead of start to ensure fresh timer
    }
  },

  // Update play/pause button visibility using hide class
  updatePlayPauseButtons: function (isPlaying) {
    const playButton = document.querySelector(".slider-play-button");
    const pauseButton = document.querySelector(".slider-pause-button");

    if (!playButton || !pauseButton) return;

    if (isPlaying) {
      // Auto-slide is active, show pause button, hide play button
      playButton.classList.add("hide");
      pauseButton.classList.remove("hide");
    } else {
      // Auto-slide is inactive, show play button, hide pause button
      playButton.classList.remove("hide");
      pauseButton.classList.add("hide");
    }
  },

  // Function to activate a specific panel with fade transition
  activatePanel: function (index, fromUserClick = true) {
    const buttons = document.querySelectorAll(
      "#service-overview-button-wrapper .service-overview-button"
    );
    const contentPanels = document.querySelectorAll(
      ".service-overview-slider .service-overview-slider-content"
    );

    // Don't do anything if already animating or if it's the current panel
    if (
      !window.serviceSliderState ||
      window.serviceSliderState.isAnimating ||
      window.serviceSliderState.activeIndex === index ||
      index >= contentPanels.length
    ) {
      return;
    }

    this.log(
      `Activating panel ${index}${fromUserClick ? " (user click)" : ""}`
    );
    window.serviceSliderState.isAnimating = true;

    // If this activation was from a user click, restart the auto-slide timer
    if (fromUserClick) {
      this.restartAutoSlide();
    }

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

    // Get play/pause buttons
    const playButton = document.querySelector(".slider-play-button");
    const pauseButton = document.querySelector(".slider-pause-button");

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

    // Create progress circle
    if (pauseButton) {
      this.createProgressCircle();
    }

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

    // Clean up existing auto-slide interval if any
    this.stopAutoSlide();

    // Create new state object
    window.serviceSliderState = {
      activeIndex: 0,
      isAnimating: false,
      eventListeners: [],
      resizeHandler: resizeHandler,
    };

    // Add click handlers to buttons
    buttons.forEach((button, index) => {
      const clickHandler = (e) => {
        e.preventDefault();
        // Pass true to indicate this is from a user click (will restart timer)
        this.activatePanel(index, true);
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

    // Setup play/pause functionality
    if (playButton && pauseButton) {
      // Set initial visibility using hide class
      playButton.classList.add("hide"); // Initially hidden
      pauseButton.classList.remove("hide"); // Initially visible

      // Add click handler for play button - use restartAutoSlide instead of startAutoSlide
      const playClickHandler = (e) => {
        e.preventDefault();
        this.restartAutoSlide(); // This ensures a fresh 6-second timer from current slide
      };
      playButton.addEventListener("click", playClickHandler);
      window.serviceSliderState.eventListeners.push({
        element: playButton,
        type: "click",
        handler: playClickHandler,
      });

      // Add click handler for pause button
      const pauseClickHandler = (e) => {
        e.preventDefault();
        this.stopAutoSlide();
      };
      pauseButton.addEventListener("click", pauseClickHandler);
      window.serviceSliderState.eventListeners.push({
        element: pauseButton,
        type: "click",
        handler: pauseClickHandler,
      });
    }

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

    // Start the auto-slide functionality
    this.startAutoSlide();
  },

  reinitialize: function () {
    this.log("Reinitializing service slider");

    // Stop current auto-slide and animations
    this.stopAutoSlide();

    // Cancel any existing animation
    if (this.progressAnimationId) {
      cancelAnimationFrame(this.progressAnimationId);
      this.progressAnimationId = null;
    }

    // Simple approach: just re-run the initialization
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      this.initialize();
    }, 100);
  },
};
