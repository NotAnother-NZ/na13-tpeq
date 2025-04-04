// Simple module for service slider functionality
export function initializeServiceSlider() {
    // Find elements
    const section = document.querySelector("#service-overview-section");
    if (!section) return;
  
    const buttons = document.querySelectorAll(
      "#service-overview-button-wrapper .service-overview-button"
    );
    const sliderDots = document.querySelectorAll(".w-slider-nav .w-slider-dot");
    
    if (!buttons.length || !sliderDots.length) return;
  
    // Set initial active state based on the active dot
    const activeIndex = Array.from(sliderDots).findIndex(dot => 
      dot.classList.contains("w-active")
    );
    
    if (activeIndex >= 0 && buttons[activeIndex]) {
      buttons.forEach(btn => btn.classList.remove("active"));
      buttons[activeIndex].classList.add("active");
    }
  
    // Set up button click handlers
    buttons.forEach((button, index) => {
      button.addEventListener("click", function(e) {
        e.preventDefault();
        if (sliderDots[index]) {
          sliderDots[index].click();
        }
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });
  
    // Set up dot click observers
    const observer = new MutationObserver(() => {
      const newActiveIndex = Array.from(sliderDots).findIndex(dot => 
        dot.classList.contains("w-active")
      );
      
      if (newActiveIndex >= 0 && buttons[newActiveIndex]) {
        buttons.forEach(btn => btn.classList.remove("active"));
        buttons[newActiveIndex].classList.add("active");
      }
    });
    
    // Observe each dot for class changes
    sliderDots.forEach(dot => {
      observer.observe(dot, { 
        attributes: true, 
        attributeFilter: ["class"] 
      });
    });
  }