// swup.js - Updated for better performance on initial load
window.App = window.App || {};
window.App.Swup = {
  isTransitioning: false,
  cooldownTimer: null,

  initialize: function () {
    if (window.App.Core.swupInstance) return window.App.Core.swupInstance;

    // Record start time for performance tracking
    const initStartTime = performance.now();

    // Ensure the overlay element exists
    this.ensureOverlayElement();

    // Create Swup instance with custom link selector that checks transition state
    window.App.Core.swupInstance = new Swup({
      containers: ["#swup"],
      cache: true,
      animationSelector: '[class*="transition-"]',
      plugins: [
        new SwupHeadPlugin({
          persistTags: "style[data-swup-persist], script[data-swup-persist]",
          awaitAssets: false, // Don't wait for all assets on head replace
        }),
        new SwupScriptsPlugin({
          head: true,
          body: true,
          optin: true,
          defer: true, // Add defer to injected scripts
        }),
      ],
      animateHistoryBrowsing: true,
      linkSelector:
        'a[href^="' +
        window.location.origin +
        '"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup])',
    });

    // Add custom link click handler to prevent multiple transitions
    this.setupLinkInterception();

    // Track transition state
    window.App.Core.swupInstance.hooks.on("animation:out:start", () => {
      this.isTransitioning = true;

      // Pause scrolling during transition
      if (window.App.LocomotiveScroll) {
        window.App.LocomotiveScroll.pause();
      }

      if (window.App.Core.scrollInstance) {
        window.App.Core.scrollInstance.destroy();
        window.App.Core.scrollInstance = null;
      }
      window.App.Core.animationStartTime = Date.now();

      // Explicitly add classes to disable interactions
      document.documentElement.classList.add("is-animating");
      document.documentElement.classList.add("is-changing");

      // Animation: show the overlay sliding from top
      const overlay = document.getElementById("swup-overlay");
      overlay.classList.remove("is-leaving");
      overlay.style.transform = "translateY(0)";
    });

    window.App.Core.swupInstance.hooks.on("content:replace", () => {
      let elapsed = Date.now() - window.App.Core.animationStartTime;
      let remaining = window.App.Core.ANIMATION_DURATION - elapsed;
      if (remaining < 0) remaining = 0;

      // Prepare the overlay to slide down (revealing the new page)
      setTimeout(() => {
        const overlay = document.getElementById("swup-overlay");
        overlay.classList.add("is-leaving");
      }, 100);

      // Use priority-based initialization to improve performance
      this.initializeComponents(remaining + 600);
    });

    // Add animation:in:end hook to reset the overlay
    window.App.Core.swupInstance.hooks.on("animation:in:end", () => {
      setTimeout(() => {
        const overlay = document.getElementById("swup-overlay");
        overlay.classList.remove("is-leaving");
        overlay.style.transition = "none";
        overlay.style.transform = "translateY(-100%)";

        // Force a reflow to ensure the transition is applied
        overlay.offsetHeight;

        // Restore the smooth transition for page changes
        overlay.style.transition =
          "transform 0.65s cubic-bezier(0.76, 0, 0.24, 1)";

        // Make sure interactions are re-enabled
        document.documentElement.classList.remove("is-animating");
        document.documentElement.classList.remove("is-changing");

        // Resume scrolling now that transition is complete
        if (window.App.LocomotiveScroll) {
          window.App.LocomotiveScroll.resume();
        }

        // Set transition state to false with a small cooldown period
        if (this.cooldownTimer) clearTimeout(this.cooldownTimer);
        this.cooldownTimer = setTimeout(() => {
          this.isTransitioning = false;
          console.log("[Swup] Ready for next transition");
        }, 50); // 50ms cooldown before allowing another transition

        // Initialize non-critical components after transition is complete
        this.initializeLowPriorityComponents();
      }, 700);
    });

    console.log(
      `[Swup] Initialization time: ${(
        performance.now() - initStartTime
      ).toFixed(2)}ms`
    );
    return window.App.Core.swupInstance;
  },

  // New method to initialize components in priority order
  initializeComponents: function (delay) {
    setTimeout(() => {
      // Critical components - initialize these first
      if (window.Webflow && Webflow.require("ix2")) {
        Webflow.require("ix2").init();
      }

      // High priority - core functionality and visible elements
      window.App.LocomotiveScroll.initialize();
      window.App.Navigation.initialize();
      if (window.App.VideoLoopHandler) {
        window.App.VideoLoopHandler.reinitialize();
      }

      // Medium priority - UI elements not immediately visible or interactive
      window.App.LocomotiveScroll.setupGoToTopButton();
      window.App.Footer.initialize();

      // Re-enable interactions when critical components are ready
      document.documentElement.classList.remove("is-animating");
      document.documentElement.classList.remove("is-changing");

      // After a short delay, initialize remaining components
      setTimeout(() => {
        // Now load QuickLink - this runs last to avoid competing for resources
        window.App.Quicklink.initialize();
      }, 700);
    }, delay);
  },

  // Low priority components to initialize after everything else
  initializeLowPriorityComponents: function () {
    // These are components that aren't critical to the initial view
    setTimeout(() => {
      window.App.Utils.runCopyrightYearScript();
      window.App.Utils.runDateZeroScript();
      window.App.NotAnother.initialize();
      window.App.Newsletter.initialize();
      window.App.Contact.initialize();
      window.App.InsightsSorting.initialize();
      window.App.ProfilePlaceholders.initialize();

      // Initialize click redirect handler
      if (window.App.ClickRedirectHandler) {
        window.App.ClickRedirectHandler.initialize();
      }

      // Handle service slider if present
      const hasServiceSlider = !!document.querySelector(
        ".service-overview-slider"
      );

      if (hasServiceSlider) {
        window.App.ServiceSlider.initialize();
        setTimeout(() => window.App.ServiceSlider.reinitialize(), 500);
      }

      // Final check for videos
      if (window.App.VideoLoopHandler) {
        window.App.VideoLoopHandler.playAllLoopingVideos();
      }
    }, 200);
  },

  setupLinkInterception: function () {
    // Intercept link clicks to check if a transition is already in progress
    document.addEventListener(
      "click",
      (event) => {
        // Only process link clicks
        if (
          !event.target.tagName ||
          event.target.tagName.toLowerCase() !== "a"
        ) {
          // Check if we clicked something inside a link
          const parentLink = event.target.closest("a");
          if (!parentLink) {
            return; // Not a link or child of link, ignore
          }

          // Use the parent link instead
          event.target = parentLink;
        }

        const link = event.target;

        // Check if this is a Swup-handled link
        if (
          link.href &&
          !link.hasAttribute("data-no-swup") &&
          (link.href.startsWith(window.location.origin) ||
            link.getAttribute("href").startsWith("/") ||
            link.getAttribute("href").startsWith("#"))
        ) {
          // Check if we're currently transitioning
          if (this.isTransitioning) {
            console.log(
              "[Swup] Transition already in progress, ignoring click"
            );
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
      },
      true
    ); // Use capture phase to intercept before Swup
  },

  ensureOverlayElement: function () {
    let overlay = document.getElementById("swup-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "swup-overlay";
      document.body.appendChild(overlay);
    }
  },
};
