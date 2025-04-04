// Module for contact form functionality
import { getScrollInstance } from './locomotive.js';

export function initializeContactForm() {
  if (!document.querySelector("#contact-section")) return;
  
  var dataElements = Array.from(
    document.querySelectorAll("[data-dt-service-type-name]")
  );
  var groups = {};
  
  dataElements.forEach(function (el) {
    var targetSelector = el.getAttribute("data-dt-service-type-name");
    if (!groups[targetSelector]) {
      groups[targetSelector] = [];
    }
    groups[targetSelector].push(el.textContent.trim());
  });
  
  Object.keys(groups).forEach(function (targetSelector) {
    var options = Array.from(new Set(groups[targetSelector])).sort(function (
      a,
      b
    ) {
      return a.localeCompare(b);
    });
    
    var selectElement = document.querySelector(targetSelector);
    if (selectElement) {
      while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.firstChild);
      }
      
      var defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Select an option";
      defaultOption.disabled = true;
      defaultOption.selected = true;
      selectElement.appendChild(defaultOption);
      
      options.forEach(function (optText) {
        var option = document.createElement("option");
        option.value = optText;
        option.textContent = optText;
        selectElement.appendChild(option);
      });
    }
  });
  
  var fullNameInput = document.getElementById("c-full-name");
  var emailInput = document.getElementById("c-email");
  var serviceSelect = document.getElementById("c-service-type");
  var messageInput = document.getElementById("c-message");
  var submitProxy = document.getElementById("contact-submit-proxy");
  var submitButton = document.getElementById("contact-submit");
  
  if (
    !fullNameInput ||
    !emailInput ||
    !serviceSelect ||
    !messageInput ||
    !submitProxy
  )
    return;
  
  var storedFormHeight = 0;
  var successScrolled = false;
  var locomotiveReloaded = false;
  
  function isElementVisible(el) {
    if (!el) return false;
    var style = window.getComputedStyle(el);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }
  
  function reloadLocomotiveScroll() {
    if (locomotiveReloaded) return;
    
    if (window.scrollInstance) {
      try {
        window.scrollInstance.destroy();
        window.scrollInstance = new LocomotiveScroll({
          el: document.querySelector("[data-scroll-container]"),
          smooth: true,
          multiplier: 0.95,
          smartphone: { smooth: true, multiplier: 1.25 },
          tablet: { smooth: true, multiplier: 1.25 },
        });
        locomotiveReloaded = true;
      } catch (error) {}
    } else {
      for (var prop in window) {
        if (
          window[prop] &&
          typeof window[prop].destroy === "function" &&
          prop.toLowerCase().includes("scroll")
        ) {
          try {
            var scrollEl = document.querySelector("[data-scroll-container]");
            if (scrollEl) {
              window[prop].destroy();
              window[prop] = new LocomotiveScroll({
                el: scrollEl,
                smooth: true,
                multiplier: 0.95,
                smartphone: { smooth: true, multiplier: 1.25 },
                tablet: { smooth: true, multiplier: 1.25 },
              });
              locomotiveReloaded = true;
              break;
            }
          } catch (error) {}
        }
      }
    }
  }
  
  function scrollToContactSection() {
    if (successScrolled) return;
    
    setTimeout(function () {
      var contactSection = document.getElementById("contact-section");
      if (contactSection) {
        const scrollInstance = getScrollInstance();
        if (scrollInstance) {
          scrollInstance.scrollTo(contactSection);
          successScrolled = true;
        } else {
          for (var prop in window) {
            if (
              window[prop] &&
              typeof window[prop].scrollTo === "function" &&
              prop.toLowerCase().includes("scroll")
            ) {
              window[prop].scrollTo(contactSection);
              successScrolled = true;
              break;
            }
          }
          if (!successScrolled) {
            contactSection.scrollIntoView({ behavior: "smooth" });
            successScrolled = true;
          }
        }
      }
    }, 200);
  }
  
  function updateSuccessHeight() {
    var contactForm = document.getElementById("contact-form");
    var successElement = document.querySelector(
      ".global-form-success.contact"
    );
    
    if (contactForm) {
      var formHeight = contactForm.offsetHeight;
      if (formHeight > 0) {
        storedFormHeight = formHeight;
      }
      
      if (successElement) {
        var originalDisplay = successElement.style.display;
        var originalVisibility = successElement.style.visibility;
        var originalOpacity = successElement.style.opacity;
        
        if (window.getComputedStyle(successElement).display === "none") {
          successElement.style.display = "block";
          successElement.style.visibility = "hidden";
          successElement.style.opacity = "0";
        }
        
        successElement.style.height = storedFormHeight + "px";
        successElement.style.display = originalDisplay;
        successElement.style.visibility = originalVisibility;
        successElement.style.opacity = originalOpacity;
        
        if (isElementVisible(successElement)) {
          reloadLocomotiveScroll();
          scrollToContactSection();
        }
      }
    }
  }
  
  function setupSuccessHeightSync() {
    updateSuccessHeight();
    setTimeout(updateSuccessHeight, 100);
    setTimeout(updateSuccessHeight, 500);
    setTimeout(updateSuccessHeight, 1000);
    addCSSRule(
      ".global-form-success.contact",
      "min-height: " + storedFormHeight + "px !important;"
    );
  }
  
  function addCSSRule(selector, rule) {
    if (storedFormHeight <= 0) return;
    var styleElement = document.createElement("style");
    styleElement.type = "text/css";
    document.head.appendChild(styleElement);
    var styleSheet = styleElement.sheet;
    styleSheet.insertRule(selector + "{" + rule + "}", 0);
  }
  
  setupSuccessHeightSync();
  
  window.addEventListener("resize", function () {
    updateSuccessHeight();
  });
  
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  function updateTooltips() {
    var fullNameValid = fullNameInput.value.trim().length > 0;
    var emailNotEmpty = emailInput.value.trim().length > 0;
    var emailValid = isValidEmail(emailInput.value.trim());
    var serviceValid = serviceSelect.value !== "";
    var messageValid = messageInput.value.trim().length > 0;
    
    if (!fullNameValid) {
      fullNameInput.title = "Please enter your full name.";
    } else {
      fullNameInput.removeAttribute("title");
    }
    
    if (!emailNotEmpty) {
      emailInput.title = "Please enter your email address.";
    } else if (!emailValid) {
      emailInput.title = "Please enter a valid email address.";
    } else {
      emailInput.removeAttribute("title");
    }
    
    if (!serviceValid) {
      serviceSelect.title = "Please select a service type.";
    } else {
      serviceSelect.removeAttribute("title");
    }
    
    if (!messageValid) {
      messageInput.title = "Please enter your message.";
    } else {
      messageInput.removeAttribute("title");
    }
  }
  
  function validateForm() {
    var fullNameValid = fullNameInput.value.trim().length > 0;
    var emailNotEmpty = emailInput.value.trim().length > 0;
    var emailValid = isValidEmail(emailInput.value.trim());
    var serviceValid = serviceSelect.value !== "";
    var messageValid = messageInput.value.trim().length > 0;
    
    if (!fullNameValid) {
      fullNameInput.setCustomValidity("Please enter your full name.");
    } else {
      fullNameInput.setCustomValidity("");
    }
    
    if (!emailNotEmpty) {
      emailInput.setCustomValidity("Please enter your email address.");
    } else if (!emailValid) {
      emailInput.setCustomValidity("Please enter a valid email address.");
    } else {
      emailInput.setCustomValidity("");
    }
    
    if (!serviceValid) {
      serviceSelect.setCustomValidity("Please select a service type.");
    } else {
      serviceSelect.setCustomValidity("");
    }
    
    if (!messageValid) {
      messageInput.setCustomValidity("Please enter your message.");
    } else {
      messageInput.setCustomValidity("");
    }
    
    var allValid =
      fullNameValid &&
      emailNotEmpty &&
      emailValid &&
      serviceValid &&
      messageValid;
      
    if (allValid) {
      submitProxy.classList.remove("disable");
    } else {
      submitProxy.classList.add("disable");
    }
    
    updateTooltips();
  }
  
  var form = fullNameInput.form;
  if (form) {
    form.setAttribute("novalidate", "true");
  }
  
  fullNameInput.addEventListener("input", validateForm);
  emailInput.addEventListener("input", validateForm);
  serviceSelect.addEventListener("change", validateForm);
  messageInput.addEventListener("input", validateForm);
  
  [fullNameInput, emailInput, serviceSelect, messageInput].forEach(function (
    element
  ) {
    element.addEventListener("focus", updateTooltips);
    element.addEventListener("blur", updateTooltips);
  });
  
  fullNameInput.addEventListener("invalid", function (e) {
    e.preventDefault();
    fullNameInput.setCustomValidity("Please enter your full name.");
    updateTooltips();
  });
  
  emailInput.addEventListener("invalid", function (e) {
    e.preventDefault();
    if (emailInput.value.trim() === "") {
      emailInput.setCustomValidity("Please enter your email address.");
    } else {
      emailInput.setCustomValidity("Please enter a valid email address.");
    }
    updateTooltips();
  });
  
  serviceSelect.addEventListener("invalid", function (e) {
    e.preventDefault();
    serviceSelect.setCustomValidity("Please select a service type.");
    updateTooltips();
  });
  
  messageInput.addEventListener("invalid", function (e) {
    e.preventDefault();
    messageInput.setCustomValidity("Please enter your message.");
    updateTooltips();
  });
  
  submitProxy.addEventListener("click", function (e) {
    if (submitProxy.classList.contains("disable")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    } else {
      e.preventDefault();
      var textElement = submitProxy.querySelector(".body2-1");
      if (textElement) {
        textElement.textContent = "Please wait...";
      }
      if (submitButton) {
        submitButton.click();
      }
    }
  });
  
  submitProxy.addEventListener("mouseenter", function () {
    if (submitProxy.classList.contains("disable")) {
      var errorMsg = "";
      if (
        emailInput.value.trim() !== "" &&
        !isValidEmail(emailInput.value.trim())
      ) {
        errorMsg = "Please enter a valid email address.";
      } else {
        errorMsg =
          "Please fill out all required fields before sending the message.";
      }
      submitProxy.title = errorMsg;
    } else {
      submitProxy.removeAttribute("title");
    }
  });
  
  submitProxy.addEventListener("mouseleave", function () {
    submitProxy.removeAttribute("title");
  });
  
  validateForm();
  
  var observer = new MutationObserver(function (mutations) {
    updateSuccessHeight();
    var successElement = document.querySelector(
      ".global-form-success.contact"
    );
    if (successElement && isElementVisible(successElement)) {
      reloadLocomotiveScroll();
      scrollToContactSection();
    }
  });
  
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    observer.observe(contactForm, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  }
  
  if (form) {
    form.addEventListener("submit", function () {
      setTimeout(updateSuccessHeight, 10);
      setTimeout(updateSuccessHeight, 100);
      setTimeout(updateSuccessHeight, 1000);
      setTimeout(function () {
        var successElement = document.querySelector(
          ".global-form-success.contact"
        );
        if (successElement && isElementVisible(successElement)) {
          reloadLocomotiveScroll();
          scrollToContactSection();
        }
      }, 1200);
    });
  }
  
  var bodyObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        updateSuccessHeight();
        setTimeout(updateSuccessHeight, 10);
        var successElement = document.querySelector(
          ".global-form-success.contact"
        );
        if (successElement && isElementVisible(successElement)) {
          reloadLocomotiveScroll();
          scrollToContactSection();
        }
      }
    });
  });
  
  bodyObserver.observe(document.body, { attributes: true });
  
  var successObserver = new MutationObserver(function (mutations) {
    var successElement = document.querySelector(
      ".global-form-success.contact"
    );
    if (successElement && isElementVisible(successElement)) {
      updateSuccessHeight();
      reloadLocomotiveScroll();
      scrollToContactSection();
    }
  });
  
  successObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });
}