const businessPhone =
  import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "918876058876";

export function createWhatsAppLink(
  medicineName: string,
  companyName?: string,
  quantity?: string,
): string {
  const lines = [
    `Hello Medipillar! I'm interested in:`,
    `Medicine: ${medicineName}`,
  ];
  if (companyName) lines.push(`Company: ${companyName}`);
  if (quantity) lines.push(`Qty: ${quantity}`);
  lines.push("", "Please share price and availability. Thanks!");
  return `https://wa.me/${businessPhone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function createPartnerWhatsAppLink(data: {
  name: string;
  email: string;
  phone: string;
  age?: string;
}): string {
  const lines = [
    "Hello Medipillar! I want to become a partner.",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
  ];
  if (data.age) lines.push(`Age: ${data.age}`);
  lines.push("", "Please share partnership details. Thanks!");
  return `https://wa.me/${businessPhone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/**
 * Builds a wa.me link to notify a customer that their order has been shipped.
 * The admin's browser opens this link in a new tab; the admin clicks Send.
 */
export function createShippedNotificationLink(data: {
  customerPhone: string;
  customerName: string;
  orderId: string;
  items: Array<{ medicineName: string; quantity: number }>;
}): string {
  const shortId = data.orderId.slice(0, 8).toUpperCase();
  const itemLines = data.items
    .map((i) => `  • ${i.medicineName} × ${i.quantity}`)
    .join("\n");

  const message = [
    `Hello ${data.customerName}! 🚚`,
    ``,
    `Great news! Your Medipillar order *#${shortId}* has been *shipped*.`,
    ``,
    `📦 Items:`,
    itemLines,
    ``,
    `Your order is on its way. We'll update you once it's delivered.`,
    ``,
    `Thank you for choosing Medipillar! 🌿`,
  ].join("\n");

  // Format customer phone to international format for wa.me
  const digits = data.customerPhone.replace(/\D/g, "");
  const formattedPhone = data.customerPhone.startsWith("+")
    ? digits
    : digits.length === 10
      ? `91${digits}`
      : digits;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
