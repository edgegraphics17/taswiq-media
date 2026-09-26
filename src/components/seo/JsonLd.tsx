/** Rendert strukturierte Daten. `<` wird escaped, damit kein Inhalt das Script-Tag schließen kann. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
