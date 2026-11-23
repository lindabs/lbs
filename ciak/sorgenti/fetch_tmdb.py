# Arricchisce l'archivio con i dati di TMDB (id, titolo italiano, durata, locandina, piattaforme).
# Scarica solo i film di films_src.py che non sono ancora in films.json: quelli già presenti restano
# com'erano, piattaforme comprese. Per ricontrollare le piattaforme di tutti usa fetch_providers.py.
# La chiave non va mai scritta qui: nell'ambiente cloud la aggiunge il proxy di rete.
import json, os, sys, time, urllib.parse, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from films_src import FILMS
API = "https://api.themoviedb.org/3"

def get(path, **params):
    params.setdefault("language", "it-IT")
    with urllib.request.urlopen(f"{API}{path}?{urllib.parse.urlencode(params)}", timeout=20) as r:
        return json.load(r)

def providers(movie_id):
    it = get(f"/movie/{movie_id}/watch/providers").get("results", {}).get("IT", {})
    return sorted({p["provider_name"] for p in it.get("flatrate", []) + it.get("free", []) + it.get("ads", [])})

old = json.load(open("films.json")) if os.path.exists("films.json") else []
by_ir = {x["ir"]: x for x in old}
out, added, missing = [], [], []
for f in FILMS:
    if f["ir"] in by_ir:
        x = by_ir[f["ir"]]
        x.update(m=f["m"], f=f["f"], se=f["se"])  # eventuali correzioni a umori, avvertenze e trama seria
        out.append(x)
        continue
    res = get("/search/movie", query=f["q"], primary_release_year=f["y"]).get("results") or get("/search/movie", query=f["q"]).get("results")
    if not res:
        missing.append(f["q"]); continue
    exact = [r for r in res if (r.get("original_title") or "").lower() == f["q"].lower()]
    m = (exact or res)[0]
    d = get(f"/movie/{m['id']}")
    x = {"id": m["id"], "t": d.get("title") or f["q"], "o": d.get("original_title"),
         "y": int((d.get("release_date") or str(f["y"]))[:4]), "r": d.get("runtime") or 0,
         "p": d.get("poster_path"), "m": f["m"], "f": f["f"], "ir": f["ir"], "se": f["se"], "pv": providers(m["id"])}
    out.append(x); added.append(x)
    time.sleep(0.05)

json.dump(out, open("films.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(out)} film in archivio, {len(added)} nuovi; non trovati: {missing}")
src_year = {f["ir"]: f["y"] for f in FILMS}
for x in added:
    flag = "  <-- CONTROLLA" if abs(x["y"] - src_year[x["ir"]]) > 1 or not x["p"] or not x["r"] else ""
    print(f"  {x['t']} ({x['y']}) · {x['r']} min · {', '.join(x['pv']) or 'nessuna piattaforma'}{flag}")
