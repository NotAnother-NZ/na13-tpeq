// quicklink.js - Prefetching with performance optimizations
window.App = window.App || {};
window.App.Quicklink = {
  initialize: function () {
    if (typeof quicklink !== "undefined") {
      // Don't run quicklink immediately on first page load
      if (window.App.Core && window.App.Core.isInitialPageLoad) {
        console.log("[Quicklink] Delaying prefetch until after initial load");
        setTimeout(() => this.enablePrefetching(), 2000); // Delay prefetching by 2 seconds
        window.App.Core.isInitialPageLoad = false;
      } else {
        this.enablePrefetching();
      }
    }
  },

  enablePrefetching: function () {
    // Check if we're on a mobile connection
    const isMobileConnection = () => {
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection ||
        {};
      return (
        connection.saveData ||
        (connection.effectiveType && connection.effectiveType.includes("2g"))
      );
    };

    quicklink.listen({
      origins: [location.hostname],
      ignores: [
        /\/api\//,
        /\.(jpg|png|gif|svg|mp4|webm|pdf)$/,
        function (uri) {
          return uri.includes("#");
        },
        function (uri, elem) {
          return elem.hasAttribute("download");
        },
        function (uri, elem) {
          return elem.getAttribute("data-no-prefetch") === "true";
        },
        // Add additional ignores for mobile/low-data connections
        function () {
          return isMobileConnection();
        },
      ],
      timeout: 2000,
      throttle: isMobileConnection() ? 1 : 2, // Reduce concurrent requests on mobile
      priority: true,
      delay: 300, // Add a small delay before prefetching
      el: document.querySelector("main") || document.body, // Only prefetch links in main content
      limit: 5, // Limit the number of prefetched pages
    });

    console.log("[Quicklink] Prefetching enabled");
  },

  loadScript: function () {
    if (typeof quicklink !== "undefined") {
      this.initialize();
      return;
    }

    var script = document.createElement("script");
    script.src = "https://unpkg.com/quicklink@2.3.0/dist/quicklink.umd.js";
    script.async = true;
    script.onload = this.initialize.bind(this);
    script.onerror = function () {};
    document.head.appendChild(script);
  },
};

// Add a flag to track initial page load
if (!window.App.Core) window.App.Core = {};
window.App.Core.isInitialPageLoad = true;
