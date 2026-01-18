
export const DEPOT_MAPPINGS = [
  { c: 'PA', d: 'VERTEX' }, { c: 'UO', d: 'VERTEX' }, { c: 'US', d: 'VERTEX' },
  { c: 'BR', d: 'VERTEX' }, { c: 'EN', d: 'VERTEX' }, { c: 'USW068', d: 'VERTEX' },
  { c: 'USW305', d: 'VERTEX' }, { c: 'USW022', d: 'VERTEX' }, { c: 'USW304', d: 'VERTEX' },
  { c: 'DK', d: 'VERTEX' }, { c: 'ZO', d: 'VERTEX' }, { c: 'UX', d: 'VERTEX' },
  { c: 'BE-ESW038', d: 'OCL' }, { c: 'OF-ESW267', d: 'OCL' }, { c: 'OF-NLW174', d: 'OCL' },
  { c: 'HR', d: 'OCL' }, { c: 'DE-DEW003', d: 'OCL' }, { c: 'DE-DEW004', d: 'OCL' },
  { c: 'AU', d: 'SAPL' }, { c: 'OO', d: 'SAPL' }, { c: 'HK', d: 'SAPL' },
  { c: 'JP', d: 'SAPL' }, { c: 'OJ', d: 'SAPL' },
  { c: 'SE', d: 'KDS' }, { c: 'SW-SEW065', d: 'KDS' }, { c: 'RS', d: 'KDS' },
  { c: 'CO', d: 'KDS' }
];

export const DEFAULT_SETTINGS = {
  adminName: "Md. Aminul Islam",
  adminRole: "Super Administrator",
  adminImg: "https://ui-avatars.com/api/?name=Admin&background=random",
  theme: "light" as const,
  fontFamily: "Exo 2",
  textSize: 14,
  sidebarSize: 14,
  boxRadius: 20,
  sidebarColor: "#0f172a",
  wallpaper: "",
  globalZoom: 100,
  swalSize: 500,
  language: "English",
  fontWeight: "400",
  fontStyle: "Normal",
  backgroundColor: "#e0e5ec",
  fontColor: "#00ff40",
  layoutMode: "Fluid (Mobile)",
  googleSheetUrl: ""
};

export const DEFAULT_REF_DATA = {
  depots: [
    { name: "Summit Alliance Port Ltd. (SAPL)", code: "VERTEX, OCL, SAPL, KDS" },
    { name: "KDS Logistics Ltd.", code: "PA, BE-ESW038, AU, SE, CN, CA" }
  ],
  buyers: ["H&M", "H&M SEA AIR", "PRIMARK", "WALMART"],
  forwarders: [{ name: "KUEHNE + NAGEL LTD", ain: "301050068", code: "KN" }],
  hsCodes: [{ code: "6109.1", desc: "T-Shirts (Cotton)", type: "Knitwear" }],
  countries: [{ name: "Bangladesh", code: "BD" }, { name: "United States", code: "US" }]
};

export const DEFAULT_LISTS = {
  shipper: ["CONFIDENCE KNIT WEAR LTD", "SQUARE FASHIONS"],
  buyer: ["H&M", "H&M SEA AIR", "MATALON", "PRIMARK"],
  depot: ["KDS", "SAVER", "NAMSUN", "SAPL", "VERTEX"],
  staff: ["Rahim", "Karim", "Samim", "Jasim"],
  exportInfo: ["Port of Chattogram", "Pangaon ICT"]
};

export const SYSTEM_WALLPAPERS = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/id/${10 + i}/1920/1080`,
  thumb: `https://picsum.photos/id/${10 + i}/200/120`,
  title: `Abstract Environment ${i + 1}`
}));

export const VISUAL_CATALOG = [
  { id: 1, font: "Helvetica", color: "Black (#000000)", bg: "White Minimalist" },
  { id: 2, font: "Arial", color: "Dark Gray (#333333)", bg: "Light Grey Texture" },
  { id: 3, font: "Roboto", color: "Navy Blue (#000080)", bg: "Abstract Blue Geometric" },
  { id: 4, font: "Open Sans", color: "Charcoal (#36454F)", bg: "Soft Bokeh Effect" },
  { id: 5, font: "Lato", color: "White (#FFFFFF)", bg: "Dark Gradient Overlay" },
  { id: 6, font: "Montserrat", color: "Crimson (#DC143C)", bg: "City Blurred Night" },
  { id: 7, font: "Poppins", color: "Teal (#008080)", bg: "White Marble Texture" },
  { id: 8, font: "Futura", color: "Gold (#FFD700)", bg: "Luxury Black Pattern" },
  { id: 9, font: "Gotham", color: "Slate Gray (#708090)", bg: "Concrete Wall" },
  { id: 10, font: "Inter", color: "Forest Green (#228B22)", bg: "Nature Leaves Close-up" },
  { id: 50, font: "Noto Serif", color: "Beige (#F5F5DC)", bg: "Cream Paper" },
  { id: 100, font: "Inconsolata", color: "Terminal Gray (#CCCCCC)", bg: "Server Room" }
];
