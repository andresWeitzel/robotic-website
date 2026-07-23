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
        mount.innerHTML = Site.rewriteRootPaths(html);

        var modal = mount.querySelector(".modal");
        if (modal && modal.parentElement !== document.body) {
          document.body.appendChild(modal);
        }
      });
  }

  function markActiveNav() {
    var active = document.body.dataset.page;
    if (!active || active === "inicio") return;

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

  function setNavOpen(open) {
    document.body.classList.toggle("nav-open", !!open);
    var toggler = document.querySelector(".navbar.site-nav .navbar-toggler");
    if (toggler) {
      toggler.setAttribute("aria-expanded", open ? "true" : "false");
      toggler.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    }
  }

  function closeNav() {
    var collapse = document.querySelector("#navbarResponsive");
    if (!collapse || !collapse.classList.contains("show")) {
      setNavOpen(false);
      return;
    }
    if (typeof window.jQuery !== "undefined") {
      window.jQuery(collapse).collapse("hide");
    } else {
      collapse.classList.remove("show");
      setNavOpen(false);
    }
  }

  function enhanceMobileNav() {
    var nav = document.querySelector(".navbar.site-nav");
    if (!nav || nav.dataset.navEnhanced === "1") return;
    nav.dataset.navEnhanced = "1";

    var collapse = nav.querySelector("#navbarResponsive");
    if (!collapse) return;

    if (typeof window.jQuery !== "undefined") {
      var $collapse = window.jQuery(collapse);
      $collapse.on("show.bs.collapse", function () {
        setNavOpen(true);
      });
      $collapse.on("hide.bs.collapse", function () {
        setNavOpen(false);
      });
      $collapse.on("hidden.bs.collapse", function () {
        setNavOpen(false);
      });
    }

    nav.addEventListener("click", function (event) {
      var link = event.target.closest(".nav-link");
      if (!link) return;
      if (window.matchMedia("(max-width: 991.98px)").matches) {
        closeNav();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    document.addEventListener("click", function (event) {
      if (!document.body.classList.contains("nav-open")) return;
      if (nav.contains(event.target)) return;
      closeNav();
    });
  }

  function afterNavReady() {
    markActiveNav();
    enhanceMobileNav();
  }

  rewriteExistingNav();

  loadPartial("#site-nav", "/components/navbar.html")
    .then(afterNavReady)
    .catch(function (error) {
      console.error(error);
      afterNavReady();
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
      '<li><a href="' +
      Site.url("/pages/repositorios.html") +
      '">Repositorios</a></li>' +
      "</ul></nav></div>" +
      '<div class="site-footer-bottom"><div class="container site-footer-bottom-inner">' +
      "<p class=\"mb-0\">Diseñado por <strong>Andrés Weitzel</strong></p>" +
      '<p class="mb-0 site-footer-meta">Open Source · 2020–2026</p>' +
      "</div></div></footer>";
  });
})();
