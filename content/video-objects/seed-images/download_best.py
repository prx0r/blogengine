import json, os, time, subprocess
from pathlib import Path

BASE = "/root/projects/blog/content/video-objects/seed-images"

def dl(url, outpath, retries=3):
    if os.path.exists(outpath) and os.path.getsize(outpath) > 2000:
        return True
    os.makedirs(os.path.dirname(outpath), exist_ok=True)
    ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    for i in range(retries):
        if i > 0:
            time.sleep(i * 4)
        r = subprocess.run(['curl', '-sL', '--connect-timeout', '20', '--max-time', '60',
            '-H', f'User-Agent: {ua}', '-o', outpath, url], capture_output=True)
        if os.path.exists(outpath) and os.path.getsize(outpath) > 2000:
            mime = subprocess.run(['file', '--mime-type', '-b', outpath], capture_output=True, text=True)
            if 'image/' in mime.stdout:
                return True
            os.unlink(outpath)
    return False

PICKS = {
    "sufi": [
        ("Ibn Arabi with students - Persian miniature.jpg", "https://upload.wikimedia.org/wikipedia/commons/8/8d/Ibn_Arabi_with_students.jpg", "Ibn Arabi on horseback with students", "Sufi master and teacher-student relationship"),
        ("Ibn Arabi life diagram.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/1f/Ibnarabi.jpg", "Ibn Arabi life/death/work diagram", "Sufi cosmology from Futuhat"),
        ("Ibn Arabi portrait.jpg", "https://upload.wikimedia.org/wikipedia/commons/e/e9/Ibn_Arabi.jpg", "Portrait of Ibn Arabi", "Sufi mystic portraiture"),
        ("Plain of Assembly diagram - Futuhat.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/5c/Ibn-al-Arabi-Plain-of-Assembly.jpg", "Plain of Assembly diagram", "Ibn Arabi's eschatological vision"),
        ("Selim I at Ibn Arabi tomb.jpg", "https://upload.wikimedia.org/wikipedia/commons/3/3d/Folio_173._Sel%C3%AEm_I_at_the_tomb_of_ibn_Arab%C3%AE_%28Biblioth%C3%A8que_nationale_de_France%2C_Suppl%C3%A9ment_turc_524%29.jpg", "Selim I visiting Ibn Arabi's tomb", "Ottoman historical miniature"),
        ("Ibn Arabi imaginary sketch.png", "https://upload.wikimedia.org/wikipedia/commons/5/5f/Ibn_%CA%BFArabi%2C_Sayr_mulhimah_min_al-Sharq_wa-al-Gharb.png", "Imaginary sketch of Ibn Arabi", "Modern imagined portrait"),
        ("Khalili Diwan Ibn Arabi.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/51/Khalili_Collection_Islamic_Art_mss_0225_fol_1a.jpg", "Diwan of Ibn al-Arabi manuscript", "Sufi poetry illumination"),
        ("Maqam Ibn Arabi Damascus.jpg", "https://upload.wikimedia.org/wikipedia/commons/9/91/Maqam_Ibn-%27arabi2.jpg", "Maqam of Ibn Arabi in Damascus", "Sufi sacred architecture"),
        ("Mausoleum Ibn Arabi Fes.jpg", "https://upload.wikimedia.org/wikipedia/commons/7/7c/Arabi_mausoleum_Fes_DSCF6355.jpg", "Mausoleum of Ibn al-Arabi in Fes", "Sufi pilgrimage site"),
        ("Tomb of Ibn al-Arabi interior.jpg", "https://upload.wikimedia.org/wikipedia/commons/0/0e/Das_Grab_von_Ibn_al-Arabi.JPG", "Ibn al-Arabi's tomb interior", "Sufi funerary architecture"),
        ("Suhrawardi portrait.jpg", "https://upload.wikimedia.org/wikipedia/commons/9/97/Shahab_al-Din_Suhrawardi.jpg", "Shihab al-Din Suhrawardi", "Illuminationist philosopher"),
        ("Suhrawardi with disciples miniature.tif", "https://upload.wikimedia.org/wikipedia/commons/b/bd/Suhraward%C4%AB_in_Suppl%C3%A9ment_Persan_776.tif", "Suhrawardi with disciples", "Persian miniature of Illuminationist school"),
        ("Baghdad Quran illumination - Suhrawardi.jpg", "https://images.metmuseum.org/CRDImages/is/original/DP234020.jpg", "Anonymous Baghdad Qur'an folio", "Islamic illumination by Ahmad al-Suhrawardi"),
        ("Hikmat al-Ishraq manuscript.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/13/Opening_page_from_the_manuscript_of_%22Hikmat_al-%CA%BFIshraq%22_by_al-Suhrawardi.jpg", "Hikmat al-Ishraq opening page", "Suhrawardi's Illuminationist philosophy"),
    ],
    "neoplatonic": [
        ("Plotinus bust from Ostia.jpg", "https://upload.wikimedia.org/wikipedia/commons/e/ee/Plotinos.jpg", "Plotinus marble bust, Ostia", "Founder of Neoplatonism"),
        ("Plotinus marble head.jpg", "https://upload.wikimedia.org/wikipedia/commons/c/c5/Plotinus.jpg", "Plotinus marble head", "Roman portrait of Plotinus"),
        ("Plotinus Vatican bust.jpg", "https://upload.wikimedia.org/wikipedia/commons/a/ad/Plotin.jpg", "Plotinus bust, Vatican Museums", "Neoplatonist portrait sculpture"),
        ("Porphyry and Plotinus medieval illumination.jpg", "https://upload.wikimedia.org/wikipedia/commons/9/99/Porphyry_and_Plotinus.jpg", "Porphyry and Plotinus discussing theurgy", "Neoplatonic illuminated manuscript"),
        ("Plotinus with disciples sarcophagus.jpg", "https://upload.wikimedia.org/wikipedia/commons/3/30/Roman_sarcophagus_of_a_reader_identified_to_Plotinus_and_disciples.jpg", "Sarcophagus of Plotinus with disciples", "Late antique Neoplatonic school scene"),
        ("Plato in his Academy.png", "https://upload.wikimedia.org/wikipedia/commons/5/5e/Plato_i_sin_akademi%2C_av_Carl_Johan_Wahlbom_%28ur_Svenska_Familj-Journalen%29.png", "Plato teaching in his Academy", "Classical depiction of the Academy"),
        ("School of Athens detail - Raphael.jpg", "https://upload.wikimedia.org/wikipedia/commons/e/e7/Scuola_di_atene_10.jpg", "Raphael's School of Athens", "Renaissance summa of Greek philosophy"),
        ("Proclus commentary on Euclid.jpg", "https://upload.wikimedia.org/wikipedia/commons/b/bf/In_primum_Euclidis_elementorum_librum_01.jpg", "Proclus commentary on Euclid's Elements", "Neoplatonic mathematical philosophy"),
        ("Proclus Platonic Theology Venice ms.jpg", "https://upload.wikimedia.org/wikipedia/commons/2/2a/Proclus%2C_Venice%2C_Gr._547%2C_fol._1r.jpg", "Proclus' Platonic Theology manuscript", "Neoplatonic theology in Byzantium"),
        ("Proclus Platonic Theology Oxford ms.jpg", "https://upload.wikimedia.org/wikipedia/commons/b/b5/Proclus%2C_Platonic_Theology%2C_Oxford%2C_MS._Laud._gr._18.jpg", "Proclus' Platonic Theology, Oxford", "Byzantine manuscript illumination"),
        ("Proclus commentary on Timaeus.jpg", "https://upload.wikimedia.org/wikipedia/commons/7/77/Proclus%2C_Commentary_on_the_Timaeus%2C_Naples%2C_III.D.28.jpg", "Proclus commentary on Plato's Timaeus", "Neoplatonic exegesis"),
        ("Plotinus Enneads Ficino annotated.jpg", "https://upload.wikimedia.org/wikipedia/commons/f/fe/Plotinus%2C_Enneads%2C_Paris%2C_B.N.%2C_Gr._1816.jpg", "Plotinus Enneads with Ficino annotations", "Renaissance transmission of Neoplatonism"),
    ],
    "hermetic": [
        ("Hermes Trismegistus engraving.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/15/Trismegistos.jpg", "Hermes Trismegistus engraving", "Founder of Hermeticism"),
        ("Hermes Siena Cathedral mosaic.jpg", "https://upload.wikimedia.org/wikipedia/commons/c/cf/Hermes_mercurius_trismegistus_siena_cathedral.jpg", "Hermes Trismegistus floor mosaic", "Renaissance Hermetic art in cathedral"),
        ("Hermes by JA Knapp 1928.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/18/Hermes_Trismegistus_by_J.A.Knapp.jpg", "Hermes Trismegistus by Knapp", "Modern Hermetic illustration"),
        ("Hermes and Emerald Tablet.jpg", "https://upload.wikimedia.org/wikipedia/commons/8/84/Hermes_and_his_pictoral_Tabula.jpg", "Hermes holding the Emerald Tablet", "The foundational alchemical text"),
        ("Ibn Umayl alchemical Hermes.jpg", "https://upload.wikimedia.org/wikipedia/commons/b/b2/Ibn_Umayl_Hermes_Crop.jpg", "Islamic alchemical illustration of Hermes", "Hermes in Islamic alchemy"),
        ("Hermes Arabic dress alchemical ms.jpg", "https://upload.wikimedia.org/wikipedia/commons/c/c9/Hermes_Trismegistos_Ashb._1166.jpg", "Hermes in Arabic dress, alchemical ms", "Medieval alchemical manuscript illumination"),
        ("Borgia fresco Isis Moses Hermes.png", "https://upload.wikimedia.org/wikipedia/commons/8/8c/Borgia_Apartment_-_Sala_dei_Santi_-_Isis_between_Moses_and_Hermes_Trismegistus.png", "Isis between Moses and Hermes", "Pinturicchio fresco - Hermetic wisdom tradition"),
        ("Louvre Hermes-Thoth incense burner.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/52/Louvre_Hermes-Thoth_perfume_vase.jpg", "Hermes-Thoth incense burner, Louvre", "Greco-Egyptian syncretic artifact"),
        ("Mercurius Trismegistus engraving 1615.jpg", "https://upload.wikimedia.org/wikipedia/commons/9/9b/Mercurius_Trismegistus-Tractatus_posthumus_de_divinatione_magicis-12.jpg", "Mercurius Trismegistus engraving", "Hermetic magical-alchemical tradition"),
        ("Hermes Trismegistus Wellcome Library.jpg", "https://upload.wikimedia.org/wikipedia/commons/8/85/Hermes_Trismegistus_illustration_Wellcome_L0016507.jpg", "Hermes Trismegistus, Wellcome Library", "Renaissance medical Hermeticism"),
        ("Hermes as mage.jpg", "https://upload.wikimedia.org/wikipedia/commons/8/84/Hermesmage.jpg", "Hermes as mage figure", "Hermetic magus archetype"),
        ("Portrait of Hermes Trismegistus.jpg", "https://upload.wikimedia.org/wikipedia/commons/3/32/Portrait_de_Herm%C3%A8s_Trism%C3%A9giste.jpg", "Portrait of Hermes Trismegistus", "University painting of Hermes"),
    ],
    "buddhist_philosophy": [
        ("Nagarjuna with Buddhist master Nepal.jpg", "https://openaccess-cdn.clevelandart.org/1985.186/1985.186_web.jpg", "Nagarjuna with Buddhist master", "Madhyamaka philosophy founder"),
        ("Seated Shakyamuni Buddha Mathura.jpg", "https://openaccess-cdn.clevelandart.org/1970.63/1970.63_web.jpg", "Seated Shakyamuni Buddha, Mathura", "Kushan period - early Buddha image"),
        ("Standing Buddha Sarnath Gupta.jpg", "https://openaccess-cdn.clevelandart.org/1943.278/1943.278_web.jpg", "Standing Buddha from Sarnath", "Gupta period Buddhist sculpture"),
        ("White Path Between Two Rivers Japan.jpg", "https://openaccess-cdn.clevelandart.org/1955.44/1955.44_web.jpg", "White Path Between Two Rivers", "Japanese Pure Land Buddhism"),
        ("Lotus Sutra frontispiece Song.jpg", "https://openaccess-cdn.clevelandart.org/1970.64/1970.64_web.jpg", "Lotus Sutra with frontispiece", "Mahayana sutra illumination"),
        ("Five Hundred Arhats Wu Bin.jpg", "https://openaccess-cdn.clevelandart.org/1971.16/1971.16_web.jpg", "Five Hundred Arhats by Wu Bin", "Chinese Buddhist painting"),
        ("Seated Amitabha Western Himalayas.jpg", "https://openaccess-cdn.clevelandart.org/2000.68/2000.68_web.jpg", "Seated Amitabha with attendants", "Pure Land Buddhism thangka"),
        ("Standing Avalokitesvara Korea.jpg", "https://openaccess-cdn.clevelandart.org/1998.80/1998.80_web.jpg", "Standing Avalokitesvara", "Korean Buddhist gilt-bronze"),
        ("Standing Buddha Myanmar.jpg", "https://openaccess-cdn.clevelandart.org/1973.159/1973.159_web.jpg", "Standing Buddha, Myanmar", "Southeast Asian Buddhist art"),
        ("Medicine Buddha Triad Korea.jpg", "https://openaccess-cdn.clevelandart.org/1987.59/1987.59_web.jpg", "Medicine Buddha Triad", "Korean Buddhist metalwork"),
        ("Maitreya Buddha Gandhara.jpg", "https://openaccess-cdn.clevelandart.org/1969.61/1969.61_web.jpg", "Maitreya Buddha, Gandhara", "Future Buddha sculpture"),
    ],
    "yoga_philosophy": [
        ("Yoga-shastra Hemachandra Jain.jpg", "https://openaccess-cdn.clevelandart.org/1971.129/1971.129_web.jpg", "Yoga-shastra folio, Jain monks", "Jain yoga tradition illustration"),
        ("Manjushri Bodhisattva Wisdom Nepal.jpg", "https://openaccess-cdn.clevelandart.org/1964.370/1964.370_web.jpg", "Manjushri, Bodhisattva of Wisdom", "Yogic contemplation of wisdom"),
        ("Buddha Teaching vitarka mudra Thailand.jpg", "https://openaccess-cdn.clevelandart.org/1958.334/1958.334_web.jpg", "Buddha in vitarka mudra", "Teaching and meditation gesture"),
        ("Seated Buddha Meditation Chola India.jpg", "https://openaccess-cdn.clevelandart.org/1970.63/1970.63_web.jpg", "Seated Buddha in dhyana mudra", "Yogic meditation posture"),
        ("Standing Buddha Sarnath Gupta.jpg", "https://openaccess-cdn.clevelandart.org/1943.278/1943.278_web.jpg", "Standing Buddha, Sarnath", "Classic Buddhist sculpture"),
        ("Standing Buddha Myanmar gold repousse.jpg", "https://openaccess-cdn.clevelandart.org/1987.154/1987.154_web.jpg", "Standing Buddha, Myanmar gold", "Southeast Asian Buddhist art"),
        ("Miroku Maitreya Japan.jpg", "https://openaccess-cdn.clevelandart.org/1999.195/1999.195_web.jpg", "Miroku (Maitreya) Japan", "Japanese meditation icon"),
        ("Medicine Buddha Triad Korea.jpg", "https://openaccess-cdn.clevelandart.org/1987.59/1987.59_web.jpg", "Medicine Buddha Triad, Silla", "Korean Buddhist devotional art"),
        ("Ascetic with Skull Northern Wei.jpg", "https://openaccess-cdn.clevelandart.org/1980.25/1980.25_web.jpg", "Ascetic holding a skull", "Buddhist ascetic practice"),
    ],
}

results = []
for world, picks in PICKS.items():
    world_dir = os.path.join(BASE, world, "originals")
    os.makedirs(world_dir, exist_ok=True)
    for idx, (fname, url, concept, desc) in enumerate(picks):
        outpath = os.path.join(world_dir, fname)
        ok = dl(url, outpath)
        if ok:
            results.append((world, fname, url, concept, desc))
            print(f"OK: {world}/{fname}")
        else:
            print(f"FAIL: {world}/{fname}")
        if idx < len(picks) - 1:
            time.sleep(2.5)

# Write BEST_PICKS.md
md = "# Best Seed Image Picks\n\n"
md += "For each world, ~12 images selected from museum API search results.\n"
md += "Preferring Wikimedia Commons (public domain), Cleveland Museum of Art (CC0), and Metropolitan Museum of Art.\n\n"

cw = None
for world, fname, url, concept, desc in results:
    if world != cw:
        md += f"\n---\n## {world.replace('_', ' ').title()}\n\n"
        cw = world
    md += f"- **{fname}**\n  - URL: {url}\n  - Concept: {concept}\n  - Use for: {desc}\n\n"

Path(os.path.join(BASE, "BEST_PICKS.md")).write_text(md)
print(f"\nDone. {len(results)} images downloaded. BEST_PICKS.md written.")
