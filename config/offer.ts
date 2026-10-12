/**
 * Her First Income — Master Offer Configuration
 * 
 * Edit prices, values, checkout links, and funnel behaviors in this single file
 * without modifying UI components.
 */

export type CheckoutProvider = 'lemonsqueezy' | 'gumroad' | 'thrivecart';
export type MobileTierOrder = 'complete-first' | 'starter-first';
export type HeadlineVariantKey = 'v1' | 'v2' | 'v3';

export interface OfferItem {
  id: string;
  title: string;
  subtitle?: string;
  pages?: number;
  templatesCount?: number;
  videosCount?: number;
  promptsCount?: number;
  estimatedValue: number; // in USD
  description: string;
  badge?: string;
}

export interface TierConfig {
  id: 'starter' | 'complete';
  name: string;
  badge?: string;
  price: number; // in USD
  estimatedValue: number; // in USD
  shortPitch: string;
  ctaText: string;
  checkoutUrl: string;
  productId: string;
  items: OfferItem[];
}

export interface UpgradeConfig {
  id: 'upgrade';
  name: string;
  price: number; // in USD ($30 upgrade for Starter buyers)
  estimatedValue: number; // in USD ($66 value of the 5 Complete extras)
  totalFunnelPaid: number; // $17 + $30 = $47 total
  headline: string;
  ctaText: string;
  checkoutUrl: string;
  productId: string;
  items: OfferItem[];
}

export interface DownsellConfig {
  id: 'downsell';
  name: string;
  price: number; // in USD ($12)
  estimatedValue: number; // in USD ($31 value: Execution Guide $19 + Roadmap $12)
  headline: string;
  ctaText: string;
  checkoutUrl: string;
  productId: string;
  items: OfferItem[];
}

export interface OrderBumpConfig {
  enabled: boolean; // OFF by default
  id: string;
  title: string;
  price: number;
  estimatedValue: number;
  description: string;
}

export interface OfferConfiguration {
  productName: string;
  checkoutProvider: CheckoutProvider;
  upgradeOfferWindowHours: number;
  tierOrderMobile: MobileTierOrder;
  defaultHeadlineVariant: HeadlineVariantKey;
  headlineVariants: Record<HeadlineVariantKey, {
    headline: string;
    subheadline: string;
  }>;
  valueDisclaimer: string;
  supportEmail?: string;
  showTestimonials: boolean; // Hidden if false (no fake testimonials)
  orderBump: OrderBumpConfig;
  starter: TierConfig;
  complete: TierConfig;
  upgrade: UpgradeConfig;
  downsell: DownsellConfig;
  metaPixelId?: string;
}

/**
 * 1. STARTER ITEMS (Total estimated value: $66)
 * Focused on choosing the right path and getting properly set up without costly mistakes.
 */
export const STARTER_ITEMS: OfferItem[] = [
  {
    id: 'core-starter-guide',
    title: 'Her First Income: 5 Honest Ways Women Are Earning From Home',
    pages: 16,
    estimatedValue: 27,
    description: 'A realistic, no-fluff guide comparing proven home-based business models with practical pros, cons, and setup requirements so you can pick one clear direction.'
  },
  {
    id: 'template-vault',
    title: 'The Complete Template Vault (145 Fill-in Templates)',
    templatesCount: 145,
    estimatedValue: 9,
    description: 'Pre-formatted copy-and-paste assets across 6 practical categories: Client Communication (25), Digital Products & Sales (26), Social & Audience (28), Partnerships (25), Outreach Scripts (28), and Workflow Systems (13).'
  },
  {
    id: 'zero-dollar-stack',
    title: 'The Zero-Dollar Tech Stack',
    pages: 12,
    estimatedValue: 7,
    description: 'Zero-cost software recommendations and free tier setups for every path—no expensive subscriptions or hidden tool costs required.'
  },
  {
    id: 'confidence-mindset',
    title: 'Confidence & Mindset Guide',
    subtitle: '"The Imposter Syndrome Antidote"',
    pages: 12,
    estimatedValue: 7,
    description: 'Practical, low-pressure cognitive exercises to quiet self-doubt, price your first offer objectively, and take consistent action.'
  },
  {
    id: 'launch-blueprint',
    title: 'The 90-Minute WFH Launch Blueprint & Weekly Productivity Tracker',
    pages: 10,
    estimatedValue: 9,
    description: 'A structured framework designed to turn small pockets of quiet time into focused, measurable progress every week.'
  },
  {
    id: 'first-dollar-checklist',
    title: 'The First Dollar Action Checklist',
    pages: 8,
    estimatedValue: 7,
    description: 'Straightforward checklist for clean financial separation, PayPal/Stripe setup, income tracking, and fundamental legal/tax basics.'
  }
];

/**
 * 2. COMPLETE EXTRAS (Total estimated value: $66)
 * Step-by-step instructions, 30-day daily roadmap, video lessons, high-leverage scripts, and AI prompts.
 */
export const COMPLETE_EXCLUSIVE_ITEMS: OfferItem[] = [
  {
    id: 'execution-guide',
    title: 'The Complete Step-by-Step Execution Guide',
    pages: 38,
    estimatedValue: 19,
    description: 'In-depth, field-tested instructions walking you step by step through launch and execution for all home-based business models.'
  },
  {
    id: 'momentum-roadmap',
    title: 'The 30-Day First Dollar Momentum Roadmap',
    pages: 13,
    estimatedValue: 12,
    description: 'One actionable micro-task per day with flexible 30-minute, 60-minute, and 90-minute options to fit whatever time you have.'
  },
  {
    id: 'essential-templates',
    title: 'Nine Essential Commercial Templates & Pitch Scripts',
    pages: 21,
    estimatedValue: 14,
    description: 'Cold pitch, brand/affiliate pitch, launch sequence, client agreement outline, onboarding pack, testimonial collector, flash-sale script, polite-pivot reply, local-business follow-up.'
  },
  {
    id: 'video-library',
    title: 'Video Library & Learning Tracker',
    pages: 13,
    videosCount: 21,
    estimatedValue: 9,
    description: '21 curated, high-signal tutorials and structured YouTube playlists organized by topic, with a tracking sheet so you never get lost in algorithm rabbit holes.'
  },
  {
    id: 'ai-prompt-pack',
    title: 'The AI Prompt Pack & How-to-Use Guide',
    pages: 25,
    promptsCount: 60,
    estimatedValue: 12,
    description: '60+ tested, copy-and-paste prompts for drafting product ideas, social captions, email subject lines, client proposals, and customer responses in seconds.'
  }
];

/**
 * Complete Kit Pricing Card Display Items:
 * Base product summary (all 6 starter items in one line) + the 5 upsell modules.
 * Gives both Starter and Complete cards exactly 6 items each for equal card length.
 */
export const COMPLETE_CARD_ITEMS: OfferItem[] = [
  {
    id: 'starter-bundle',
    title: 'Everything in the Starter Kit',
    estimatedValue: 66,
    description: 'Includes Core Guide, 145-Template Vault, Zero-$ Tech Stack, Confidence Mindset Guide, 90-Min Launch Blueprint, and First Dollar Action Checklist.'
  },
  ...COMPLETE_EXCLUSIVE_ITEMS
];

/**
 * Master Offer Configuration Object
 */
export const offerConfig: OfferConfiguration = {
  productName: 'Her First Income',
  
  /**
   * Checkout Provider Switch: 'lemonsqueezy' | 'gumroad' | 'thrivecart'
   * 
   * Note on Post-Purchase Upsell Mechanics:
   * - Lemon Squeezy & Gumroad: Do not support native 1-click tokenized upsells on hosted checkouts.
   *   The upgrade page therefore routes to a dedicated $30 upgrade checkout. We pre-fill customer
   *   email via query parameters (?checkout[email]=... or ?email=...) to eliminate re-entry friction.
   * - ThriveCart: Supports native 1-click upsells. If set to 'thrivecart', checkout URLs can be swapped
   *   to ThriveCart's upsell redirect links.
   */
  checkoutProvider: 'gumroad',

  // Cookie expiry window for Starter buyers to claim the $30 upgrade rate
  upgradeOfferWindowHours: 24,

  // Mobile layout switch: 'complete-first' displays the higher-tier Complete card first on small screens
  tierOrderMobile: 'complete-first',

  // Default A/B headline variant
  defaultHeadlineVariant: 'v1',

  /**
   * Three benefit-led, compliance-safe headline options.
   * Switchable on the live page via query parameter (?v=1 | ?v=2 | ?v=3).
   * All variants are logged to Meta Pixel and CAPI events.
   */
  headlineVariants: {
    // Option 1: Clarity & Practical Setup Focus
    v1: {
      headline: 'A Quiet, Honest Way to Build Real Income From Home.',
      subheadline: 'Zero hype. Zero expensive software. Choose one realistic path and follow clear, step-by-step guidance designed for busy schedules.'
    },
    // Option 2: Overwhelm Reduction & Elimination of Tech Barriers
    v2: {
      headline: 'Stop Guessing Online. Pick One Clear Path and Get Started.',
      subheadline: 'Realistic guidance, free-tool blueprints, and 145 fill-in templates to launch a practical, independent income stream in your spare time.'
    },
    // Option 3: Direct-Response Simplicity & Realistic Action
    v3: {
      headline: 'Practical Guidance to Earn Your First Independent Dollar From Home.',
      subheadline: 'No complicated funnels or social media burnout. Just proven, realistic business models broken down into honest, manageable steps.'
    }
  },

  valueDisclaimer: 'Estimated combined value if the items were purchased separately.',

  // Testimonials section is hidden by default until verified customer reviews are collected
  showTestimonials: false,

  // Order bump: OFF by default per specification. Will not render unless enabled = true.
  orderBump: {
    enabled: false,
    id: 'ob-audio-companion',
    title: 'Audio Companion & Walkthrough Audio MP3s',
    price: 9,
    estimatedValue: 17,
    description: 'Listen to every guide and checklist on the go while doing chores or commuting.'
  },

  // Tier 1: Starter Kit ($17)
  starter: {
    id: 'starter',
    name: 'Starter Kit',
    price: 17,
    estimatedValue: 66,
    shortPitch: 'Choose your path and get set up with zero-dollar tools, practical checklists, and the complete 145-template vault.',
    ctaText: 'Get Instant Access',
    // Hosted checkout URL (replace with actual store link)
    checkoutUrl: 'https://herfirstincome.gumroad.com/l/starter-kit',
    productId: 'prod_starter_17',
    items: STARTER_ITEMS
  },

  // Tier 2: Complete Kit ($47)
  complete: {
    id: 'complete',
    name: 'Complete Kit',
    badge: 'Best Value', // Math: $132 value for $47 = 64% savings (never "Most Popular" unless verified)
    price: 47,
    estimatedValue: 132,
    shortPitch: 'Everything in Starter PLUS the 38-page execution guide, 30-day momentum roadmap, 9 commercial pitch scripts, curated video library, and 60+ AI prompts.',
    ctaText: 'Get Instant Access',
    checkoutUrl: 'https://herfirstincome.gumroad.com/l/complete-kit',
    productId: 'prod_complete_47',
    items: COMPLETE_CARD_ITEMS
  },

  // Upgrade: Post-Purchase for Starter Buyers Only ($30)
  upgrade: {
    id: 'upgrade',
    name: 'Complete Upgrade',
    price: 30,
    estimatedValue: 66,
    totalFunnelPaid: 47,
    headline: "You've chosen your path. Here's the step-by-step to actually do it.",
    ctaText: 'Yes, Upgrade My Kit',
    checkoutUrl: 'https://herfirstincome.gumroad.com/l/upgrade-kit',
    productId: 'prod_upgrade_30',
    items: COMPLETE_EXCLUSIVE_ITEMS
  },

  // Downsell: If Upgrade is Declined ($12)
  downsell: {
    id: 'downsell',
    name: 'Core Execution Pack',
    price: 12,
    estimatedValue: 31, // Execution Guide ($19) + 30-Day Roadmap ($12)
    headline: 'Keep The Step-By-Step Execution Guide & 30-Day Roadmap For Just $12.',
    ctaText: 'Yes, Add Execution & Roadmap for $12',
    checkoutUrl: 'https://herfirstincome.gumroad.com/l/downsell-pack',
    productId: 'prod_downsell_12',
    items: [
      COMPLETE_EXCLUSIVE_ITEMS[0], // Step-by-Step Execution Guide ($19)
      COMPLETE_EXCLUSIVE_ITEMS[1]  // 30-Day Momentum Roadmap ($12)
    ]
  }
};
