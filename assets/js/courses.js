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

  function renderCourseCard(course) {
    const modalId = `modal-${course.id}`;
    const labelId = `${modalId}-label`;
    const imageUrl = Site.url(course.image);
    const courseUrl = Site.url(course.courseUrl);

    return `
      <article class="card mb-4">
        <div class="row no-gutters">
          <div class="col-md-4">
            <img src="${escapeHtml(imageUrl)}" class="card-img" alt="${escapeHtml(course.imageAlt)}">
          </div>
          <div class="col-md-8 text-center">
            <div class="card-body">
              <h5 class="card-title">${escapeHtml(course.title)}</h5>
              <p class="card-text">${escapeHtml(course.summary)}</p>
              <p class="card-text">
                <small class="text-muted">Requisitos: ${escapeHtml(course.requirements)}</small>
              </p>
              <div>
                <button type="button" class="btn alert-secondary alert-link m-2" data-toggle="modal" data-target="#${modalId}">
                  Ver Más..
                </button>
                <div class="modal fade" id="${modalId}" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="${labelId}" aria-hidden="true">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="${labelId}">${escapeHtml(course.title)}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar">
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div class="modal-body">
                        ${formatDetails(course.details)}
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                      </div>
                    </div>
                  </div>
                </div>
                <a href="${escapeHtml(courseUrl)}" target="_blank" rel="noopener noreferrer">
                  <button type="button" class="btn alert-secondary alert-link">Ir al Curso</button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  fetch(Site.url("/assets/data/courses.json"))
    .then(function (response) {
      if (!response.ok) throw new Error("No se pudieron cargar los cursos");
      return response.json();
    })
    .then(function (courses) {
      container.innerHTML = courses.map(renderCourseCard).join("");
    })
    .catch(function (error) {
      container.innerHTML =
        '<p class="text-center text-danger">No se pudieron cargar los cursos. Revisá que el servidor local esté corriendo.</p>';
      console.error(error);
    });
})();
