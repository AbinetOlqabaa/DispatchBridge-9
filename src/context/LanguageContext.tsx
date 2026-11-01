import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  LanguageOption,
  translations,
} from '../i18n/translations.js';

export type TranslationParams = Record<string, string | number>;

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallbackOrParams?: string | TranslationParams, params?: TranslationParams) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'dispatchbridge_lang';
const ALT_STORAGE_KEY = 'dispatchbridge_language';

const DYNAMIC_SEED_MAP: Record<string, string> = {
  'Apex Supply Logistics': 'seed.biz_001',
  'Metro Retail Distribution': 'seed.biz_002',
  'Midwest Cold-Chain Express': 'seed.biz_003',
  'DispatchBridge Platform Engine': 'seed.biz_admin',
  'Metro Retail North Branch': 'seed.ptn_001_name',
  'David Miller (Receiving Manager)': 'seed.ptn_001_contact',
  'Forklift required for pallet unloads. Contact dock manager prior to arrival.': 'seed.ptn_001_notes',
  'Summit Wholesale Depot': 'seed.ptn_002_name',
  'Receiving Dock Supervisor': 'seed.ptn_002_contact',
  'Operating hours 06:00 - 15:00 CST.': 'seed.ptn_002_notes',
  'Urban Core Supermarkets': 'seed.ptn_003_name',
  'Warehouse Manager': 'seed.ptn_003_contact',
  'Alley entrance. Height clearance 13ft 6in max.': 'seed.ptn_003_notes',
  'Chicago Central Terminal - Dock 4': 'seed.loc_001_label',
  'Joliet Cold-Chain Warehouse - Bay 2': 'seed.loc_002_label',
  'Minneapolis Receiving Terminal - Dock 12': 'seed.loc_003_label',
  'Des Moines Cold Storage - Bay 1': 'seed.loc_004_label',
  'Organic Cold-Brew Espresso (Case of 24 cans)': 'seed.item_bev_001',
  'Artisan Sea Salt Crackers (Carton of 12 boxes)': 'seed.item_snk_004',
  'Fair-Trade Rolled Oats 25kg Bulk Bag': 'seed.item_dry_019',
  'Premium Olive Oil 750ml (Box of 6 glass bottles)': 'seed.item_oil_002',
  '4 boxes crushed and leaking onto truck floor upon opening tailgate.': 'seed.note_oil_002',
  'Artisan Bronze-Die Pasta 500g (Pack of 20)': 'seed.item_pst_011',
  'Pallet shrinkwrap intact; only 57 packs inside sealed crate.': 'seed.note_pst_011',
  'Unbleached Bakers Flour 50lb Sack': 'seed.item_flr_001',
  'All bags received intact and dry.': 'seed.note_flr_001',
  'Priority morning delivery. Unload at Bay 3; refrigerated section.': 'seed.dsp_001_notes',
  'Fragile liquids included. Handle with forklift only.': 'seed.dsp_002_notes',
  'Warehouse inspection requested. Freight carrier claim pending.': 'seed.dsp_002_disc_notes',
  'Packing slip discrepancy verified at dispatch origin. Shortage acknowledged.': 'seed.dsp_002_sender_comment',
  'Loss verified with carrier driver before departure. Credit note requested.': 'seed.dsp_002_receiver_comment',
  'Standard freight delivery.': 'seed.dsp_003_notes',
  'Full shipment verified 100% complete.': 'seed.dsp_003_receiver_comment',
  'I-90 Westbound Mile Marker 274 (La Crosse Waypoint)': 'seed.chk_001',
  'Minneapolis Receiving Dock 12 (Arrived & Inspected)': 'seed.chk_002',
  'Des Moines Bay 4 (Reconciled & Closed)': 'seed.chk_003',
  'Chicago Central Terminal - Dock 4 (Origin)': 'seed.wp_p0',
  'I-90 Westbound Toll Plaza (Elgin)': 'seed.wp_p1',
  'Rockford Freight Corridor': 'seed.wp_p2',
  'Madison Cold-Chain Checkpoint': 'seed.wp_p3',
  'Wisconsin Dells I-94 Junction': 'seed.wp_p4',
  'Tomah Logistics Hub': 'seed.wp_p5',
  'La Crosse River Crossing (Waypoint)': 'seed.wp_p6',
  'Eau Claire Transit Corridor': 'seed.wp_p7',
  'Metro Retail North Branch - Dock 12 (Destination)': 'seed.wp_p8',
  'I-90 Westbound Toll Plaza': 'seed.wp_a1',
  'Rockford Bypass (Detour - Roadwork)': 'seed.wp_a2',
  'Madison Cold-Chain Checkpoint (Temp Verified 3.4°C)': 'seed.wp_a3',
  'I-90 Westbound Mile Marker 274 (Current GPS)': 'seed.wp_a4',
  'Discrepancy Reported on DSP-2025-0891': 'seed.notif_001_title',
  'Summit Wholesale Depot reported 4 damaged olive oil boxes and 3 missing pasta packs ($358.50 variance).': 'seed.notif_001_msg',
  'Partner Viewed Dispatch DSP-2025-0892': 'seed.notif_002_title',
  'David Miller at Metro Retail North Branch opened the delivery manifest link.': 'seed.notif_002_msg',
  'Full Delivery Reconciled: DSP-2025-0888': 'seed.notif_003_title',
  'Urban Core Supermarkets confirmed 100% receipt of 120 Unbleached Bakers Flour sacks.': 'seed.notif_003_msg',
  'Created dispatch DSP-2025-0892 for Metro Retail North Branch ($8,520.00, 3 lines).': 'seed.aud_001',
  'Partner Metro Retail North Branch accessed public delivery manifest DSP-2025-0892.': 'seed.aud_002',
  'Recorded discrepancy on DSP-2025-0891: 4 damaged units (SKU-OIL-002), 3 missing units (SKU-PST-011). Total variance: $358.50.': 'seed.aud_003',
  'Confirmed 100% receipt of DSP-2025-0888 (120 sacks flour). Dual-signoff completed.': 'seed.aud_004',
  'System operator performed staging integrity and adapter readiness verification.': 'seed.aud_005',
  'Automated reconciliation rule triggered for DSP-2025-0891: Variance ($358.50) exceeds $250 threshold. Escalated to Business Owner.': 'seed.aud_006',
  'New partner location registered: Urban Core Supermarkets (Milwaukee, WI).': 'seed.aud_007',
  'Session authenticated via RBAC token engine (Role: BUSINESS_OWNER).': 'seed.aud_008',
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(ALT_STORAGE_KEY)) as SupportedLanguage | null;
    if (saved && ['en', 'am', 'om', 'ti', 'so'].includes(saved)) {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem(ALT_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (
    key: string,
    fallbackOrParams?: string | TranslationParams,
    params?: TranslationParams
  ): string => {
    if (!key) return '';
    let fallback: string | undefined;
    let actualParams: TranslationParams | undefined;

    if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
      actualParams = fallbackOrParams;
      fallback = undefined;
    } else {
      fallback = fallbackOrParams;
      actualParams = params;
    }

    const resolvedKey = DYNAMIC_SEED_MAP[key] || key;
    const langDict = translations[language];
    let template =
      langDict && langDict[resolvedKey]
        ? langDict[resolvedKey]
        : translations.en && translations.en[resolvedKey]
        ? translations.en[resolvedKey]
        : fallback || key;

    if (actualParams) {
      Object.entries(actualParams).forEach(([k, v]) => {
        template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return template;
  };

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export const useLanguage = useTranslation;

