(function () {
  var hub = document.getElementById("microcourse-hub");
  var lessonView = document.getElementById("microcourse-lesson");
  if (!hub && !lessonView) return;

  var dataUrl =
    document.body.dataset.courseData || "/assets/data/courses/intro-robotica.json";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatParagraphs(text) {
    return escapeHtml(text)
      .split(/\n\n+/)
      .map(function (block) {
        return "<p>" + block.replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function padIndex(num) {
    return String(num).padStart(2, "0");
  }

  function renderFigure(image, imageAlt, imageCaption) {
    if (!image) return "";
    return (
      '<figure class="lesson-figure">' +
      '<img src="' +
      escapeHtml(Site.url(image)) +
      '" alt="' +
      escapeHtml(imageAlt || "") +
      '" loading="lazy">' +
      (imageCaption
        ? "<figcaption>" + escapeHtml(imageCaption) + "</figcaption>"
        : "") +
      "</figure>"
    );
  }

  function lessonUrl(lessonId) {
    return Site.url(
      "/pages/cursos/introduccion-robotica/leccion.html?id=" +
        encodeURIComponent(lessonId)
    );
  }

  function getLessonIdFromQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function courseToolbar(course, options) {
    options = options || {};
    var temarioUrl = Site.url("/pages/cursos/introduccion-robotica/index.html");

    if (options.showTemario === false) {
      return "";
    }

    return (
      '<div class="course-toolbar">' +
      '<a class="course-toolbar-link" href="' +
      escapeHtml(temarioUrl) +
      '">← Volver al temario</a>' +
      "</div>"
    );
  }

  function renderHub(course) {
    var lessonsHtml = course.lessons
      .map(function (lesson) {
        return (
          '<a class="lesson-card" href="' +
          escapeHtml(lessonUrl(lesson.id)) +
          '">' +
          '<span class="lesson-num">Lección ' +
          lesson.number +
          "</span>" +
          "<h3>" +
          escapeHtml(lesson.title) +
          "</h3>" +
          '<p class="lesson-meta">' +
          escapeHtml(lesson.duration) +
          "</p>" +
          "<p>" +
          escapeHtml(lesson.goal) +
          "</p>" +
          "</a>"
        );
      })
      .join("");

    var sourcesHtml = (course.sources || [])
      .map(function (source) {
        return (
          "<li><a href=\"" +
          escapeHtml(source.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(source.title) +
          "</a></li>"
        );
      })
      .join("");

    hub.innerHTML =
      courseToolbar(course, { showTemario: false }) +
      '<header class="course-hero">' +
      '<p class="eyebrow">Curso · ' +
      escapeHtml(course.level) +
      "</p>" +
      "<h1>" +
      escapeHtml(course.title) +
      "</h1>" +
      "<p>" +
      escapeHtml(course.summary) +
      "</p>" +
      '<p class="course-meta">' +
      escapeHtml(course.duration) +
      " · Requisitos: " +
      escapeHtml(course.requirements) +
      "</p>" +
      '<p><a class="btn-accent" href="' +
      escapeHtml(lessonUrl(course.lessons[0].id)) +
      '">Empezar lección 1</a></p>' +
      "</header>" +
      '<section class="lesson-grid">' +
      "<h2>Temario</h2>" +
      '<div class="lesson-grid-items">' +
      lessonsHtml +
      "</div>" +
      "</section>" +
      '<section class="course-sources">' +
      "<h2>Fuentes consultadas (inglés)</h2>" +
      "<p>El contenido está redactado en español a partir de estas referencias académicas y de divulgación técnica:</p>" +
      "<ul>" +
      sourcesHtml +
      "</ul>" +
      (course.playlistUrl
        ? '<p class="mt-3"><a class="btn-ghost" href="' +
          escapeHtml(course.playlistUrl) +
          '" target="_blank" rel="noopener noreferrer">Playlist complementaria en YouTube</a></p>'
        : "") +
      "</section>";
  }

  function renderLesson(course) {
    var lessonId = getLessonIdFromQuery() || course.lessons[0].id;
    var index = -1;
    var lesson = null;

    for (var i = 0; i < course.lessons.length; i++) {
      if (course.lessons[i].id === lessonId) {
        index = i;
        lesson = course.lessons[i];
        break;
      }
    }

    if (!lesson) {
      lessonView.innerHTML =
        '<p class="text-danger">No se encontró la lección. <a href="./index.html">Volver al temario</a></p>';
      return;
    }

    var prev = course.lessons[index - 1];
    var next = course.lessons[index + 1];

    var sectionsHtml = lesson.sections
      .map(function (section, sectionIndex) {
        return (
          '<section class="lesson-block">' +
          '<header class="lesson-block-head">' +
          '<span class="lesson-block-index">' +
          padIndex(sectionIndex + 1) +
          "</span>" +
          "<h2>" +
          escapeHtml(section.heading) +
          "</h2>" +
          "</header>" +
          '<div class="lesson-block-body">' +
          renderFigure(section.image, section.imageAlt, section.imageCaption) +
          formatParagraphs(section.body) +
          "</div>" +
          "</section>"
        );
      })
      .join("");

    document.title = lesson.title + " | " + course.title;

    lessonView.innerHTML =
      courseToolbar(course, { showTemario: true }) +
      '<nav class="lesson-breadcrumb">' +
      '<a href="./index.html">' +
      escapeHtml(course.title) +
      "</a> / Lección " +
      lesson.number +
      "</nav>" +
      '<header class="lesson-header">' +
      '<p class="eyebrow">Lección ' +
      lesson.number +
      " de " +
      course.lessons.length +
      "</p>" +
      "<h1>" +
      escapeHtml(lesson.title) +
      "</h1>" +
      '<p class="lesson-meta">' +
      escapeHtml(lesson.duration) +
      "</p>" +
      '<p class="lesson-goal"><strong>Objetivo:</strong> ' +
      escapeHtml(lesson.goal) +
      "</p>" +
      "</header>" +
      '<div class="lesson-body">' +
      sectionsHtml +
      "</div>" +
      '<nav class="lesson-pager">' +
      (prev
        ? '<a class="btn-ghost" href="' +
          escapeHtml(lessonUrl(prev.id)) +
          '">← ' +
          escapeHtml(prev.title) +
          "</a>"
        : "<span></span>") +
      '<a class="btn-ghost" href="./index.html">Temario</a>' +
      (next
        ? '<a class="btn-accent" href="' +
          escapeHtml(lessonUrl(next.id)) +
          '">' +
          escapeHtml(next.title) +
          " →</a>"
        : '<a class="btn-accent" href="./index.html">Finalizar curso</a>') +
      "</nav>";
  }

  fetch(Site.url(dataUrl))
    .then(function (response) {
      if (!response.ok) throw new Error("No se pudo cargar el curso");
      return response.json();
    })
    .then(function (course) {
      if (hub) renderHub(course);
      if (lessonView) renderLesson(course);
    })
    .catch(function (error) {
      var target = hub || lessonView;
      target.innerHTML =
        '<p class="text-danger">No se pudo cargar el contenido del curso.</p>';
      console.error(error);
    });
})();
