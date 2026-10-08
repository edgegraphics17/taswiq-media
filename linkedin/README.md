# LinkedIn-Anbindung

Eigener MCP-Server über die offizielle LinkedIn-API. Claude Code startet ihn über `.mcp.json`; Zugangsdaten und Token liegen in `~/.config/taswiq-linkedin` und nie im Repo.

## Einrichten

1. Auf <https://www.linkedin.com/developers/apps> eine App anlegen (braucht eine Unternehmensseite als Inhaber).
2. Unter **Auth** die Weiterleitungsadresse `http://localhost:8765/callback` eintragen.
3. Unter **Products** freischalten:
   - *Sign In with LinkedIn using OpenID Connect* und *Share on LinkedIn* – sofort aktiv, reicht für Beiträge im eigenen Profil.
   - *Community Management API* – für Unternehmensseiten (Beiträge, Logo, Titelbild, Statistiken). LinkedIn prüft den Antrag und verlangt dafür eine eigene App ohne andere Produkte.
4. Anmelden:

```bash
node linkedin/login.mjs          # eigenes Profil
node linkedin/login.mjs seiten   # Unternehmensseiten (nach Freigabe der Community Management API)
node linkedin/login.mjs --neu    # andere App hinterlegen
```

Das Skript fragt einmalig Client ID und Client Secret ab und öffnet die Freigabeseite im Browser.

## Werkzeuge

| Werkzeug | Zweck |
|---|---|
| `linkedin_status` | Verbindung, Rechte, Laufzeit des Tokens |
| `linkedin_list_pages` | Verwaltete Unternehmensseiten |
| `linkedin_create_post` | Beitrag mit Text, Bildern oder Link (Profil oder Seite) |
| `linkedin_list_posts` / `linkedin_delete_post` | Beiträge lesen und löschen |
| `linkedin_post_stats` / `linkedin_page_stats` | Auswertung von Beiträgen und Seiten |
| `linkedin_update_page` | Logo, Titelbild und weitere Seitenfelder |
| `linkedin_api_request` | Freier API-Aufruf für alles Übrige |

## Geplante Beiträge

`node linkedin/publish.mjs` veröffentlicht den fälligen Beitrag aus `kunden/taswiq/linkedin/beitraege.json` – nur Einträge mit Status `freigegeben`, höchstens einen pro Lauf. `--liste` zeigt die Warteschlange. Redaktionsplan und Seitentexte liegen im selben Ordner.

## Grenzen

- Unternehmensseiten **anlegen** kann die API nicht – das geht nur auf linkedin.com.
- Ohne Community Management API läuft das Token nach 60 Tagen ab, dann erneut anmelden.
- Die API-Version steht in `lib.mjs` (`API_VERSION`) und lässt sich über `LINKEDIN_VERSION` überschreiben.
