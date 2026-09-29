export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export type ProductCategory = 
  | "AI & Developer"
  | "Productivity"
  | "Streaming"
  | "Education & Learning"
  | "Design & Video";

export interface PlanTier {
  id: string;
  durationMonths: number;
  durationLabel: string; // e.g. "1 Month", "3 Months", "12 Months"
  price: number;
  originalPrice?: number;
  popular?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  features: string[];
  badge?: string; // e.g. "Best Seller", "Ultra 4K", "Instant Delivery"
  icon: string; // Icon name e.g. "Tv", "Brain", "Shield", "Sparkles", "Gamepad2"
  color: string; // Hex or gradient class
  warrantyDays: number;
  rules: string[]; // e.g. "Do not change password", "Single screen profile"
  tiers: PlanTier[];
}

export type InventoryStatus = "available" | "assigned" | "revoked";

export interface InventoryItem {
  id: string;
  productId: string;
  tierId: string;
  accountEmail: string;
  accountPassword: string;
  additionalInfo?: string; // e.g. "Profile 3 (PIN: 1984)", "Backup Codes: 8941 2940"
  licenseKey?: string;
  status: InventoryStatus;
  assignedToUserId?: string;
  assignedToOrderId?: string;
  assignedAt?: string;
  createdAt: string;
}

export type SubscriptionStatus = "active" | "expiring_soon" | "expired" | "revoked";

export interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  tierId: string;
  durationLabel: string;
  orderId: string;
  inventoryItemId: string;
  accountEmail: string;
  accountPassword: string;
  additionalInfo?: string;
  licenseKey?: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  startDate: string;
  expiresAt: string;
  warrantyUntil: string;
}

export type OrderStatus = "completed" | "processing" | "refunded";

export interface OrderItem {
  productId: string;
  productName: string;
  tierId: string;
  durationLabel: string;
  price: number;
  quantity: number;
  inventoryItemId?: string;
  accountEmail?: string;
  accountPassword?: string;
  additionalInfo?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "card" | "crypto" | "applepay";
  paymentId: string;
  status: OrderStatus;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  tier: PlanTier;
  quantity: number;
}
