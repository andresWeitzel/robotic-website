window.Site = (function () {
  function getBase() {
    var path = window.location.pathname;

    if (/\.html$/i.test(path)) {
      path = path.replace(/\/[^/]+$/, "");
    }

    path = path.replace(/\/$/, "");

    if (path.slice(-6) === "/pages") {
      path = path.slice(0, -6);
    }

    return path;
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
