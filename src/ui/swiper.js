// swiper.js - Dynamic slider initialization and management
// Current Date and Time (UTC): 2025-04-17 20:40:33
// Current User's Login: Druhin13

window.App = window.App || {};
window.App.Swiper = {
  debug: true,
  sliders: [],
  resizeTimeout: null,
  swupInitialized: false,
  breakpoint: 1024, // Desktop/mobile breakpoint in pixels
  initialWindowWidth: window.innerWidth, // Store initial window width
  sizeChangeThreshold: 200, // Width change threshold in pixels to trigger reload

  log: function (...args) {
    if (this.debug) {
      console.log("[Swiper]", ...args);
    }
  },

  // Helper function to convert CSS units to pixels
  toPixels: function (valueString) {
    if (!valueString) return 0;

    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    const val = valueString.trim();

    if (val.endsWith("rem")) {
      return parseFloat(val) * rootFontSize;
    } else if (val.endsWith("em")) {
      return parseFloat(val) * rootFontSize;
    } else if (val.endsWith("px")) {
      return parseFloat(val);
    } else {
      // If just a number or no suffix, parse as float
      return parseFloat(val) || 0;
    }
  },

  // Initialize a specific slider element
  initializeSlider: function (sliderElement) {
    if (!sliderElement) return null;

    // Check if this is already a Swiper instance
    if (sliderElement.swiper) return sliderElement.swiper;

    // Read attributes from the HTML
    const targetSelector =
      sliderElement.getAttribute("data-convert-slider") || ".resources-card";
    const slidesPerView =
      parseFloat(
        sliderElement.getAttribute("data-convert-slider-items-per-view")
      ) || 3;
    const prevButtonSelector = sliderElement.getAttribute(
      "data-convert-slider-prev"
    );
    const nextButtonSelector = sliderElement.getAttribute(
      "data-convert-slider-next"
    );
    const gapValue =
      sliderElement.getAttribute("data-convert-slider-gap") || "0.75rem";

    // Use the specified margin or default to 1.5rem for left/right margins
    const marginValue =
      sliderElement.getAttribute("data-convert-slider-margin") || "1.5rem";

    const prevButton = document.querySelector(prevButtonSelector);
    const nextButton = document.querySelector(nextButtonSelector);

    // Get the slides
    const slides = sliderElement.querySelectorAll(targetSelector);

    // If not enough slides, hide navigation and skip
    if (slides.length <= slidesPerView) {
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
      this.log(
        `Not enough slides (${slides.length}) to form a slider with slidesPerView=${slidesPerView}. Skipping.`
      );
      return null;
    }

    // Convert CSS measurements to pixels
    const spaceBetweenPx = this.toPixels(gapValue);
    const paddingPx = this.toPixels(marginValue);

    // Store original HTML before modifications
    const originalHTML = sliderElement.innerHTML;

    // Add the necessary Swiper classes
    sliderElement.classList.add("swiper");

    // Create swiper-wrapper if it doesn't exist
    let swiperWrapper = sliderElement.querySelector(".swiper-wrapper");
    if (!swiperWrapper) {
      swiperWrapper = document.createElement("div");
      swiperWrapper.className = "swiper-wrapper";

      // Move slides into the wrapper
      const tempContainer = document.createDocumentFragment();
      slides.forEach((slide) => {
        const clonedSlide = slide.cloneNode(true);
        clonedSlide.classList.add("swiper-slide");
        tempContainer.appendChild(clonedSlide);

        // Remove original slide
        slide.parentNode.removeChild(slide);
      });

      swiperWrapper.appendChild(tempContainer);
      sliderElement.appendChild(swiperWrapper);
    }

    // Initialize Swiper
    this.log(
      `Initializing Swiper with slidesPerView=${slidesPerView}, spaceBetween=${spaceBetweenPx}px, margin=${paddingPx}px`
    );

    // Function to update navigation button states
    const updateButtonStates = (swiper) => {
      if (!swiper) return;

      // Update previous button
      if (prevButton) {
        if (swiper.isBeginning) {
          prevButton.style.opacity = "0.5";
          prevButton.style.pointerEvents = "none";
        } else {
          prevButton.style.opacity = "1";
          prevButton.style.pointerEvents = "auto";
        }
      }

      // Update next button
      if (nextButton) {
        if (swiper.isEnd) {
          nextButton.style.opacity = "0.5";
          nextButton.style.pointerEvents = "none";
        } else {
          nextButton.style.opacity = "1";
          nextButton.style.pointerEvents = "auto";
        }
      }
    };

    const swiper = new Swiper(sliderElement, {
      slidesPerView: slidesPerView,
      spaceBetween: spaceBetweenPx,
      slidesOffsetBefore: paddingPx, // Left margin (start)
      slidesOffsetAfter: paddingPx, // Right margin (end)
      navigation: {
        nextEl: nextButtonSelector,
        prevEl: prevButtonSelector,
      },
      loop: false,
      breakpoints: {
        // Responsive settings
        320: {
          slidesPerView: 1.3,
          spaceBetween: spaceBetweenPx / 2,
          slidesOffsetBefore: paddingPx, // Maintain left margin on mobile
          slidesOffsetAfter: paddingPx, // Maintain right margin on mobile
        },
        768: {
          slidesPerView: Math.min(2.3, slidesPerView),
          spaceBetween: spaceBetweenPx,
          slidesOffsetBefore: paddingPx,
          slidesOffsetAfter: paddingPx,
        },
        1024: {
          slidesPerView: slidesPerView,
          spaceBetween: spaceBetweenPx,
          slidesOffsetBefore: paddingPx,
          slidesOffsetAfter: paddingPx,
        },
      },
      on: {
        init: function () {
          // Set initial button states
          updateButtonStates(this);
        },
        slideChange: function () {
          // Update button states on slide change
          updateButtonStates(this);
        },
        reachBeginning: function () {
          // Explicitly handle reaching beginning
          if (prevButton) {
            prevButton.style.opacity = "0.5";
            prevButton.style.pointerEvents = "none";
          }
        },
        reachEnd: function () {
          // Explicitly handle reaching end
          if (nextButton) {
            nextButton.style.opacity = "0.5";
            nextButton.style.pointerEvents = "none";
          }
        },
        fromEdge: function () {
          // Handle transition from an edge (beginning or end)
          updateButtonStates(this);
        },
        resize: function () {
          // Update button states after resize
          updateButtonStates(this);
        },
      },
    });

    // Force an update after initialization to ensure button states are correct
    setTimeout(() => {
      swiper.update();
      updateButtonStates(swiper);
    }, 100);

    // Add cursor styles for better UX
    sliderElement.style.cursor = "grab";

    sliderElement.addEventListener("mousedown", function () {
      this.style.cursor = "grabbing";
    });

    sliderElement.addEventListener("mouseup", function () {
      this.style.cursor = "grab";
    });

    sliderElement.addEventListener("mouseleave", function () {
      this.style.cursor = "grab";
    });

    // Store slider info
    const sliderInfo = {
      element: sliderElement,
      swiper: swiper,
      originalHTML: originalHTML,
      targetSelector: targetSelector,
      prevButtonSelector: prevButtonSelector,
      nextButtonSelector: nextButtonSelector,
      slidesPerView: slidesPerView,
      updateButtonStates: () => updateButtonStates(swiper),
    };

    // Add to our sliders array
    this.sliders.push(sliderInfo);

    return swiper;
  },

  // Destroy a specific slider instance
  destroySlider: function (sliderInfo) {
    if (!sliderInfo || !sliderInfo.swiper) return;

    this.log("Destroying Swiper instance");

    // Destroy the Swiper instance
    sliderInfo.swiper.destroy(true, true);

    // Restore original HTML
    sliderInfo.element.innerHTML = sliderInfo.originalHTML;

    // Remove Swiper-specific classes
    sliderInfo.element.classList.remove("swiper");
    sliderInfo.element.style.cursor = "";

    // Remove event listeners
    sliderInfo.element.removeEventListener("mousedown", () => {});
    sliderInfo.element.removeEventListener("mouseup", () => {});
    sliderInfo.element.removeEventListener("mouseleave", () => {});

    // Hide navigation buttons on mobile
    const prevButton = document.querySelector(sliderInfo.prevButtonSelector);
    const nextButton = document.querySelector(sliderInfo.nextButtonSelector);

    if (window.innerWidth < this.breakpoint) {
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
    }

    // Remove reference to Swiper instance
    sliderInfo.swiper = null;
  },

  // Check if window size change is significant enough to reload the page
  checkForSignificantResize: function () {
    const currentWidth = window.innerWidth;
    const widthDifference = Math.abs(currentWidth - this.initialWindowWidth);

    // If width change exceeds threshold, reload the page
    if (widthDifference > this.sizeChangeThreshold) {
      this.log(
        `Significant window size change detected (${widthDifference}px). Reloading page...`
      );

      // Use a slight delay to avoid multiple reloads during continuous resizing
      setTimeout(() => {
        window.location.reload();
      }, 500);

      // Update initial width to prevent multiple reloads
      this.initialWindowWidth = currentWidth;
    }
  },

  // Reinitialize Webflow interactions
  reinitializeWebflowInteractions: function () {
    if (window.Webflow && window.Webflow.destroy && window.Webflow.ready) {
      this.log("Reinitializing Webflow interactions");
      window.Webflow.destroy();
      window.Webflow.ready();
    }
  },

  // Handle responsive behavior for all sliders
  handleResponsive: function () {
    const isDesktop = window.innerWidth >= this.breakpoint;

    this.log(`Window width: ${window.innerWidth}px, isDesktop: ${isDesktop}`);

    // Check if window size change requires a page reload
    this.checkForSignificantResize();

    // Find all slider elements
    const sliderElements = document.querySelectorAll("[data-convert-slider]");

    if (isDesktop) {
      // On desktop: Initialize sliders that aren't already initialized
      sliderElements.forEach((element) => {
        // Check if this element is already in our sliders array
        const existingSlider = this.sliders.find((s) => s.element === element);

        if (existingSlider && existingSlider.swiper) {
          // Already initialized and active
          this.log("Slider already initialized");

          // Make sure it's properly updated
          existingSlider.swiper.update();
          if (existingSlider.updateButtonStates) {
            existingSlider.updateButtonStates();
          }
        } else if (existingSlider && !existingSlider.swiper) {
          // Was destroyed, needs re-initialization
          this.log("Reinitializing previously destroyed slider");
          this.initializeSlider(element);
        } else {
          // New slider, initialize it
          this.log("Initializing new slider");
          this.initializeSlider(element);
        }
      });
    } else {
      // On mobile: Destroy all active sliders
      this.sliders.forEach((sliderInfo) => {
        if (sliderInfo.swiper) {
          this.destroySlider(sliderInfo);
        }
      });
    }
  },

  // Set up Swup event listeners
  setupSwupEvents: function () {
    if (this.swupInitialized) return;

    this.log("Setting up Swup event listeners");

    // Primary event for Swup page transitions
    document.addEventListener("swup:contentReplaced", () => {
      this.log("Swup content replaced - Reinitializing sliders");
      setTimeout(() => {
        this.reinitialize();
        this.reinitializeWebflowInteractions();
      }, 100); // Add a slight delay to ensure DOM is fully updated
    });

    // Fallback events in case the main one doesn't fire properly
    document.addEventListener("swup:pageView", () => {
      this.log("Swup page view - Checking sliders");
      setTimeout(() => {
        // Only reinitialize if needed
        if (
          document.querySelectorAll("[data-convert-slider]").length > 0 &&
          this.sliders.length === 0
        ) {
          this.reinitialize();
        }
        this.reinitializeWebflowInteractions();
      }, 150);
    });

    document.addEventListener("swup:animationOutDone", () => {
      // Clean up sliders on page exit
      this.sliders.forEach((sliderInfo) => {
        if (sliderInfo.swiper) {
          this.destroySlider(sliderInfo);
        }
      });
      this.sliders = [];
    });

    this.swupInitialized = true;
  },

  // Initialize all sliders on the page
  initialize: function () {
    this.log("Initializing Swiper.js functionality");

    // Store initial window width
    this.initialWindowWidth = window.innerWidth;

    // Check if window.Swiper is available
    if (typeof Swiper === "undefined") {
      console.error(
        "[Swiper] Swiper.js library not found. Make sure it's properly loaded."
      );
      return;
    }

    // Set up Swup event listeners
    this.setupSwupEvents();

    // Handle initial slider setup based on screen size
    this.handleResponsive();

    // Set up resize event listener with debounce
    window.removeEventListener("resize", this.resizeHandler);

    this.resizeHandler = () => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
        this.handleResponsive();
      }, 250);
    };

    window.addEventListener("resize", this.resizeHandler);

    this.log("Swiper initialization complete");

    // Final check of button states after short delay
    setTimeout(() => {
      this.sliders.forEach((sliderInfo) => {
        if (sliderInfo.swiper && sliderInfo.updateButtonStates) {
          sliderInfo.updateButtonStates();
        }
      });
    }, 300);
  },

  // Reinitialize sliders (useful after DOM changes)
  reinitialize: function () {
    this.log("Reinitializing all sliders");

    // Destroy all existing sliders
    this.sliders.forEach((sliderInfo) => {
      if (sliderInfo.swiper) {
        this.destroySlider(sliderInfo);
      }
    });

    // Clear sliders array
    this.sliders = [];

    // Reinitialize everything
    this.initialize();

    // Reinitialize Webflow interactions
    this.reinitializeWebflowInteractions();
  },

  // Update all sliders (without full reinitialization)
  update: function () {
    this.log("Updating all sliders");

    this.sliders.forEach((sliderInfo) => {
      if (sliderInfo.swiper) {
        sliderInfo.swiper.update();
        if (sliderInfo.updateButtonStates) {
          sliderInfo.updateButtonStates();
        }
      }
    });
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  window.App.Swiper.initialize();

  // Initialize Webflow interactions if available
  if (window.Webflow && window.Webflow.ready) {
    window.Webflow.ready();
  }
});

// Global function to manually initialize sliders (can be called from other scripts)
window.initializeSliders = function () {
  window.App.Swiper.reinitialize();
};

// Additional event listener for after page load (helps with some edge cases)
window.addEventListener("load", function () {
  // Check if we have sliders but none are initialized
  if (
    document.querySelectorAll("[data-convert-slider]").length > 0 &&
    window.App.Swiper.sliders.length === 0
  ) {
    window.App.Swiper.initialize();
  }

  // Make sure button states are correctly set
  setTimeout(() => {
    window.App.Swiper.update();

    // Reinitialize Webflow interactions after everything is loaded
    window.App.Swiper.reinitializeWebflowInteractions();
  }, 300);
});

// MutationObserver to detect if sliders are dynamically added to the page
const observer = new MutationObserver(function (mutations) {
  let shouldInit = false;

  mutations.forEach(function (mutation) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach(function (node) {
        if (
          node.nodeType === 1 &&
          ((node.hasAttribute && node.hasAttribute("data-convert-slider")) ||
            (node.querySelector && node.querySelector("[data-convert-slider]")))
        ) {
          shouldInit = true;
        }
      });
    }
  });

  if (shouldInit) {
    window.App.Swiper.reinitialize();
  }
});

// Start observing the document body for added nodes
observer.observe(document.body, { childList: true, subtree: true });
