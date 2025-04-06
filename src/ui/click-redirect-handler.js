// click-redirect-handler.js - Handles click redirection for elements with data-dt-click attribute
window.App = window.App || {};
window.App.ClickRedirectHandler = {
  debug: true,

  log: function (...args) {
    if (this.debug) {
      console.log("[ClickRedirectHandler]", ...args);
    }
  },

  setupClickRedirects: function () {
    // Find all elements with the data-dt-click attribute
    const redirectElements = document.querySelectorAll("[data-dt-click]");
    this.log(`Found ${redirectElements.length} elements with click redirect`);

    // Remove existing handlers to prevent duplicates
    if (window.clickRedirectState && window.clickRedirectState.listeners) {
      this.log("Cleaning up previous listeners");
      window.clickRedirectState.listeners.forEach((item) => {
        if (
          item &&
          item.element &&
          typeof item.element.removeEventListener === "function"
        ) {
          item.element.removeEventListener(item.type, item.handler);
        }
      });
    }

    // Create new state object for tracking
    window.clickRedirectState = {
      listeners: [],
    };

    // Set up click handlers for each element
    redirectElements.forEach((element, index) => {
      const targetSelector = element.getAttribute("data-dt-click");
      if (!targetSelector) {
        this.log(
          `Element ${index} has empty data-dt-click attribute, skipping`
        );
        return;
      }

      this.log(`Setting up redirect from element to "${targetSelector}"`);

      const clickHandler = (event) => {
        event.preventDefault();

        // Find the target element
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
          this.log(`Target element "${targetSelector}" not found`);
          return;
        }

        this.log(`Redirecting click to ${targetSelector}`);

        // Trigger a click on the target element
        targetElement.click();
      };

      // Add the click event listener
      element.addEventListener("click", clickHandler);
      window.clickRedirectState.listeners.push({
        element: element,
        type: "click",
        handler: clickHandler,
      });
    });
  },

  initialize: function () {
    this.log("Initializing click redirect handler");
    this.setupClickRedirects();
  },

  reinitialize: function () {
    this.log("Reinitializing click redirect handler");
    setTimeout(() => {
      this.setupClickRedirects();
    }, 100);
  },
};
