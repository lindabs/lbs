# Arricchisce l'archivio con i dati di TMDB (id, titolo italiano, durata, locandina).
# La chiave non serve qui: in questo ambiente la aggiunge il proxy di rete.
import json, sys, time, urllib.parse, urllib.request
sys.path.insert(0, '.')
from films_src import FILMS
API = "https://api.themoviedb.org/3"
def get(path, **params):
    params.setdefault("language", "it-IT")
    url = f"{API}{path}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=20) as r:
        return json.load(r)
out, missing = [], []
for f in FILMS:
    res = get("/search/movie", query=f["q"], primary_release_year=f["y"]).get("results") or get("/search/movie", query=f["q"]).get("results")
    if not res:
        missing.append(f["q"]); continue
    exact = [r for r in res if (r.get("original_title") or "").lower() == f["q"].lower()]
    m = (exact or res)[0]
    d = get(f"/movie/{m['id']}")
    out.append({
        "id": m["id"], "t": d.get("title") or f["q"], "o": d.get("original_title"),
        "y": int((d.get("release_date") or str(f["y"]))[:4]), "r": d.get("runtime") or 0,
        "p": d.get("poster_path"), "m": f["m"], "f": f["f"], "ir": f["ir"], "se": f["se"],
    })
    time.sleep(0.05)
json.dump(out, open("films.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(len(out), "film; mancanti:", missing)
for x in out: 
    if abs(x["y"] - next(f["y"] for f in FILMS if f["ir"] == x["ir"])) > 1 or not x["p"] or not x["r"]:
        print("controlla:", x["t"], x["y"], x["r"], x["p"])
