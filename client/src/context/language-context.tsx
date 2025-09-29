import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "om" | "am";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "app.name": "CBO Loyalty System",
    "app.subtitle": "Cooperative Bank of Oromia",
    "login.title": "Sign In",
    "login.email": "Email or Employee ID",
    "login.password": "Password",
    "login.remember": "Remember me",
    "login.forgot": "Forgot password?",
    "login.submit": "Sign In",
    "dashboard.overview": "Dashboard Overview",
    "dashboard.monitor": "Monitor your loyalty program performance",
    "metrics.customers": "Total Customers",
    "metrics.issued": "Points Issued",
    "metrics.redeemed": "Points Redeemed",
    "metrics.campaigns": "Active Campaigns",
    "nav.overview": "Overview",
    "nav.rules": "Rules Engine",
    "nav.campaigns": "Campaigns",
    "nav.tiers": "Tier Management",
    "nav.users": "Customer Management",
    "nav.analytics": "Analytics",
    "nav.api": "API Management",
    "customer.available": "Available Points",
    "customer.tier": "Tier Status",
    "customer.lifetime": "Lifetime Earned",
    "tier.silver": "Silver",
    "tier.gold": "Gold",
    "tier.platinum": "Platinum",
    "redeem.cashback": "Cashback",
    "redeem.voucher": "Shopping Voucher",
    "redeem.airtime": "Airtime Top-up",
  },
  om: {
    "app.name": "Sagantaa CBO",
    "app.subtitle": "Baankii Koopereetiivii Oromiyaa",
    "login.title": "Seeni",
    "login.email": "Imeelii ykn Lakkoofsa Hojjetaa",
    "login.password": "Jecha Icciitii",
    "login.remember": "Na yaadadhu",
    "login.forgot": "Jecha icciitii irraanfatte?",
    "login.submit": "Seeni",
    "dashboard.overview": "Ilaalcha Walii Galaa",
    "dashboard.monitor": "Sagantaa sagalee keessan hordofuu",
    "metrics.customers": "Maamiltootni Waliigalaa",
    "metrics.issued": "Qabxiilee Kenname",
    "metrics.redeemed": "Qabxiilee Baafatté",
    "metrics.campaigns": "Duula Hojii Irra Jiru",
    "nav.overview": "Ilaalcha Walii Galaa",
    "nav.rules": "Seera Motora",
    "nav.campaigns": "Duuloota",
    "nav.tiers": "Bulchiinsa Sadarkaa",
    "nav.users": "Bulchiinsa Maamilaa",
    "nav.analytics": "Xiinxala",
    "nav.api": "Bulchiinsa API",
    "customer.available": "Qabxiilee Jiran",
    "customer.tier": "Sadarkaa",
    "customer.lifetime": "Waliigalaa Argatte",
    "tier.silver": "Meetii",
    "tier.gold": "Warqee",
    "tier.platinum": "Plaatiinaam",
    "redeem.cashback": "Maallaqa Deebisu",
    "redeem.voucher": "Vaucharii Bittaa",
    "redeem.airtime": "Yeroo Haawwasaa",
  },
  am: {
    "app.name": "የCBO ታማኝነት ስርዓት",
    "app.subtitle": "የኦሮሚያ ህብረት ስራ ባንክ",
    "login.title": "ግባ",
    "login.email": "ኢሜይል ወይም የሰራተኛ መለያ",
    "login.password": "የይለፍ ቃል",
    "login.remember": "አስታውሰኝ",
    "login.forgot": "የይለፍ ቃል ረሳህ?",
    "login.submit": "ግባ",
    "dashboard.overview": "የአጠቃላይ እይታ ዳሽቦርድ",
    "dashboard.monitor": "የታማኝነት ፕሮግራምዎን አፈጻጸም ይከታተሉ",
    "metrics.customers": "ጠቅላላ ደንበኞች",
    "metrics.issued": "የተሰጡ ነጥቦች",
    "metrics.redeemed": "የተለወጡ ነጥቦች",
    "metrics.campaigns": "ንቁ ዘመቻዎች",
    "nav.overview": "አጠቃላይ እይታ",
    "nav.rules": "የደንብ ሞተር",
    "nav.campaigns": "ዘመቻዎች",
    "nav.tiers": "የደረጃ አስተዳደር",
    "nav.users": "የደንበኛ አስተዳደር",
    "nav.analytics": "ትንታኔ",
    "nav.api": "የAPI አስተዳደር",
    "customer.available": "የሚገኙ ነጥቦች",
    "customer.tier": "የደረጃ ሁኔታ",
    "customer.lifetime": "የህይወት ጊዜ ያገኙ",
    "tier.silver": "ብር",
    "tier.gold": "ወርቅ",
    "tier.platinum": "ፕላቲነም",
    "redeem.cashback": "ገንዘብ መመለስ",
    "redeem.voucher": "የግዢ ቫውቸር",
    "redeem.airtime": "የአየር ጊዜ ማሞላት",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
