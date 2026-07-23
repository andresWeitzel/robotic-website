(function () {
  var listEl = document.getElementById("repos-list");
  var chipsEl = document.getElementById("repos-chips");
  var levelChipsEl = document.getElementById("repos-level-chips");
  var toolbarEl = document.getElementById("repos-toolbar");
  var countEl = document.getElementById("repos-count");
  var searchEl = document.getElementById("repos-search");
  var statsEl = document.getElementById("repos-stats");
  var jumpEl = document.getElementById("repos-jump");
  if (!listEl) return;

  var TYPE_META = {
    github: { label: "GitHub", cta: "Abrir repo" },
    pdf: { label: "PDF", cta: "Abrir PDF" },
    video: { label: "Video", cta: "Ver playlist" },
    docs: { label: "Docs", cta: "Abrir docs" },
    link: { label: "Link", cta: "Abrir enlace" },
  };

  var TYPE_ORDER = ["github", "pdf", "video", "docs", "link"];
  var LEVEL_ORDER = ["Inicial", "Intermedio", "Avanzado", "Referencia"];
  var GENERAL_ID = "__general__";

  var allItems = [];
  var courseOrder = [];
  var courseIndex = {};
  var activeType = "all";
  var activeLevel = "all";
  var query = "";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function typeMeta(type) {
    return TYPE_META[type] || { label: type, cta: "Abrir" };
  }

  function courseOf(item) {
    var id = item.courseId || "";
    if (id && courseIndex[id]) return courseIndex[id];
    return null;
  }

  function courseKey(item) {
    var course = courseOf(item);
    return course ? course.id : GENERAL_ID;
  }

  function levelOfItem(item) {
    var course = courseOf(item);
    if (course && course.level && course.level !== "Próximamente") {
      return course.level;
    }
    return item.level || "Referencia";
  }

  function matchesQuery(item, q) {
    if (!q) return true;
    var course = courseOf(item);
    var hay = [
      item.title,
      item.summary,
      item.source,
      item.level,
      typeMeta(item.type).label,
      course ? course.title : "referencia general",
      (item.tags || []).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function filteredItems() {
    return allItems.filter(function (item) {
      if (activeType !== "all" && item.type !== activeType) return false;
      if (activeLevel !== "all" && levelOfItem(item) !== activeLevel) {
        return false;
      }
      return matchesQuery(item, query);
    });
  }

  function sortItems(items) {
    return items.slice().sort(function (a, b) {
      var ta = TYPE_ORDER.indexOf(a.type);
      var tb = TYPE_ORDER.indexOf(b.type);
      if (ta !== tb) return ta - tb;
      if (!!b.featured - !!a.featured) return !!b.featured - !!a.featured;
      return String(a.title).localeCompare(String(b.title), "es");
    });
  }

  function buildTree(items) {
    var byCourse = {};
    items.forEach(function (item) {
      var key = courseKey(item);
      if (!byCourse[key]) byCourse[key] = [];
      byCourse[key].push(item);
    });

    var courseBlocks = [];

    courseOrder.forEach(function (course) {
      var list = byCourse[course.id];
      if (!list || !list.length) return;
      courseBlocks.push({
        id: course.id,
        title: course.title,
        level: course.level,
        path: course.internalPath || "",
        summary: course.summary || "",
        items: sortItems(list),
      });
    });

    if (byCourse[GENERAL_ID] && byCourse[GENERAL_ID].length) {
      courseBlocks.push({
        id: GENERAL_ID,
        title: "Referencia general",
        level: "Referencia",
        path: "",
        summary: "Material transversal que no pertenece a un solo curso.",
        items: sortItems(byCourse[GENERAL_ID]),
      });
    }

    // Any courseId not in catalog (orphan)
    Object.keys(byCourse).forEach(function (key) {
      if (key === GENERAL_ID) return;
      if (courseIndex[key]) return;
      courseBlocks.push({
        id: key,
        title: key,
        level: "Referencia",
        path: "",
        summary: "",
        items: sortItems(byCourse[key]),
      });
    });

    var byLevel = {};
    LEVEL_ORDER.forEach(function (level) {
      byLevel[level] = [];
    });

    courseBlocks.forEach(function (block) {
      var level = LEVEL_ORDER.indexOf(block.level) !== -1 ? block.level : "Referencia";
      byLevel[level].push(block);
    });

    return LEVEL_ORDER.map(function (level) {
      return {
        level: level,
        courses: byLevel[level] || [],
      };
    }).filter(function (band) {
      return band.courses.length > 0;
    });
  }

  function renderStats(items) {
    if (!statsEl) return;
    var counts = { github: 0, pdf: 0, video: 0, docs: 0, link: 0 };
    var courseIds = {};
    items.forEach(function (item) {
      if (counts[item.type] != null) counts[item.type] += 1;
      var key = courseKey(item);
      if (key !== GENERAL_ID) courseIds[key] = true;
    });
    var courseCount = Object.keys(courseIds).length;
    statsEl.innerHTML =
      "<span><strong>" +
      courseCount +
      "</strong> cursos</span>" +
      '<span class="repos-stats-dot" aria-hidden="true">·</span>' +
      "<span><strong>" +
      counts.github +
      "</strong> repos</span>" +
      '<span class="repos-stats-dot" aria-hidden="true">·</span>' +
      "<span><strong>" +
      counts.pdf +
      "</strong> PDFs</span>" +
      '<span class="repos-stats-dot" aria-hidden="true">·</span>' +
      "<span><strong>" +
      counts.video +
      "</strong> videos</span>";
  }

  function renderJump(tree) {
    if (!jumpEl) return;
    var links = [];
    tree.forEach(function (band) {
      band.courses.forEach(function (course) {
        links.push({
          id: course.id,
          label: course.title,
          count: course.items.length,
        });
      });
    });

    if (links.length < 2) {
      jumpEl.hidden = true;
      jumpEl.innerHTML = "";
      return;
    }

    jumpEl.hidden = false;
    jumpEl.innerHTML =
      '<p class="repos-jump-label">Ir al curso</p>' +
      '<div class="repos-jump-links">' +
      links
        .map(function (link) {
          return (
            '<a href="#curso-' +
            escapeHtml(link.id) +
            '">' +
            escapeHtml(link.label) +
            " <span>(" +
            link.count +
            ")</span></a>"
          );
        })
        .join("") +
      "</div>";
  }

  function typeMix(items) {
    var seen = {};
    items.forEach(function (item) {
      seen[item.type] = true;
    });
    return TYPE_ORDER.filter(function (type) {
      return seen[type];
    })
      .map(function (type) {
        return escapeHtml(typeMeta(type).label);
      })
      .join(" · ");
  }

  function displayTitle(item) {
    var title = String(item.title || "");
    return title.replace(/^Repo:\s*/i, "");
  }

  function sourceLabel(item, meta) {
    if (!item.source) return "";
    if (String(item.source).toLowerCase() === String(meta.label).toLowerCase()) {
      return "";
    }
    return item.source;
  }

  function renderRow(item) {
    var meta = typeMeta(item.type);
    var source = sourceLabel(item, meta);
    return (
      '<a class="repos-row" href="' +
      escapeHtml(Site.url(item.url)) +
      '" target="_blank" rel="noopener noreferrer">' +
      '<div class="repos-row-copy">' +
      '<div class="repos-row-topline">' +
      '<span class="repos-type repos-type--' +
      escapeHtml(item.type) +
      '">' +
      escapeHtml(meta.label) +
      "</span>" +
      (source
        ? '<span class="repos-source">' + escapeHtml(source) + "</span>"
        : "") +
      "</div>" +
      "<h3>" +
      escapeHtml(displayTitle(item)) +
      "</h3>" +
      "<p>" +
      escapeHtml(item.summary) +
      "</p>" +
      "</div>" +
      '<span class="repos-row-go" aria-hidden="true">→</span>' +
      "</a>"
    );
  }

  function renderCourse(course, openByDefault) {
    var courseLink = course.path
      ? '<a class="repos-course-open" href="' +
        escapeHtml(Site.url(course.path)) +
        '">Abrir curso</a>'
      : "";

    return (
      '<details class="repos-course" id="curso-' +
      escapeHtml(course.id) +
      '"' +
      (openByDefault ? " open" : "") +
      ">" +
      '<summary class="repos-course-head">' +
      '<div class="repos-course-head-main">' +
      '<span class="repos-course-toggle" aria-hidden="true"></span>' +
      "<h3>" +
      escapeHtml(course.title) +
      "</h3>" +
      '<p class="repos-course-mix">' +
      '<span class="repos-course-count">' +
      course.items.length +
      (course.items.length === 1 ? " recurso" : " recursos") +
      "</span>" +
      '<span class="repos-course-types">' +
      typeMix(course.items) +
      "</span>" +
      "</p>" +
      "</div>" +
      "</summary>" +
      (course.summary || courseLink
        ? '<div class="repos-course-meta">' +
          (course.summary
            ? '<p class="repos-course-summary">' +
              escapeHtml(course.summary) +
              "</p>"
            : "") +
          courseLink +
          "</div>"
        : "") +
      '<div class="repos-feed">' +
      course.items.map(renderRow).join("") +
      "</div>" +
      "</details>"
    );
  }

  function renderBand(band, bandIndex) {
    return (
      '<section class="repos-band" id="nivel-' +
      escapeHtml(band.level.toLowerCase()) +
      '">' +
      '<header class="repos-band-head">' +
      '<p class="repos-section-kicker">Nivel</p>' +
      "<h2>" +
      escapeHtml(band.level) +
      "</h2>" +
      '<p class="repos-section-count">' +
      band.courses.length +
      (band.courses.length === 1 ? " curso" : " cursos") +
      "</p>" +
      "</header>" +
      '<div class="repos-course-stack">' +
      band.courses
        .map(function (course, courseIndex) {
          var openByDefault = !(
            window.matchMedia &&
            window.matchMedia("(max-width: 767.98px)").matches
          )
            ? true
            : bandIndex === 0 && courseIndex === 0;
          return renderCourse(course, openByDefault);
        })
        .join("") +
      "</div>" +
      "</section>"
    );
  }

  function render() {
    var items = filteredItems();
    var tree = buildTree(items);

    if (!tree.length) {
      listEl.innerHTML =
        '<p class="repos-empty">No hay material con ese filtro. Probá otro curso, tipo o búsqueda.</p>';
      renderJump([]);
      if (countEl) countEl.textContent = "0 recursos";
      return;
    }

    listEl.innerHTML = tree
      .map(function (band, bandIndex) {
        return renderBand(band, bandIndex);
      })
      .join("");
    renderJump(tree);
    bindJumpOpen();

    if (countEl) {
      var courseTotal = tree.reduce(function (sum, band) {
        return sum + band.courses.length;
      }, 0);
      var bits = [
        items.length + (items.length === 1 ? " recurso" : " recursos"),
        courseTotal + (courseTotal === 1 ? " curso" : " cursos"),
      ];
      if (activeLevel !== "all") bits.push(activeLevel);
      if (activeType !== "all") bits.push(typeMeta(activeType).label);
      if (query) bits.push("“" + query + "”");
      countEl.textContent = bits.join(" · ");
    }
  }

  function bindJumpOpen() {
    if (!jumpEl) return;
    jumpEl.querySelectorAll('a[href^="#curso-"]').forEach(function (link) {
      link.addEventListener("click", function () {
        var id = link.getAttribute("href").slice(1);
        var target = document.getElementById(id);
        if (target && target.tagName === "DETAILS") {
          target.open = true;
        }
      });
    });
  }

  function syncCourseOpenState() {
    var mobile =
      window.matchMedia &&
      window.matchMedia("(max-width: 767.98px)").matches;
    var courses = listEl.querySelectorAll(".repos-course");
    courses.forEach(function (el, index) {
      el.open = mobile ? index === 0 : true;
    });
  }

  if (window.matchMedia) {
    var mobileQuery = window.matchMedia("(max-width: 767.98px)");
    var onViewportChange = function () {
      syncCourseOpenState();
    };
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", onViewportChange);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(onViewportChange);
    }
  }

  function paintChips(container, items, active, attr) {
    if (!container) return;
    container.innerHTML = items
      .map(function (item) {
        var value = item.value;
        var on = value === active ? " is-active" : "";
        return (
          '<button type="button" class="repos-chip' +
          on +
          '" data-' +
          attr +
          '="' +
          escapeHtml(value) +
          '" aria-pressed="' +
          (value === active ? "true" : "false") +
          '">' +
          escapeHtml(item.label) +
          "</button>"
        );
      })
      .join("");
  }

  function setupFilters() {
    var levelItems = [{ value: "all", label: "Todos los niveles" }].concat(
      LEVEL_ORDER.filter(function (level) {
        return allItems.some(function (item) {
          return levelOfItem(item) === level;
        });
      }).map(function (level) {
        return { value: level, label: level };
      })
    );

    var typeItems = [{ value: "all", label: "Todos los tipos" }].concat(
      TYPE_ORDER.filter(function (type) {
        return allItems.some(function (item) {
          return item.type === type;
        });
      }).map(function (type) {
        return { value: type, label: typeMeta(type).label };
      })
    );

    paintChips(levelChipsEl, levelItems, activeLevel, "level");
    paintChips(chipsEl, typeItems, activeType, "type");
    if (toolbarEl) toolbarEl.hidden = false;

    if (levelChipsEl) {
      levelChipsEl.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-level]");
        if (!btn) return;
        activeLevel = btn.getAttribute("data-level") || "all";
        paintChips(levelChipsEl, levelItems, activeLevel, "level");
        render();
      });
    }

    if (chipsEl) {
      chipsEl.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-type]");
        if (!btn) return;
        activeType = btn.getAttribute("data-type") || "all";
        paintChips(chipsEl, typeItems, activeType, "type");
        render();
      });
    }
  }

  if (searchEl) {
    var searchTimer = null;
    searchEl.addEventListener("input", function () {
      var value = searchEl.value.trim().toLowerCase();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        query = value;
        render();
      }, 120);
    });
  }

  Promise.all([
    fetch(Site.url("/assets/data/resources.json")).then(function (r) {
      if (!r.ok) throw new Error("resources");
      return r.json();
    }),
    fetch(Site.url("/assets/data/courses.json"))
      .then(function (r) {
        return r.ok ? r.json() : [];
      })
      .catch(function () {
        return [];
      }),
  ])
    .then(function (results) {
      allItems = results[0] || [];
      courseOrder = (results[1] || []).filter(function (course) {
        return course.level !== "Próximamente";
      });
      courseOrder.forEach(function (course) {
        courseIndex[course.id] = course;
      });
      renderStats(allItems);
      setupFilters();
      render();
    })
    .catch(function (error) {
      listEl.innerHTML =
        '<p class="repos-empty is-error">No se pudo cargar el material. Revisá el servidor local.</p>';
      console.error(error);
    });
})();
