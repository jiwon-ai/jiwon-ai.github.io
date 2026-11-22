(function () {
  var D, family = "sig", base = "o", chart;
  var FR = {
    "Centella asiatica / madecassoside": "Centella asiatica / madécassoside", "Niacinamide": "Niacinamide",
    "Hyaluronic acid / sodium hyaluronate": "Acide hyaluronique", "Panthenol": "Panthénol", "Ceramides": "Céramides",
    "Ferments (galactomyces, bifida, saccharomyces)": "Ferments (galactomyces, bifida…)", "Snail secretion": "Mucine d'escargot",
    "Propolis": "Propolis", "Rice (oryza sativa)": "Riz (oryza sativa)", "Green tea (camellia sinensis)": "Thé vert",
    "Adenosine": "Adénosine", "Allantoin": "Allantoïne", "Retinoids": "Rétinoïdes", "Vitamin C (ascorbic acid & derivatives)": "Vitamine C",
    "Salicylic acid / BHA": "Acide salicylique / BHA", "AHA (glycolic / lactic acid)": "AHA (glycolique / lactique)",
    "Fragrance (parfum / fragrance)": "Parfum", "Fragrance allergens (limonene, linalool…)": "Allergènes de parfum (limonène…)",
    "Essential oils": "Huiles essentielles", "Alcohol denat.": "Alcool dénaturé", "Phenoxyethanol": "Phénoxyéthanol",
    "Parabens": "Parabènes", "1,2-Hexanediol": "1,2-Hexanediol", "Butylene glycol": "Butylène glycol",
    "Silicones (dimethicone, cyclo…)": "Silicones", "Mineral oil / paraffin": "Huile minérale / paraffine", "PEG compounds": "PEG"
  };
  var FAM = {
    hero: ["Centella asiatica / madecassoside", "Niacinamide", "Hyaluronic acid / sodium hyaluronate", "Panthenol", "Ceramides", "Ferments (galactomyces, bifida, saccharomyces)", "Snail secretion", "Propolis", "Rice (oryza sativa)", "Green tea (camellia sinensis)", "Adenosine", "Allantoin"],
    classic: ["Retinoids", "Vitamin C (ascorbic acid & derivatives)", "Salicylic acid / BHA", "AHA (glycolic / lactic acid)"],
    form: ["Fragrance (parfum / fragrance)", "Fragrance allergens (limonene, linalool…)", "Essential oils", "Alcohol denat.", "Phenoxyethanol", "Parabens", "1,2-Hexanediol", "Butylene glycol", "Silicones (dimethicone, cyclo…)", "Mineral oil / paraffin", "PEG compounds"]
  };
  function name(i) { return JY.lang() === "fr" ? (FR[i] || i) : i; }
  function p(v) { return JY.fmt(v * 100, { maximumFractionDigits: 0 }) + " %"; }

  function rows() {
    var r = D.rows;
    if (family === "sig") r = r.filter(function (x) { return x.padj < 0.05; });
    else r = r.filter(function (x) { return FAM[family].indexOf(x.ing) >= 0; });
    return r.slice().sort(function (a, b) { return (b.k - b[base]) - (a.k - a[base]); });
  }

  function draw() {
    var r = rows();
    var baseLabel = base === "o" ? JY.t("Autres marques (n = " + D.n.o + ")", "Other brands (n = " + D.n.o + ")")
                                 : JY.t("Autres marques vendues en France (n = " + D.n.f + ")", "Other brands sold in France (n = " + D.n.f + ")");
    var cfg = {
      type: "bar",
      data: { labels: r.map(function (x) { return name(x.ing); }), datasets: [
        { label: JY.t("Marques coréennes (n = " + D.n.k + ")", "Korean brands (n = " + D.n.k + ")"), data: r.map(function (x) { return x.k * 100; }), backgroundColor: JY.css("--warm") },
        { label: baseLabel, data: r.map(function (x) { return x[base] * 100; }), backgroundColor: JY.css("--accent") }] },
      options: { indexAxis: "y", plugins: { tooltip: { callbacks: { label: function (c) {
          var x = r[c.dataIndex], s = c.dataset.label.split(" (")[0] + ": " + JY.fmt(c.parsed.x, { maximumFractionDigits: 1 }) + " %";
          if (c.datasetIndex === 0) s += "  [IC 95 % " + p(x.kci[0]) + "–" + p(x.kci[1]) + "]";
          return s; } } } },
        scales: { x: { min: 0, max: 100, ticks: { callback: function (v) { return v + " %"; } } }, y: { grid: { display: false } } } }
    };
    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("ing"), cfg);
    document.getElementById("nnote").textContent = family === "sig"
      ? JY.t("Ingrédients dont l'écart coréen / autres est significatif (p ajusté < 0,05). Survolez une barre pour l'intervalle de confiance.", "Ingredients where the Korean vs other gap is significant (adjusted p < 0.05). Hover a bar for the confidence interval.")
      : JY.t("Survolez une barre pour l'intervalle de confiance à 95 %.", "Hover a bar for the 95 % confidence interval.");
  }

  function table() {
    var r = D.rows.slice().sort(function (a, b) { return (b.k - b.o) - (a.k - a.o); });
    var h = "<tr><th>" + JY.t("Ingrédient", "Ingredient") + '</th><th class="n">' + JY.t("Coréennes", "Korean") + '</th><th class="n">' + JY.t("Autres", "Other") + '</th><th class="n">' + JY.t("Autres, France", "Other, France") + '</th><th class="n">' + JY.t("Écart (pts)", "Gap (pts)") + '</th><th class="n">' + JY.t("p ajusté", "adj. p") + "</th></tr>";
    r.forEach(function (x) {
      var d = Math.round((x.k - x.o) * 100), sig = x.padj < 0.05;
      h += "<tr><td>" + name(x.ing) + '</td><td class="n">' + p(x.k) + '</td><td class="n">' + p(x.o) + '</td><td class="n">' + p(x.f) + '</td><td class="n ' + (sig ? (d > 0 ? "up" : "down") : "") + '">' + (d > 0 ? "+" : "") + JY.fmt(d) + '</td><td class="n">' + (x.padj < 0.001 ? "< 0,001".replace(",", JY.lang() === "fr" ? "," : ".") : JY.fmt(x.padj, { maximumFractionDigits: 3 })) + (sig ? " ✓" : "") + "</td></tr>";
    });
    document.getElementById("tbl").innerHTML = h;
  }

  fetch("data/kbeauty_data.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d; chartDefaults(); draw(); table();
    segInit(document.getElementById("family"), function (v) { family = v; draw(); });
    segInit(document.getElementById("base"), function (v) { base = v; draw(); });
    document.addEventListener("langchange", function () { draw(); table(); });
  });
})();
