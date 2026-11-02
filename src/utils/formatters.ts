/**
 * Indian Financial Formatting Utilities for CapitalVest
 * Currency: INR (₹)
 * Number System: Lakhs & Crores (1 Lakh = 100,000, 1 Crore = 10,000,000)
 * Dates: DD/MM/YYYY
 * Timezone: Asia/Kolkata
 */

export function formatINR(amount: number | null | undefined, compact: boolean = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const sign = amount < 0 ? '-' : '';
  const absAmount = Math.abs(amount);

  if (compact) {
    if (absAmount >= 10000000) {
      // Crores (Cr)
      const inCrores = absAmount / 10000000;
      return `${sign}₹${inCrores.toFixed(2)} Cr`;
    } else if (absAmount >= 100000) {
      // Lakhs (L)
      const inLakhs = absAmount / 100000;
      return `${sign}₹${inLakhs.toFixed(2)} L`;
    } else if (absAmount >= 1000) {
      // Thousands (k)
      const inThousands = absAmount / 1000;
      return `${sign}₹${inThousands.toFixed(1)} K`;
    }
    return `${sign}₹${absAmount.toFixed(0)}`;
  }

  // Full Indian comma grouping: last 3 digits, then every 2 digits
  // Example: 12345678.50 -> 1,23,45,678.50
  const parts = absAmount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  // If decimal is 00, we can omit or keep depending on preference
  const result = decimalPart === '00' 
    ? `${sign}₹${formattedInteger}` 
    : `${sign}₹${formattedInteger}.${decimalPart}`;

  return result;
}

export function formatPercentage(val: number | null | undefined, includeSign: boolean = true): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '0.00%';
  }
  const sign = includeSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(d.getTime())) return String(dateString);
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(d.getTime())) return String(dateString);
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm} IST`;
  } catch {
    return String(dateString);
  }
}

export function formatIndianNumber(val: number): string {
  const parts = val.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree + decimalPart;
}
