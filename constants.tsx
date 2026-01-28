
export const DEPOT_MAPPINGS = [
  { c: 'PA', d: 'VERTEX' }, { c: 'UO', d: 'VERTEX' }, { c: 'US', d: 'VERTEX' }, { c: 'BR', d: 'VERTEX' },
  { c: 'EN', d: 'VERTEX' }, { c: 'USW068', d: 'VERTEX' }, { c: 'USW305', d: 'VERTEX' }, { c: 'USW022', d: 'VERTEX' },
  { c: 'USW304', d: 'VERTEX' }, { c: 'DK', d: 'VERTEX' }, { c: 'ZO', d: 'VERTEX' }, { c: 'UX', d: 'VERTEX' },
  { c: 'DU', d: 'VERTEX' }, { c: 'ZU', d: 'VERTEX' }, { c: 'DF', d: 'VERTEX' }, { c: 'EX', d: 'VERTEX' },
  { c: 'EY', d: 'VERTEX' }, { c: 'EQ', d: 'VERTEX' }, { c: 'EL', d: 'VERTEX' }, { c: 'DP', d: 'VERTEX' },
  { c: 'FD', d: 'VERTEX' }, { c: 'GJ', d: 'VERTEX' }
];

export const SYSTEM_FONTS = [
  "Poppins", "Orbitron", "Inter", "Roboto", "Montserrat", "Lato", "Open Sans", "Raleway"
];

export const SYSTEM_LANGUAGES = [
  "English (US)", "English (UK)", "Bengali", "Hindi", "Arabic"
];

export const SYSTEM_COLORS = [
  "#000080", "#0080c0", "#1e3a8a", "#0f172a", "#1e40af", "#3730a3", "#10b981", "#059669", "#b91c1c", "#ea580c"
];

export const DEFAULT_SETTINGS = {
  appName: "SUNNYTRANS",
  appTagline: "GLOBAL LOGISTICS ERP v6.0",
  logoUrl: "",
  adminName: "Md. Aminul Islam",
  adminRole: "Super Administrator",
  adminImg: "https://ui-avatars.com/api/?name=Admin&background=random",
  theme: "dark" as const,
  fontFamily: "Poppins",
  textSize: 14,
  sidebarSize: 14,
  boxRadius: 12,
  sidebarColor: "#1e293b",
  popboxColor: "#000080",
  wallpaper: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000",
  globalZoom: 100,
  swalSize: 500,
  language: "English (US)",
  fontWeight: "700",
  fontStyle: "Normal",
  backgroundColor: "#c0c7d1",
  fontColor: "#000000",
  layoutMode: "Classic ERP",
  googleSheetUrl: "",
  glassIntensity: 20,
  primaryColor: "#2563eb",
  successColor: "#10b981",
  dangerColor: "#ef4444",
  maintenanceMode: false
};

export const DEFAULT_LISTS = {
  shipper: ["CONFIDENCE KNIT WEAR LTD", "SQUARE FASHIONS", "GLOBAL APPARELS LTD"],
  buyer: ["H&M", "PRIMARK", "ZARA", "WALMART", "TARGET"],
  depot: ["SAPL", "KDS", "VERTEX", "OCL", "BM"],
  staff: ["Md. Aminul Islam", "Operator 1", "Operator 2"],
  exporter: ["SunnyTrans International Ltd."],
  exportInfo: ["Port of Chattogram", "Dhaka Airport"],
  subAccounts: ["Main", "Salary account", "Rent", "Association Fee Account"]
};
