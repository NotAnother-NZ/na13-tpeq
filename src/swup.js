window.App = window.App || {};
window.App.Swup = {
  initialize: function () {
    if (window.App.Core.swupInstance) return window.App.Core.swupInstance;

    // Ensure the overlay element exists
    this.ensureOverlayElement();

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
    });

    window.App.Core.swupInstance.hooks.on("animation:out:start", () => {
      if (window.App.Core.scrollInstance) {
        window.App.Core.scrollInstance.destroy();
        window.App.Core.scrollInstance = null;
      }
      window.App.Core.animationStartTime = Date.now();
      document.documentElement.classList.add("is-animating");
      document.body.style.pointerEvents = "none";

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
        // Initialize our components
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

        // Handle service slider
        const hasServiceSlider = !!document.querySelector(
          ".service-overview-slider"
        );
        if (hasServiceSlider) {
          setTimeout(() => {
            window.App.ServiceSlider.reinitialize();
          }, 200);
        }

        document.documentElement.classList.remove("is-animating");
        document.body.style.pointerEvents = "";

        // Force Webflow to reinitialize components
        if (window.Webflow) {
          if (Webflow.require("ix2")) {
            Webflow.require("ix2").init();
          }
          if (typeof Webflow.ready === "function") {
            Webflow.ready();
          }
        }
      }, remaining + 600); // Added extra time for the overlay animation
    });

    // Add animation:in:end hook to reset the overlay
    window.App.Core.swupInstance.hooks.on("animation:in:end", () => {
      setTimeout(() => {
        // Hide overlay by positioning it back above the viewport
        // But only do this AFTER the transition is complete and it's off-screen at the bottom
        const overlay = document.getElementById("swup-overlay");
        overlay.classList.remove("is-leaving");

        // Important: Use a transition with no animation to reset the position
        overlay.style.transition = "none";
        overlay.style.transform = "translateY(-100%)";

        // Force a reflow to ensure the transition is applied
        overlay.offsetHeight;

        // Restore the smooth transition for next page change
        overlay.style.transition =
          "transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)";
      }, 700);
    });

    return window.App.Core.swupInstance;
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
