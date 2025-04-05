// core.js - Core variables and shared state
window.App = window.App || {};
window.App.Core = {
  ANIMATION_DURATION: 500,
  animationStartTime: 0,
  scrollInstance: null,
  swupInstance: null,
  globalInitialized: false,

  initialize: function () {
    if (this.globalInitialized) return;
    this.globalInitialized = true;

    document.addEventListener("DOMContentLoaded", function () {
      window.App.Swup.ensureOverlayElement();
      window.App.Swup.initialize();
      window.App.LocomotiveScroll.initialize();
      window.App.Quicklink.loadScript();
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
      window.App.ServiceSlider.initialize();
      window.App.Utils.initializePageScripts();
    });

    window.addEventListener("load", function () {
      window.App.Footer.initialize();
      window.App.ProfilePlaceholders.initialize();

      // Re-initialize service slider after everything is loaded
      setTimeout(() => {
        if (window.serviceSliderState) {
          window.serviceSliderState.isInitialized = false;
        }
        window.App.ServiceSlider.initialize();
      }, 200);
    });
  },
};

// Immediately initialize the core
window.App.Core.initialize();
