// Language switch (FR default) + shared chart helpers.
(function () {
  var KEY = "jy-lang";
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var fromUrl = new URLSearchParams(location.search).get("lang");
  var lang = (fromUrl === "en" || fromUrl === "fr") ? fromUrl : (stored() || "fr");

  function apply(l) {
    lang = l;
    document.documentElement.setAttribute("data-lang", l);
    document.documentElement.lang = l;
    document.querySelectorAll(".langsw button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === l));
    });
    var t = document.querySelector('meta[name="title-' + l + '"]');
    if (t) document.title = t.content;
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  }
  window.JY = {
    lang: function () { return lang; },
    t: function (fr, en) { return lang === "fr" ? fr : en; },
    fmt: function (v, opt) { return new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", opt || {}).format(v); },
    css: function (name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  };
  document.documentElement.setAttribute("data-lang", lang);
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".langsw button").forEach(function (b) {
      b.addEventListener("click", function () { save(b.dataset.lang); apply(b.dataset.lang); });
    });
    apply(lang);
  });
})();

// Segmented buttons: <div class="seg" data-group="x"><button data-v="a">
function segInit(el, onChange) {
  el.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () {
      el.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      onChange(b.dataset.v);
    });
  });
}

function chartDefaults() {
  if (!window.Chart) return;
  Chart.defaults.font.family = "Inter, -apple-system, Segoe UI, Roboto, sans-serif";
  Chart.defaults.color = JY.css("--muted");
  Chart.defaults.borderColor = JY.css("--line");
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.maintainAspectRatio = false;
}
