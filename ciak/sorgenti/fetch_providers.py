# Aggiunge a films.json le piattaforme in abbonamento su cui ogni film è disponibile in Italia.
# Fonte: TMDB, con dati di JustWatch. Da rilanciare periodicamente: il catalogo cambia spesso.
import json, urllib.request, collections, datetime
films = json.load(open("films.json"))
seen = collections.Counter()
for f in films:
    with urllib.request.urlopen(f"https://api.themoviedb.org/3/movie/{f['id']}/watch/providers", timeout=20) as r:
        it = json.load(r).get("results", {}).get("IT", {})
    names = sorted({p["provider_name"] for p in it.get("flatrate", []) + it.get("free", []) + it.get("ads", [])})
    f["pv"] = names
    seen.update(names)
json.dump(films, open("films.json", "w"), ensure_ascii=False, separators=(",", ":"))
json.dump({"aggiornato": datetime.date.today().isoformat()}, open("aggiornamento.json", "w"))
print(sum(1 for f in films if f["pv"]), "film su almeno una piattaforma di", len(films))
for n, c in seen.most_common(30): print(c, n)
