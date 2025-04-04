document.addEventListener("DOMContentLoaded", () => {
  let e = encodeURIComponent(window.location.origin),
    t = ["🚀", "🌏", "✨", "🇳🇿", "⚫️", "🖤"];
  document.querySelectorAll("[data-not-another]").forEach((a) => {
    let n = a.getAttribute("data-not-another") || "client-footer";
    if (
      ((a.href = `https://na.studio/?utm_source=${e}&utm_medium=referral&utm_campaign=${encodeURIComponent(
        n
      )}&utm_content=na13`),
      (a.target = "_blank"),
      (a.rel = "noopener noreferrer"),
      !a.querySelector(".not-another-emoji"))
    ) {
      let r = document.createElement("span");
      (r.className = "not-another-emoji"),
        (r.style.display = "inline-block"),
        (r.style.opacity = "0"),
        (r.style.transform = "translateY(8px)"),
        (r.style.transition = "opacity 0.2s ease, transform 0.2s ease"),
        a.appendChild(r);
    }
    let l = a.querySelector(".not-another-emoji"),
      o = null,
      s = !1,
      $ = !1,
      i = () => {
        if (s) return;
        s = !0;
        let e = null,
          t = (a) => {
            e || (e = a);
            let n = a - e,
              r = 1;
            n < 140
              ? (r = 1 + 0.3 * (n / 140))
              : n < 280
              ? (r = 1.3 - 0.3 * ((n - 140) / 140))
              : n < 420
              ? (r = 1 + 0.2 * ((n - 280) / 140))
              : n < 700 && (r = 1.2 - 0.2 * ((n - 420) / 280)),
              n < 700
                ? ((l.style.transform = `translateY(0) scale(${r})`),
                  (o = requestAnimationFrame(t)))
                : ((l.style.transform = "translateY(0) scale(1)"),
                  (s = !1),
                  $ || i());
          };
        o = requestAnimationFrame(t);
      };
    a.addEventListener("mouseenter", () => {
      $ = !1;
      let e = t[Math.floor(Math.random() * t.length)];
      (l.textContent = ` ${e}`),
        requestIdleCallback(() => {
          (l.style.opacity = "1"),
            (l.style.transform = "translateY(0) scale(1)"),
            i();
        });
    }),
      a.addEventListener("mouseleave", () => {
        ($ = !0),
          o && cancelAnimationFrame(o),
          (o = null),
          (s = !1),
          requestIdleCallback(() => {
            (l.style.opacity = "0"),
              (l.style.transform = "translateY(8px) scale(1)");
          });
      });
  });
});
