"""Assemble the static site: shared head/nav/footer + one body fragment per page."""
from pathlib import Path
SRC = Path(__file__).parent; OUT = SRC.parent

def page(body, title_fr, title_en, desc, scripts=""):
    return f"""<!doctype html>
<html lang="fr" data-lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title_fr}</title>
<meta name="title-fr" content="{title_fr}">
<meta name="title-en" content="{title_en}">
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="assets/site.css">
<script src="assets/site.js"></script>
</head>
<body>
<nav class="nav"><div class="wrap">
  <a class="brand" href="index.html"><span class="mono">JY</span>Jiwon Yi</a>
  <a class="link" href="index.html#etudes"><span lang="fr">Projets</span><span lang="en">Projects</span></a>
  <a class="link opt" href="index.html#ia"><span lang="fr">IA</span><span lang="en">AI</span></a>
  <a class="link opt" href="index.html#competences"><span lang="fr">Compétences</span><span lang="en">Skills</span></a>
  <a class="link opt" href="index.html#parcours"><span lang="fr">Parcours</span><span lang="en">Background</span></a>
  <a class="link opt" href="mailto:jiwonyi.data@gmail.com">Contact</a>
  <div class="langsw" role="group" aria-label="Language"><button data-lang="fr" aria-pressed="true">FR</button><button data-lang="en" aria-pressed="false">EN</button></div>
</div></nav>
{body}
<footer><div class="wrap">
  <span>Jiwon Yi · Paris</span>
  <a href="mailto:jiwonyi.data@gmail.com">jiwonyi.data@gmail.com</a>
  <a href="https://www.linkedin.com/in/jiwonyi/">LinkedIn</a>
  <a href="https://github.com/jiwon-ai">GitHub</a>
  <a href="https://fiomio.io">fiomio.io</a>
</div></footer>
{scripts}
</body>
</html>
"""

PAGES = {
 "index.html": ("Jiwon Yi — Data Analyst à Paris", "Jiwon Yi — Data Analyst in Paris",
                "Jiwon Yi, Data Analyst à Paris : SQL, Python, BI. Études de cas en retail, beauté et finance.",
                '<script src="assets/chart.umd.js"></script><script src="assets/home.js"></script>'),
 "winref.html": ("WINREF, application client — Jiwon Yi", "WINREF client app — Jiwon Yi",
                 "Mission freelance : application Android et console web pour gérer les officiels de ski alpin, indicateurs et rapports en SQL.", ""),
 "retail.html": ("Analyse retail — Jiwon Yi", "Retail analytics — Jiwon Yi",
                 "Étude de cas : 1,07 M de lignes de ventes, modèle SQL, rétention par cohorte, RFM, tableau de bord interactif.",
                 '<script src="assets/chart.umd.js"></script><script src="assets/retail.js"></script>'),
 "kbeauty.html": ("K-beauty vs rayon européen — Jiwon Yi", "K-beauty vs the European shelf — Jiwon Yi",
                  "Étude de cas : formules de 2 608 soins visage, marques coréennes vs autres, tests statistiques.",
                  '<script src="assets/chart.umd.js"></script><script src="assets/kbeauty.js"></script>'),
 "thesis.html": ("Mémoire : trading adaptatif — Jiwon Yi", "Thesis: regime-adaptive trading — Jiwon Yi",
                 "Mémoire Paris 1 : classification de régimes de marché et stratégie adaptative sur Nasdaq et or.",
                 '<script src="assets/chart.umd.js"></script><script src="assets/thesis.js"></script>'),
}
import re
def to_en(t):
    t = t.replace(" ; ", ", ")
    t = re.sub(r"(\d),(\d)", r"\1.\2", t)
    for _ in range(3):
        t = re.sub(r"(\d) (\d{3})(?!\d)", r"\1,\2", t)
    return t
def localise_numbers(html):
    """Shared numbers are written in French format; add an English twin where they differ."""
    def rep(m):
        open_, txt, close = m.group(1), m.group(2), m.group(3)
        en = to_en(txt)
        if en == txt or "<" in txt:
            return m.group(0)
        return f'{open_}<span lang="fr">{txt}</span><span lang="en">{en}</span>{close}'
    html = re.sub(r'(<td class="n"[^>]*>)(.*?)(</td>)', rep, html)
    html = re.sub(r'(<b>)([^<]*\d[^<]*)(</b>)', rep, html)
    return html
import time
VER = time.strftime("%Y%m%d%H%M")
for name, (tf, te, d, s) in PAGES.items():
    body = localise_numbers((SRC / name.replace(".html", ".body.html")).read_text())
    html = page(body, tf, te, d, s)
    html = re.sub(r'(assets/[\w.]+\.(?:css|js))"', lambda m: f'{m.group(1)}?v={VER}"', html)
    (OUT / name).write_text(html)
    print("built", name)
