// newsletter.js - Newsletter form functionality with validation
window.App = window.App || {};
window.App.Newsletter = {
  initialize: function () {
    if (!document.querySelector("#newsletter-form")) return;

    // Initialize form validation and submit handling
    this.initializeFormHandling();

    // Handle previously submitted status
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

    // Observe success message to set session storage
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

  initializeFormHandling: function () {
    const emailInput = document.getElementById("n-email");
    const submitProxy = document.getElementById("newsletter-submit-proxy");
    const submitButton = document.getElementById("newsletter-submit");

    if (!emailInput || !submitProxy || !submitButton) return;

    // Initially hide the submit button
    submitProxy.style.display = "none";

    // Add novalidate to form to prevent browser default validation
    const form = emailInput.form;
    if (form) {
      form.setAttribute("novalidate", "true");
    }

    // Email validation function
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Update tooltips function
    function updateTooltips() {
      const emailNotEmpty = emailInput.value.trim().length > 0;
      const emailValid = isValidEmail(emailInput.value.trim());

      if (!emailNotEmpty) {
        emailInput.title = "Please enter your email address.";
      } else if (!emailValid) {
        emailInput.title = "Please enter a valid email address.";
      } else {
        emailInput.removeAttribute("title");
      }
    }

    // Form validation function
    function validateForm() {
      const emailNotEmpty = emailInput.value.trim().length > 0;
      const emailValid = isValidEmail(emailInput.value.trim());

      if (!emailNotEmpty) {
        emailInput.setCustomValidity("Please enter your email address.");
      } else if (!emailValid) {
        emailInput.setCustomValidity("Please enter a valid email address.");
      } else {
        emailInput.setCustomValidity("");
      }

      // Show/hide submit button based on validation
      if (emailNotEmpty && emailValid) {
        submitProxy.style.display = ""; // Show button
        submitProxy.classList.remove("disable");
      } else {
        submitProxy.style.display = "none"; // Hide button
      }

      updateTooltips();
    }

    // Add event listeners
    emailInput.addEventListener("input", validateForm);
    emailInput.addEventListener("focus", updateTooltips);
    emailInput.addEventListener("blur", updateTooltips);

    // Handle invalid event
    emailInput.addEventListener("invalid", function (e) {
      e.preventDefault();
      if (emailInput.value.trim() === "") {
        emailInput.setCustomValidity("Please enter your email address.");
      } else {
        emailInput.setCustomValidity("Please enter a valid email address.");
      }
      updateTooltips();
    });

    // Handle submit proxy click
    submitProxy.addEventListener("click", function (e) {
      e.preventDefault();
      const textElement = submitProxy.querySelector(".button-text");
      if (textElement) {
        textElement.textContent = "Please wait...";
      }
      if (submitButton) {
        submitButton.click();
      }
    });

    // Initial validation
    validateForm();
  },
};
