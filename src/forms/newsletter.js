// newsletter.js - Newsletter form functionality
window.App = window.App || {};
window.App.Newsletter = {
  initialize: function () {
    if (!document.querySelector("#newsletter-form")) return;
    if (sessionStorage.getItem("newsletterSubmitted") === "true") {
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(() => {
          const form = document.getElementById("newsletter-form");
          const title = document.getElementById("newsletter-form-title");
          if (form) form.classList.add("hide");
          if (title)
            title.textContent =
              "Thanks for subscribing to our newsletter — we'll keep you posted!";
        });
      } else {
        setTimeout(() => {
          const form = document.getElementById("newsletter-form");
          const title = document.getElementById("newsletter-form-title");
          if (form) form.classList.add("hide");
          if (title)
            title.textContent =
              "Thanks for subscribing to our newsletter — we'll keep you posted!";
        }, 0);
      }
    }
    const submitProxy = document.getElementById("newsletter-submit-proxy");
    if (submitProxy) {
      submitProxy.addEventListener("click", function () {
        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(() => {
            const submitButton = document.getElementById("newsletter-submit");
            if (submitButton) submitButton.click();
          });
        } else {
          setTimeout(() => {
            const submitButton = document.getElementById("newsletter-submit");
            if (submitButton) submitButton.click();
          }, 0);
        }
      });
    }
    const observer = new MutationObserver(function (mutationsList) {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const successEl = document.querySelector(
            ".global-form-success.newsletter"
          );
          if (successEl && getComputedStyle(successEl).display !== "none") {
            sessionStorage.setItem("newsletterSubmitted", "true");
          }
        }
      }
    });
    const successEl = document.querySelector(".global-form-success.newsletter");
    if (successEl) {
      observer.observe(successEl, {
        attributes: true,
        attributeFilter: ["style"],
      });
    }
  },
};
