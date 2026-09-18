export type CompanyType = "company" | "personal" | "trust";

export interface Company {
  id: string;
  name: string;
  shortName: string;
  type: CompanyType;
  code: string;
}

export interface Owner {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone: string;
}

export interface OwnershipShare {
  ownerId: string;
  sharePercent: number;
}

export type PropertyType = "Commercial" | "Residential" | "Mixed";
export type CommercialSubtype = "Office" | "Shop" | "Warehouse";
export type ResidentialSubtype = "Studio" | "1 BHK" | "2 BHK" | "3 BHK" | "4 BHK";
export type PropertyStatus =
  | "Occupied"
  | "Vacant"
  | "Self-Use"
  | "Under Renovation"
  | "Under Dispute"
  | "Under Sale";
export type Furnishing = "Unfurnished" | "Semi-Furnished" | "Fully Furnished";

export interface ParkingSlot {
  id: string;
  label: string;
  type: "Covered" | "Open" | "Stilt";
}

export interface PropertyExpenses {
  societyCharges: number;
  propertyTax: number;
  maintenance: number;
  insurance: number;
  repairs: number;
}

export interface Property {
  id: string;
  code: string;
  name: string;
  unitNumber: string;
  companyId: string;
  type: PropertyType;
  subtype: CommercialSubtype | ResidentialSubtype;
  status: PropertyStatus;
  country: string;
  state: string;
  city: string;
  area: string;
  building: string;
  address: string;
  pin: string;
  floor: string;
  bhk?: number;
  builtUp: number;
  carpet: number;
  superBuiltUp: number;
  parkingCount: number;
  parking: ParkingSlot[];
  furnishing: Furnishing;
  fixtures: string[];
  amenities: string[];
  ownership: OwnershipShare[];
  currentRent: number;
  expectedRent: number;
  tenantId?: string;
  tenantName?: string;
  assignedBroker?: string;
  daysVacant?: number;
  mapQuery: string;
  expenses: PropertyExpenses;
}

export type DocumentCategory =
  | "Sale Deed"
  | "POA"
  | "Board Resolution"
  | "Society NOC"
  | "Floor Plan"
  | "Insurance"
  | "Invoice"
  | "Warranty"
  | "Lease Agreement"
  | "Registered Copy"
  | "KYC"
  | "Other";

export interface EstateDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  entityType: "property" | "asset" | "lease" | "amc";
  entityIds: string[];
  uploadedOn: string;
  version: string;
  expiresOn?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "tenant" | "lease" | "asset" | "document" | "maintenance" | "event";
}

export type AssetCategory =
  | "AC"
  | "Refrigerator"
  | "Washing Machine"
  | "Water Purifier";

export type AssetStatus = "In Use" | "Dead Stock" | "Under Repair" | "Decommissioned";
export type CoverageStatus = "Active" | "Expiring" | "Expired" | "None";

export interface AssetCategoryConfig {
  id: string;
  name: AssetCategory;
  subtypes: string[];
}

export interface Asset {
  id: string;
  assetNo: string;
  name: string;
  category: AssetCategory;
  subtype: string;
  model: string;
  serialNumber: string;
  propertyId?: string;
  companyId: string;
  status: AssetStatus;
  purchaseDate: string;
  purchasePrice: number;
  invoiceNumber: string;
  amcContractId?: string;
  warrantyLabel: string;
  warrantyExpiry?: string;
  documentIds: string[];
}

export interface AssignmentMove {
  id: string;
  assetId: string;
  fromPropertyId?: string;
  toPropertyId?: string;
  date: string;
  note: string;
}

export interface MaintenanceEvent {
  id: string;
  assetId: string;
  date: string;
  type: "Service" | "Repair" | "Install";
  description: string;
  cost: number;
  vendor: string;
}

export interface AmcContract {
  id: string;
  supplier: string;
  startDate: string;
  expiryDate: string;
  coverage: string;
  assetIds: string[];
}

export type PipelineStage =
  | "Prospect Submitted"
  | "Under Review"
  | "Approved"
  | "Negotiation"
  | "Terms Finalised"
  | "KYC Pending"
  | "KYC Complete"
  | "Agreement Drafted"
  | "Agreement Signed"
  | "Registration Pending"
  | "Registered"
  | "Active"
  | "Notice Given"
  | "Vacating"
  | "Closed"
  | "Rejected";

export type LeaseStatus = PipelineStage;
export type RentMonthStatus = "Paid" | "Due" | "Upcoming" | "Free Period" | "Partial";

export interface EscalationStep {
  years: number;
  percent: number;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  kycStatus: "Complete" | "Pending" | "Partial";
  broker?: string;
}

export interface Prospect {
  id: string;
  srNumber: string;
  tenantName: string;
  tenantId?: string;
  propertyIds: string[];
  broker?: string;
  submittedBy: string;
  stage: PipelineStage;
  expectedRent: number;
  stageHistory: TimelineEvent[];
}

export interface PaymentRecord {
  id: string;
  month: string;
  invoiced: number;
  received: number;
  tds: number;
  outstanding: number;
  date?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface Lease {
  id: string;
  srNumber: string;
  tenantId: string;
  propertyIds: string[];
  companyId: string;
  status: LeaseStatus;
  leaseAmount: number;
  startDate: string;
  endDate: string;
  lockInMonths: number;
  freePeriodMonths: number;
  securityDeposit: number;
  tokenAmount: number;
  noticePeriodDays: number;
  agreementDate: string;
  possessionDate: string;
  registrationDate?: string;
  rentCommencementDate: string;
  chequeDetails: string;
  registrationDetails: string;
  escalation: EscalationStep[];
  suppressReminders: boolean;
  payments: PaymentRecord[];
  nextDueDate: string;
  outstanding: number;
}

export type UserRole =
  | "Owner/Family"
  | "Super Admin"
  | "Property Manager"
  | "Accounts"
  | "Legal"
  | "Maintenance"
  | "Broker"
  | "Tenant"
  | "Vendor";

export type AccessLevel = "none" | "view" | "edit";

export interface ModuleAccess {
  properties: boolean;
  assets: boolean;
  leases: boolean;
  financials: boolean;
  userManagement: boolean;
  reports: boolean;
}

export interface FieldPermission {
  module: keyof ModuleAccess;
  resource: string;
  view: boolean;
  edit: boolean;
}

export interface UserScope {
  companyIds: string[];
  stateIds?: string[];
  cityIds?: string[];
  buildingIds?: string[];
  propertyIds?: string[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Inactive";
  lastActive: string;
  avatarInitials: string;
  scope: UserScope;
  modules: ModuleAccess;
  permissions: FieldPermission[];
}

export type NotificationType =
  | "rent-due"
  | "lease-expiring"
  | "insurance-expiring"
  | "amc-expiring"
  | "poa-expiring"
  | "vacant-followup";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  entity: string;
  entityHref: string;
  daysLeft: number;
  companyId: string;
  createdAt: string;
}
