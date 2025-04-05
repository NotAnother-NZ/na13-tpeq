// not-another.js - Not Another script
window.App = window.App || {};
window.App.NotAnother = {
  initialize: function () {
    let origin = encodeURIComponent(window.location.origin);
    let emojis = ["🚀", "🌏", "✨", "🇳🇿", "⚫️", "🖤"];
    document.querySelectorAll("[data-not-another]").forEach((link) => {
      let campaign = link.getAttribute("data-not-another") || "client-footer";
      if (
        link.href !==
        `https://na.studio/?utm_source=${origin}&utm_medium=referral&utm_campaign=${encodeURIComponent(
          campaign
        )}&utm_content=na13`
      ) {
        link.href = `https://na.studio/?utm_source=${origin}&utm_medium=referral&utm_campaign=${encodeURIComponent(
          campaign
        )}&utm_content=na13`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      if (!link.querySelector(".not-another-emoji")) {
        let emojiSpan = document.createElement("span");
        emojiSpan.className = "not-another-emoji";
        emojiSpan.style.display = "inline-block";
        emojiSpan.style.opacity = "0";
        emojiSpan.style.transform = "translateY(8px)";
        emojiSpan.style.transition = "opacity 0.2s ease, transform 0.2s ease";
        link.appendChild(emojiSpan);
      }
      let emojiSpan = link.querySelector(".not-another-emoji");
      let animationFrame = null;
      let isAnimating = false;
      let hasLeft = false;
      const animateEmoji = () => {
        if (isAnimating) return;
        isAnimating = true;
        let startTime = null;
        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          let elapsed = timestamp - startTime;
          let scale = 1;
          if (elapsed < 140) {
            scale = 1 + 0.3 * (elapsed / 140);
          } else if (elapsed < 280) {
            scale = 1.3 - 0.3 * ((elapsed - 140) / 140);
          } else if (elapsed < 420) {
            scale = 1 + 0.2 * ((elapsed - 280) / 140);
          } else if (elapsed < 700) {
            scale = 1.2 - 0.2 * ((elapsed - 420) / 280);
          }
          if (elapsed < 700) {
            emojiSpan.style.transform = `translateY(0) scale(${scale})`;
            animationFrame = requestAnimationFrame(animate);
          } else {
            emojiSpan.style.transform = "translateY(0) scale(1)";
            isAnimating = false;
            if (!hasLeft) animateEmoji();
          }
        };
        animationFrame = requestAnimationFrame(animate);
      };
      link.addEventListener("mouseenter", () => {
        hasLeft = false;
        let randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        emojiSpan.textContent = ` ${randomEmoji}`;
        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(() => {
            emojiSpan.style.opacity = "1";
            emojiSpan.style.transform = "translateY(0) scale(1)";
            animateEmoji();
          });
        } else {
          setTimeout(() => {
            emojiSpan.style.opacity = "1";
            emojiSpan.style.transform = "translateY(0) scale(1)";
            animateEmoji();
          }, 0);
        }
      });
      link.addEventListener("mouseleave", () => {
        hasLeft = true;
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        isAnimating = false;
        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(() => {
            emojiSpan.style.opacity = "0";
            emojiSpan.style.transform = "translateY(8px) scale(1)";
          });
        } else {
          setTimeout(() => {
            emojiSpan.style.opacity = "0";
            emojiSpan.style.transform = "translateY(8px) scale(1)";
          }, 0);
        }
      });
    });
  },
};
