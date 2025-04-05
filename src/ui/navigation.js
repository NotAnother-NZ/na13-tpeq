// navigation.js - Navigation menu
window.App = window.App || {};
window.App.Navigation = {
  initialize: function () {
    setTimeout(() => {
      const links = document.querySelectorAll(".nav-link");
      const activeBg = document.querySelector(".nav-link-active");
      const menu = document.querySelector(".nav-menu");
      if (!links.length || !activeBg || !menu) return;

      // Amount in pixels to shorten the pill's width.
      const pillWidthAdjustment = 10;

      function getActiveLink() {
        const path = window.location.pathname;
        let active = null;
        links.forEach((link) => {
          const href = link.getAttribute("href");
          if (href === "/") {
            if (path === "/") {
              active = link;
            }
          } else {
            if (path === href || path.indexOf(href + "/") === 0) {
              active = link;
            }
          }
        });
        return active;
      }

      function moveActiveTo(link) {
        const linkRect = link.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        // Adjust width and center the pill accordingly
        const adjustedWidth = linkRect.width - pillWidthAdjustment;
        const adjustedLeft =
          linkRect.left - menuRect.left + pillWidthAdjustment / 2;
        activeBg.style.left = adjustedLeft + "px";
        activeBg.style.width = adjustedWidth + "px";
        activeBg.style.transform = "scaleY(1.05)";
        setTimeout(() => {
          activeBg.style.transform = "scaleY(1)";
        }, 300);
      }

      const currentLink = getActiveLink();
      if (currentLink) {
        activeBg.style.display = "block";
        activeBg.style.transition = "none";
        const linkRect = currentLink.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const adjustedWidth = linkRect.width - pillWidthAdjustment;
        const adjustedLeft =
          linkRect.left - menuRect.left + pillWidthAdjustment / 2;
        activeBg.style.left = adjustedLeft + "px";
        activeBg.style.width = adjustedWidth + "px";
        activeBg.offsetWidth;
        activeBg.style.transition =
          "left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      } else {
        activeBg.style.display = "none";
      }

      links.forEach((link) => {
        link.addEventListener("click", () => {
          moveActiveTo(link);
        });
      });

      window.addEventListener("resize", () => {
        const currentLink = getActiveLink();
        if (currentLink) {
          const linkRect = currentLink.getBoundingClientRect();
          const menuRect = menu.getBoundingClientRect();
          const adjustedWidth = linkRect.width - pillWidthAdjustment;
          const adjustedLeft =
            linkRect.left - menuRect.left + pillWidthAdjustment / 2;
          activeBg.style.left = adjustedLeft + "px";
          activeBg.style.width = adjustedWidth + "px";
        }
      });
    }, 50);
  },
};
