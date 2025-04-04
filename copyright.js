document.addEventListener("DOMContentLoaded", function () {
  [...document.querySelectorAll("[data-copyright-year]")].forEach(
    (el) => (el.textContent = new Date().getFullYear())
  );
});
