import { ChainPreset, Brand } from './types';

export const CHAIN_PRESETS: ChainPreset[] = [
  {
    id: 'c-marriott',
    name: 'Marriott International',
    description: 'A global hospitality leader offering select corporate comfort, natural design, and legendary world-class luxury.',
    icon: '🏨',
    brands: [
      {
        id: 'b-courtyard',
        name: 'Courtyard by Marriott',
        description: 'Modern, business-focused environment. High-efficiency beds and professional service with low overhead.',
        vipMultiplier: 1.1,
        bedMultiplier: 1.0,
        styleColor: 'from-blue-600/20 to-blue-900/10 border-blue-500/30 text-blue-400',
        vipSpawnRate: 0.12,
        icon: '💼',
        color: 'from-blue-500 to-indigo-500'
      },
      {
        id: 'b-jwmarriott',
        name: 'JW Marriott Resort',
        description: 'Mindful luxury and nature-infused spaces. Plants and decorative tables gain double guest satisfaction!',
        vipMultiplier: 1.4,
        bedMultiplier: 1.2,
        styleColor: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
        vipSpawnRate: 0.22,
        icon: '🍃',
        color: 'from-emerald-500 to-teal-500'
      },
      {
        id: 'b-ritzcarlton',
        name: 'The Ritz-Carlton',
        description: 'The absolute gold standard in luxury. Double VIP spawn rate, high-end guest treatment, and supreme price margins.',
        vipMultiplier: 2.0,
        bedMultiplier: 1.8,
        styleColor: 'from-amber-600/20 to-amber-900/10 border-amber-500/30 text-amber-400',
        vipSpawnRate: 0.38,
        icon: '👑',
        color: 'from-amber-500 to-amber-700'
      }
    ]
  },
  {
    id: 'c-radisson',
    name: 'Radisson Hotel Group',
    description: 'Sleek Scandinavian hospitality focusing on natural elements, balanced design, and high-density modern comfort.',
    icon: '🛋️',
    brands: [
      {
        id: 'b-radissonred',
        name: 'Radisson RED',
        description: 'Playful, tech-forward aesthetic. Vibrant layouts, creative capsule setups, and fast-track robotic services.',
        vipMultiplier: 1.0,
        bedMultiplier: 0.9,
        styleColor: 'from-rose-600/20 to-rose-900/10 border-rose-500/30 text-rose-400',
        vipSpawnRate: 0.10,
        icon: '🎈',
        color: 'from-rose-500 to-red-600'
      },
      {
        id: 'b-radissonblu',
        name: 'Radisson Blu',
        description: 'Iconic, sophisticated Scandinavian design. Extremely high bed comfort and pristine premium services.',
        vipMultiplier: 1.5,
        bedMultiplier: 1.4,
        styleColor: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400',
        vipSpawnRate: 0.20,
        icon: '🛋️',
        color: 'from-cyan-500 to-blue-600'
      }
    ]
  },
  {
    id: 'c-cosmos',
    name: 'Cosmos Hotel Group',
    description: 'Immersive Russian hospitality, Soviet retro-futurism, cosmic architecture, and legendary space-age comfort.',
    icon: '🚀',
    brands: [
      {
        id: 'b-cosmos-smart',
        name: 'Cosmos Smart Sputnik',
        description: 'Soviet retro-futuristic aesthetic. Sputnik sphere accents, high efficiency, and super low building overheads.',
        vipMultiplier: 0.9,
        bedMultiplier: 0.9,
        styleColor: 'from-violet-600/20 to-violet-900/10 border-violet-500/30 text-violet-400',
        vipSpawnRate: 0.10,
        icon: '🚀',
        color: 'from-purple-500 to-violet-600'
      },
      {
        id: 'b-cosmos-collection',
        name: 'Cosmos Collection Palace',
        description: 'Grand historic palaces. Russian imperial aesthetics, opulent gold trims, and stellar prestige ratings.',
        vipMultiplier: 1.8,
        bedMultiplier: 1.6,
        styleColor: 'from-fuchsia-600/20 to-fuchsia-900/10 border-fuchsia-500/30 text-fuchsia-400',
        vipSpawnRate: 0.30,
        icon: '🏰',
        color: 'from-fuchsia-500 to-pink-600'
      }
    ]
  },
  {
    id: 'c-rixos',
    name: 'Rixos Hotels & Resorts',
    description: 'Lavish Turkish all-inclusive luxury, grand spa hammams, premium champagne events, and ultimate wellness sanctuaries.',
    icon: '⚜️',
    brands: [
      {
        id: 'b-rixospremium',
        name: 'Rixos Premium',
        description: 'Luxury seaside vibes. Premium Turkish hospitality, custom gold service, and high satisfaction ratings.',
        vipMultiplier: 1.7,
        bedMultiplier: 1.5,
        styleColor: 'from-yellow-600/20 to-yellow-900/10 border-yellow-500/30 text-yellow-400',
        vipSpawnRate: 0.28,
        icon: '⚜️',
        color: 'from-yellow-500 to-amber-600'
      },
      {
        id: 'b-rixosroyal',
        name: 'Rixos Royal Spa Retreat',
        description: 'Ultimate wellness spa retreats. All-inclusive luxury, extreme VIP spawn multipliers, and maximum relaxation levels.',
        vipMultiplier: 2.2,
        bedMultiplier: 2.0,
        styleColor: 'from-orange-600/20 to-orange-900/10 border-orange-500/30 text-orange-400',
        vipSpawnRate: 0.45,
        icon: '👑',
        color: 'from-orange-500 to-yellow-500'
      }
    ]
  }
];

export const DEFAULT_BRANDS: Brand[] = CHAIN_PRESETS.flatMap(c => c.brands);
