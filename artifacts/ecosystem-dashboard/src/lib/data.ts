export interface Audience {
  role: string;
  icon: string;
  sees: string[];
}

export interface Feature {
  name: string;
  points: string[];
  strategicRole: string;
  nextMove: string;
  audience?: Audience[];
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface ProjectComponent {
  id: string;
  name: string;
  feature: Feature;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  colorName: string;
  components: ProjectComponent[];
  executiveSummary?: string;
  launchUrl?: string;
  launchLabel?: string;
  blindSpot?: string;
}

export const ECOSYSTEM_DATA: Project[] = [
  {
    id: "spotx",
    name: "SpotX Ecosystem",
    tagline: "Core Financial Engine",
    emoji: "💎",
    color: "#fbbf24",
    colorName: "gold",
    executiveSummary: "Your central monetization and infrastructure layer. Powers every other project — enables micro-transactions, quests, rewards, and the 'earn while participating' economy.",
    launchUrl: "https://spotxwallet.com",
    launchLabel: "Launch SpotX Wallet",
    blindSpot: "Unified Payment Infrastructure must be live before AI automation can execute real financial transactions.",
    components: [
      {
        id: "spotx-wallet",
        name: "SpotX Wallet",
        feature: {
          name: "Universal Financial Hub",
          points: [
            "Fiat + crypto storage",
            "Stripe integration",
            "Coinbase integration",
            "NowPayments",
            "Auto-pay (AI future)",
            "Transaction history",
            "Swap & convert"
          ],
          strategicRole: "Acts as the central liquidity and routing pool for the entire ecosystem. Break the sync and the entire monetization loop collapses.",
          nextMove: "Finalize AI-driven auto-pay and expand fiat rails.",
          ctaLabel: "Open My Wallet",
          ctaUrl: "https://spotxwallet.com",
          audience: [
            { role: "End User", icon: "👤", sees: ["Balance (Fiat + Crypto)", "Deposit / Withdraw", "Start Earning → TradeBot", "Transaction history", "Simple swap (EUR ↔ Crypto)"] },
            { role: "Power Trader", icon: "🧠", sees: ["Multi-asset view", "API connections (Stripe, exchanges)", "Advanced swaps", "Liquidity options"] },
            { role: "Business Owner", icon: "🏢", sees: ["Payment links", "Stripe integration dashboard", "Invoices", "Payout management"] },
            { role: "Admin / AI", icon: "🧑‍💼", sees: ["All user balances overview", "Flow of funds", "Risk exposure", "System alerts"] }
          ]
        }
      },
      {
        id: "spotx-tradebot",
        name: "SpotXTradeBot",
        feature: {
          name: "Algorithmic Yield Generator",
          points: [
            "Automated daily profits ~€6+/day",
            "EMA20/50 + RSI14 strategy",
            "Risk-based position sizing",
            "Telegram alerts",
            "P&L tracker with win rate",
            "Daily earnings logic"
          ],
          strategicRole: "Provides passive baseline revenue and demonstrates immediate value. TradeBot sends profits directly to the Wallet — they are parallel systems, not parent-child.",
          nextMove: "Scale user testing and refine strategy selection algorithms.",
          ctaLabel: "Start Earning",
          ctaUrl: "/spotx",
          audience: [
            { role: "End User", icon: "👤", sees: ["'Activate earning' button", "Daily profit tracker (€)", "Risk level (Low/Medium/High)", "On/Off toggle", "Auto-withdraw to wallet"] },
            { role: "Power Trader", icon: "🧠", sees: ["Strategy selection", "Performance charts", "Backtesting results", "Manual override"] },
            { role: "Business Owner", icon: "🏢", sees: ["'Auto-invest business profits'", "Daily yield from idle cash"] },
            { role: "Admin / AI", icon: "🧑‍💼", sees: ["Global performance", "Bot health status", "Strategy tuning", "Kill switch"] }
          ]
        }
      },
      {
        id: "smart-trader",
        name: "Smart Trader Dashboard",
        feature: {
          name: "Real-time Intelligence",
          points: [
            "Live charts",
            "Price alerts",
            "Admin sync",
            "Portfolio overview",
            "Real-time updates"
          ],
          strategicRole: "Retains high-value users by offering professional-grade market oversight.",
          nextMove: "Integrate custom AI predictive models.",
          ctaLabel: "Open Dashboard",
          ctaUrl: "/spotx"
        }
      },
      {
        id: "crypto-onoff",
        name: "Crypto On/Off-Ramps",
        feature: {
          name: "Frictionless Bridge",
          points: [
            "Embedded financial access",
            "Buy/sell crypto",
            "Fiat conversion",
            "Multiple payment rails"
          ],
          strategicRole: "Removes the barrier to entry for non-crypto natives entering the ecosystem.",
          nextMove: "Secure additional local banking partnerships.",
          ctaLabel: "View On/Off-Ramps",
          ctaUrl: "https://spotxwallet.com"
        }
      }
    ]
  },
  {
    id: "vaultzforge-dripcode",
    name: "VaultzForge + DripCode™",
    tagline: "Physical × Digital Bridge",
    emoji: "👕",
    color: "#c084fc",
    colorName: "purple",
    executiveSummary: "Smart merchandise + identity + access layer. Turns physical products into active ecosystem nodes. DripCode™ bridges street culture with fintech via scannable garments.",
    launchLabel: "View VaultzForge",
    blindSpot: "Mass DripCode deployment campaigns in physical locations (Xspaces + streets) must happen before digital value is unlocked.",
    components: [
      {
        id: "dripcode-tags",
        name: "DripCode™ Tags",
        feature: {
          name: "Smart Apparel Identity",
          points: [
            "Scannable identity in clothing",
            "QR-embedded garments",
            "Scan-to-earn rewards",
            "Unlock education content",
            "Community entry gate",
            "Aid distribution layer"
          ],
          strategicRole: "Turns physical merchandise into interactive nodes within the digital ecosystem.",
          nextMove: "Mass production of V1 tag integration."
        }
      },
      {
        id: "king-lima",
        name: "King Lima Brand",
        feature: {
          name: "Flagship Streetwear",
          points: [
            "Flagship DripCode™ brand",
            "First rollout brand",
            "Street culture identity",
            "Limited edition drops"
          ],
          strategicRole: "Proves the DripCode model through an established, desirable cultural entity.",
          nextMove: "Execute Season 1 exclusive drop."
        }
      },
      {
        id: "rewards-system",
        name: "Rewards System",
        feature: {
          name: "Engagement Engine",
          points: [
            "Quest completion rewards",
            "Scan-to-earn",
            "Token rewards",
            "Reactivation engine"
          ],
          strategicRole: "Drives continuous daily active usage and brand loyalty.",
          nextMove: "Connect reward token liquidity to SpotX."
        }
      },
      {
        id: "community-layer",
        name: "Community Access Layer",
        feature: {
          name: "Gated Experiences",
          points: [
            "Brand membership tiers",
            "Exclusive content gates",
            "Event access",
            "Digital identity"
          ],
          strategicRole: "Creates exclusivity and upsell opportunities for high-tier community members.",
          nextMove: "Launch the VIP Discord/Portal integration."
        }
      }
    ]
  },
  {
    id: "xspaces",
    name: "Xspaces",
    tagline: "AI-Powered Social Hub",
    emoji: "🏢",
    color: "#2dd4bf",
    colorName: "cyan",
    executiveSummary: "AI-powered social + monetization hub. Physical onboarding funnel into the entire ecosystem — coffee lounge, billiards, hookah. Real-world testing ground and community retention engine.",
    launchLabel: "View Xspaces",
    blindSpot: "Launch MVP in Fucecchio first. QR-based quest activation must go live immediately upon opening.",
    components: [
      {
        id: "physical-hub",
        name: "Physical Location Hub",
        feature: {
          name: "Real-world Touchpoint",
          points: [
            "Coffee lounge",
            "Billiards tables",
            "Hookah lounge",
            "Social hub",
            "Community gathering"
          ],
          strategicRole: "Grounds the digital ecosystem in a tangible, high-traffic physical location.",
          nextMove: "Finalize interior AI-camera installations."
        }
      },
      {
        id: "quest-system",
        name: "1€ Quest System",
        feature: {
          name: "Micro-Engagement Economy",
          points: [
            "City-wide micro-quests",
            "1 euro entry quests",
            "Scan-to-play",
            "Business integration",
            "Daily reward loops"
          ],
          strategicRole: "Gamifies the physical city, driving foot traffic and micro-transactions.",
          nextMove: "Launch the first 10 city-partner quests."
        }
      },
      {
        id: "event-engine",
        name: "Event Engine",
        feature: {
          name: "Social Catalyst",
          points: [
            "Karaoke nights",
            "Black tie events",
            "Themed nights",
            "Billiards tournaments",
            "Hookah lounge events"
          ],
          strategicRole: "Generates predictable revenue spikes and community content.",
          nextMove: "Automate event ticketing via DripCode scans."
        }
      },
      {
        id: "ai-personalization",
        name: "AI Personalization",
        feature: {
          name: "Hyper-tailored Experiences",
          points: [
            "User behavior tracking",
            "Personalized offers",
            "AI-driven menu",
            "Smart recommendations"
          ],
          strategicRole: "Maximizes LTV by adapting physical offerings to real-time user data.",
          nextMove: "Deploy AI recommendation screens at tables."
        }
      }
    ]
  },
  {
    id: "meta-fucecchio",
    name: "Meta Fucecchio",
    tagline: "City → Digital Economy",
    emoji: "🌍",
    color: "#4ade80",
    colorName: "green",
    executiveSummary: "Local city turned into a tokenized, gamified economic sandbox. Proof-of-concept for global Smart City Monetization Model — residents interact via quests, wallets, digital identity, and local commerce.",
    launchLabel: "View Project",
    blindSpot: "Must launch micro-quests tied to real businesses before the digital twin has meaningful engagement.",
    components: [
      {
        id: "virtual-city",
        name: "Virtual Fucecchio",
        feature: {
          name: "Digital Twin",
          points: [
            "Digital representation of city",
            "Virtual real estate",
            "Explorable map",
            "Event mirroring"
          ],
          strategicRole: "Expands physical constraints to a global, scalable virtual environment.",
          nextMove: "Launch V1 3D web explorer."
        }
      },
      {
        id: "spotx-billiard",
        name: "SpotX Billiard",
        feature: {
          name: "Phygital Gaming",
          points: [
            "Digital tournaments",
            "Rankings & leaderboards",
            "Live streaming integration",
            "Prize pool management"
          ],
          strategicRole: "Connects traditional sports culture with Web3 betting/reward dynamics.",
          nextMove: "Host first hybrid cross-border tournament."
        }
      },
      {
        id: "sorts",
        name: "Sorts (Gamified)",
        feature: {
          name: "Local Exploration Loops",
          points: [
            "Location-based challenges",
            "Treasure hunts",
            "Merchant discovery",
            "Achievement badges"
          ],
          strategicRole: "Directs user attention and foot traffic to ecosystem partners.",
          nextMove: "Onboard 5 local vendors to Sorts."
        }
      },
      {
        id: "local-commerce",
        name: "Local Commerce",
        feature: {
          name: "Digital Main Street",
          points: [
            "Local vendor digital storefronts",
            "Crypto payments accepted",
            "Same-day delivery routing",
            "Unified loyalty points"
          ],
          strategicRole: "Captures the local economic flow within the SpotX financial rails.",
          nextMove: "Distribute payment terminals to local shops."
        }
      }
    ]
  },
  {
    id: "speedbiz",
    name: "SPEEDBIZ / SJDigiX",
    tagline: "Service Monetization Arm",
    emoji: "🚀",
    color: "#fb923c",
    colorName: "orange",
    executiveSummary: "Cash-flow engine and service aggregator. Immediate revenue generation that feeds clients into the SpotX ecosystem and funds all other projects. Bundle services with wallet + automation.",
    launchLabel: "View Services",
    blindSpot: "Services must be bundled with SpotX wallet + automation to sell as 'business-in-a-box' — standalone services undermonetize.",
    components: [
      {
        id: "payment-services",
        name: "Payment Services",
        feature: {
          name: "B2B Financial Infrastructure",
          points: [
            "Merchant processing",
            "POS deployment",
            "Fee optimization",
            "Cross-border settlements"
          ],
          strategicRole: "Provides stable B2B recurring revenue via processing fees.",
          nextMove: "Target 50 local SME conversions."
        }
      },
      {
        id: "web-smm",
        name: "Web/SEO/SMM",
        feature: {
          name: "Digital Presence Agency",
          points: [
            "Website generation",
            "Social media automation",
            "Search ranking optimization",
            "Content strategies"
          ],
          strategicRole: "Acts as the initial trust-building entry service for traditional businesses.",
          nextMove: "Implement AI-driven 1-click site generation."
        }
      },
      {
        id: "ecom-setup",
        name: "E-Commerce Setup",
        feature: {
          name: "Turnkey Online Stores",
          points: [
            "Store architecture",
            "Inventory sync",
            "Payment rail integration",
            "Logistics setup"
          ],
          strategicRole: "Transitions offline retailers into the digital economy (and our payment rails).",
          nextMove: "Bundle with SpotX crypto checkout."
        }
      },
      {
        id: "mobility",
        name: "Mobility Services",
        feature: {
          name: "Transport Logistics",
          points: [
            "Fleet management tracking",
            "Delivery optimization",
            "Service vehicle routing",
            "Local transit integration"
          ],
          strategicRole: "Ensures the physical movement of goods generated by the e-commerce arm.",
          nextMove: "Deploy tracker app for driver fleet."
        }
      }
    ]
  },
  {
    id: "ai-automation",
    name: "AI Automation",
    tagline: "Invisible Operator Layer",
    emoji: "🤖",
    color: "#60a5fa",
    colorName: "blue",
    executiveSummary: "Fully autonomous execution engine. AI runs hiring (Deel), payments, decision-making, marketing, and operations. Removes operational bottlenecks and enables scale without overhead.",
    launchLabel: "View Automation",
    blindSpot: "AI wallet agents can only execute real transactions once SpotX Wallet is live on payment rails.",
    components: [
      {
        id: "ai-wallet-agents",
        name: "AI Wallet Agents",
        feature: {
          name: "Autonomous Asset Managers",
          points: [
            "Predictive fund routing",
            "Gas fee optimization",
            "Auto-staking",
            "Smart contract interaction"
          ],
          strategicRole: "Maximizes yield and reduces friction without human intervention.",
          nextMove: "Beta test autonomous yield farming."
        }
      },
      {
        id: "ai-dept-heads",
        name: "AI Department Heads",
        feature: {
          name: "Virtual Executives",
          points: [
            "Automated marketing director",
            "AI customer success lead",
            "Data analysis agent",
            "Operations coordinator"
          ],
          strategicRole: "Drastically reduces human capital overhead across the ecosystem.",
          nextMove: "Deploy AI Marketing Agent across Twitter/Discord."
        }
      },
      {
        id: "auto-reporting",
        name: "Automated Reporting",
        feature: {
          name: "Real-time Oversight",
          points: [
            "Cross-project KPI dashboards",
            "Anomaly detection alerts",
            "Revenue aggregation",
            "Predictive forecasting"
          ],
          strategicRole: "Provides the founder with absolute clarity and control over all 9 projects.",
          nextMove: "Integrate dashboard with Telegram bot alerts."
        }
      },
      {
        id: "decision-engine",
        name: "Decision Engine",
        feature: {
          name: "Strategic Logic Core",
          points: [
            "Capital allocation recommendations",
            "A/B testing automation",
            "Market trend analysis",
            "Risk assessment algorithms"
          ],
          strategicRole: "Acts as the digital co-founder, analyzing data faster than humanly possible.",
          nextMove: "Feed past 12 months of SpotX data into model."
        }
      }
    ]
  },
  {
    id: "deals-a-gogo",
    name: "Deals-A-Go-Go™",
    tagline: "AI-Powered Marketplace",
    emoji: "🛍",
    color: "#f472b6",
    colorName: "pink",
    executiveSummary: "AI-powered marketplace for mass users — especially non-tech and senior demographics. Simple, automated, remote income system fully managed by AI. High-scale adoption funnel.",
    launchLabel: "View Marketplace",
    blindSpot: "Rebrand + build investor-grade pitch + AI dashboard mockups before any major marketing spend.",
    components: [
      {
        id: "ai-marketplace",
        name: "AI Marketplace",
        feature: {
          name: "Smart Commerce Platform",
          points: [
            "Algorithmic product matching",
            "Dynamic pricing",
            "Automated dropshipping",
            "Vendor AI assistants"
          ],
          strategicRole: "Scales e-commerce revenue without corresponding linear inventory risk.",
          nextMove: "Connect top 100 high-margin dropship products."
        }
      },
      {
        id: "senior-ux",
        name: "Senior-Friendly UX",
        feature: {
          name: "Accessible Interface Layer",
          points: [
            "Voice-command shopping",
            "Simplified checkout flows",
            "High-contrast visuals",
            "AI customer support calls"
          ],
          strategicRole: "Captures an underserved, highly liquid demographic.",
          nextMove: "Launch voice-to-cart beta."
        }
      },
      {
        id: "remote-income",
        name: "Remote Income Tools",
        feature: {
          name: "Affiliate Generation",
          points: [
            "1-click store cloning",
            "Automated commission tracking",
            "Marketing asset generator",
            "Payout routing via SpotX"
          ],
          strategicRole: "Turns users into a decentralized, commission-only sales force.",
          nextMove: "Roll out affiliate portal V1."
        }
      },
      {
        id: "ai-dashboard",
        name: "AI Dashboard",
        feature: {
          name: "Vendor Command Center",
          points: [
            "Inventory forecasting",
            "Customer sentiment analysis",
            "Automated ad buying",
            "Competitor price tracking"
          ],
          strategicRole: "Makes ecosystem vendors overwhelmingly successful, ensuring retention.",
          nextMove: "Release sentiment analysis feature."
        }
      }
    ]
  },
  {
    id: "global-expansion",
    name: "Global Expansion",
    tagline: "Geographic Arbitrage Engine",
    emoji: "🌐",
    color: "#f87171",
    colorName: "red",
    executiveSummary: "Geographic arbitrage at scale. Target: Africa, Little Italy clusters, Ukraine. Tools: Crypto ATMs, Kiosks, Telegram onboarding. Rapid adoption in underbanked markets bypasses traditional banking limitations.",
    launchLabel: "View Strategy",
    blindSpot: "Pilot with 1 country + 1 city replication model before attempting multi-continent rollout.",
    components: [
      {
        id: "africa-rollout",
        name: "Africa Rollout",
        feature: {
          name: "Emerging Market Deployment",
          points: [
            "Mobile-first crypto access",
            "Micro-lending protocols",
            "Remittance optimization",
            "Local partner network"
          ],
          strategicRole: "Captures rapid growth in historically unbanked regions.",
          nextMove: "Finalize Nigerian mobile money integration."
        }
      },
      {
        id: "little-italy",
        name: "Little Italy Network",
        feature: {
          name: "Cultural Commerce Bridge",
          points: [
            "Expat business directory",
            "Cross-border import/export",
            "Cultural event coordination",
            "Shared loyalty programs"
          ],
          strategicRole: "Leverages existing cultural ties for high-trust business networking.",
          nextMove: "Onboard 20 NY/NJ Little Italy merchants."
        }
      },
      {
        id: "ukraine-market",
        name: "Ukraine Market",
        feature: {
          name: "Tech Talent & Aid",
          points: [
            "Development talent sourcing",
            "Crypto aid distribution",
            "Digital infrastructure rebuilding",
            "Remote work hubs"
          ],
          strategicRole: "Secures high-tier technical talent while providing critical infrastructure.",
          nextMove: "Open virtual tech-incubator applications."
        }
      },
      {
        id: "crypto-atms",
        name: "Crypto ATM Kiosks",
        feature: {
          name: "Physical Cash Bridges",
          points: [
            "Strategic physical placements",
            "High-margin fee structure",
            "Branded hardware touchpoints",
            "Instant onboarding"
          ],
          strategicRole: "Generates massive physical visibility and highly profitable transaction fees.",
          nextMove: "Install 5 flagship ATMs in target cities."
        }
      }
    ]
  },
  {
    id: "vaultzforge-tech",
    name: "Vault Stack / VaultzForge Tech",
    tagline: "Tech Infrastructure Layer",
    emoji: "🏗",
    color: "#94a3b8",
    colorName: "gray",
    executiveSummary: "Product + identity infrastructure tying physical, digital, and financial layers together. VaultzForge platform with smart merch backend, SSO auth, VF Crest soulbound identity system.",
    launchLabel: "View Tech Stack",
    blindSpot: "Unified cross-app session cookies must be implemented before SSO claims can be made to investors.",
    components: [
      {
        id: "smart-merch",
        name: "Smart Merch Backend",
        feature: {
          name: "NFC/QR Database",
          points: [
            "Unique item serialization",
            "Counterfeit prevention",
            "Ownership transfer logic",
            "Dynamic metadata updates"
          ],
          strategicRole: "Provides the unhackable truth layer for all physical goods.",
          nextMove: "Audit security of ownership transfer protocol."
        }
      },
      {
        id: "auth-system",
        name: "Auth System",
        feature: {
          name: "Universal Login",
          points: [
            "Single Sign-On (SSO) for all 9 apps",
            "Web3 wallet connect",
            "Biometric integration",
            "Zero-knowledge proofs"
          ],
          strategicRole: "Ensures users flow frictionlessly between all ecosystem projects.",
          nextMove: "Implement unified cross-app session cookies."
        }
      },
      {
        id: "vf-crest",
        name: "VF Crest Identity",
        feature: {
          name: "Soulbound User Profile",
          points: [
            "Reputation scoring",
            "Aggregated achievements",
            "Cross-project VIP status",
            "On-chain resume"
          ],
          strategicRole: "Makes user investment in the ecosystem permanent and prestigious.",
          nextMove: "Design the visual tiers of the Crest."
        }
      },
      {
        id: "replit-deployment",
        name: "Replit Deployment",
        feature: {
          name: "Rapid Shipping Engine",
          points: [
            "AI-assisted coding",
            "Instant cloud hosting",
            "Continuous CI/CD",
            "Scalable microservices"
          ],
          strategicRole: "Allows the enterprise to iterate and ship features 10x faster than competitors.",
          nextMove: "Automate daily health checks across deployments."
        }
      }
    ]
  }
];

export const PRIORITY_STACK = [
  "1. SpotX Stripe Integration",
  "2. DripCode V1 Mass Production",
  "3. Xspaces AI-Camera Setup",
  "4. Meta Fucecchio 3D Map",
  "5. SPEEDBIZ SME Onboarding"
];
