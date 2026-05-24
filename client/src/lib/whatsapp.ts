const phone =
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
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
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
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
