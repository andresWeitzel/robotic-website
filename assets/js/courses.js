(function () {
  const container = document.getElementById("courses-list");
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
      '<div class="summary-chip"><span>Duración</span><strong>' +
      escapeHtml(course.duration || "Flexible") +
      "</strong></div>" +
      '<div class="summary-chip"><span>Lecciones</span><strong>' +
      escapeHtml(String(course.lessonsCount || (overview.syllabus || []).length || "—")) +
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
        '<a class="btn-accent" href="' +
        escapeHtml(Site.url(course.internalPath)) +
        '" data-dismiss="modal">Entrar al curso</a>';
    } else if (course.courseUrl && !course.comingSoon) {
      primaryAction =
        '<a class="btn-accent" href="' +
        escapeHtml(Site.url(course.courseUrl)) +
        '" target="_blank" rel="noopener noreferrer">Ir al curso</a>';
    }

    return (
      '<div class="modal fade" id="' +
      modalId +
      '" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="' +
      labelId +
      '" aria-hidden="true">' +
      '<div class="modal-dialog modal-dialog-centered' +
      (hasOverview ? " modal-lg summary-modal-dialog" : "") +
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
      '<button type="button" class="close" data-dismiss="modal" aria-label="Cerrar">' +
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

  function renderCourseCard(course) {
    var modalId = "modal-" + course.id;
    var imageUrl = Site.url(course.image);
    var comingSoon = Boolean(course.comingSoon);
    var hasInternal = Boolean(course.internalPath);
    var hasExternal = Boolean(course.courseUrl);

    var actionButton;
    if (comingSoon) {
      actionButton =
        '<button type="button" class="btn-ghost" disabled>Próximamente</button>';
    } else if (hasInternal) {
      actionButton =
        '<a class="btn-accent" href="' +
        escapeHtml(Site.url(course.internalPath)) +
        '">Entrar al curso</a>';
    } else if (hasExternal) {
      actionButton =
        '<a class="btn-accent" href="' +
        escapeHtml(Site.url(course.courseUrl)) +
        '" target="_blank" rel="noopener noreferrer">Ir al curso</a>';
    } else {
      actionButton =
        '<button type="button" class="btn-ghost" disabled>Próximamente</button>';
    }

    return (
      '<article class="card mb-4 course-card">' +
      '<div class="row no-gutters">' +
      '<div class="col-md-4 course-media">' +
      '<img src="' +
      escapeHtml(imageUrl) +
      '" alt="' +
      escapeHtml(course.imageAlt) +
      '">' +
      "</div>" +
      '<div class="col-md-8">' +
      '<div class="card-body course-content">' +
      levelBadge(course.level) +
      '<h5 class="card-title mt-2 mb-2">' +
      escapeHtml(course.title) +
      "</h5>" +
      '<p class="card-text">' +
      escapeHtml(course.summary) +
      "</p>" +
      '<p class="card-text mb-0">' +
      "<small>Requisitos: " +
      escapeHtml(course.requirements) +
      "</small>" +
      "</p>" +
      '<div class="course-actions">' +
      '<button type="button" class="btn-ghost" data-toggle="modal" data-target="#' +
      modalId +
      '">Resumen</button>' +
      actionButton +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  fetch(Site.url("/assets/data/courses.json"))
    .then(function (response) {
      if (!response.ok) throw new Error("No se pudieron cargar los cursos");
      return response.json();
    })
    .then(function (courses) {
      container.innerHTML = courses.map(renderCourseCard).join("");

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
