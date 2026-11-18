/* ==========================================================================
   Ulster Carpets — master navigation loader.
   Fetches /partials/nav.html once and injects it into #site-header on every
   page, then wires up the overlay menu, expandable groups and search.
   Edit the markup in /partials/nav.html and the styles in /css/site-nav.css.
   ========================================================================== */
(function () {
  "use strict";

  var mount = document.getElementById("site-header");
  if (!mount) return;

  fetch("/partials/nav.html", { credentials: "same-origin" })
    .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
    .then(function (html) {
      mount.innerHTML = html;
      init(mount);
      // reveal after a frame so styles are applied first (no flash)
      requestAnimationFrame(function () { mount.classList.add("snav-ready"); });
    })
    .catch(function (err) {
      // Fail safe: at least give people a way home.
      mount.innerHTML =
        '<div style="background:#17120d;padding:16px 28px">' +
        '<a href="/" style="color:#f3efe8;font:700 18px/1 Georgia,serif;text-decoration:none">Ulster Carpets</a></div>';
      if (window.console) console.warn("site-nav: could not load /partials/nav.html —", err);
    });

  function init(root) {
    var snav = root.querySelector(".snav");
    var overlay = root.querySelector(".snav__overlay");
    var menuToggle = root.querySelector(".snav__menu-toggle");
    var searchToggle = root.querySelector(".snav__search-toggle");
    if (!snav || !overlay) return;

    buildOverlayTop(root, overlay);

    /* ---- Overlay open / close ---- */
    function openMenu() {
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("snav-locked");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
      var first = overlay.querySelector(".snav__group-title");
      if (first) first.focus({ preventScroll: true });
    }
    function closeMenu() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("snav-locked");
      if (menuToggle) { menuToggle.setAttribute("aria-expanded", "false"); menuToggle.focus({ preventScroll: true }); }
    }
    if (menuToggle) menuToggle.addEventListener("click", openMenu);

    root.addEventListener("click", function (e) {
      if (e.target.closest(".snav__close")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) closeMenu();
    });

    /* ---- Expandable groups ---- */
    root.querySelectorAll(".snav__group-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = btn.closest(".snav__group").querySelector(".snav__panel");
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        if (panel) panel.classList.toggle("is-open", !open);
      });
    });

    /* Desktop mega-menus open on hover / focus-within (pure CSS); nothing to wire here. */

    /* ---- Search ---- */
    function toggleSearch() {
      var on = snav.classList.toggle("is-searching");
      if (searchToggle) searchToggle.setAttribute("aria-expanded", String(on));
      if (on) {
        var input = snav.querySelector(".snav__search-input");
        if (input) input.focus();
      }
    }
    root.addEventListener("click", function (e) {
      if (e.target.closest(".snav__search-toggle")) { e.preventDefault(); toggleSearch(); }
    });
    var form = snav.querySelector(".snav__search");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = (form.querySelector(".snav__search-input") || {}).value || "";
        q = q.trim();
        if (!q) return;
        var url = "https://www.google.com/search?q=" +
          encodeURIComponent("site:ulstercarpets.com " + q);
        window.open(url, "_blank", "noopener");
      });
    }
  }

  /* Build the fixed top row shown inside the open overlay (logo + search + close). */
  function buildOverlayTop(root, overlay) {
    var util = root.querySelector(".snav__utility");
    var logo = root.querySelector(".snav__bar .snav__logo");
    var top = document.createElement("div");
    top.className = "snav__overlay-top";
    top.innerHTML =
      (util ? util.outerHTML : "") +
      '<div class="snav__bar"><div class="snav__inner">' +
        (logo ? logo.outerHTML : '<a class="snav__logo" href="/"></a>') +
        '<div class="snav__actions">' +
          '<button class="snav__close snav__icon" type="button" aria-label="Close menu">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"></line><line x1="19" y1="5" x2="5" y2="19"></line></svg>' +
          '</button>' +
        '</div>' +
      '</div></div>';
    overlay.insertBefore(top, overlay.firstChild);
  }
})();
