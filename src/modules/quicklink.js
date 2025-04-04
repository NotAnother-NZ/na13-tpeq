// Quicklink module for prefetching links
export function initializeQuicklink() {
    if (typeof quicklink !== "undefined") {
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
        ],
        timeout: 2000,
        throttle: 2,
        priority: true,
        delay: 0,
        el: document.body,
      });
    }
  }
  
  export function loadQuicklink() {
    if (typeof quicklink !== "undefined") {
      initializeQuicklink();
      return;
    }
    
    var script = document.createElement("script");
    script.src = "https://unpkg.com/quicklink@2.3.0/dist/quicklink.umd.js";
    script.async = true;
    script.onload = initializeQuicklink;
    script.onerror = function () {};
    document.head.appendChild(script);
  }