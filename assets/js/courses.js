(function () {
  var container = document.getElementById("courses-list");
  if (!container) return;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDetails(details) {
    return escapeHtml(details).replace(/\n\n/g, "<br><br>");
  }

  function levelClass(level) {
    if (level === "Inicial") return "is-inicial";
    if (level === "Intermedio") return "is-intermedio";
    if (level === "Avanzado") return "is-avanzado";
    return "is-proximamente";
  }

  function levelBadge(level) {
    if (!level) return "";
    return (
      '<div class="course-level-wrap">' +
      '<span class="badge-level ' +
      levelClass(level) +
      '">' +
      escapeHtml(level) +
      "</span>" +
      "</div>"
    );
  }

  function renderOverviewBody(course) {
    var overview = course.overview;
    if (!overview) {
      return '<div class="summary-plain">' + formatDetails(course.details) + "</div>";
    }

    var highlights = (overview.highlights || [])
      .map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      })
      .join("");

    var syllabus = (overview.syllabus || [])
      .map(function (item, index) {
        return (
          '<li><span class="summary-syl-num">' +
          String(index + 1).padStart(2, "0") +
          "</span>" +
          escapeHtml(item) +
          "</li>"
        );
      })
      .join("");

    return (
      '<div class="summary-layout">' +
      '<p class="summary-lead">' +
      escapeHtml(overview.lead) +
      "</p>" +
      '<div class="summary-meta-row">' +
      '<div class="summary-chip"><span>Nivel</span><strong>' +
      escapeHtml(course.level) +
      "</strong></div>" +
      '<div class="summary-chip"><span>Lecciones</span><strong>' +
      escapeHtml(
        String(course.lessonsCount || (overview.syllabus || []).length || "—")
      ) +
      "</strong></div>" +
      '<div class="summary-chip"><span>Requisitos</span><strong>' +
      escapeHtml(course.requirements || "Ninguno") +
      "</strong></div>" +
      "</div>" +
      '<div class="summary-grid">' +
      '<section class="summary-panel">' +
      "<h6>Qué vas a aprender</h6>" +
      '<ul class="summary-list">' +
      highlights +
      "</ul>" +
      "</section>" +
      '<section class="summary-panel">' +
      "<h6>Temario</h6>" +
      '<ol class="summary-syllabus">' +
      syllabus +
      "</ol>" +
      "</section>" +
      "</div>" +
      (overview.audience
        ? '<p class="summary-note"><strong>Para quién:</strong> ' +
          escapeHtml(overview.audience) +
          "</p>"
        : "") +
      (overview.format
        ? '<p class="summary-note"><strong>Formato:</strong> ' +
          escapeHtml(overview.format) +
          "</p>"
        : "") +
      "</div>"
    );
  }

  function renderModal(course) {
    var modalId = "modal-" + course.id;
    var labelId = modalId + "-label";
    var hasOverview = Boolean(course.overview);
    var primaryAction = "";

    if (course.internalPath) {
      primaryAction =
        '<a class="btn-accent summary-enter-btn" href="' +
        escapeHtml(Site.url(course.internalPath)) +
        '">Entrar al curso</a>';
    } else if (course.courseUrl && !course.comingSoon) {
      primaryAction =
        '<a class="btn-accent summary-enter-btn" href="' +
        escapeHtml(Site.url(course.courseUrl)) +
        '" target="_blank" rel="noopener noreferrer">Ir al curso</a>';
    } else if (course.comingSoon) {
      primaryAction =
        '<button type="button" class="btn-ghost" disabled>Próximamente</button>';
    }

    return (
      '<div class="modal fade summary-modal-root" id="' +
      modalId +
      '" tabindex="-1" aria-labelledby="' +
      labelId +
      '" aria-hidden="true">' +
      '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable' +
      (hasOverview ? " modal-lg summary-modal-dialog" : " summary-modal-dialog") +
      '">' +
      '<div class="modal-content summary-modal">' +
      '<div class="modal-header summary-modal-header">' +
      "<div>" +
      levelBadge(course.level) +
      '<h5 class="modal-title mt-2" id="' +
      labelId +
      '">' +
      escapeHtml(course.title) +
      "</h5>" +
      "</div>" +
      '<button type="button" class="close summary-modal-close" data-dismiss="modal" aria-label="Cerrar">' +
      '<span aria-hidden="true">&times;</span>' +
      "</button>" +
      "</div>" +
      '<div class="modal-body summary-modal-body">' +
      renderOverviewBody(course) +
      "</div>" +
      '<div class="modal-footer summary-modal-footer">' +
      '<button type="button" class="btn-ghost" data-dismiss="modal">Cerrar</button>' +
      primaryAction +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function actionButtons(course, options) {
    options = options || {};
    var modalId = "modal-" + course.id;
    var comingSoon = Boolean(course.comingSoon);
    var hasInternal = Boolean(course.internalPath);
    var hasExternal = Boolean(course.courseUrl);
    var compact = Boolean(options.compact);

    var actionButton;
    if (comingSoon) {
      actionButton =
        '<button type="button" class="btn-ghost" disabled>Próximamente</button>';
    } else if (hasInternal) {
      actionButton =
        '<a class="btn-accent" href="' +
        escapeHtml(Site.url(course.internalPath)) +
        '">Entrar</a>';
    } else if (hasExternal) {
      actionButton =
        '<a class="btn-accent" href="' +
        escapeHtml(Site.url(course.courseUrl)) +
        '" target="_blank" rel="noopener noreferrer">Abrir</a>';
    } else {
      actionButton =
        '<button type="button" class="btn-ghost" disabled>Próximamente</button>';
    }

    return (
      '<div class="course-actions">' +
      '<button type="button" class="btn-ghost" data-toggle="modal" data-target="#' +
      modalId +
      '">Resumen</button>' +
      actionButton +
      "</div>"
    );
  }

  function renderFeaturedCard(course) {
    var formatChip = course.internalPath
      ? "En el sitio"
      : course.formatLabel || (course.courseUrl ? "Playlist" : "");

    return (
      '<article class="course-tile">' +
      '<div class="course-tile-media">' +
      '<img src="' +
      escapeHtml(Site.url(course.image)) +
      '" alt="' +
      escapeHtml(course.imageAlt || course.title) +
      '" loading="lazy">' +
      "</div>" +
      '<div class="course-tile-body">' +
      levelBadge(course.level) +
      "<h3>" +
      escapeHtml(course.title) +
      "</h3>" +
      "<p>" +
      escapeHtml(course.summary) +
      "</p>" +
      '<div class="course-tile-meta">' +
      (formatChip ? "<span>" + escapeHtml(formatChip) + "</span>" : "") +
      (course.lessonsCount
        ? "<span>" + escapeHtml(String(course.lessonsCount)) + " lecciones</span>"
        : "") +
      "</div>" +
      '<p class="course-tile-req">Requisitos: ' +
      escapeHtml(course.requirements || "Ninguno") +
      "</p>" +
      actionButtons(course) +
      "</div>" +
      "</article>"
    );
  }

  function renderMoreCard(course) {
    return (
      '<article class="course-more-item">' +
      '<div class="course-more-media">' +
      '<img src="' +
      escapeHtml(Site.url(course.image)) +
      '" alt="' +
      escapeHtml(course.imageAlt || course.title) +
      '" loading="lazy">' +
      "</div>" +
      '<div class="course-more-body">' +
      levelBadge(course.level) +
      "<h3>" +
      escapeHtml(course.title) +
      "</h3>" +
      "<p>" +
      escapeHtml(course.summary) +
      "</p>" +
      actionButtons(course, { compact: true }) +
      "</div>" +
      "</article>"
    );
  }

  function renderGroup(title, subtitle, courses, options) {
    options = options || {};
    if (!courses.length) return "";

    var featured = Boolean(options.featured);
    var carousel = Boolean(options.carousel) && courses.length > 1;
    var cards = courses
      .map(featured ? renderFeaturedCard : renderMoreCard)
      .join("");

    if (!carousel) {
      return (
        '<section class="course-group">' +
        '<header class="course-group-head">' +
        "<h3>" +
        escapeHtml(title) +
        "</h3>" +
        (subtitle ? "<p>" + escapeHtml(subtitle) + "</p>" : "") +
        "</header>" +
        '<div class="' +
        (featured ? "course-grid" : "course-more-grid") +
        '">' +
        cards +
        "</div>" +
        "</section>"
      );
    }

    return (
      '<section class="course-group course-group--carousel">' +
      '<header class="course-group-head course-group-head--row">' +
      "<div>" +
      "<h3>" +
      escapeHtml(title) +
      "</h3>" +
      (subtitle ? "<p>" + escapeHtml(subtitle) + "</p>" : "") +
      "</div>" +
      '<div class="course-carousel-controls">' +
      '<button type="button" class="course-carousel-btn" data-carousel-dir="-1" aria-label="Ver cursos anteriores">←</button>' +
      '<button type="button" class="course-carousel-btn" data-carousel-dir="1" aria-label="Ver más cursos">→</button>' +
      "</div>" +
      "</header>" +
      '<p class="course-carousel-hint">Deslizá o usá las flechas para ver más cursos</p>' +
      '<div class="course-carousel">' +
      '<div class="course-carousel-track" tabindex="0">' +
      cards +
      "</div>" +
      "</div>" +
      "</section>"
    );
  }

  function bindCarousels(root) {
    root.querySelectorAll(".course-group--carousel").forEach(function (group) {
      var track = group.querySelector(".course-carousel-track");
      if (!track) return;

      group.querySelectorAll("[data-carousel-dir]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var dir = Number(btn.getAttribute("data-carousel-dir") || "1");
          var firstTile = track.querySelector(".course-tile");
          var tileWidth = firstTile ? firstTile.getBoundingClientRect().width : 280;
          var gap = 14;
          var amount = Math.max(tileWidth + gap, track.clientWidth * 0.85);
          track.scrollBy({ left: dir * amount, behavior: "smooth" });
        });
      });
    });
  }

  function bindModalMobileUx() {
    if (typeof window.jQuery === "undefined") return;
    var $ = window.jQuery;

    $(document).on("shown.bs.modal", ".summary-modal-root", function () {
      document.body.classList.add("summary-modal-open");
      var body = this.querySelector(".summary-modal-body");
      if (body) body.scrollTop = 0;
    });

    $(document).on("hidden.bs.modal", ".summary-modal-root", function () {
      if (!$(".summary-modal-root.show").length) {
        document.body.classList.remove("summary-modal-open");
      }
    });
  }

  bindModalMobileUx();

  fetch(Site.url("/assets/data/courses.json"))
    .then(function (response) {
      if (!response.ok) throw new Error("No se pudieron cargar los cursos");
      return response.json();
    })
    .then(function (courses) {
      var inicial = courses.filter(function (course) {
        return course.level === "Inicial";
      });
      var intermedioFeatured = courses.filter(function (course) {
        return course.level === "Intermedio" && Boolean(course.internalPath);
      });
      var avanzadoFeatured = courses.filter(function (course) {
        return course.level === "Avanzado" && Boolean(course.internalPath);
      });
      var more = courses.filter(function (course) {
        if (course.level === "Inicial") return false;
        if (
          intermedioFeatured.some(function (item) {
            return item.id === course.id;
          })
        ) {
          return false;
        }
        if (
          avanzadoFeatured.some(function (item) {
            return item.id === course.id;
          })
        ) {
          return false;
        }
        return true;
      });

      inicial.sort(function (a, b) {
        var order = {
          "intro-robotica": 0,
          "electronica-basica": 1,
          "sensores-actuadores": 2,
          arduino: 3,
        };
        var av = Object.prototype.hasOwnProperty.call(order, a.id) ? order[a.id] : 50;
        var bv = Object.prototype.hasOwnProperty.call(order, b.id) ? order[b.id] : 50;
        return av - bv;
      });
      intermedioFeatured.sort(function (a, b) {
        var order = {
          "robots-moviles": 0,
          "practicas-arduino": 1,
          "vision-computadora": 2,
          wemos: 3,
        };
        var av = Object.prototype.hasOwnProperty.call(order, a.id) ? order[a.id] : 50;
        var bv = Object.prototype.hasOwnProperty.call(order, b.id) ? order[b.id] : 50;
        return av - bv;
      });
      avanzadoFeatured.sort(function (a, b) {
        var order = { ros: 0 };
        var av = Object.prototype.hasOwnProperty.call(order, a.id) ? order[a.id] : 50;
        var bv = Object.prototype.hasOwnProperty.call(order, b.id) ? order[b.id] : 50;
        return av - bv;
      });

      container.innerHTML =
        renderGroup(
          "Nivel inicial",
          "Ruta sugerida: Intro → Electrónica → Sensores → Arduino. Usá las flechas para ver todos.",
          inicial,
          { featured: true, carousel: true }
        ) +
        renderGroup(
          "Nivel intermedio",
          "Prácticas con hardware, robots móviles, visión e IoT. Usá las flechas para recorrerlos.",
          intermedioFeatured,
          { featured: true, carousel: true }
        ) +
        renderGroup(
          "Nivel avanzado",
          "Software de robots a escala: ROS y el camino hacia autonomía.",
          avanzadoFeatured,
          { featured: true, carousel: true }
        ) +
        renderGroup(
          "Más cursos",
          "Cursos en preparación. Deslizá para recorrerlos, igual que los niveles.",
          more,
          { featured: true, carousel: true }
        );

      bindCarousels(container);

      var modalsHost = document.getElementById("course-modals");
      if (!modalsHost) {
        modalsHost = document.createElement("div");
        modalsHost.id = "course-modals";
        document.body.appendChild(modalsHost);
      }
      modalsHost.innerHTML = courses.map(renderModal).join("");
    })
    .catch(function (error) {
      container.innerHTML =
        '<p class="text-center text-danger">No se pudieron cargar los cursos. Revisá que el servidor local esté corriendo.</p>';
      console.error(error);
    });
})();
