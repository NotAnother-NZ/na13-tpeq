// webflow-handler.js - Advanced solution for Webflow interactions
// Current Date and Time (UTC): 2025-04-18 00:01:58
// Current User's Login: Druhin13

window.App = window.App || {};
window.App.WebflowHandler = {
  debug: true,
  initialized: false,
  initCount: 0,
  initTimeouts: [],

  log: function (...args) {
    if (this.debug) {
      console.log("[WebflowHandler]", ...args);
    }
  },

  // Clear all pending timeouts
  clearAllTimeouts: function () {
    this.initTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.initTimeouts = [];
  },

  // Force IX2 initialization more aggressively
  forceIX2Init: function () {
    try {
      // Try direct IX2 initialization if available
      if (window.Webflow && window.Webflow.require) {
        const ix2 = window.Webflow.require("ix2");
        if (ix2) {
          if (ix2.destroy) {
            ix2.destroy();
          }
          if (ix2.init) {
            ix2.init();
            this.log("IX2 directly initialized");
            return true;
          }
        }
      }

      // Fallback to older Webflow versions or different structures
      if (window.Webflow && window.Webflow.ix2) {
        if (window.Webflow.ix2.destroy) {
          window.Webflow.ix2.destroy();
        }
        if (window.Webflow.ix2.init) {
          window.Webflow.ix2.init();
          this.log("IX2 initialized through Webflow.ix2");
          return true;
        }
      }

      // Another approach - find Webflow's IX2 controller in window.__wf_ix2
      if (window.__wf_ix2) {
        if (window.__wf_ix2.destroy) {
          window.__wf_ix2.destroy();
        }
        if (window.__wf_ix2.init) {
          window.__wf_ix2.init();
          this.log("IX2 initialized through __wf_ix2");
          return true;
        }
      }

      return false;
    } catch (e) {
      this.log("Error forcing IX2 init:", e);
      return false;
    }
  },

  // Main initialization function with force option
  initializeWebflow: function (force = false) {
    this.initCount++;

    this.log(
      `Initializing Webflow (attempt #${this.initCount}, force: ${force})`
    );

    // If forced, clear any pending timeouts and reset state
    if (force) {
      this.clearAllTimeouts();
      this.initialized = false;
    }

    // Skip if already initialized and not forced
    if (this.initialized && !force) {
      this.log("Already initialized, skipping");
      return;
    }

    // Check if Webflow exists
    if (window.Webflow) {
      try {
        // Try to destroy any existing instances
        if (window.Webflow.destroy) {
          window.Webflow.destroy();
        }

        // Re-initialize Webflow
        if (window.Webflow.ready) {
          window.Webflow.ready();
          this.log("Webflow.ready() called");
        }

        // Force IX2 initialization
        this.forceIX2Init();

        // For some Webflow versions, we need to manually trigger the IX mount
        const allIxElements = document.querySelectorAll("[data-ix]");
        if (allIxElements.length > 0) {
          this.log(`Found ${allIxElements.length} interaction elements`);
          allIxElements.forEach((el) => {
            // Trigger a re-evaluation by toggling a harmless attribute
            el.setAttribute("data-ix-force", "force");
            setTimeout(() => {
              el.removeAttribute("data-ix-force");
            }, 10);
          });
        }

        // Set initialization flag
        this.initialized = true;
        this.log("Webflow initialization complete");

        // Additional force attempt after a short delay
        const finalTimeout = setTimeout(() => {
          this.forceIX2Init();
        }, 300);
        this.initTimeouts.push(finalTimeout);
      } catch (e) {
        this.log("Error initializing Webflow:", e);
      }
    } else {
      this.log("Webflow not available yet");

      // Try again with increasing delays
      if (this.initCount < 8) {
        const delay = Math.min(100 * Math.pow(1.5, this.initCount - 1), 2000);
        const timeout = setTimeout(() => {
          this.initializeWebflow();
        }, delay);
        this.initTimeouts.push(timeout);
      }
    }
  },

  // Schedule initialization with multiple attempts at different delays
  scheduleMultipleInits: function () {
    // Clear any existing timeouts
    this.clearAllTimeouts();

    // Schedule multiple initialization attempts with different delays
    const delays = [10, 100, 300, 600, 1000, 2000, 3500];

    delays.forEach((delay, index) => {
      const timeout = setTimeout(() => {
        this.log(`Scheduled initialization #${index + 1} (delay: ${delay}ms)`);
        this.initializeWebflow(true); // Force initialization
      }, delay);
      this.initTimeouts.push(timeout);
    });
  },

  // Set up all event listeners
  setupEventListeners: function () {
    // Immediate attempt
    this.initializeWebflow();

    // Schedule multiple attempts
    this.scheduleMultipleInits();

    // DOMContentLoaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.log("DOMContentLoaded fired");
        this.initializeWebflow(true);
        this.scheduleMultipleInits();
      });
    }

    // Window load
    window.addEventListener("load", () => {
      this.log("Window load fired");
      this.initializeWebflow(true);

      // One more scheduled attempt after window load
      setTimeout(() => {
        this.initializeWebflow(true);
      }, 500);
    });

    // Swup events
    document.addEventListener("swup:contentReplaced", () => {
      this.log("Swup content replaced");
      this.initialized = false; // Reset initialization state
      this.initializeWebflow(true);
      this.scheduleMultipleInits();
    });

    document.addEventListener("swup:pageView", () => {
      this.log("Swup page view");
      setTimeout(() => {
        this.initializeWebflow(true);
      }, 150);
    });

    // Listen for potential page script loaded events
    document.addEventListener("DOMNodeInserted", (e) => {
      if (e.target.nodeName === "SCRIPT") {
        setTimeout(() => {
          this.initializeWebflow(true);
        }, 100);
      }
    });

    // Create a MutationObserver to watch for significant DOM changes
    const observer = new MutationObserver((mutations) => {
      let shouldInit = false;

      mutations.forEach((mutation) => {
        // Look for addition of elements with data-ix attributes
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Element node
              if (node.hasAttribute && node.hasAttribute("data-ix")) {
                shouldInit = true;
              } else if (
                node.querySelector &&
                node.querySelector("[data-ix]")
              ) {
                shouldInit = true;
              }
            }
          });
        }

        // Look for changes to data-ix attributes
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-ix"
        ) {
          shouldInit = true;
        }
      });

      if (shouldInit) {
        this.log("Significant DOM changes detected, reinitializing");
        this.initializeWebflow(true);
      }
    });

    // Start observing the entire document
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-ix"],
    });
  },
};

// Initialize immediately
window.App.WebflowHandler.setupEventListeners();

// Provide global function to manually trigger initialization
window.initializeWebflowInteractions = function () {
  window.App.WebflowHandler.initializeWebflow(true);
};

// Also expose as a global variable for direct access in other scripts
window.webflowHandler = window.App.WebflowHandler;
