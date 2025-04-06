window.App = window.App || {};
window.App.LocomotiveScroll = {
  isPaused: false,

  initialize: function () {
    const scrollContainer = document.querySelector("[data-scroll-container]");
    if (!scrollContainer) return;

    if (document.documentElement.classList.contains("is-animating")) {
      console.log(
        "[LocomotiveScroll] Delaying initialization during transition"
      );
      return;
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    window.App.Core.scrollInstance = new LocomotiveScroll({
      el: scrollContainer,
      smooth: !isMobile,
      multiplier: window.innerWidth <= 1024 ? 1.0 : 0.95,
      smartphone: { smooth: false },
      tablet: { smooth: false },
      scrollbarContainer: false,
    });

    window.scrollInstance = window.App.Core.scrollInstance;

    // Initially pause scroll if we're in an animating state
    if (
      document.documentElement.classList.contains("is-animating") ||
      document.documentElement.classList.contains("no-js")
    ) {
      this.pause();
    }
  },

  setupGoToTopButton: function () {
    const goToTopButton = document.querySelector("#go-to-top");
    if (goToTopButton) {
      goToTopButton.addEventListener("click", function (e) {
        e.preventDefault();

        if (document.documentElement.classList.contains("is-animating")) {
          return;
        }

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (window.App.Core.scrollInstance && !isMobile) {
          window.App.Core.scrollInstance.scrollTo(0, {
            duration: 900,
            easing: [0.25, 0.0, 0.35, 1.0],
            disableLerp: false,
          });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  },

  // New method to pause scrolling
  pause: function () {
    if (!window.App.Core.scrollInstance || this.isPaused) return;

    console.log("[LocomotiveScroll] Pausing scroll");

    // Store current state
    this.isPaused = true;

    // Add a class to body for styling hooks
    document.body.classList.add("scroll-paused");

    // Disable native scrolling as well
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Stop Locomotive Scroll
    if (window.App.Core.scrollInstance.stop) {
      window.App.Core.scrollInstance.stop();
    }
  },

  // New method to resume scrolling
  resume: function () {
    if (!window.App.Core.scrollInstance || !this.isPaused) return;

    console.log("[LocomotiveScroll] Resuming scroll");

    // Update state
    this.isPaused = false;

    // Remove styling class
    document.body.classList.remove("scroll-paused");

    // Re-enable native scrolling
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    // Resume Locomotive Scroll
    if (window.App.Core.scrollInstance.start) {
      window.App.Core.scrollInstance.start();
    }

    // Update instance to ensure it's in sync with content
    if (window.App.Core.scrollInstance.update) {
      window.App.Core.scrollInstance.update();
    }
  },
};
