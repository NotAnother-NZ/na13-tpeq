(function() {
  const transparent = 'rgba(0, 0, 0, 0)';
  const forceTransparent = el => {
    const bg = window.getComputedStyle(el).backgroundColor;
    if (bg !== transparent && bg !== 'transparent') {
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('background-image', 'none', 'important');
    }
  };

  const monitorElements = () => {
    const elements = document.querySelectorAll('input, textarea, select');
    elements.forEach(el => forceTransparent(el));
  };

  const observer = new MutationObserver(() => {
    // Small timeout to ensure styles have been applied
    setTimeout(monitorElements, 0);
  });

  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    childList: true,
    attributeFilter: ['style', 'class']
  });

  const interval = setInterval(monitorElements, 500);

  document.addEventListener('DOMContentLoaded', monitorElements);
  window.addEventListener('load', monitorElements);
})();