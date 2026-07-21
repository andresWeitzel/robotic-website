(function () {
  function loadPartial(selector, path) {
    var mount = document.querySelector(selector);
    if (!mount) return Promise.resolve();

    return fetch(Site.url(path))
      .then(function (response) {
        if (!response.ok) throw new Error("No se pudo cargar " + path);
        return response.text();
      })
      .then(function (html) {
        // Keep the mount node; inject HTML inside so parallel loads stay stable.
        mount.innerHTML = Site.rewriteRootPaths(html);

        // Bootstrap modals work more reliably at document.body level.
        var modal = mount.querySelector(".modal");
        if (modal && modal.parentElement !== document.body) {
          document.body.appendChild(modal);
        }
      });
  }

  function markActiveNav() {
    var active = document.body.dataset.page;
    if (!active) return;

    document.querySelectorAll("[data-nav]").forEach(function (link) {
      var item = link.closest(".nav-item");
      if (!item) return;

      if (link.getAttribute("data-nav") === active) {
        item.classList.add("active");
        if (!link.querySelector(".sr-only")) {
          link.insertAdjacentHTML(
            "beforeend",
            ' <span class="sr-only">(current)</span>'
          );
        }
      } else {
        item.classList.remove("active");
      }
    });
  }

  function rewriteExistingNav() {
    var nav = document.querySelector("#site-nav nav, nav.site-nav");
    if (!nav) return;
    nav.outerHTML = Site.rewriteRootPaths(nav.outerHTML);
  }

  // If the page already has an inline navbar fallback, fix its paths first.
  rewriteExistingNav();

  // Load independently so one failure does not block the other.
  loadPartial("#site-nav", "/components/navbar.html")
    .then(markActiveNav)
    .catch(function (error) {
      console.error(error);
      markActiveNav();
    });

  loadPartial("#site-footer", "/components/footer.html").catch(function (error) {
    console.error(error);
    var mount = document.querySelector("#site-footer");
    if (!mount || mount.innerHTML.trim()) return;
    mount.innerHTML =
      '<footer class="site-footer"><div class="container site-footer-main">' +
      '<div class="site-footer-brand">' +
      '<a class="site-footer-logo" href="' +
      Site.url("/index.html") +
      '"><span>Robótica</span></a>' +
      '<p class="site-footer-copy">Cursos libres y material práctico.</p></div>' +
      '<nav class="site-footer-col"><p class="site-footer-label">Explorar</p>' +
      '<ul class="site-footer-nav">' +
      '<li><a href="' +
      Site.url("/index.html#cursos") +
      '">Cursos</a></li>' +
      '<li><a href="' +
      Site.url("/pages/blog.html") +
      '">Blog</a></li>' +
      "</ul></nav></div>" +
      '<div class="site-footer-bottom"><div class="container site-footer-bottom-inner">' +
      "<p class=\"mb-0\">Diseñado por <strong>Andrés Weitzel</strong></p>" +
      '<p class="mb-0 site-footer-meta">Open Source · 2020–2026</p>' +
      "</div></div></footer>";
  });
})();
