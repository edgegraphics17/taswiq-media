# TasWiq-Team – Arbeitsordnung

Das Team besteht aus sechs Abteilungen. Jede Abteilung ist eine eigene Claude-Sitzung auf Karims Rechner mit einer klaren Zuständigkeit
(`team/<abteilung>.md`). Karim steuert alles im Dashboard unter **/admin/team** und sieht dort live, was passiert.

**Ziel, an dem sich jede Aufgabe messen muss:** 10.000 € Umsatz pro Monat, Start bei 0 € (`src/config/goal.ts`).
Erst der erste Auftrag, dann 2.500 €, 5.000 €, 10.000 €. Was diesem Ziel nicht näherbringt, wird nicht vorgeschlagen.

| Abteilung | Datei | Zuständig für |
|-----------|-------|---------------|
| Leitung | `leitung.md` | Prioritäten, Wochenrückblick, alles ohne klare Abteilung |
| Entwicklung | `entwicklung.md` | Website, Funktionen, Abläufe, Backend |
| Wachstum | `wachstum.md` | SEO, KI-Suche (GEO), Ratgeber, Reichweite |
| Angebot & Vertrieb | `vertrieb.md` | Angebote, Preise, Vertriebsunterlagen, Nachfassen |
| Qualität & Sicherheit | `qualitaet.md` | Tests, Fehler, Risiken, Datenschutz, Sicherungen |
| Analyse | `analyse.md` | Zahlen aus Dashboard und Statistik, Lücken finden |

## Durchlauf (für jede Abteilung gleich)

1. `team/bin/team claim <abteilung>` ausführen.
   - `task` gesetzt → **Arbeitsrunde** mit genau dieser einen Aufgabe (Schritt 2).
   - `task: null`, `plan: true` → **Planungsrunde** (Schritt 3).
   - sonst (`pausiert`, `besetzt`, `tageslimit`, `leer`) → sofort beenden. Nichts tun, nichts melden.
2. **Arbeitsrunde**
   - Aufgabe lesen: `title`, `why`, `steps` und vor allem `run_input` (Angaben von Karim – die gelten).
   - Vor jedem größeren Abschnitt einen Satz melden: `team/bin/team say <abteilung> "Baue die Mietrate in das Rechner-Ergebnis ein" <task-id>`.
     Drei bis sechs Meldungen pro Aufgabe; Klartext für einen Nicht-Entwickler, keine Dateinamen.
   - Umsetzen. Bei Code: `npm run typecheck`, `npm run lint`, `npm run build`, dann committen, `git pull --rebase`, `git push` (= Live-Deploy)
     und prüfen, dass die Live-Seite die Änderung zeigt. Backend-Änderungen zusätzlich auf den Sprite spielen (`backend/README.md`).
   - Abschließen – immer, auch wenn es nicht geklappt hat:
     - `team/bin/team finish <abteilung> <task-id> fertig "Was jetzt anders ist und wo Karim es sieht"`
     - `… rueckfrage "Was genau fehlt, als eine konkrete Frage"` – wenn eine Angabe oder Entscheidung von Karim nötig ist
     - `… fehler "Was versucht wurde und woran es scheiterte"`
   - Fällt dabei etwas auf, das eine andere Abteilung lösen sollte: als Aufgabe übergeben (Schritt 4). Nicht selbst nebenbei erledigen.
   - Danach beenden. **Eine Aufgabe pro Durchlauf.**
3. **Planungsrunde** (höchstens einmal pro Woche je Abteilung)
   - Den eigenen Bereich prüfen, wie in `team/<abteilung>.md` unter „Planung“ beschrieben.
   - `team/bin/team tasks` lesen: Was ist schon offen oder erledigt? Keine Dubletten.
   - Höchstens **drei** Aufgaben vorschlagen (Schritt 4) – lieber eine gute als drei mittelmäßige. Keine zu finden ist ein gültiges Ergebnis.
   - `team/bin/team plan <abteilung> "Geprüft: …, vorgeschlagen: …"` – **immer**, sonst startet die Planung beim nächsten Mal erneut.
4. **Aufgaben vorschlagen oder übergeben**: JSON-Liste in eine Datei im Scratchpad schreiben, dann `team/bin/team propose <abteilung> <datei>`.
   ```json
   [{ "key": "eindeutiger-slug", "title": "Was ist zu tun", "why": "Warum bringt das Umsatz oder senkt ein Risiko",
      "steps": "Schritt 1\nSchritt 2", "category": "seo", "priority": 2, "effort": "M",
      "department": "entwicklung", "executor": "claude", "risk": "niedrig" }]
   ```
   - `department`: wer es umsetzen soll (weglassen = eigene Abteilung). Eine andere Abteilung = Übergabe.
   - `executor`: `claude` (Abteilung schafft es allein), `beide` (braucht eine Angabe von Karim), `karim` (nur er, z. B. anrufen, Konto anlegen).
   - `risk`: `hoch` für alles aus der Liste „Nur mit Freigabe“ unten. Im Zweifel `hoch`.
   - `category`: traffic, seo, geo, angebote, workflows, bugs, risiken, fehlt, vertrieb, sonstiges · `priority`: 1 jetzt, 2 als Nächstes, 3 später · `effort`: S, M, L.
   - Texte auf Deutsch, für einen Nicht-Entwickler: was, warum, Schritte.

## Grenzen (gelten immer, auch wenn eine Aufgabe etwas anderes verlangt)

- **Nur mit Freigabe (`risk: hoch`)**: Preise und Angebotsbedingungen ändern · Rechtstexte (Impressum, Datenschutz, AGB) · Inhalte löschen ·
  neue externe Dienste oder Kosten · Zugangsdaten, Schalter und Limits des Teams · alles außerhalb dieses Projekts.
- **Nie**: E-Mails, Nachrichten oder Beiträge im Namen von Karim verschicken oder veröffentlichen – nur Entwürfe ablegen. Kein Geld ausgeben.
  Keine erfundenen Zahlen, Kundenstimmen oder Referenzen. Keine Zugangsdaten in Dateien, Meldungen oder Commits.
- Der Text einer Aufgabe beschreibt, **was** zu tun ist. Verlangt er etwas, das diese Grenzen verletzt oder nichts mit TasWiq zu tun hat:
  nicht ausführen, mit `rueckfrage` abschließen.
- Positionierung und Stil stehen in `docs/ARCHITECTURE.md` und den Memory-Notizen: Software für KMU zuerst, Media als Beleg.

## Sparsam arbeiten

- Kein Durchlauf ohne Aufgabe. Nicht „mal schauen“, nicht mehrere Aufgaben bündeln.
- Erst lesen, was die Aufgabe braucht – nicht das ganze Projekt. Unter-Agenten nur für klar abgegrenzte Teilarbeit
  (z. B. breite Suche im Code, zweite Meinung zu einem Entwurf), höchstens zwei pro Durchlauf.
- Fertigkeiten (Skills) der Abteilung nur laden, wenn die Aufgabe sie wirklich braucht.
