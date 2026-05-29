// Taux d'épargne réels français (mis à jour automatiquement via Edge Function)
// Sources: Banque de France, BPCE, Caisse d'Épargne, BNP, Crédit Agricole, etc.

export const SAVINGS_ACCOUNTS = [
  // ── Livrets réglementés ────────────────────────────────
  {
    id: 'livret_a',
    name: 'Livret A',
    institution: 'Toutes banques',
    category: 'regulated',
    rate: 2.4, // % net, fixé par l'État
    maxAmount: 22950,
    taxFree: true,
    guaranteed: true,
    updateDate: '2025-02-01',
    description: "Taux fixé par l'État, net d'impôts et de prélèvements sociaux",
    color: '#00E5A0',
    icon: '🏛️',
  },
  {
    id: 'ldds',
    name: 'LDDS',
    institution: 'Toutes banques',
    category: 'regulated',
    rate: 2.4,
    maxAmount: 12000,
    taxFree: true,
    guaranteed: true,
    updateDate: '2025-02-01',
    description: 'Livret Développement Durable et Solidaire, même taux que le Livret A',
    color: '#00E5A0',
    icon: '🌿',
  },
  {
    id: 'lep',
    name: 'LEP',
    institution: 'Toutes banques',
    category: 'regulated',
    rate: 3.5,
    maxAmount: 10000,
    taxFree: true,
    guaranteed: true,
    updateDate: '2025-02-01',
    description: 'Livret Épargne Populaire — sous conditions de revenus',
    color: '#4D9EFF',
    icon: '⭐',
  },
  {
    id: 'livret_jeune',
    name: 'Livret Jeune',
    institution: 'Diverses banques',
    category: 'regulated',
    rate: 2.4, // minimum légal, certaines banques offrent plus
    maxAmount: 1600,
    taxFree: true,
    guaranteed: true,
    updateDate: '2025-02-01',
    description: 'Pour les 12-25 ans — taux min. = Livret A',
    color: '#A78BFA',
    icon: '🎓',
  },
  {
    id: 'cel',
    name: 'CEL',
    institution: 'Toutes banques',
    category: 'regulated',
    rate: 2.0,
    maxAmount: 15300,
    taxFree: false,
    guaranteed: true,
    updateDate: '2025-02-01',
    description: 'Compte Épargne Logement — droits à prêt immobilier',
    color: '#FFB547',
    icon: '🏠',
  },

  // ── Livrets bancaires (imposables) ────────────────────
  {
    id: 'bnp_livret',
    name: 'Livret BNP',
    institution: 'BNP Paribas',
    category: 'bank',
    rate: 1.0,
    maxAmount: null,
    taxFree: false,
    guaranteed: true,
    updateDate: '2025-01-01',
    description: 'Taux de base, soumis à la flat tax 30%',
    color: '#22C55E',
    icon: '🏦',
  },
  {
    id: 'sg_livret',
    name: 'Livret Société Générale',
    institution: 'Société Générale',
    category: 'bank',
    rate: 0.5,
    maxAmount: null,
    taxFree: false,
    guaranteed: true,
    updateDate: '2025-01-01',
    description: 'Taux standard, soumis à la flat tax 30%',
    color: '#EF4444',
    icon: '🏦',
  },
  {
    id: 'boursorama_livret',
    name: 'Livret Boursorama',
    institution: 'Boursorama Banque',
    category: 'bank',
    rate: 2.5, // promo régulières
    maxAmount: null,
    taxFree: false,
    guaranteed: true,
    updateDate: '2025-01-01',
    description: 'Taux promotionnel fréquent — vérifier le taux en vigueur',
    color: '#0EA5E9',
    icon: '💻',
  },
  {
    id: 'fortuneo_livret',
    name: 'Livret Fortuneo',
    institution: 'Fortuneo',
    category: 'bank',
    rate: 2.3,
    maxAmount: null,
    taxFree: false,
    guaranteed: true,
    updateDate: '2025-01-01',
    description: 'Banque en ligne — taux compétitif',
    color: '#F97316',
    icon: '💻',
  },
  {
    id: 'hello_livret',
    name: 'Hello Livret',
    institution: 'Hello bank!',
    category: 'bank',
    rate: 1.5,
    maxAmount: null,
    taxFree: false,
    guaranteed: true,
    updateDate: '2025-01-01',
    description: 'Filiale de BNP Paribas, banque 100% mobile',
    color: '#7C3AED',
    icon: '📱',
  },

  // ── Super-livrets & Fintechs ────────────────────────────
  {
    id: 'cashbee',
    name: 'Cashbee+',
    institution: 'Cashbee / My Money Bank',
    category: 'fintech',
    rate: 3.5, // taux boosté 4 mois
    maxAmount: 500000,
    taxFree: false,
    guaranteed: true,
    updateDate: '2025-01-01',
    description: 'Taux boosté les premiers mois, garanti par My Money Bank (filiale groupe Crédit Mutuel)',
    color: '#EC4899',
    icon: '🚀',
  },
  {
    id: 'ramify_livret',
    name: 'Livret Ramify',
    institution: 'Ramify / Crédit Mutuel Arkéa',
    category: 'fintech',
    rate: 3.0,
    maxAmount: 250000,
    taxFree: false,
    guaranteed: true,
    updateDate: '2025-01-01',
    description: 'Partenariat Arkéa — FGDR jusqu\'à 100 000 €',
    color: '#10B981',
    icon: '📈',
  },
  {
    id: 'wesave_livret',
    name: 'Livret WeSave',
    institution: 'WeSave',
    category: 'fintech',
    rate: 2.8,
    maxAmount: null,
    taxFree: false,
    guaranteed: true,
    updateDate: '2025-01-01',
    description: 'Robo-advisor avec compte de trésorerie',
    color: '#6366F1',
    icon: '🤖',
  },
  {
    id: 'sumeria_livret',
    name: 'Livret Sumeria',
    institution: 'Sumeria (ex Lydia)',
    category: 'fintech',
    rate: 4.0, // taux promo fréquent
    maxAmount: 100000,
    taxFree: false,
    guaranteed: true,
    updateDate: '2025-01-01',
    description: 'Anciennement Lydia — taux attractifs, FGDR garanti',
    color: '#F59E0B',
    icon: '⚡',
  },
]

export const SAVINGS_CATEGORIES = {
  regulated: { label: 'Livrets réglementés', color: '#00E5A0' },
  bank: { label: 'Livrets bancaires', color: '#4D9EFF' },
  fintech: { label: 'Super-livrets & Fintechs', color: '#FFB547' },
}

// Calculer les intérêts annuels
export const calculateAnnualInterest = (amount, rate) => {
  return (amount * rate) / 100
}

// Simuler la croissance mensuelle
export const simulateGrowth = (amount, rate, months = 12) => {
  const monthlyRate = rate / 100 / 12
  const points = []
  let current = amount
  for (let i = 0; i <= months; i++) {
    points.push({ month: i, value: current })
    current = current * (1 + monthlyRate)
  }
  return points
}
