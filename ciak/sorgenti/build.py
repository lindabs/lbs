# Unisce il gioco (app.html), l'archivio (films.json) e la data dell'ultimo aggiornamento.
# Uso: python3 build.py                 -> index.html (anteprima)
#      python3 build.py --sito PERCORSO -> pagina completa per il sito pubblico
import json, sys
films = open("films.json").read()
upd = json.load(open("aggiornamento.json"))["aggiornato"]
lines = open("app.html").read().replace("/*FILMS*/[]", films).replace("/*UPDATED*/", upd).split("\n")
if "--sito" in sys.argv:
    out = sys.argv[sys.argv.index("--sito") + 1]
    base = "https://lindabs.github.io/lbs/ciak/"
    head = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Ciak, si sceglie · il film di stasera in cinque minuti</title>
<meta name="description" content="Il gioco per scegliere in due il film della serata: veti, umore segreto e voto a carte. Senza perdere un'ora a scorrere i cataloghi.">
<meta property="og:title" content="Ciak, si sceglie">
<meta property="og:description" content="Il film di stasera, in cinque minuti. Gioca in due e niente ripensamenti.">
<meta property="og:type" content="website">
<meta property="og:url" content="{base}">
<meta property="og:image" content="{base}anteprima.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#140308">
<style>[hidden]{{display:none!important}}img{{max-width:100%}}:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}</style>
</head>
<body>
"""
    open(out, "w").write(head + "\n".join(lines[1:]) + "\n</body>\n</html>\n")
    print("pagina del sito:", out)
else:
    open("index.html", "w").write("\n".join(lines))
    print("index.html · aggiornato al", upd)
