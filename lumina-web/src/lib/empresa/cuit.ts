const WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const;
const TYPES = new Set(["20", "23", "24", "25", "26", "27", "30", "33", "34"]);

export function digitsCuit(value: string): string {
  return value.replace(/\D/g, "");
}

export function checkDigitCuit(firstTen: string): number | null {
  if (!/^\d{10}$/.test(firstTen)) return null;
  const sum = WEIGHTS.reduce((acc, weight, index) => acc + Number(firstTen[index]) * weight, 0);
  const rest = 11 - (sum % 11);
  if (rest === 11) return 0;
  if (rest === 10) return null;
  return rest;
}

export function isValidCuit(value: string): boolean {
  const digits = digitsCuit(value);
  if (digits.length !== 11) return false;
  if (!TYPES.has(digits.slice(0, 2))) return false;
  const expected = checkDigitCuit(digits.slice(0, 10));
  return expected !== null && expected === Number(digits[10]);
}

export function formatCuit(value: string): string {
  const digits = digitsCuit(value);
  if (digits.length !== 11) return value.trim();
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

export function displayEmpresa(cuit: string, company?: string): string {
  const formatted = formatCuit(cuit);
  const name = company?.trim();
  if (!name || name === formatted || name === digitsCuit(cuit)) return formatted;
  return name;
}
