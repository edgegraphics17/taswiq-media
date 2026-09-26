import { notFound } from "next/navigation";

/** Fängt unbekannte Pfade innerhalb einer Sprache ab → übersetzte 404-Seite */
export default function CatchAll() {
  notFound();
}
