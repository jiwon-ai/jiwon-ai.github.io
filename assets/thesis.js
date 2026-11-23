(function () {
  var D, mode = "linear", chart;
  function dd(a) { var m = -Infinity; return a.map(function (v) { m = Math.max(m, v); return (v / m - 1) * 100; }); }
  function draw() {
    var series = [
      ["dyn", JY.t("Stratégie dynamique NQ/GC", "Dynamic NQ/GC strategy"), JY.css("--accent-2"), 2.5],
      ["nq", JY.t("Nasdaq, achat-conservation", "Nasdaq buy-and-hold"), JY.css("--accent"), 1.5],
      ["gc", JY.t("Or, achat-conservation", "Gold buy-and-hold"), "#b08d2e", 1.5]
    ];
    var cfg = {
      type: "line",
      data: { labels: D.d, datasets: series.map(function (s) {
        return { label: s[1], data: mode === "dd" ? dd(D[s[0]]) : D[s[0]], borderColor: s[2], backgroundColor: s[2], borderWidth: s[3], pointRadius: 0, tension: .1 };
      }) },
      options: { interaction: { mode: "index", intersect: false },
        plugins: { tooltip: { callbacks: { label: function (c) {
          return c.dataset.label + ": " + (mode === "dd" ? JY.fmt(c.parsed.y, { maximumFractionDigits: 1 }) + " %" : "$" + JY.fmt(Math.round(c.parsed.y)));
        } } } },
        scales: {
          x: { ticks: { maxTicksLimit: 8, callback: function (v) { return D.d[v].slice(0, 7); } }, grid: { display: false } },
          y: { ticks: { callback: function (v) { return mode === "dd" ? v + " %" : "$" + JY.fmt(v / 1000) + "k"; } } }
        } }
    };
    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("eq"), cfg);
  }
  fetch("data/thesis_data.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d; chartDefaults(); draw();
    segInit(document.getElementById("scale"), function (v) { mode = v; draw(); });
    document.addEventListener("langchange", draw);
  });
})();
(function () {
  var c;
  var R = ["Quiet_Bullish", "Elevated", "Quiet", "Quiet_Bearish"], NQ = [3.28, 1.49, -1.30, -2.37], GC = [3.28, 2.61, -1.23, -1.91];
  function draw() {
    if (c) c.destroy();
    c = new Chart(document.getElementById("regimes"), {
      type: "bar",
      data: { labels: R, datasets: [
        { label: "Nasdaq (NQ)", data: NQ, backgroundColor: JY.css("--accent"), borderRadius: 4 },
        { label: JY.t("Or (GC)", "Gold (GC)"), data: GC, backgroundColor: JY.css("--gold"), borderRadius: 4 }] },
      options: { plugins: { tooltip: { callbacks: { label: function (x) { return x.dataset.label + ": " + JY.fmt(x.parsed.y, { minimumFractionDigits: 2 }); } } } },
        scales: { y: { title: { display: true, text: "Sharpe" } }, x: { grid: { display: false } } } }
    });
  }
  document.addEventListener("DOMContentLoaded", function () { chartDefaults(); draw(); document.addEventListener("langchange", draw); });
})();
