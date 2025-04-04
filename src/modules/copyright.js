// Module for handling copyright year display
export function runCopyrightYearScript() {
  [...document.querySelectorAll("[data-copyright-year]")].forEach(
    (el) => (el.textContent = new Date().getFullYear())
  );
}