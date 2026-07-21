window.Site = (function () {
  function getBase() {
    var path = window.location.pathname;
    var pagesIdx = path.indexOf("/pages/");

    if (pagesIdx !== -1) {
      return path.slice(0, pagesIdx);
    }

    if (/\.html$/i.test(path)) {
      path = path.replace(/\/[^/]+$/, "");
    }

    return path.replace(/\/$/, "");
  }

  function url(path) {
    if (!path) return getBase() || "/";
    if (/^https?:\/\//i.test(path)) return path;
    if (path.charAt(0) !== "/") path = "/" + path;
    return getBase() + path;
  }

  function rewriteRootPaths(html) {
    return String(html).replace(
      /(href|src)="\/(?!\/)/g,
      '$1="' + getBase() + "/"
    );
  }

  return {
    getBase: getBase,
    url: url,
    rewriteRootPaths: rewriteRootPaths,
  };
})();
