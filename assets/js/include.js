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
        mount.outerHTML = Site.rewriteRootPaths(html);
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

  Promise.all([
    loadPartial("#site-nav", "/components/navbar.html"),
    loadPartial("#site-footer", "/components/footer.html"),
  ])
    .then(markActiveNav)
    .catch(function (error) {
      console.error(error);
      markActiveNav();
    });
})();
