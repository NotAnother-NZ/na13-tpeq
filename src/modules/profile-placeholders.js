// Module for handling profile avatar placeholders
export function initializeProfilePlaceholders() {
    const nodes = document.querySelectorAll("[data-dt-placeholder-profile]");
    
    if (nodes.length > 0) {
      function applyProfilePlaceholders() {
        const updates = [];
        
        nodes.forEach((div) => {
          const name = div.getAttribute("data-dt-placeholder-profile");
          if (!name) return;
          
          const type =
            parseInt(div.getAttribute("data-dt-placeholder-profile-type")) || 2;
          let style = "glass";
          
          switch (type) {
            case 1:
              style = "initials";
              break;
            case 2:
              style = "glass";
              break;
            case 3:
              style = "shapes";
              break;
            case 4:
              style = "identicon";
              break;
            case 5:
              style = "bottts-neutral";
              break;
          }
          
          const seed = encodeURIComponent(name.trim());
          const url = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
          updates.push({ div, url });
        });
        
        for (let i = 0; i < updates.length; i++) {
          const { div, url } = updates[i];
          div.style.backgroundImage = `url("${url}")`;
          div.style.backgroundSize = "cover";
          div.style.backgroundPosition = "center";
          div.style.backgroundRepeat = "no-repeat";
        }
      }
      
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(applyProfilePlaceholders, { timeout: 500 });
      } else {
        setTimeout(applyProfilePlaceholders, 0);
      }
    }
  }