
export interface Shipment {
  id: string;
  date: string;
  employeeName: string;
  jobNo: string;
  invoiceNo: string;
  exporterName: string;
  shipper: string;
  buyer: string;
  depot: string;
  docQty: number;
  ctnQty: number;
  tonQty: number;
  unloadQty: number;
  conQty: number;
  otherAmt: number;
  remarks: string;
  totalIndent: number;
  paid: number;
  associationPaid?: number;
  associationRemarks?: string;
  cost: number;
  profit: number;
}

export interface Employee {
  id: string;
  name: string;
  post: string;
  mobile: string;
  joinDate: string;
  salary: number;
  address: string;
  optional: string;
  guardianMobile: string;
  role?: 'Admin' | 'Operator'; 
  status?: 'Active' | 'Locked'; 
}

export interface UserSession {
  name: string;
  role: 'Admin' | 'Operator';
  id: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Cash In' | 'Cash Out' | 'Special';
  category: string;
  subAccount?: string;
  description: string;
  amount: number;
  invoiceNo?: string;
  remarks?: string;
  paidMonth?: string;
}

export interface ListData {
  shipper: string[];
  buyer: string[];
  depot: string[];
  staff: string[];
  exporter: string[];
  exportInfo: string[];
  subAccounts: string[];
}

export interface AppSettings {
  // Branding
  appName: string;
  appTagline: string;
  logoUrl: string;
  adminName: string;
  adminRole: string;
  adminImg: string;
  
  // UI & Theme
  theme: 'light' | 'dark';
  fontFamily: string;
  textSize: number;
  sidebarSize: number;
  boxRadius: number;
  sidebarColor: string;
  popboxColor: string;
  backgroundColor: string;
  fontColor: string;
  glassIntensity: number;
  primaryColor: string;
  successColor: string;
  dangerColor: string;
  
  // System & Cloud
  wallpaper: string;
  globalZoom: number;
  swalSize: number;
  language: string;
  fontWeight: string;
  fontStyle: string;
  layoutMode: string;
  googleSheetUrl: string;
  maintenanceMode: boolean;
}

export interface DepotMapping {
  c: string;
  d: string;
}

export interface Truck {
  id: string;
  date: string;
  truckNo: string;
  driverMobile: string;
  depot: string;
  inTime: string;
  outTime: string;
}

export interface Contact {
  id: string;
  name: string;
  type: 'Customer' | 'Supplier/Employee';
  phone: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Export' | 'Import';
  shipperName: string;
}

export interface Shipper {
  id: string;
  name: string;
  commercialName: string;
  mobile: string;
  address: string;
  details: string;
}

export interface Buyer {
  id: string;
  name: string;
  details: string;
}

export interface Depot {
  id: string;
  name: string;
  code: string;
  details: string;
}

export interface PriceRate {
  id: string;
  category: 'DOC' | 'CTN' | 'TON' | 'UNLOAD' | 'CON';
  condition: string;
  rate: number;
}

export interface ReferenceData {
  depots: { name: string; code: string }[];
  buyers: string[];
  forwarders: { name: string; ain: string; code: string }[];
  hsCodes: { code: string; desc: string; type: string }[];
  countries: { name: string; code: string }[];
}
