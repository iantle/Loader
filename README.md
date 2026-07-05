# Loader

Yksinkertainen, asennettava web-sovellus (PWA), joka näyttää loaderin koko näytöllä.
Yläoikealla on asetuspaneeli, josta voi vaihtaa teeman (tumma/vaalea), valita
loader-tyylin ja korostusvärin. Asetukset tallentuvat laitteen välimuistiin
(`localStorage`), joten ne säilyvät seuraaville käynneille.

Toteutettu pelkällä HTML:llä, CSS:llä ja JavaScriptilla — ei riippuvuuksia.

## Ominaisuudet

- 📱 **Asennettava puhelimeen** – toimii kotinäytöltä omana sovelluksena (manifest + service worker)
- 🌓 **Tumma / vaalea teema**
- 🎛️ **9 eri loaderia**: rengas, pisteet, syke, palkit, kaksoisrengas, väreily, ruudukko, kiertorata, kääntö
- 🎨 **Korostusvärin valinta**
- 💾 **Asetukset tallentuvat** välimuistiin automaattisesti
- 🔌 **Offline-tuki** service workerin ansiosta

## Käyttö / kehitys

Palvele kansiota millä tahansa staattisella palvelimella (service worker vaatii
`http(s)`-yhteyden, `file://` ei riitä):

```bash
python3 -m http.server 8000
# avaa selaimessa http://localhost:8000
```

## Asennus puhelimeen

1. Avaa sivu puhelimen selaimessa (HTTPS-osoitteesta).
2. **iOS (Safari):** Jaa → *Lisää Koti-valikkoon*.
3. **Android (Chrome):** valikko ⋮ → *Asenna sovellus* / *Lisää aloitusnäyttöön*.

## Tiedostot

| Tiedosto | Kuvaus |
|----------|--------|
| `index.html` | Sivun rakenne |
| `css/style.css` | Tyylit ja loader-animaatiot |
| `js/app.js` | Asetukset, teema ja tallennus |
| `manifest.webmanifest` | PWA-manifesti |
| `sw.js` | Service worker (offline / asennus) |
| `icons/` | Sovelluskuvakkeet |
| `gen_icons.py` | Skripti kuvakkeiden generointiin |
