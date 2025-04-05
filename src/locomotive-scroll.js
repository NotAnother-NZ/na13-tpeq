// locomotive-scroll.js - Enhanced for transition handling
window.App = window.App || {};
window.App.LocomotiveScroll = {
  initialize: function () {
    const scrollContainer = document.querySelector("[data-scroll-container]");
    if (!scrollContainer) return;

    // Don't initialize if we're in the middle of a transition
    if (document.documentElement.classList.contains("is-animating")) {
      console.log(
        "[LocomotiveScroll] Delaying initialization during transition"
      );
      return;
    }

    window.App.Core.scrollInstance = new LocomotiveScroll({
      el: scrollContainer,
      smooth: true,
      multiplier: window.innerWidth <= 1024 ? 1.5 : 0.95,
      smartphone: { smooth: true, multiplier: 1.5 },
      tablet: { smooth: true, multiplier: 1.5 },
      scrollbarContainer: false,
    });

    window.scrollInstance = window.App.Core.scrollInstance;
  },

  setupGoToTopButton: function () {
    const goToTopButton = document.querySelector("#go-to-top");
    if (goToTopButton) {
      goToTopButton.addEventListener("click", function (e) {
        e.preventDefault();

        // Don't do anything if we're in a transition
        if (document.documentElement.classList.contains("is-animating")) {
          return;
        }

        if (window.App.Core.scrollInstance) {
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
};
