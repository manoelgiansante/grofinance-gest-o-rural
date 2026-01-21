/**
 * Utilitários de validação para o Agrofinance
 */

// Validação de CPF
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false; // Todos dígitos iguais

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[9])) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[10])) return false;

  return true;
}

// Validação de CNPJ
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

  // Calcula primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleanCNPJ[12])) return false;

  // Calcula segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleanCNPJ[13])) return false;

  return true;
}

// Validação de CPF ou CNPJ
export function validateCPFCNPJ(value: string): boolean {
  const clean = value.replace(/\D/g, '');
  if (clean.length === 11) return validateCPF(clean);
  if (clean.length === 14) return validateCNPJ(clean);
  return false;
}

// Validação de email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validação de telefone brasileiro
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

// Validação de valor monetário
export function validateCurrency(value: string | number): boolean {
  if (typeof value === 'number') return value >= 0 && isFinite(value);
  const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
  return !isNaN(numValue) && numValue >= 0;
}

// Validação de data
export function validateDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d instanceof Date && !isNaN(d.getTime());
}

// Validação de data futura
export function isFutureDate(date: Date | string): boolean {
  if (!validateDate(date)) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}

// Validação de data passada
export function isPastDate(date: Date | string): boolean {
  if (!validateDate(date)) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

// Validação de área (hectares)
export function validateArea(area: number): boolean {
  return typeof area === 'number' && area > 0 && area <= 1000000;
}

// Validação de quantidade de estoque
export function validateStockQuantity(quantity: number, minStock: number = 0): boolean {
  return typeof quantity === 'number' && quantity >= 0 && quantity >= minStock;
}

// Validação de chave de acesso NF-e (44 dígitos)
export function validateNFeAccessKey(key: string): boolean {
  const cleanKey = key.replace(/\D/g, '');
  return cleanKey.length === 44;
}

// Validação de campos obrigatórios
export function validateRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// Validação de tamanho mínimo
export function validateMinLength(value: string, min: number): boolean {
  return typeof value === 'string' && value.length >= min;
}

// Validação de tamanho máximo
export function validateMaxLength(value: string, max: number): boolean {
  return typeof value === 'string' && value.length <= max;
}

// Validação de faixa numérica
export function validateRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}
