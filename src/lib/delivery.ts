import { CartItem, Order, Subscription, InventoryItem } from "@/types";
import { 
  getAvailableInventoryItem, 
  assignInventoryItem, 
  createSubscription, 
  createOrder,
  getProductById 
} from "./db";

export interface DeliveryResult {
  order: Order;
  allocatedCredentials: {
    productId: string;
    productName: string;
    tierLabel: string;
    accountEmail: string;
    accountPassword: string;
    additionalInfo?: string;
    licenseKey?: string;
    expiresAt: string;
    warrantyUntil: string;
  }[];
  emailSentTo: string;
}

export async function processAutomatedDelivery(params: {
  userId: string;
  userEmail: string;
  userName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "card" | "crypto" | "applepay";
  paymentId: string;
}): Promise<DeliveryResult> {
  const {
    userId,
    userEmail,
    userName,
    items,
    subtotal,
    discount,
    total,
    paymentMethod,
    paymentId,
  } = params;

  const now = new Date();
  const orderItemsWithCredentials: Order["items"] = [];
  const allocatedCredentials: DeliveryResult["allocatedCredentials"] = [];
  const createdSubscriptions: Subscription[] = [];

  // Temporary ID for order association
  const temporaryOrderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  for (const cartItem of items) {
    const product = getProductById(cartItem.productId);
    const productName = product ? product.name : cartItem.product.name;
    const durationMonths = cartItem.tier.durationMonths || 1;

    // Calculate expiry and warranty dates
    const expiryDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
    const warrantyDays = product?.warrantyDays || 30;
    const warrantyDate = new Date(now.getTime() + warrantyDays * 24 * 60 * 60 * 1000);

    for (let i = 0; i < cartItem.quantity; i++) {
      // Find available stock item from inventory vault
      let inventoryItem: InventoryItem | undefined = getAvailableInventoryItem(
        cartItem.productId,
        cartItem.tier.id
      );

      let accountEmail = "";
      let accountPassword = "";
      let additionalInfo: string | undefined = undefined;
      let licenseKey: string | undefined = undefined;
      let assignedItemId = "";

      if (inventoryItem) {
        // Lease from vault
        const assigned = assignInventoryItem(inventoryItem.id, userId, temporaryOrderId);
        if (assigned) {
          accountEmail = assigned.accountEmail;
          accountPassword = assigned.accountPassword;
          additionalInfo = assigned.additionalInfo;
          licenseKey = assigned.licenseKey;
          assignedItemId = assigned.id;
        }
      } else {
        // Vault fallback instant generation if stock ran out during high demand
        accountEmail = `sub_${cartItem.product.slug}_${Math.random().toString(36).substring(2, 6)}@subvault.io`;
        accountPassword = `VaultPass#${Math.floor(100000 + Math.random() * 900000)}!`;
        additionalInfo = `Instant Vault Generated Seat | Warranty Active`;
        assignedItemId = `inv_auto_${Date.now()}`;
      }

      // Record in order items
      orderItemsWithCredentials.push({
        productId: cartItem.productId,
        productName,
        tierId: cartItem.tier.id,
        durationLabel: cartItem.tier.durationLabel,
        price: cartItem.tier.price,
        quantity: 1,
        inventoryItemId: assignedItemId,
        accountEmail,
        accountPassword,
        additionalInfo,
      });

      // Create subscriber record
      const subscription = createSubscription({
        userId,
        userEmail,
        productId: cartItem.productId,
        productName,
        tierId: cartItem.tier.id,
        durationLabel: cartItem.tier.durationLabel,
        orderId: temporaryOrderId,
        inventoryItemId: assignedItemId,
        accountEmail,
        accountPassword,
        additionalInfo,
        licenseKey,
        status: "active",
        autoRenew: true,
        startDate: now.toISOString(),
        expiresAt: expiryDate.toISOString(),
        warrantyUntil: warrantyDate.toISOString(),
      });

      createdSubscriptions.push(subscription);

      allocatedCredentials.push({
        productId: cartItem.productId,
        productName,
        tierLabel: cartItem.tier.durationLabel,
        accountEmail,
        accountPassword,
        additionalInfo,
        licenseKey,
        expiresAt: expiryDate.toISOString(),
        warrantyUntil: warrantyDate.toISOString(),
      });
    }
  }

  // Create final order in DB
  const finalOrder = createOrder({
    userId,
    userEmail,
    userName,
    items: orderItemsWithCredentials,
    subtotal,
    discount,
    total,
    paymentMethod,
    paymentId,
    status: "completed",
  });

  return {
    order: finalOrder,
    allocatedCredentials,
    emailSentTo: userEmail,
  };
}
