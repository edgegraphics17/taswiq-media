-- ════════════════════════════════════════════════════════════════════
--  Software-Fokus (2026-09-27)
--  TasWiq positioniert sich auf Software & Systeme für KMU und Mittelstand.
--   - Branchen-Obergruppen für die neuen Landingpages & den Funnel
--   - Budget-Stufen für Software-Projekte (alte Stufen bleiben für Bestands-Leads gültig)
--   - Lead-Quellen Blog & Portfolio
--  Enum-Werte lassen sich nur ergänzen, nicht entfernen – daher rein additiv.
-- ════════════════════════════════════════════════════════════════════

alter type public.industry add value if not exists 'immobilien';
alter type public.industry add value if not exists 'automotive';
alter type public.industry add value if not exists 'kanzlei';
alter type public.industry add value if not exists 'beauty';
alter type public.industry add value if not exists 'handwerk';

alter type public.budget_bracket add value if not exists 'unter_5k';
alter type public.budget_bracket add value if not exists '5k_15k';
alter type public.budget_bracket add value if not exists '15k_40k';
alter type public.budget_bracket add value if not exists 'ueber_40k';

alter type public.lead_source add value if not exists 'blog';
alter type public.lead_source add value if not exists 'portfolio';

-- Alte Rechner-Optionen (Video/Foto/Social-Abo) aus der Preistabelle ausblenden,
-- die neuen legt `npm run db:seed-sql` + supabase/seed.sql an.
update public.services set is_active = false
where group_id in ('videoUmfang', 'videoExtras', 'fotoUmfang', 'fotoExtras', 'webArt', 'webExtras', 'contentAbo', 'hosting', 'kiBetrieb');
