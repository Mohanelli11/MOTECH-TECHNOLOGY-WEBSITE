export type ProductStatus = 'available' | 'preorder' | 'disabled';

export type DocCategory =
'Technical Manual' |
'Firmware' |
'Schematics & PCB' |
'Software' |
'Design Package' |
'Commissioning';

export type SpecRow = {label: string;value: string;};

/**
 * Metadata for a protected resource. NOTE: no storage path, bucket, or URL is
 * ever included here — delivery is brokered by the access-control service.
 */
export type ProtectedFile = {
  id: string;
  productId: string;
  title: string;
  category: DocCategory;
  format: string;
  sizeLabel: string;
  version: string;
  uploadedAt: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  image: string;
  price: number;
  currency: 'KES';
  status: ProductStatus;
  features: string[];
  applications: string[];
  specs: SpecRow[];
  hardware: SpecRow[];
  software: SpecRow[];
  architecture: string[];
};

export type Role = 'customer' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  role: Role;
  disabled: boolean;
  createdAt: string;
};

export type OrderStatus =
'awaiting_payment' |
'under_review' |
'verified' |
'rejected';

export type PaymentProof = {
  fileName: string;
  sizeLabel: string;
  uploadedAt: string;
  note: string;
};

export type Order = {
  id: string;
  reference: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  currency: 'KES';
  status: OrderStatus;
  createdAt: string;
  reviewedAt: string | null;
  proof: PaymentProof | null;
  adminNote: string;
  licenseId: string | null;
};

export type LicenseStatus = 'active' | 'deactivated';

export type License = {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  issuedAt: string;
  status: LicenseStatus;
};

export type Session = {
  token: string;
  userId: string;
  expiresAt: number;
};

export type DownloadGrant = {
  token: string;
  fileTitle: string;
  expiresAt: number;
  ttlSeconds: number;
};