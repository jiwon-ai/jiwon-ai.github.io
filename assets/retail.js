(function () {
  var D, market = "all", metric = "rev", trend, rfm;
  var SEG = ["Champions", "Loyal", "At risk", "Need attention", "New / Promising", "Lost / Hibernating"];
  var SEG_FR = { "Champions": "Champions", "Loyal": "Fidèles", "At risk": "À risque", "Need attention": "À surveiller", "New / Promising": "Nouveaux / prometteurs", "Lost / Hibernating": "Perdus / inactifs" };
  var MONTHS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  var MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function mlabel(m) { var p = m.split("-"); return (JY.lang() === "fr" ? MONTHS_FR : MONTHS_EN)[+p[1] - 1] + " " + p[0].slice(2); }
  function money(v) { return "£" + (v >= 1e6 ? JY.fmt(v / 1e6, { maximumFractionDigits: 2 }) + " M" : v >= 1e4 ? JY.fmt(Math.round(v / 1e3)) + " k" : JY.fmt(Math.round(v))); }
  function pct(v, d) { return JY.fmt(v * 100, { maximumFractionDigits: d === undefined ? 1 : d }) + " %"; }

  function kpis() {
    var x = D[market], y0 = x.yoy["2010"], y1 = x.yoy["2011"];
    function delta(a, b) {
      if (!a || !b) return "";
      var c = b / a - 1, cls = c >= 0 ? "up" : "down";
      return '<div class="d ' + cls + '">' + (c >= 0 ? "+" : "") + JY.fmt(c * 100, { maximumFractionDigits: 1 }) + " % " + JY.t("vs 2010 (janv.–nov.)", "vs 2010 (Jan–Nov)") + "</div>";
    }
    var cards = [
      [money(x.total.rev), JY.t("Chiffre d'affaires (déc. 09–déc. 11)", "Revenue (Dec 09–Dec 11)"), delta(y0 && y0.rev, y1 && y1.rev)],
      [JY.fmt(x.total.orders), JY.t("Commandes", "Orders"), delta(y0 && y0.orders, y1 && y1.orders)],
      [JY.fmt(x.total.cust), JY.t("Clients", "Customers"), delta(y0 && y0.cust, y1 && y1.cust)],
      [money(x.total.rev / x.total.orders), JY.t("Panier moyen", "Average order value"), ""]
    ];
    document.getElementById("kpis").innerHTML = cards.map(function (c) {
      return '<div class="kpi"><b>' + c[0] + "</b><span>" + c[1] + "</span>" + c[2] + "</div>";
    }).join("");
  }

  function drawTrend() {
    var m = D[market].monthly;
    var vals = m.map(function (r) { return metric === "aov" ? r.rev / r.orders : r[metric]; });
    var names = { rev: JY.t("Chiffre d'affaires (£)", "Revenue (£)"), orders: JY.t("Commandes", "Orders"), cust: JY.t("Clients actifs", "Active customers"), aov: JY.t("Panier moyen (£)", "Avg. order value (£)") };
    var cfg = {
      type: "line",
      data: { labels: m.map(function (r) { return mlabel(r.m); }), datasets: [{ label: names[metric], data: vals, borderColor: JY.css("--accent"), backgroundColor: JY.css("--accent-soft"), fill: true, tension: .15, pointRadius: 2.5 }] },
      options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return names[metric] + ": " + JY.fmt(Math.round(c.parsed.y)); } } } },
        scales: { y: { beginAtZero: true, ticks: { callback: function (v) { return JY.fmt(v, { notation: "compact" }); } } }, x: { grid: { display: false } } } }
    };
    if (trend) trend.destroy();
    trend = new Chart(document.getElementById("trend"), cfg);
  }

  function drawRfm() {
    var r = D[market].rfm, by = {};
    r.forEach(function (s) { by[s.seg] = s; });
    var n = r.reduce(function (a, s) { return a + s.n; }, 0), rev = r.reduce(function (a, s) { return a + s.rev; }, 0);
    var segs = SEG.filter(function (s) { return by[s]; });
    var cfg = {
      type: "bar",
      data: { labels: segs.map(function (s) { return JY.lang() === "fr" ? SEG_FR[s] : s; }),
        datasets: [
          { label: JY.t("% des clients", "% of customers"), data: segs.map(function (s) { return by[s].n / n * 100; }), backgroundColor: JY.css("--line") },
          { label: JY.t("% du CA", "% of revenue"), data: segs.map(function (s) { return by[s].rev / rev * 100; }), backgroundColor: JY.css("--accent") }] },
      options: { indexAxis: "y", plugins: { tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": " + JY.fmt(c.parsed.x, { maximumFractionDigits: 1 }) + " %"; } } } },
        scales: { x: { ticks: { callback: function (v) { return v + " %"; } } }, y: { grid: { display: false } } } }
    };
    if (rfm) rfm.destroy();
    rfm = new Chart(document.getElementById("rfm"), cfg);
  }

  function drawTop() {
    var t = D[market].top;
    document.getElementById("top").innerHTML = "<tr><th>" + JY.t("Produit", "Product") + '</th><th class="n">' + JY.t("CA", "Revenue") + '</th><th class="n">' + JY.t("Unités", "Units") + "</th></tr>" +
      t.map(function (r) { return "<tr><td>" + r.p.toLowerCase().replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); }) + '</td><td class="n">' + money(r.rev) + '</td><td class="n">' + JY.fmt(r.units) + "</td></tr>"; }).join("");
  }

  function drawCohort() {
    var c = D[market].cohorts, keys = Object.keys(c).sort(), el = document.getElementById("cohort");
    var size = keys.reduce(function (a, k) { return a + c[k].size; }, 0);
    if (size < 300) {
      el.innerHTML = '<p class="note">' + JY.t("Trop peu de clients sur ce marché (" + size + ") pour une analyse de cohorte fiable.", "Too few customers in this market (" + size + ") for a reliable cohort analysis.") + "</p>";
      return;
    }
    var maxN = 23, accent = JY.css("--accent");
    var h = '<table class="heat"><tr><th></th><th>' + JY.t("taille", "size") + "</th>";
    for (var n = 1; n <= maxN; n++) h += "<th>" + n + "</th>";
    h += "</tr>";
    keys.forEach(function (k) {
      h += '<tr><td class="lab">' + mlabel(k) + (k === "2009-12" ? " *" : "") + '</td><td class="lab">' + c[k].size + "</td>";
      for (var n = 1; n <= maxN; n++) {
        var v = c[k].r[n];
        if (v === undefined) { h += "<td></td>"; continue; }
        var a = Math.min(v / 0.45, 1);
        h += '<td style="background:color-mix(in srgb,' + accent + " " + Math.round(a * 100) + '%,transparent);color:' + (a > .55 ? "#fff" : "inherit") + '" title="' + pct(v) + '">' + Math.round(v * 100) + "</td>";
      }
      h += "</tr>";
    });
    h += "</table>";
    el.innerHTML = h + '<p class="note">' + JY.t("* La cohorte de décembre 2009 inclut tous les clients déjà existants (les données commencent ce mois-là).", "* The December 2009 cohort includes all pre-existing customers (the data starts that month).") + "</p>";
  }

  function all() { kpis(); drawTrend(); drawRfm(); drawTop(); drawCohort(); }

  fetch("data/retail_data.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d; chartDefaults(); all();
    segInit(document.getElementById("market"), function (v) { market = v; all(); });
    segInit(document.getElementById("metric"), function (v) { metric = v; drawTrend(); });
    document.addEventListener("langchange", all);
  });
})();
