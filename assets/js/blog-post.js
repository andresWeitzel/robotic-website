(function () {
  var root = document.getElementById("blog-post-root");
  if (!root) return;

  var courseIndex = {};

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function queryId() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
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

  function renderSections(sections) {
    if (!sections || !sections.length) return "";
    return sections
      .map(function (section) {
        var paras = (section.paragraphs || [])
          .map(function (p) {
            return "<p>" + escapeHtml(p) + "</p>";
          })
          .join("");
        return (
          '<section class="blog-post-section">' +
          (section.heading
            ? "<h2>" + escapeHtml(section.heading) + "</h2>"
            : "") +
          paras +
          "</section>"
        );
      })
      .join("");
  }

  function renderRelated(post) {
    var ids = post.relatedCourseIds || [];
    if (!ids.length) return "";
    return (
      '<aside class="blog-post-courses" aria-label="Cursos relacionados">' +
      "<h2>Seguí con un curso</h2>" +
      "<p>Si esta nota te enganchó, estos microcursos del sitio van en la misma línea.</p>" +
      '<div class="blog-post-course-links">' +
      ids
        .map(function (id) {
          return (
            '<a href="' +
            escapeHtml(courseHref(id)) +
            '">' +
            escapeHtml(courseLabel(id)) +
            " →</a>"
          );
        })
        .join("") +
      "</div>" +
      "</aside>"
    );
  }

  function renderPost(post) {
    var videoUrl =
      "https://www.youtube.com/embed/" + encodeURIComponent(post.videoId || "");
    var tags = (post.tags || [])
      .map(function (tag) {
        return escapeHtml(tag);
      })
      .join(" · ");

    document.title = post.title + " | Blog de Robótica";

    return (
      '<article class="blog-post">' +
      '<header class="blog-post-hero">' +
      '<div class="container blog-post-hero-inner">' +
      '<a class="blog-post-back" href="' +
      escapeHtml(Site.url("/pages/blog.html")) +
      '">← Volver al blog</a>' +
      (tags ? '<p class="blog-meta">' + tags + "</p>" : "") +
      "<h1>" +
      escapeHtml(post.title) +
      "</h1>" +
      '<p class="blog-post-byline">' +
      escapeHtml(post.author || "Equipo Robótica") +
      (post.publishedAt
        ? '<span class="blog-dot">·</span>' + formatDate(post.publishedAt)
        : "") +
      (post.readMinutes
        ? '<span class="blog-dot">·</span>' +
          post.readMinutes +
          " min de lectura"
        : "") +
      "</p>" +
      (post.lead
        ? '<p class="blog-post-lead">' + escapeHtml(post.lead) + "</p>"
        : "") +
      "</div>" +
      "</header>" +
      '<div class="container blog-post-layout">' +
      '<div class="blog-post-media">' +
      '<img src="' +
      escapeHtml(Site.url(post.image)) +
      '" alt="' +
      escapeHtml(post.imageAlt || post.title) +
      '" loading="eager">' +
      "</div>" +
      '<div class="blog-post-body">' +
      renderSections(post.sections) +
      (post.videoId
        ? '<section class="blog-post-section blog-post-video">' +
          "<h2>Miralo en movimiento</h2>" +
          '<div class="embed-responsive embed-responsive-16by9">' +
          '<iframe src="' +
          escapeHtml(videoUrl) +
          '" title="' +
          escapeHtml(post.title) +
          '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>' +
          "</div>" +
          "</section>"
        : "") +
      renderRelated(post) +
      (post.articleUrl
        ? '<footer class="blog-post-footer">' +
          "<p>Esta nota es contenido propio del sitio. Si querés la ficha original del fabricante o la cobertura de prensa:</p>" +
          '<a class="btn-ghost" href="' +
          escapeHtml(Site.url(post.articleUrl)) +
          '" target="_blank" rel="noopener noreferrer">Fuente externa</a>' +
          "</footer>"
        : "") +
      "</div>" +
      "</div>" +
      "</article>"
    );
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
      var posts = results[0] || [];
      (results[1] || []).forEach(function (course) {
        courseIndex[course.id] = course;
      });

      var id = queryId();
      var post = posts.find(function (item) {
        return item.id === id;
      });

      if (!post) {
        root.innerHTML =
          '<div class="container blog-post-missing">' +
          "<h1>Nota no encontrada</h1>" +
          "<p>Esa nota no existe o el enlace está incompleto.</p>" +
          '<a class="btn-accent" href="' +
          escapeHtml(Site.url("/pages/blog.html")) +
          '">Volver al blog</a>' +
          "</div>";
        return;
      }

      root.innerHTML = renderPost(post);
    })
    .catch(function (error) {
      root.innerHTML =
        '<p class="blog-empty is-error">No se pudo cargar la nota. Revisá el servidor local.</p>';
      console.error(error);
    });
})();
