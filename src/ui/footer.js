// footer.js - Footer menu hover effects
window.App = window.App || {};
window.App.Footer = {
  initialize: function () {
    if (window.matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll(".footer-menu-list").forEach((list) => {
        let lastHovered = null;
        list.addEventListener("mouseover", (event) => {
          const link = event.target.closest(".footer-menu-list-item a");
          if (!link) return;
          const item = link.closest(".footer-menu-list-item");
          if (!item) return;
          lastHovered = item;
          if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(() => {
              list.querySelectorAll(".footer-menu-list-item").forEach((el) => {
                const hasLink = el.querySelector("a");
                el.style.opacity = hasLink ? (el === item ? "1" : "0.25") : "1";
              });
            });
          } else {
            setTimeout(() => {
              list.querySelectorAll(".footer-menu-list-item").forEach((el) => {
                const hasLink = el.querySelector("a");
                el.style.opacity = hasLink ? (el === item ? "1" : "0.25") : "1";
              });
            }, 0);
          }
        });
        list.addEventListener("mousemove", (event) => {
          const link = event.target.closest(".footer-menu-list-item a");
          if (!link && lastHovered) {
            if (typeof requestIdleCallback !== "undefined") {
              requestIdleCallback(() => {
                list
                  .querySelectorAll(".footer-menu-list-item")
                  .forEach((el) => {
                    const hasLink = el.querySelector("a");
                    el.style.opacity = hasLink
                      ? el === lastHovered
                        ? "1"
                        : "0.25"
                      : "1";
                  });
              });
            } else {
              setTimeout(() => {
                list
                  .querySelectorAll(".footer-menu-list-item")
                  .forEach((el) => {
                    const hasLink = el.querySelector("a");
                    el.style.opacity = hasLink
                      ? el === lastHovered
                        ? "1"
                        : "0.25"
                      : "1";
                  });
              }, 0);
            }
          }
        });
        list.addEventListener("mouseleave", () => {
          lastHovered = null;
          if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(() => {
              list.querySelectorAll(".footer-menu-list-item").forEach((el) => {
                el.style.opacity = "";
              });
            });
          } else {
            setTimeout(() => {
              list.querySelectorAll(".footer-menu-list-item").forEach((el) => {
                el.style.opacity = "";
              });
            }, 0);
          }
        });
      });
    }
  },
};
