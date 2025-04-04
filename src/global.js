// Direct imports of all modules
import { initializeCopyright } from './modules/copyright.js';
import { initializeDateZero } from './modules/date-zero.js';

// Prevent multiple initializations
if (window.globalInitialized) {
  console.log("Global JS already initialized");
} else {
  window.globalInitialized = true;

  // Common variables
  let scrollInstance = null;
  let swupInstance = null;
  let animationStartTime = 0;
  const ANIMATION_DURATION = 500;

  // Initialize all modules on content replacement
  function initializeAllModules() {
    // Direct calls to all module initializers
    initializeCopyright();
    initializeDateZero();
  }

  // Initialize Swup
  function initializeSwup() {
    // Your existing Swup initialization code
    const overlay = document.createElement("div");
    overlay.id = "swup-overlay";
    document.body.appendChild(overlay);

    swupInstance = new Swup({
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

    swupInstance.hooks.on("animation:out:start", () => {
      if (scrollInstance) {
        scrollInstance.destroy();
        scrollInstance = null;
      }
      animationStartTime = Date.now();
      document.documentElement.classList.add("is-animating");
      document.body.style.pointerEvents = "none";
    });

    swupInstance.hooks.on("content:replace", () => {
      let elapsed = Date.now() - animationStartTime;
      let remaining = ANIMATION_DURATION - elapsed;
      if (remaining < 0) remaining = 0;

      setTimeout(() => {
        // Run all module initializers
        initializeAllModules();

        // Reinitialize Webflow interactions if needed
        if (window.Webflow && Webflow.require) {
          Webflow.require("ix2").init();
        }

        document.documentElement.classList.remove("is-animating");
        document.body.style.pointerEvents = "";
      }, remaining);
    });

    return swupInstance;
  }

  // Initialize on document load
  document.addEventListener("DOMContentLoaded", function () {
    initializeSwup();
    initializeAllModules();
  });

  // Also initialize on load for reliability
  window.addEventListener("load", function () {
    // Some modules may need window.load event
    // No automatic detection here - add manually if needed
  });
}