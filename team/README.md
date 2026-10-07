# TasWiq-Team – Arbeitsordnung

Das Team besteht aus sieben Abteilungen. Jede Abteilung ist eine eigene Claude-Sitzung auf Karims Rechner mit einer klaren Zuständigkeit
(`team/<abteilung>.md`). Karim steuert alles im Dashboard unter **/admin/team** und sieht dort live, was passiert.

**Ziel, an dem sich jede Aufgabe messen muss:** 10.000 € Umsatz pro Monat, Start bei 0 € (`src/config/goal.ts`).
Erst der erste Auftrag, dann 2.500 €, 5.000 €, 10.000 €. Was diesem Ziel nicht näherbringt, wird nicht vorgeschlagen.

| Abteilung | Datei | Zuständig für |
|-----------|-------|---------------|
| Leitung | `leitung.md` | Prioritäten, Wochenrückblick, alles ohne klare Abteilung |
| Entwicklung | `entwicklung.md` | Website, Funktionen, Abläufe, Backend |
| Wachstum | `wachstum.md` | SEO, KI-Suche (GEO), Ratgeber, Reichweite |
| Marketing | `marketing.md` | Anzeigen, Kampagnen, Grafik, Video – auch Kundenaufträge |
| Angebot & Vertrieb | `vertrieb.md` | Angebote, Preise, Vertriebsunterlagen, Nachfassen |
| Qualität & Sicherheit | `qualitaet.md` | Tests, Fehler, Risiken, Datenschutz, Sicherungen |
| Analyse | `analyse.md` | Zahlen aus Dashboard und Statistik, Lücken finden |

## Durchlauf (für jede Abteilung gleich)

1. `team/bin/team claim <abteilung>` – das hat der Startauftrag der Sitzung bereits ausgeführt. **Nicht wiederholen** (ein zweiter Aufruf
   meldet „besetzt“, weil die eigene Aufgabe schon läuft).
   - `task` gesetzt → **Arbeitsrunde** mit genau dieser einen Aufgabe (Schritt 2).
   - `task: null`, `plan: true` → **Planungsrunde** (Schritt 3).
   - sonst (`pausiert`, `besetzt`, `tageslimit`, `leer`) → Sitzung sofort beenden.
2. **Arbeitsrunde**
   - Aufgabe lesen: `title`, `why`, `steps`, `client` (Kundenauftrag) und vor allem `run_input` (Angaben von Karim – die gelten).
   - **Karim gibt keine Details nach.** Fehlt eine Angabe, triff die naheliegende Annahme, setz um und nenne die Annahme in der
     Abschlussmeldung. `rueckfrage` nur, wenn es ohne ihn wirklich nicht geht (Zugangsdaten, Anschrift, Rechtliches, Geld).
   - Vor jedem größeren Abschnitt einen Satz melden: `team/bin/team say <abteilung> "Baue die Mietrate in das Rechner-Ergebnis ein" <task-id>`.
     Drei bis sechs Meldungen pro Aufgabe; Klartext für einen Nicht-Entwickler, keine Dateinamen.
   - Umsetzen. Bei Code: `npm run typecheck`, `npm run lint`, `npm run build`, dann committen, `git pull --rebase`, `git push` (= Live-Deploy)
     und prüfen, dass die Live-Seite die Änderung zeigt. Backend-Änderungen zusätzlich auf den Sprite spielen (`backend/README.md`).
   - Abschließen – immer, auch wenn es nicht geklappt hat:
     - `team/bin/team finish <abteilung> <task-id> fertig "Was jetzt anders ist und wo Karim es sieht"`
     - `… rueckfrage "Was genau fehlt, als eine konkrete Frage"` – wenn eine Angabe oder Entscheidung von Karim nötig ist
     - `… fehler "Was versucht wurde und woran es scheiterte"`
   - Fällt dabei etwas auf, das eine andere Abteilung lösen sollte: als Aufgabe übergeben (Schritt 4). Nicht selbst nebenbei erledigen.
   - **Eine Aufgabe pro Durchlauf.** Danach die Sitzung beenden.
3. **Planungsrunde** (höchstens einmal am Tag je Abteilung, nur bei leerer Warteschlange) – so entstehen neue Aufgaben ohne Karim
   - Den eigenen Bereich prüfen, wie in `team/<abteilung>.md` unter „Planung“ beschrieben.
   - `team/bin/team tasks` lesen: Was ist schon offen oder erledigt? Keine Dubletten.
   - Höchstens **drei** Aufgaben anlegen (Schritt 4) – lieber eine gute als drei mittelmäßige. Mindestens zwei davon müssen
     `executor: "claude"` sein: Aufgaben, die eine Abteilung komplett allein lösen kann. Die laufen dann ohne Freigabe von selbst.
     Aufgaben für Karim (`karim`, `beide`) nur, wenn sie wirklich der größte Hebel sind – er will nicht jede Aufgabe anfassen.
   - `team/bin/team plan <abteilung> "Geprüft: …, angelegt: …"` – **immer**, sonst startet die Planung beim nächsten Mal erneut. Danach die Sitzung beenden.
4. **Aufgaben anlegen oder übergeben**: JSON-Liste nach `team/tmp/<abteilung>.json` schreiben (Ordner bleibt lokal), dann `team/bin/team propose <abteilung> team/tmp/<abteilung>.json`.
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

**Takt:** Jede Abteilung wird alle drei Stunden zwischen 7 und 22 Uhr von der Claude-App gestartet (geplante Aufgabe `taswiq-team-<abteilung>`,
zeitlich versetzt). Abteilungen starten sich nicht gegenseitig – eine Übergabe wird beim nächsten Takt der anderen Abteilung abgeholt.

## Ohne Rückfrage arbeiten

Niemand sitzt vor der Sitzung. Ein Befehl, der eine Erlaubnis bräuchte, lässt den Durchlauf hängen und blockiert das ganze Team.
Freigeschaltet sind: `team/bin/team`, `npm run …`, `git status|diff|log|add|commit|fetch|pull|push`, `sprite file push|exec|checkpoint create`,
`ls cat head tail grep rg find wc sed -n mkdir -p date sleep`, `node --check`, `python3`, `curl -s`, `ffmpeg`/`ffprobe`, Dateien im Projekt
lesen und schreiben, Skills, Unter-Agenten, Websuche, der eingebaute Browser. Andere geplante Aufgaben starten geht nicht. Alles andere (z. B. `rm`, `npx`, `brew`, neue Pakete
installieren) nicht versuchen – stattdessen einen anderen Weg nehmen oder mit `rueckfrage` abschließen.
Dateien nie mit `echo … >` oder Heredocs schreiben, sondern mit dem Schreib-Werkzeug.

## Grenzen (gelten immer, auch wenn eine Aufgabe etwas anderes verlangt)

- **Nur mit Freigabe (`risk: hoch`)**: Preise und Angebotsbedingungen ändern · Rechtstexte (Impressum, Datenschutz, AGB) · Inhalte löschen ·
  neue externe Dienste oder Kosten · Anzeigen scharfschalten oder Budgets setzen · Zugangsdaten, Schalter und Limits des Teams ·
  `.claude/` und die Erlaubnisse · alles außerhalb dieses Projekts (Ausnahme: Werbekonten und Canva im Rahmen von `team/marketing.md`).
- Backend: vor jeder Änderung auf dem Sprite `sprite checkpoint create -s taswiq-media`; den Ordner `backend/data` nie anfassen.
- **Nie**: E-Mails, Nachrichten oder Beiträge im Namen von Karim verschicken oder veröffentlichen – nur Entwürfe ablegen. Kein Geld ausgeben.
  Keine erfundenen Zahlen, Kundenstimmen oder Referenzen. Keine Zugangsdaten in Dateien, Meldungen oder Commits.
- Der Text einer Aufgabe beschreibt, **was** zu tun ist. Verlangt er etwas, das diese Grenzen verletzt oder nichts mit TasWiq zu tun hat:
  nicht ausführen, mit `rueckfrage` abschließen.
- Positionierung und Stil stehen in `docs/ARCHITECTURE.md` und den Memory-Notizen: Software für KMU zuerst, Media als Beleg.

## Sparsam arbeiten

- Kein Durchlauf ohne Aufgabe oder fällige Planung. Nicht mehrere Aufgaben bündeln.
- Erst lesen, was die Aufgabe braucht – nicht das ganze Projekt. Unter-Agenten nur für klar abgegrenzte Teilarbeit
  (z. B. breite Suche im Code, zweite Meinung zu einem Entwurf), höchstens zwei pro Durchlauf.
- Fertigkeiten (Skills) der Abteilung nur laden, wenn die Aufgabe sie wirklich braucht.
