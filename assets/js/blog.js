(function () {
  var listEl = document.getElementById("blog-list");
  var featuredEl = document.getElementById("blog-featured");
  var chipsEl = document.getElementById("blog-chips");
  var toolbarEl = document.getElementById("blog-toolbar");
  var countEl = document.getElementById("blog-count");
  if (!listEl) return;

  var allPosts = [];
  var courseIndex = {};
  var activeTag = "all";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function postHref(post) {
    return Site.url("/pages/blog/nota.html?id=" + encodeURIComponent(post.id));
  }

  function courseLabel(id) {
    return courseIndex[id] && courseIndex[id].title
      ? courseIndex[id].title
      : id;
  }

  function courseHref(id) {
    if (courseIndex[id] && courseIndex[id].internalPath) {
      return Site.url(courseIndex[id].internalPath);
    }
    return Site.url("/index.html#cursos");
  }

  function formatDate(iso) {
    if (!iso) return "";
    var parts = String(iso).split("-");
    if (parts.length !== 3) return escapeHtml(iso);
    var months = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];
    var month = months[Number(parts[1]) - 1] || parts[1];
    return parts[2].replace(/^0/, "") + " " + month + " " + parts[0];
  }

  function uniqueTags(posts) {
    var map = {};
    posts.forEach(function (post) {
      (post.tags || []).forEach(function (tag) {
        map[tag] = true;
      });
    });
    return Object.keys(map).sort();
  }

  function relatedLine(post) {
    var ids = post.relatedCourseIds || [];
    if (!ids.length) return "";
    var links = ids
      .slice(0, 2)
      .map(function (id) {
        return (
          '<a href="' +
          escapeHtml(courseHref(id)) +
          '">' +
          escapeHtml(courseLabel(id)) +
          "</a>"
        );
      })
      .join('<span class="blog-dot">·</span>');
    return (
      '<p class="blog-course-line"><span>Curso</span> ' + links + "</p>"
    );
  }

  function tagLine(tags) {
    if (!tags || !tags.length) return "";
    return (
      '<p class="blog-meta">' +
      tags
        .map(function (tag) {
          return escapeHtml(tag);
        })
        .join(" · ") +
      "</p>"
    );
  }

  function metaLine(post) {
    var bits = [];
    if (post.publishedAt) bits.push(formatDate(post.publishedAt));
    if (post.readMinutes) bits.push(post.readMinutes + " min");
    if (!bits.length) return "";
    return '<p class="blog-read-meta">' + bits.join(" · ") + "</p>";
  }

  function actions(post, featured) {
    var cls = featured ? "blog-actions blog-actions--featured" : "blog-actions";
    return (
      '<div class="' +
      cls +
      '">' +
      '<a class="btn-accent" href="' +
      escapeHtml(postHref(post)) +
      '">Leer nota</a>' +
      "</div>"
    );
  }

  function renderFeatured(post) {
    return (
      '<article class="blog-feature">' +
      '<a class="blog-feature-media" href="' +
      escapeHtml(postHref(post)) +
      '">' +
      '<img src="' +
      escapeHtml(Site.url(post.image)) +
      '" alt="' +
      escapeHtml(post.imageAlt || post.title) +
      '" loading="eager">' +
      "</a>" +
      '<div class="blog-feature-copy">' +
      '<p class="blog-kicker">Destacado</p>' +
      tagLine(post.tags) +
      '<h2><a class="blog-title-link" href="' +
      escapeHtml(postHref(post)) +
      '">' +
      escapeHtml(post.title) +
      "</a></h2>" +
      metaLine(post) +
      '<p class="blog-excerpt">' +
      escapeHtml(post.summary) +
      "</p>" +
      relatedLine(post) +
      actions(post, true) +
      "</div>" +
      "</article>"
    );
  }

  function renderRow(post) {
    return (
      '<article class="blog-row">' +
      '<a class="blog-row-media" href="' +
      escapeHtml(postHref(post)) +
      '" aria-label="Leer nota: ' +
      escapeHtml(post.title) +
      '">' +
      '<img src="' +
      escapeHtml(Site.url(post.image)) +
      '" alt="' +
      escapeHtml(post.imageAlt || post.title) +
      '" loading="lazy">' +
      "</a>" +
      '<div class="blog-row-copy">' +
      tagLine(post.tags) +
      '<h3><a class="blog-title-link" href="' +
      escapeHtml(postHref(post)) +
      '">' +
      escapeHtml(post.title) +
      "</a></h3>" +
      metaLine(post) +
      "<p>" +
      escapeHtml(post.summary) +
      "</p>" +
      relatedLine(post) +
      actions(post, false) +
      "</div>" +
      "</article>"
    );
  }

  function filteredPosts() {
    if (activeTag === "all") return allPosts.slice();
    return allPosts.filter(function (post) {
      return (post.tags || []).indexOf(activeTag) !== -1;
    });
  }

  function render() {
    var posts = filteredPosts();
    if (!posts.length) {
      if (featuredEl) featuredEl.innerHTML = "";
      listEl.innerHTML =
        '<p class="blog-empty">No hay notas en este tema. Probá otro filtro.</p>';
      if (countEl) countEl.textContent = "0 notas";
      return;
    }

    var featured = posts[0];
    var rest = posts.slice(1);

    if (featuredEl) {
      featuredEl.innerHTML = renderFeatured(featured);
    }

    listEl.innerHTML = rest.length
      ? '<div class="blog-feed">' + rest.map(renderRow).join("") + "</div>"
      : "";

    if (countEl) {
      countEl.textContent =
        posts.length +
        (posts.length === 1 ? " nota" : " notas") +
        (activeTag === "all" ? "" : " · " + activeTag);
    }
  }

  function setupChips(posts) {
    if (!chipsEl || !toolbarEl) return;
    var tags = uniqueTags(posts);
    var items = ["all"].concat(tags);

    chipsEl.innerHTML = items
      .map(function (tag) {
        var label = tag === "all" ? "Todos" : tag;
        var active = tag === activeTag ? " is-active" : "";
        return (
          '<button type="button" class="blog-chip' +
          active +
          '" data-tag="' +
          escapeHtml(tag) +
          '" role="tab" aria-selected="' +
          (tag === activeTag ? "true" : "false") +
          '">' +
          escapeHtml(label) +
          "</button>"
        );
      })
      .join("");

    toolbarEl.hidden = false;

    chipsEl.addEventListener("click", function (event) {
      var btn = event.target.closest(".blog-chip");
      if (!btn) return;
      activeTag = btn.getAttribute("data-tag") || "all";
      chipsEl.querySelectorAll(".blog-chip").forEach(function (chip) {
        var on = chip.getAttribute("data-tag") === activeTag;
        chip.classList.toggle("is-active", on);
        chip.setAttribute("aria-selected", on ? "true" : "false");
      });
      render();
    });
  }

  Promise.all([
    fetch(Site.url("/assets/data/blog.json")).then(function (r) {
      if (!r.ok) throw new Error("blog");
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
      allPosts = results[0] || [];
      (results[1] || []).forEach(function (course) {
        courseIndex[course.id] = course;
      });

      setupChips(allPosts);
      render();
    })
    .catch(function (error) {
      listEl.innerHTML =
        '<p class="blog-empty is-error">No se pudieron cargar las notas. Revisá el servidor local.</p>';
      console.error(error);
    });
})();
