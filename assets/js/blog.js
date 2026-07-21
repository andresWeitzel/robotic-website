(function () {
  const container = document.getElementById("blog-list");
  if (!container) return;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function chunk(items, size) {
    var groups = [];
    for (var i = 0; i < items.length; i += size) {
      groups.push(items.slice(i, i + size));
    }
    return groups;
  }

  function renderPostCard(post) {
    var modalId = "modal-" + post.id;
    var labelId = modalId + "-label";
    var videoUrl =
      "https://www.youtube.com/embed/" + encodeURIComponent(post.videoId);
    var imageUrl = Site.url(post.image);
    var articleUrl = Site.url(post.articleUrl);

    return (
      '<article class="card mt-5">' +
      '<img src="' +
      escapeHtml(imageUrl) +
      '" class="card-img-top" alt="' +
      escapeHtml(post.imageAlt) +
      '">' +
      '<div class="card-body">' +
      '<h5 class="card-title">' +
      escapeHtml(post.title) +
      "</h5>" +
      '<p class="card-text">' +
      escapeHtml(post.summary) +
      "</p>" +
      "</div>" +
      '<div class="card-footer text-center">' +
      '<a href="' +
      escapeHtml(articleUrl) +
      '" target="_blank" rel="noopener noreferrer" class="btn btn-secondary border-light alert-link m-2">Ir al Artículo</a>' +
      '<button type="button" class="btn btn-secondary border-light alert-link m-2" data-toggle="modal" data-target="#' +
      modalId +
      '">Ver vídeo</button>' +
      '<div class="modal fade text-dark" id="' +
      modalId +
      '" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="' +
      labelId +
      '" aria-hidden="true">' +
      '<div class="modal-dialog">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title" id="' +
      labelId +
      '">' +
      escapeHtml(post.title) +
      "</h5>" +
      '<button type="button" class="close" data-dismiss="modal" aria-label="Cerrar">' +
      '<span aria-hidden="true">&times;</span>' +
      "</button>" +
      "</div>" +
      '<div class="modal-body">' +
      '<div class="embed-responsive embed-responsive-16by9">' +
      '<iframe src="' +
      videoUrl +
      '" title="' +
      escapeHtml(post.title) +
      '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
      "</div>" +
      "</div>" +
      '<div class="modal-footer m-1 text-left">' +
      "<h6>Para <strong>salir</strong>, pause el video y toque el botón <strong>Cerrar</strong></h6>" +
      '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  fetch(Site.url("/assets/data/blog.json"))
    .then(function (response) {
      if (!response.ok) throw new Error("No se pudieron cargar los posts");
      return response.json();
    })
    .then(function (posts) {
      container.innerHTML = chunk(posts, 3)
        .map(function (group) {
          return (
            '<div class="card-deck m-3">' +
            group.map(renderPostCard).join("") +
            "</div>"
          );
        })
        .join("");
    })
    .catch(function (error) {
      container.innerHTML =
        '<p class="text-center text-danger m-3">No se pudieron cargar los posts del blog. Revisá que el servidor local esté corriendo.</p>';
      console.error(error);
    });
})();
