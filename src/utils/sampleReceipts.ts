/**
 * Utility to generate clean, legible canvas-rendered mock invoice images
 * for testing Tesseract.js OCR in-browser.
 */
export interface SampleBill {
  id: string;
  name: string;
  subtitle: string;
  product: string;
  brand: string;
  date: string;
  warranty: string;
  price: string;
  currency: string;
}

export const SAMPLE_BILLS: SampleBill[] = [
  {
    id: 'sample-tv',
    name: 'Sony Bravia 55" 4K TV',
    subtitle: 'Electronics Bill (₹74,990 • 1 Year)',
    product: 'Smart TV',
    brand: 'Sony',
    date: '2024-05-15',
    warranty: '1 Year Warranty Included',
    price: '74,990',
    currency: '₹',
  },
  {
    id: 'sample-macbook',
    name: 'Apple MacBook Pro M3',
    subtitle: 'Store Receipt ($1,999 • 2 Years)',
    product: 'MacBook Pro',
    brand: 'Apple',
    date: '2023-11-20',
    warranty: '2 Years AppleCare Warranty',
    price: '1,999.00',
    currency: '$',
  },
  {
    id: 'sample-fridge',
    name: 'LG Double Door Refrigerator',
    subtitle: 'Appliance Invoice (₹34,500 • 24 Months)',
    product: 'Refrigerator',
    brand: 'LG',
    date: '2024-02-10',
    warranty: '24 Months Comprehensive Warranty',
    price: '34,500',
    currency: '₹',
  }
];

export function createReceiptCanvasDataUrl(sample: SampleBill): string {
  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 700, 800);

  // Border & Header
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 660, 760);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 28px Courier, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RETAIL TAX INVOICE', 350, 70);

  ctx.font = '16px Courier, monospace';
  ctx.fillStyle = '#4B5563';
  ctx.fillText('Authorized Electronic MegaStore & Co.', 350, 100);
  ctx.fillText('GSTIN: 27AABCT3518Q1Z9 | Tel: +91 800-450-8800', 350, 125);

  // Divider
  ctx.beginPath();
  ctx.strokeStyle = '#9CA3AF';
  ctx.setLineDash([6, 4]);
  ctx.moveTo(40, 150);
  ctx.lineTo(660, 150);
  ctx.stroke();
  ctx.setLineDash([]);

  // Invoice Details
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 18px Courier, monospace';
  ctx.fillText(`Date: ${sample.date}`, 50, 190);
  ctx.fillText(`Invoice No: INV-2024-89412`, 50, 220);
  ctx.fillText(`Customer: Verified Buyer`, 50, 250);

  // Table header
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(40, 280, 620, 40);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 16px Courier, monospace';
  ctx.fillText('ITEM DESCRIPTION', 55, 305);
  ctx.fillText('QTY', 420, 305);
  ctx.fillText('AMOUNT', 530, 305);

  // Item row
  ctx.font = 'bold 18px Courier, monospace';
  ctx.fillText(`${sample.brand} ${sample.product}`, 55, 360);
  ctx.font = '16px Courier, monospace';
  ctx.fillStyle = '#4B5563';
  ctx.fillText(`Serial: SN-9847120-X`, 55, 390);
  ctx.fillText(`Coverage: ${sample.warranty}`, 55, 420);

  ctx.fillStyle = '#111827';
  ctx.fillText('1', 430, 360);
  ctx.fillText(`${sample.currency}${sample.price}`, 530, 360);

  // Subtotal & Total
  ctx.beginPath();
  ctx.strokeStyle = '#9CA3AF';
  ctx.setLineDash([4, 4]);
  ctx.moveTo(40, 470);
  ctx.lineTo(660, 470);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = '16px Courier, monospace';
  ctx.fillText('Subtotal:', 380, 510);
  ctx.fillText(`${sample.currency}${sample.price}`, 530, 510);
  
  ctx.fillText('Tax (0% included):', 380, 540);
  ctx.fillText(`${sample.currency}0.00`, 530, 540);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 22px Courier, monospace';
  ctx.fillText('Grand Total:', 340, 590);
  ctx.fillText(`${sample.currency}${sample.price}`, 510, 590);

  // Bottom Notice
  ctx.beginPath();
  ctx.strokeStyle = '#E5E7EB';
  ctx.moveTo(40, 630);
  ctx.lineTo(660, 630);
  ctx.stroke();

  ctx.font = 'italic 15px Courier, monospace';
  ctx.fillStyle = '#6B7280';
  ctx.textAlign = 'center';
  ctx.fillText('Please retain this receipt for warranty claims & service support.', 350, 670);
  ctx.fillText(`Manufacturer Warranty: ${sample.warranty}`, 350, 700);
  ctx.fillText('*** THANK YOU FOR YOUR BUSINESS ***', 350, 740);

  return canvas.toDataURL('image/png');
}
