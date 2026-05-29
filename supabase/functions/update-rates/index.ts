// supabase/functions/update-rates/index.ts
// Deploy: supabase functions deploy update-rates
// Schedule: via Supabase Cron (ou pg_cron) — ex. tous les 1er du mois

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Taux officiels — mis à jour ici manuellement ou via scraping Banque de France
const OFFICIAL_RATES = {
  livret_a: 2.4,
  ldds: 2.4,
  lep: 3.5,
  livret_jeune: 2.4,
  cel: 2.0,
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Vérifier l'Authorization header (Supabase Service Key)
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Optionnel : scraper les taux depuis la Banque de France
    // const response = await fetch('https://www.banque-france.fr/...')
    // const rates = await parseRates(response)

    // Pour l'instant, retourner les taux officiels en dur
    const updatedAt = new Date().toISOString()
    const rates = Object.entries(OFFICIAL_RATES).map(([id, rate]) => ({
      id,
      rate,
      updatedAt,
    }))

    return new Response(
      JSON.stringify({ success: true, rates, updatedAt }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
