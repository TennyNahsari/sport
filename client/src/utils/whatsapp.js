/**
 * Format phone number and return WhatsApp web/app URL.
 * Handles numbers like 08123456789, +628123456789, 628123456789, etc.
 */
export function getWaUrl(phone, defaultText = '') {
  if (!phone) return '#';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  const baseUrl = `https://wa.me/${cleaned}`;
  return defaultText ? `${baseUrl}?text=${encodeURIComponent(defaultText)}` : baseUrl;
}
