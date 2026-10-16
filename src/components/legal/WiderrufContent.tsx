import { site } from "@/config/site";

/**
 * Widerrufsbelehrung – Entwurf nach dem gesetzlichen Muster (Anlage 1 zu Art. 246a EGBGB).
 *
 * Nur Deutsch und im Code statt in messages: Rechtstext, versioniert, nicht doppelt zu übersetzen.
 * Der Hinweis auf die vorzeitige Leistungsaufnahme (§ 356 Abs. 4 BGB) ist für dieses Geschäftsmodell
 * wichtig, weil Projekte oft binnen der Widerrufsfrist starten. Vor dem Livegang juristisch prüfen lassen.
 */
export function WiderrufContent() {
  return (
    <>
      <p className="rounded-xl border border-ink/10 bg-ink/5 p-4 text-sm">
        Diese Belehrung richtet sich an Verbraucher (§ 13 BGB). Unternehmer (§ 14 BGB) haben kein gesetzliches
        Widerrufsrecht; für sie gelten die Kündigungsregeln in den AGB. Entwurf – juristische Prüfung steht aus.
      </p>

      <h2>Widerrufsrecht</h2>
      <p>
        Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die
        Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
      </p>
      <p>
        Um dein Widerrufsrecht auszuüben, musst du uns
      </p>
      <p>
        {site.legalName}
        <br />
        {site.address.street}, {site.address.postalCode} {site.address.city}
        <br />
        E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a> · Telefon: <a href={site.phoneHref}>{site.phone}</a>
      </p>
      <p>
        mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über deinen
        Entschluss, diesen Vertrag zu widerrufen, informieren. Du kannst dafür das unten stehende Muster-Formular
        verwenden, das aber nicht vorgeschrieben ist. Zur Wahrung der Frist genügt es, dass du die Mitteilung über
        die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absendest.
      </p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten haben, unverzüglich
        und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über deinen Widerruf
        bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du bei der
        ursprünglichen Transaktion eingesetzt hast; es sei denn, mit dir wurde ausdrücklich etwas anderes vereinbart.
        In keinem Fall werden dir wegen dieser Rückzahlung Entgelte berechnet.
      </p>
      <p>
        Hast du verlangt, dass die Leistung während der Widerrufsfrist beginnt, so schuldest du uns einen
        angemessenen Betrag, der dem Anteil der bis zu dem Zeitpunkt, zu dem du uns über die Ausübung des
        Widerrufsrechts unterrichtest, bereits erbrachten Leistungen im Vergleich zum Gesamtumfang der im Vertrag
        vorgesehenen Leistungen entspricht (§ 357 Abs. 8 BGB).
      </p>

      <h2>Vorzeitiger Beginn der Leistung</h2>
      <p>
        Wir beginnen mit der Leistung in der Regel erst nach Ablauf der Widerrufsfrist. Verlangst du ausdrücklich,
        dass wir vor Ablauf der Widerrufsfrist mit der Leistung beginnen, hast du den vorstehenden Anteil zu zahlen
        und dein Widerrufsrecht erlischt, sobald wir die Leistung vollständig erbracht haben (§ 356 Abs. 4 BGB).
        Dies setzt voraus, dass wir dich vor Beginn ausdrücklich darüber informiert und deine Zustimmung eingeholt
        haben und wir die Bestätigung nach Art. 246a § 4 Abs. 2 EGBGB dokumentiert haben.
      </p>

      <h2>Erlöschen des Widerrufsrechts</h2>
      <p>
        Bei einem Vertrag über die Lieferung digitaler Inhalte, die nicht auf einem körperlichen Datenträger
        geliefert werden, erlischt das Widerrufsrecht, wenn wir die Ausführung begonnen haben, nachdem du
        ausdrücklich zugestimmt hast, dass wir mit der Ausführung vor Ablauf der Widerrufsfrist beginnen, und du
        deine Kenntnis davon bestätigt hast, dass du durch deine Zustimmung mit Beginn der Ausführung dein
        Widerrufsrecht verlierst (§ 356 Abs. 5 BGB).
      </p>

      <h2>Muster-Widerrufsformular</h2>
      <p className="rounded-xl border border-ink/15 p-4 text-sm">
        An {site.legalName}, {site.address.street}, {site.address.postalCode} {site.address.city},
        E-Mail: {site.email}
        <br />
        <br />
        Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden
        Waren (*)/die Erbringung der folgenden Dienstleistung (*):
        <br />
        <br />
        Bestellt am (*)/erhalten am (*):
        <br />
        <br />
        Name des/der Verbraucher(s):
        <br />
        <br />
        Anschrift des/der Verbraucher(s):
        <br />
        <br />
        Datum:
        <br />
        <br />
        Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):
        <br />
        <br />
        (*) Unzutreffendes streichen.
      </p>

      <h2>Rücksendekosten und Ausnahmen</h2>
      <p>
        Bei Verträgen über Dienstleistungen und digitale Inhalte fallen keine Rücksendekosten an. Für individuell
        angefertigte Waren und für Leistungen, die nicht in den Anwendungsbereich des gesetzlichen Widerrufsrechts
        fallen, gelten die gesetzlichen Ausnahmen (§ 312g Abs. 2 BGB).
      </p>

      <h2>Freiwillige Zufriedenheitszusage</h2>
      <p>
        Unabhängig vom gesetzlichen Widerrufsrecht gilt für Mietmodelle die im Angebot genannte Testzeit. Während
        dieser Zeit ist der Vertrag von dir ohne Angabe von Gründen zum Monatsende kündbar.
      </p>
    </>
  );
}
