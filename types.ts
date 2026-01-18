
export interface Shipment {
  id: string;
  date: string;
  invoiceNo: string;
  employeeName: string;
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

export interface Transaction {
  id: string;
  date: string;
  type: 'Cash In' | 'Cash Out';
  category: string;
  description: string;
  amount: number;
  invoiceNo?: string;
  remarks?: string;
}

export interface ReferenceData {
  depots: { name: string; code: string }[];
  buyers: string[];
  forwarders: { name: string; ain: string; code: string }[];
  hsCodes: { code: string; desc: string; type: string }[];
  countries: { name: string; code: string }[];
}

export interface AppSettings {
  adminName: string;
  adminRole: string;
  adminImg: string;
  theme: 'light' | 'dark';
  fontFamily: string;
  textSize: number;
  sidebarSize: number;
  boxRadius: number;
  sidebarColor: string;
  wallpaper: string;
  globalZoom: number;
  swalSize: number;
  language: string;
  fontWeight: string;
  fontStyle: string;
  backgroundColor: string;
  fontColor: string;
  layoutMode: string;
  googleSheetUrl: string;
}

export interface ListData {
  shipper: string[];
  buyer: string[];
  depot: string[];
  staff: string[];
  exportInfo: string[];
}

export interface DepotMapping {
  c: string; // Code
  d: string; // Depot Name
}
