(function () {
  var hub = document.getElementById("microcourse-hub");
  var lessonView = document.getElementById("microcourse-lesson");
  if (!hub && !lessonView) return;

  var dataUrl =
    document.body.dataset.courseData || "/assets/data/courses/intro-robotica.json";
  var courseBase =
    document.body.dataset.courseBase ||
    "/pages/cursos/introduccion-robotica";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function checklistStorageKey(courseId, lessonId, sectionIndex) {
    return "course-check:" + courseId + ":" + lessonId + ":" + sectionIndex;
  }

  function loadChecklistState(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function saveChecklistState(key, state) {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      /* ignore quota / private mode */
    }
  }

  function isChecklistLine(line) {
    return /^[☐☑✓]\s*/.test(line.trim());
  }

  function checklistItemText(line) {
    return line.trim().replace(/^[☐☑✓]\s*/, "");
  }

  function renderChecklist(items, storageKey, saved) {
    var checkedCount = 0;
    var listHtml = items
      .map(function (item, index) {
        var id = storageKey + "-" + index;
        var checked = Boolean(saved[String(index)]);
        if (checked) checkedCount += 1;
        return (
          '<li class="lesson-check-item' +
          (checked ? " is-checked" : "") +
          '">' +
          '<label class="lesson-check-label" for="' +
          escapeHtml(id) +
          '">' +
          '<input class="lesson-check-input" type="checkbox" id="' +
          escapeHtml(id) +
          '" data-check-key="' +
          escapeHtml(storageKey) +
          '" data-check-index="' +
          index +
          '"' +
          (checked ? " checked" : "") +
          ">" +
          '<span class="lesson-check-box" aria-hidden="true"></span>' +
          '<span class="lesson-check-text">' +
          escapeHtml(item) +
          "</span>" +
          "</label>" +
          "</li>"
        );
      })
      .join("");

    return (
      '<div class="lesson-checklist' +
      (checkedCount === items.length && items.length > 0 ? " is-complete" : "") +
      '" data-check-group="' +
      escapeHtml(storageKey) +
      '" data-check-total="' +
      items.length +
      '">' +
      '<div class="lesson-checklist-progress">' +
      '<span class="lesson-checklist-count">' +
      checkedCount +
      " / " +
      items.length +
      "</span>" +
      '<div class="lesson-checklist-bar" aria-hidden="true">' +
      '<span class="lesson-checklist-bar-fill" style="width:' +
      Math.round((checkedCount / items.length) * 100) +
      '%"></span>' +
      "</div>" +
      "</div>" +
      '<ul class="lesson-checklist-list">' +
      listHtml +
      "</ul>" +
      "</div>"
    );
  }

  function formatSectionBody(text, courseId, lessonId, sectionIndex) {
    var lines = String(text).split("\n");
    var html = [];
    var paragraph = [];
    var checklist = [];
    var storageKey = checklistStorageKey(courseId, lessonId, sectionIndex);
    var saved = loadChecklistState(storageKey);

    function flushParagraph() {
      if (!paragraph.length) return;
      var block = paragraph.join("\n").trim();
      paragraph = [];
      if (!block) return;
      html.push(
        "<p>" +
          escapeHtml(block).replace(/\n/g, "<br>") +
          "</p>"
      );
    }

    function flushChecklist() {
      if (!checklist.length) return;
      html.push(renderChecklist(checklist, storageKey, saved));
      checklist = [];
    }

    lines.forEach(function (line) {
      if (isChecklistLine(line)) {
        flushParagraph();
        checklist.push(checklistItemText(line));
        return;
      }

      if (checklist.length && line.trim() === "") {
        return;
      }

      flushChecklist();

      if (line.trim() === "") {
        flushParagraph();
        return;
      }

      paragraph.push(line);
    });

    flushChecklist();
    flushParagraph();
    return html.join("");
  }

  function bindChecklists(root) {
    if (!root) return;
    root.querySelectorAll(".lesson-check-input").forEach(function (input) {
      input.addEventListener("change", function () {
        var key = input.getAttribute("data-check-key");
        var index = input.getAttribute("data-check-index");
        var state = loadChecklistState(key);
        state[index] = input.checked;
        saveChecklistState(key, state);

        var item = input.closest(".lesson-check-item");
        if (item) item.classList.toggle("is-checked", input.checked);

        var group = root.querySelector(
          '.lesson-checklist[data-check-group="' + key + '"]'
        );
        if (!group) return;

        var total = Number(group.getAttribute("data-check-total") || 0);
        var checked = group.querySelectorAll(
          ".lesson-check-input:checked"
        ).length;
        var countEl = group.querySelector(".lesson-checklist-count");
        var fillEl = group.querySelector(".lesson-checklist-bar-fill");
        if (countEl) countEl.textContent = checked + " / " + total;
        if (fillEl) {
          fillEl.style.width =
            total > 0 ? Math.round((checked / total) * 100) + "%" : "0%";
        }
        group.classList.toggle("is-complete", checked === total && total > 0);
      });
    });
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

  function renderCodeBlock(code) {
    if (!code || !code.content) return "";
    var title = code.title || "Sketch para Arduino IDE";
    var language = code.language || "cpp";
    var filename = code.filename || "sketch.ino";
    var tip =
      code.tip ||
      "Copiá el código, pegalo en Arduino IDE, elegí placa/puerto y subilo.";

    return (
      '<div class="lesson-code">' +
      '<div class="lesson-code-bar">' +
      "<div>" +
      '<p class="lesson-code-title">' +
      escapeHtml(title) +
      "</p>" +
      '<p class="lesson-code-file">' +
      escapeHtml(filename) +
      " · " +
      escapeHtml(language) +
      "</p>" +
      "</div>" +
      '<button type="button" class="lesson-code-copy" data-code-copy>Copiar</button>' +
      "</div>" +
      '<pre class="lesson-code-pre"><code>' +
      escapeHtml(code.content) +
      "</code></pre>" +
      '<p class="lesson-code-tip">' +
      escapeHtml(tip) +
      "</p>" +
      "</div>"
    );
  }

  function bindCodeCopy(root) {
    if (!root) return;
    root.querySelectorAll("[data-code-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var block = btn.closest(".lesson-code");
        var codeEl = block ? block.querySelector("code") : null;
        if (!codeEl) return;
        var text = codeEl.textContent || "";
        var done = function () {
          var prev = btn.textContent;
          btn.textContent = "Copiado";
          btn.classList.add("is-copied");
          setTimeout(function () {
            btn.textContent = prev;
            btn.classList.remove("is-copied");
          }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {
            window.prompt("Copiá el código:", text);
          });
        } else {
          window.prompt("Copiá el código:", text);
        }
      });
    });
  }

  function lessonUrl(lessonId) {
    return Site.url(
      courseBase + "/leccion.html?id=" + encodeURIComponent(lessonId)
    );
  }

  function temarioUrl() {
    return Site.url(courseBase + "/index.html");
  }

  function getLessonIdFromQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function coursesSectionUrl() {
    return Site.url("/index.html#cursos");
  }

  function courseToolbar(options) {
    options = options || {};
    var showTemario = options.showTemario !== false;
    var links = [];

    links.push(
      '<a class="course-toolbar-link" href="' +
        escapeHtml(coursesSectionUrl()) +
        '">← Todos los cursos</a>'
    );

    if (showTemario) {
      links.push(
        '<a class="course-toolbar-link course-toolbar-link--secondary" href="' +
          escapeHtml(temarioUrl()) +
          '">Temario</a>'
      );
    }

    return (
      '<div class="course-toolbar" role="navigation" aria-label="Navegación del curso">' +
      '<div class="course-toolbar-links">' +
      links.join('<span class="course-toolbar-sep" aria-hidden="true">/</span>') +
      "</div>" +
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
          "<p>" +
          escapeHtml(lesson.goal) +
          "</p>" +
          '<span class="lesson-card-cta">Abrir lección →</span>' +
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

    var heroMedia = course.image
      ? '<div class="course-hero-media">' +
        '<img src="' +
        escapeHtml(Site.url(course.image)) +
        '" alt="' +
        escapeHtml(course.imageAlt || course.title) +
        '" loading="lazy">' +
        "</div>"
      : "";

    var outcomes = course.outcomes || [];
    var outcomesHtml = outcomes.length
      ? '<section class="course-outcomes">' +
        "<h2>Qué vas a llevarte</h2>" +
        '<ul class="course-outcomes-list">' +
        outcomes
          .map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
          })
          .join("") +
        "</ul>" +
        "</section>"
      : "";

    hub.innerHTML =
      courseToolbar({ showTemario: false }) +
      '<header class="course-hero">' +
      heroMedia +
      '<div class="course-hero-copy">' +
      '<p class="eyebrow">Curso · ' +
      escapeHtml(course.level) +
      "</p>" +
      "<h1>" +
      escapeHtml(course.title) +
      "</h1>" +
      "<p>" +
      escapeHtml(course.summary) +
      "</p>" +
      '<div class="course-hero-meta">' +
      '<span class="course-pill">' +
      course.lessons.length +
      " lecciones</span>" +
      '<span class="course-pill">Requisitos: ' +
      escapeHtml(course.requirements) +
      "</span>" +
      "</div>" +
      '<p class="course-hero-actions"><a class="btn-accent" href="' +
      escapeHtml(lessonUrl(course.lessons[0].id)) +
      '">Empezar lección 1</a></p>' +
      "</div>" +
      "</header>" +
      outcomesHtml +
      '<section class="lesson-grid">' +
      "<h2>Temario</h2>" +
      '<div class="lesson-grid-items">' +
      lessonsHtml +
      "</div>" +
      "</section>" +
      '<section class="course-sources">' +
      "<h2>Fuentes y referencias</h2>" +
      "<p>Contenido redactado en español a partir de material técnico y académico:</p>" +
      "<ul>" +
      sourcesHtml +
      "</ul>" +
      (course.playlistUrl
        ? '<p class="mt-3"><a class="btn-ghost" href="' +
          escapeHtml(course.playlistUrl) +
          '" target="_blank" rel="noopener noreferrer">Material complementario</a></p>'
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
          formatSectionBody(
            section.body,
            course.id || "course",
            lesson.id,
            sectionIndex
          ) +
          renderCodeBlock(section.code) +
          "</div>" +
          "</section>"
        );
      })
      .join("");

    document.title = lesson.title + " | " + course.title;

    lessonView.innerHTML =
      courseToolbar({ showTemario: true }) +
      '<nav class="lesson-breadcrumb" aria-label="Ruta">' +
      '<a href="' +
      escapeHtml(coursesSectionUrl()) +
      '">Cursos</a>' +
      '<span class="lesson-breadcrumb-sep" aria-hidden="true">/</span>' +
      '<a href="' +
      escapeHtml(temarioUrl()) +
      '">' +
      escapeHtml(course.title) +
      "</a>" +
      '<span class="lesson-breadcrumb-sep" aria-hidden="true">/</span>' +
      "<span>Lección " +
      lesson.number +
      "</span>" +
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
      '<a class="btn-ghost" href="' +
      escapeHtml(temarioUrl()) +
      '">Temario</a>' +
      (next
        ? '<a class="btn-accent" href="' +
          escapeHtml(lessonUrl(next.id)) +
          '">' +
          escapeHtml(next.title) +
          " →</a>"
        : '<a class="btn-accent" href="' +
          escapeHtml(temarioUrl()) +
          '">Finalizar curso</a>') +
      "</nav>";

    bindChecklists(lessonView);
    bindCodeCopy(lessonView);
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
