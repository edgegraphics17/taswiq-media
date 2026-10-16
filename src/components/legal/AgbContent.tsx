import { site } from "@/config/site";
import { rental, runningCosts } from "@/config/packages";

/**
 * AGB-Entwurf (nur Deutsch, deutschsprachiger Rechtstext).
 *
 * Bewusst als TSX und nicht in messages/{de,en}.json: Rechtstexte sollen versioniert im Code
 * liegen und nicht doppelt übersetzt werden – die englische Fassung zeigt über
 * LegalPage.bindingNote ohnehin an, dass nur die deutsche Version verbindlich ist.
 *
 * Zahlen kommen aus src/config/packages.ts (rental, runningCosts), damit AGB und
 * Preisrechner nicht auseinanderlaufen. Vor dem Livegang juristisch prüfen lassen.
 */
export function AgbContent() {
  return (
    <>
      <p className="rounded-xl border border-ink/10 bg-ink/5 p-4 text-sm">
        Dieser Entwurf ist aus dem tatsächlichen Angebot abgeleitet: Mietmodell mit {rental.trialMonths} Monaten
        Testzeit und anschließend {rental.minTermMonths} Monaten Mindestlaufzeit, {rental.setupFee} € Anzahlung,
        laufender Betrieb ab {runningCosts.hosting} €/Monat. Offene kaufmännische Punkte sind mit [[ ]] markiert.
      </p>

      <h2>§ 1 Geltungsbereich</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen {site.legalName}, Anschrift
        siehe Impressum (nachfolgend „wir“ oder „Auftragnehmer“), und unseren Auftraggebern (nachfolgend „Kunde“)
        über die Entwicklung, Anpassung, Bereitstellung und den Betrieb von Software, Webanwendungen und Websites.
      </p>
      <p>
        Abweichende, entgegenstehende oder ergänzende Bedingungen des Kunden werden nur Vertragsbestandteil, wenn wir
        ihrer Geltung ausdrücklich schriftlich zugestimmt haben. Für Verbraucher im Sinne des § 13 BGB gilt zusätzlich
        die Widerrufsbelehrung; für Unternehmer im Sinne des § 14 BGB gelten die Regelungen dieser AGB ohne das
        gesetzliche Widerrufsrecht.
      </p>

      <h2>§ 2 Angebot und Vertragsschluss</h2>
      <p>
        Angebote, Preisrechner-Ergebnisse und Kostenschätzungen auf dieser Website sind unverbindliche Richtwerte und
        keine verbindlichen Angebote. Der Vertrag kommt erst durch unsere schriftliche Auftragsbestätigung oder durch
        Beginn der Leistungserbringung mit Wissen des Kunden zustande. Der im Preisrechner angezeigte Rahmen
        (± Toleranz um die berechnete Summe) ist eine Orientierung; der verbindliche Preis steht im individuellen Angebot.
      </p>
      <p>
        Eingaben im Preisrechner, im Kontaktformular und im Erstgespräch dienen der Vorbereitung des Angebots. Ein
        Anspruch auf Abschluss eines Vertrages besteht nicht.
      </p>

      <h2>§ 3 Leistungsumfang</h2>
      <p>
        Art, Umfang und Funktionsstand der Leistung ergeben sich aus dem jeweiligen Angebot bzw. der
        Leistungsbeschreibung (Pakete, Module, Funktionen) und dem darin festgehaltenen Stand. Nicht ausdrücklich
        vereinbarte Leistungen sind nicht geschuldet. Funktionswünsche, die über den vereinbarten Umfang hinausgehen,
        werden als gesonderter Auftrag beauftragt und vergütet.
      </p>
      <p>
        Wir erbringen Entwicklungsleistungen nach dem anerkannten Stand der Technik. Ein bestimmter kommerzieller
        Erfolg (z. B. eine bestimmte Anzahl an Bestellungen, Besucherzahlen, Platzierungen bei Suchmaschinen oder in
        KI-Systemen) wird nicht geschuldet und nicht zugesagt.
      </p>

      <h2>§ 4 Mitwirkung des Kunden</h2>
      <p>
        Der Kunde stellt unverzüglich alle für die Durchführung erforderlichen Informationen, Inhalte, Texte, Bilder,
        Logos, Zugänge und Ansprechpartner bereit und benennt eine entscheidungsbefugte Person. Er hat die
        Mitwirkungspflichten des § 642 BGB zu erfüllen.
      </p>
      <p>
        Der Kunde sichert zu, dass die von ihm bereitgestellten Inhalte und Materialien frei von Rechten Dritter sind
        und er zur Verwendung berechtigt ist. Er stellt uns von Ansprüchen Dritter aus der Verletzung solcher Rechte frei.
      </p>
      <p>
        Verzögerungen, die auf fehlender oder verspäteter Mitwirkung beruhen, verlängern vereinbarte Termine
        angemessen. Aufwendungen, die dadurch wiederholt entstehen (z. B. erneute Abstimmungs- oder
        Einrichtungstermine), können nach Aufwand berechnet werden.
      </p>

      <h2>§ 5 Termine, Prüfung und Abnahme</h2>
      <p>
        Termine sind nur verbindlich, wenn sie ausdrücklich als verbindlich vereinbart wurden. Nach Fertigstellung
        eines Meilensteins oder der Gesamtleistung stellen wir die Lieferung in einer Testumgebung bereit.
      </p>
      <p>
        Der Kunde prüft die Leistung innerhalb von vierzehn (14) Kalendertagen nach Bereitstellung und zeigt Mängel
        konkret und nachvollziehbar an. Erklärt er innerhalb dieser Frist nichts oder nimmt er die Leistung in Betrieb
        (insbesondere durch Livegang, Veröffentlichung oder Abruf über die produktive Adresse), gilt sie als abgenommen.
        Die Abnahme kann nicht wegen unwesentlicher Mängel verweigert werden.
      </p>

      <h2>§ 6 Preise und Zahlung</h2>
      <p>
        Es gelten die Preise des individuellen Angebots. Alle Preise sind Endpreise. Als Kleinunternehmer im Sinne des
        § 19 UStG berechnen wir keine Umsatzsteuer; diese wird auf der Rechnung nicht ausgewiesen.
      </p>
      <p>
        Einmalige Projektpreise werden – soweit nicht anders vereinbart – zu einem Drittel bei Auftragserteilung, zu
        einem Drittel nach Zwischenabnahme und zu einem Drittel nach Abnahme fällig. Laufende Entgelte
        (Betrieb, Support, Weiterentwicklung) werden monatlich im Voraus über die im Angebot genannte Zahlungsart
        eingezogen. Rechnungen sind innerhalb von vierzehn (14) Kalendertagen ohne Abzug fällig.
      </p>
      <p>
        Gerät der Kunde mit zwei Monatsraten oder einem Betrag von mehr als 200 € in Verzug, können wir laufende
        Leistungen nach Ankündigung aussetzen und den Zugang bis zum Zahlungseingang sperren. Weitergehende
        gesetzliche Rechte bleiben unberührt.
      </p>

      <h2>§ 7 Nutzungsrechte und Quellcode</h2>
      <p>
        Nach vollständiger Bezahlung des einmaligen Projektpreises erhält der Kunde ein unbefristetes, zeitlich und
        räumlich unbeschränktes Nutzungsrecht an der individualisierten Lösung im vereinbarten Umfang. Bei
        Mietvarianten (siehe § 8) geht das Nutzungsrecht in diesem Umfang nach vollständiger Bezahlung der
        Raten über [[ vollständiger Kaufpreis bzw. vereinbarter Restbetrag ]] über.
      </p>
      <p>
        Auf Wunsch übergeben wir den Quellcode der individualisierten Bestandteile und eine Einweisung in die
        Inbetriebnahme. Von Dritten zugekaufte Komponenten, Werkzeuge, Bibliotheken und unsere eigenen
        wiederverwendbaren Grundlagen (Basisgerüste, Design-Systeme, interne Werkzeuge, Entwicklungs-Know-how)
        bleiben lizenzabhängig bzw. unser Eigentum; für sie wird das jeweils erforderliche Nutzungsrecht eingeräumt.
      </p>
      <p>
        Wir dürfen Namen und Logo des Kunden zur Referenz nennen, sofern diese Website und deren Marketingmaterial
        hiervon umfasst sind; vertrauliche Inhalte bleiben verschlossen.
      </p>

      <h2>§ 8 Mietmodell, Testzeit, Laufzeit und Kündigung</h2>
      <p>
        Statt eines Einmalpreises kann eine Lösung im Mietmodell bezogen werden. Die Miete umfasst den vereinbarten
        Leistungsumfang sowie Hosting, Wartung, Support und Updates, wie im jeweiligen Angebot ausgewiesen
        (laufender Betrieb ab {runningCosts.hosting} €/Monat, Betrieb &amp; Support ab {runningCosts.betrieb} €/Monat).
        Die im Preisrechner für Laufzeit und Kündigung genannten Werte sind Richtwerte und werden im Angebot verbindlich.
      </p>
      <p>
        Die ersten {rental.trialMonths} Monate gelten als Testzeit; in dieser Zeit ist die Miete monatlich kündbar.
        Anschließend besteht eine Mindestlaufzeit von {rental.minTermMonths} Monaten. Nach Ablauf der Mindestlaufzeit
        verlängert sich der Vertrag auf unbestimmte Zeit und ist mit einer Frist von [[ drei ]] Monaten zum
        Monatsende kündbar, sofern im Angebot nichts anderes steht.
      </p>
      <p>
        Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt für beide Seiten unberührt. Eine
        Kündigung bedarf der Textform. Unterlässt der Kunde die Mitwirkung nach § 4 auch nach Fristsetzung und
        verhindert dadurch die Leistungserbringung dauerhaft, bleibt die Miete für die Mindestlaufzeit geschuldet.
      </p>
      <p>
        Eine Anrechnung gezahlter Mieten auf einen späteren Kauf erfolgt
        [[ nur, wenn dies im Angebot ausdrücklich vereinbart ist ]].
      </p>

      <h2>§ 9 Hosting, Verfügbarkeit und Sicherungen</h2>
      <p>
        Wir betreiben die Lösung auf einer von uns ausgewählten Infrastruktur (derzeit Fly.io mit Speicherung in der
        EU). Angestrebt wird eine Verfügbarkeit von 99,5 % im Jahresmittel, ausgenommen geplante
        Wartungsfenster, Störungen bei Vorleistern, höhere Gewalt und Eingriffe des Kunden. Eine jederzeitige
        unterbrechungsfreie Verfügbarkeit wird nicht geschuldet.
      </p>
      <p>
        Sicherungskopien erstellen wir regelmäßig im Rahmen des laufenden Betriebs. Der Kunde bleibt verpflichtet,
        für ihn geschäftskritische Daten zusätzlich selbst zu sichern, wenn das im Angebot nicht anders geregelt ist.
      </p>

      <h2>§ 10 Gewährleistung</h2>
      <p>
        Wir beseitigen Mängel, die auf unserem Verschulden beruhen und den vertraglich vereinbarten Funktionsumfang
        betreffen, innerhalb angemessener Frist; die Wahl zwischen Nachbesserung und Neuherstellung liegt uns. Bei
        Fehlschlag der Nacherfüllung kann der Kunde mindern oder zurücktreten.
      </p>
      <p>
        Kein Mangel liegt vor bei Störungen durch Dritte (Hosting-, Zahlungs- oder Messaging-Anbieter, Plattformen
        Dritter, Schnittstellenpartner), bei Änderungen des Kunden an der Lösung, bei nicht freigegebenen
        Konfigurationen sowie bei Eingriffen in Code, Datenbank oder Infrastruktur durch den Kunden oder Dritte.
      </p>
      <p>
        Bei Website- und Softwareprojekten liegt die Gewährleistungsfrist für Unternehmer bei zwölf (12) Monaten
        nach Abnahme; für Verbraucher gelten die gesetzlichen Fristen. Für laufende Leistungen gilt die Gewährleistung
        für die Dauer des jeweiligen Abrechnungsmonats.
      </p>

      <h2>§ 11 Haftung</h2>
      <p>
        Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei der Verletzung von Leben, Körper oder
        Gesundheit sowie nach den Vorschriften des Produkthaftungsgesetzes. Bei einfacher Fahrlässigkeit haften wir
        nur bei Verletzung einer wesentlichen Vertragspflicht und begrenzt auf den vertragstypisch
        vorhersehbaren Schaden, höchstens auf die Summe der vom Kunden im letzten Vertragsjahr gezahlten Entgelte.
      </p>
      <p>
        Die Haftung für Datenverlust ist auf den Aufwand beschränkt, der bei ordnungsgemäßer
        Datensicherung zur Wiederherstellung erforderlich gewesen wäre. Eine Haftung für mittelbare Schäden,
        entgangenen Gewinn und Ansprüche Dritter ist – außerhalb der vorgenannten Fälle – ausgeschlossen.
      </p>

      <h2>§ 12 Datenschutz und Vertraulichkeit</h2>
      <p>
        Wir verarbeiten personenbezogene Daten ausschließlich nach den geltenden Vorschriften. Soweit wir im Auftrag
        des Kunden personenbezogene Daten von dessen Kunden oder Mitarbeitern verarbeiten, schließen die Parteien
        einen Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO. Einzelheiten regelt die Datenschutzerklärung.
      </p>
      <p>
        Beide Parteien behandeln die im Rahmen der Zusammenarbeit erlangten vertraulichen Informationen der jeweils
        anderen Seite vertraulich und verwenden sie ausschließlich zur Vertragsdurchführung. Diese Verpflichtung
        besteht auch nach Vertragsende fort.
      </p>

      <h2>§ 13 Änderungen dieser AGB</h2>
      <p>
        Wir behalten uns vor, diese AGB mit Wirkung für die Zukunft anzupassen, wenn sich Rechtslage, Technik oder
        Leistungsumfang wesentlich ändern. Änderungen teilen wir dem Kunden mindestens sechs Wochen vor Wirksamwerden
        in Textform mit. Widerspricht er nicht innerhalb von vier Wochen, gelten die geänderten Bedingungen als
        angenommen. Auf die Bedeutung dieser Frist weisen wir in der Mitteilung gesondert hin. Für laufende
        Projekte gilt die bei Auftragserteilung gültige Fassung.
      </p>

      <h2>§ 14 Schlussbestimmungen</h2>
      <p>
        Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Ist der Kunde Kaufmann, juristische Person des
        öffentlichen Rechts oder ohne allgemeinen Gerichtsstand im Inland, ist ausschließlicher Gerichtsstand
        Frankfurt am Main. Für Verbraucher gelten die gesetzlichen Gerichtsstände.
      </p>
      <p>
        Sollten einzelne Bestimmungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen
        unberührt. An die Stelle der unwirksamen Regelung tritt die gesetzliche Bestimmung.
      </p>
      <p className="text-sm text-muted">
        Stand: {new Date().getFullYear()}. Entwurf – juristische Prüfung steht aus.
      </p>
    </>
  );
}
