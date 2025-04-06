// swup.js - Updated to control scrolling during transitions
window.App = window.App || {};
window.App.Swup = {
  isTransitioning: false,
  cooldownTimer: null,

  initialize: function () {
    if (window.App.Core.swupInstance) return window.App.Core.swupInstance;

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
          awaitAssets: true,
        }),
        new SwupScriptsPlugin({ head: true, body: true, optin: true }),
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

      setTimeout(() => {
        // Force Webflow to reinitialize components
        if (window.Webflow) {
          if (Webflow.require("ix2")) {
            Webflow.require("ix2").init();
          }
          if (typeof Webflow.ready === "function") {
            Webflow.ready();
          }
        }

        // Initialize components - order matters here
        window.App.LocomotiveScroll.initialize();
        window.App.Quicklink.initialize();
        window.App.LocomotiveScroll.setupGoToTopButton();
        window.App.Utils.runCopyrightYearScript();
        window.App.Utils.runDateZeroScript();
        window.App.NotAnother.initialize();
        window.App.Navigation.initialize();
        window.App.Newsletter.initialize();
        window.App.Contact.initialize();
        window.App.InsightsSorting.initialize();
        window.App.Footer.initialize();
        window.App.ProfilePlaceholders.initialize();

        // Initialize click redirect handler
        if (window.App.ClickRedirectHandler) {
          window.App.ClickRedirectHandler.initialize();
        }

        // Handle service slider if present
        const hasServiceSlider = !!document.querySelector(
          ".service-overview-slider"
        );
        console.log("[Swup] Service slider present?", hasServiceSlider);

        if (hasServiceSlider) {
          window.App.ServiceSlider.initialize();
          setTimeout(() => window.App.ServiceSlider.reinitialize(), 500);
        }

        // Handle looping videos
        if (window.App.VideoLoopHandler) {
          window.App.VideoLoopHandler.reinitialize();
        }

        // Re-enable interactions when animation is complete
        document.documentElement.classList.remove("is-animating");
        document.documentElement.classList.remove("is-changing");
      }, remaining + 600); // Added extra time for the overlay animation
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

        // Final check for videos - especially helpful on mobile
        if (window.App.VideoLoopHandler) {
          window.App.VideoLoopHandler.playAllLoopingVideos();
        }

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
      }, 700);
    });

    return window.App.Core.swupInstance;
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
