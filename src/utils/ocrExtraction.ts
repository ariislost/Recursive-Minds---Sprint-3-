import { ExtractedWarrantyData } from '../types';

export const WARRANTY_DEFAULTS_BY_KEYWORD: Record<string, number> = {
  tv: 12,
  television: 12,
  phone: 12,
  smartphone: 12,
  mobile: 12,
  iphone: 12,
  laptop: 24,
  macbook: 24,
  computer: 24,
  fridge: 24,
  refrigerator: 24,
  default: 12,
};

const COMMON_BRANDS = [
  'Samsung', 'Apple', 'Sony', 'LG', 'Whirlpool', 'Dell', 'HP', 'Lenovo',
  'Asus', 'Acer', 'Bose', 'Dyson', 'OnePlus', 'Xiaomi', 'Philips', 'Google',
  'Panasonic', 'Godrej', 'Haier', 'Bosch', 'Boat', 'JBL', 'Canon', 'Nikon',
  'Motorola', 'Realme', 'Oppo', 'Vivo', 'Amazon', 'Microsoft'
];

const COMMON_PRODUCT_TERMS = [
  'Smart TV', 'OLED TV', 'QLED TV', 'Television',
  'iPhone', 'Smartphone', 'Galaxy Phone', 'Pixel Phone',
  'MacBook Pro', 'MacBook Air', 'Laptop', 'ThinkPad', 'Inspiron',
  'Double Door Refrigerator', 'Refrigerator', 'Fridge',
  'Washing Machine', 'Air Conditioner', 'AC', 'Microwave',
  'Headphones', 'Earbuds', 'Soundbar', 'Smartwatch', 'Camera'
];

/**
 * Parses raw OCR text using regex and heuristics.
 * Strictly plain JS & Regex - No external AI/LLM.
 */
export function extractWarrantyFromOCR(rawText: string): ExtractedWarrantyData {
  const notes: string[] = [];
  const text = rawText.replace(/\r\n/g, '\n');
  const lowerText = text.toLowerCase();

  // 1. Detect Brand
  let detectedBrand = '';
  for (const brand of COMMON_BRANDS) {
    const regex = new RegExp(`\\b${brand}\\b`, 'i');
    if (regex.test(text)) {
      detectedBrand = brand;
      notes.push(`Detected brand: ${brand}`);
      break;
    }
  }

  // 2. Detect Product Keyword / Title
  let detectedProduct = '';
  for (const productTerm of COMMON_PRODUCT_TERMS) {
    const regex = new RegExp(`\\b${productTerm}\\b`, 'i');
    if (regex.test(text)) {
      detectedProduct = productTerm;
      notes.push(`Detected product term: ${productTerm}`);
      break;
    }
  }

  // If no common product term found, try to grab the first non-empty line or reasonable title
  if (!detectedProduct) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    // Look for a line that isn't just an invoice/receipt header or date
    for (const line of lines) {
      if (!/invoice|receipt|tax|bill|date|total|tel|gst|order|cash|copy/i.test(line) && line.length < 50) {
        detectedProduct = line;
        break;
      }
    }
    if (!detectedProduct) {
      detectedProduct = detectedBrand ? `${detectedBrand} Device` : 'Electronic Device';
    }
  }

  // If brand is not detected yet, check if product starts with brand
  if (!detectedBrand) {
    for (const brand of COMMON_BRANDS) {
      if (detectedProduct.toLowerCase().includes(brand.toLowerCase())) {
        detectedBrand = brand;
        break;
      }
    }
    if (!detectedBrand) {
      detectedBrand = 'Generic / Retailer';
    }
  }

  // 3. Match Date
  // Formats:
  // - YYYY-MM-DD or YYYY/MM/DD
  // - DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  // - MM/DD/YYYY or MM-DD-YYYY
  // - 15 Jan 2024 / Jan 15, 2024 / 15-Oct-2023
  let detectedDate = '';
  
  // Format 1: YYYY-MM-DD
  const isoDateMatch = text.match(/\b(20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/);
  if (isoDateMatch) {
    detectedDate = `${isoDateMatch[1]}-${isoDateMatch[2].padStart(2, '0')}-${isoDateMatch[3].padStart(2, '0')}`;
    notes.push(`Matched date (YYYY-MM-DD): ${detectedDate}`);
  }

  // Format 2: DD/MM/YYYY or MM/DD/YYYY
  if (!detectedDate) {
    const dmyMatch = text.match(/\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](20\d{2})\b/);
    if (dmyMatch) {
      detectedDate = `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
      notes.push(`Matched date (DD/MM/YYYY): ${detectedDate}`);
    }
  }

  // Format 3: Month Name e.g. "12 Oct 2023" or "October 12, 2023"
  if (!detectedDate) {
    const monthNames = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const monthRegex = /\b(0?[1-9]|[12]\d|3[01])?\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*(0?[1-9]|[12]\d|3[01])?,?\s*(20\d{2})\b/i;
    const monthMatch = text.match(monthRegex);
    if (monthMatch) {
      const day = monthMatch[1] || monthMatch[3] || '01';
      const mStr = monthMatch[2].substring(0, 3).toLowerCase() as keyof typeof monthNames;
      const month = monthNames[mStr] || '01';
      const year = monthMatch[4];
      detectedDate = `${year}-${month}-${day.padStart(2, '0')}`;
      notes.push(`Matched date (Named Month): ${detectedDate}`);
    }
  }

  // Fallback date to today if none detected
  if (!detectedDate) {
    const today = new Date();
    detectedDate = today.toISOString().split('T')[0];
    notes.push('Date not found in OCR, defaulted to today');
  }

  // 4. Match Warranty Keywords ("1 year", "2 years", "12 months", "24 mos", etc.)
  let detectedWarrantyMonths = 0;

  // Regex patterns for warranty
  const yearPattern = /\b([1-5])\s*(?:year|years|yr|yrs)\b(?:\s*warranty)?/i;
  const monthPattern = /\b([1-9]|[1-4][0-9]|60)\s*(?:month|months|mo|mos)\b(?:\s*warranty)?/i;

  const yearMatch = text.match(yearPattern);
  const monthMatch = text.match(monthPattern);

  if (yearMatch) {
    detectedWarrantyMonths = parseInt(yearMatch[1], 10) * 12;
    notes.push(`Matched warranty: ${yearMatch[1]} year(s) (${detectedWarrantyMonths} months)`);
  } else if (monthMatch) {
    detectedWarrantyMonths = parseInt(monthMatch[1], 10);
    notes.push(`Matched warranty: ${detectedWarrantyMonths} months`);
  } else {
    // Fallback to hardcoded defaults object by product keyword
    let foundFallback = false;
    for (const [kw, months] of Object.entries(WARRANTY_DEFAULTS_BY_KEYWORD)) {
      if (kw !== 'default' && lowerText.includes(kw)) {
        detectedWarrantyMonths = months;
        notes.push(`Warranty keyword match fallback (${kw}): ${months} months`);
        foundFallback = true;
        break;
      }
    }
    if (!foundFallback) {
      detectedWarrantyMonths = WARRANTY_DEFAULTS_BY_KEYWORD.default;
      notes.push(`Applied standard default warranty: ${detectedWarrantyMonths} months`);
    }
  }

  // 5. Detect Currency and Price
  // ₹ / Rs / INR -> INR
  // $ -> USD
  // € -> EUR
  // £ -> GBP
  // Default INR
  let detectedCurrency = 'INR';
  let detectedPrice = 0;

  // Currency symbol search
  if (/[₹]|(?:Rs\.?|INR)\b/i.test(text)) {
    detectedCurrency = 'INR';
  } else if (/\$|USD\b/i.test(text)) {
    detectedCurrency = 'USD';
  } else if (/€|EUR\b/i.test(text)) {
    detectedCurrency = 'EUR';
  } else if (/£|GBP\b/i.test(text)) {
    detectedCurrency = 'GBP';
  } else {
    detectedCurrency = 'INR';
  }

  // Price regex patterns:
  // Match "Total", "Grand Total", "Amount", "Price", or currency symbol + number
  const pricePatterns = [
    /(?:total|grand\s*total|amount\s*paid|net\s*amount|price|subtotal)[\s:]*([₹$€£]|Rs\.?|INR|USD)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i,
    /([₹$€£]|Rs\.?|INR|USD)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i,
    /\b([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?)\b/
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Find numeric group in match
      const numericString = match.slice(1).reverse().find(g => g && /^[0-9,.]+$/.test(g.trim()));
      if (numericString) {
        const cleaned = numericString.replace(/,/g, '');
        const val = parseFloat(cleaned);
        if (!isNaN(val) && val > 0) {
          detectedPrice = val;
          notes.push(`Detected price: ${val} (${detectedCurrency})`);
          break;
        }
      }
    }
  }

  // If no price found, fallback to 0 or a reasonable placeholder
  if (detectedPrice === 0) {
    // Try to find any stand-alone number > 50
    const numbers = text.match(/\b\d{2,6}(?:\.\d{2})?\b/g);
    if (numbers && numbers.length > 0) {
      const candidates = numbers.map(n => parseFloat(n)).filter(n => n > 50 && n < 500000);
      if (candidates.length > 0) {
        detectedPrice = Math.max(...candidates);
        notes.push(`Guessed price from largest numeric token: ${detectedPrice}`);
      }
    }
  }

  return {
    product: detectedProduct,
    brand: detectedBrand,
    purchase_date: detectedDate,
    warranty_months: detectedWarrantyMonths,
    price: detectedPrice,
    currency: detectedCurrency,
    rawText,
    confidenceNotes: notes,
  };
}

/**
 * Calculates warranty expiration date given purchase date string and months.
 */
export function calculateExpiryDate(purchaseDateStr: string, warrantyMonths: number): string {
  try {
    const date = new Date(purchaseDateStr);
    if (isNaN(date.getTime())) {
      return purchaseDateStr;
    }
    date.setMonth(date.getMonth() + warrantyMonths);
    return date.toISOString().split('T')[0];
  } catch {
    return purchaseDateStr;
  }
}

/**
 * Computes remaining days from today to expiration date.
 */
export function getDaysUntilExpiry(expiryDateStr: string): number {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}

/**
 * Generate email template literal for claim:
 * "Subject: Warranty Claim - {product}
 * Dear {brand} Support, I am writing to file a warranty claim for my 
 * {product}, purchased on {purchase_date}. It remains under warranty 
 * until {expiry_date}. Please advise on next steps.
 * Regards, [Your Name]"
 */
export function generateClaimEmail(
  product: string,
  brand: string,
  purchaseDate: string,
  expiryDate: string,
  userName = 'Customer'
): { subject: string; body: string; fullEmail: string } {
  const subject = `Warranty Claim - ${product}`;
  const body = `Dear ${brand || 'Product'} Support,

I am writing to file a warranty claim for my ${product}, purchased on ${purchaseDate}. It remains under warranty until ${expiryDate}. Please advise on next steps.

Regards,
${userName}`;

  return {
    subject,
    body,
    fullEmail: `Subject: ${subject}\n\n${body}`
  };
}
