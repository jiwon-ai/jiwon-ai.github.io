// Native mini-charts for the home page case cards (language- and theme-aware).
(function () {
  var charts = {}, data = {};
  var MFR = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N"], MEN = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N"];
  function kill(id) { if (charts[id]) charts[id].destroy(); }

  function retail() {
    var m = data.retail.all.monthly, y = { "2010": [], "2011": [] };
    m.forEach(function (r) { var p = r.m.split("-"); if (y[p[0]] && +p[1] <= 11) y[p[0]][+p[1] - 1] = r.rev / 1000; });
    kill("r");
    charts.r = new Chart(document.getElementById("v-retail"), {
      type: "line",
      data: { labels: (JY.lang() === "fr" ? ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]),
        datasets: [
          { label: "2010", data: y["2010"], borderColor: JY.css("--faint"), backgroundColor: JY.css("--faint"), borderWidth: 2, pointRadius: 0, tension: .2, borderDash: [5, 4] },
          { label: "2011", data: y["2011"], borderColor: JY.css("--accent"), backgroundColor: JY.css("--accent"), borderWidth: 2.5, pointRadius: 0, tension: .2 }] },
      options: { interaction: { mode: "index", intersect: false }, plugins: { legend: { position: "bottom" },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": £" + JY.fmt(Math.round(c.parsed.y)) + "k"; } } } },
        scales: { y: { beginAtZero: true, ticks: { callback: function (v) { return v >= 1000 ? "£" + JY.fmt(v / 1000, { maximumFractionDigits: 1 }) + " M" : "£" + v + "k"; } } }, x: { grid: { display: false } } } }
    });
  }

  function kb() {
    var pick = [["Fragrance (parfum / fragrance)", "Parfum", "Fragrance"], ["Phenoxyethanol", "Phénoxyéthanol", "Phenoxyethanol"],
                ["1,2-Hexanediol", "1,2-Hexanediol", "1,2-Hexanediol"], ["Centella asiatica / madecassoside", "Centella", "Centella"],
                ["Niacinamide", "Niacinamide", "Niacinamide"], ["Ceramides", "Céramides", "Ceramides"]];
    var by = {}; data.kb.rows.forEach(function (r) { by[r.ing] = r; });
    kill("k");
    charts.k = new Chart(document.getElementById("v-kb"), {
      type: "bar",
      data: { labels: pick.map(function (p) { return JY.lang() === "fr" ? p[1] : p[2]; }),
        datasets: [
          { label: JY.t("Marques coréennes", "Korean brands"), data: pick.map(function (p) { return by[p[0]].k * 100; }), backgroundColor: JY.css("--accent-2"), borderRadius: 4 },
          { label: JY.t("Autres marques", "Other brands"), data: pick.map(function (p) { return by[p[0]].o * 100; }), backgroundColor: JY.css("--accent"), borderRadius: 4 }] },
      options: { indexAxis: "y", plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": " + JY.fmt(c.parsed.x, { maximumFractionDigits: 0 }) + " %"; } } } },
        scales: { x: { max: 100, ticks: { callback: function (v) { return v + " %"; } } }, y: { grid: { display: false } } } }
    });
  }

  function th() {
    function dd(a) { var m = -Infinity; return a.map(function (v) { m = Math.max(m, v); return (v / m - 1) * 100; }); }
    kill("t");
    charts.t = new Chart(document.getElementById("v-th"), {
      type: "line",
      data: { labels: data.th.d, datasets: [
        { label: JY.t("Stratégie dynamique", "Dynamic strategy"), data: dd(data.th.dyn), borderColor: JY.css("--accent-2"), backgroundColor: "transparent", borderWidth: 2.5, pointRadius: 0 },
        { label: JY.t("Nasdaq (achat-conservation)", "Nasdaq (buy-and-hold)"), data: dd(data.th.nq), borderColor: JY.css("--accent"), backgroundColor: JY.css("--accent-soft"), fill: true, borderWidth: 1.5, pointRadius: 0 }] },
      options: { interaction: { mode: "index", intersect: false }, plugins: { legend: { position: "bottom" },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": " + JY.fmt(c.parsed.y, { maximumFractionDigits: 1 }) + " %"; } } } },
        scales: { y: { max: 0, ticks: { callback: function (v) { return v + " %"; } } },
          x: { grid: { display: false }, ticks: { maxTicksLimit: 5, callback: function (v) { return data.th.d[v].slice(0, 4); } } } } }
    });
  }

  function all() { retail(); kb(); th(); }
  Promise.all(["data/retail_data.json", "data/kbeauty_data.json", "data/thesis_data.json"].map(function (u) { return fetch(u).then(function (r) { return r.json(); }); }))
    .then(function (r) { data.retail = r[0]; data.kb = r[1]; data.th = r[2]; chartDefaults(); all(); document.addEventListener("langchange", all); });
})();
