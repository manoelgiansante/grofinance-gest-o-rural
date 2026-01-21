/**
 * Utilitários de formatação para o Agrofinance
 */

// Formatar valor monetário brasileiro
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Formatar valor monetário sem símbolo
export function formatCurrencyNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Formatar valor compacto (ex: 1.5M, 500k)
export function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return formatCurrency(value);
}

// Formatar CPF
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar CNPJ
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Formatar CPF ou CNPJ automaticamente
export function formatCPFCNPJ(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 11) return formatCPF(clean);
  return formatCNPJ(clean);
}

// Formatar telefone brasileiro
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

// Formatar CEP
export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return cep;
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Formatar data brasileira
export function formatDateBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

// Formatar data e hora
export function formatDateTimeBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return (
    d.toLocaleDateString('pt-BR') +
    ' ' +
    d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

// Formatar data relativa (Hoje, Ontem, etc)
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias atrás`;
  if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
  if (days < 365) return `${Math.floor(days / 30)} meses atrás`;
  return `${Math.floor(days / 365)} anos atrás`;
}

// Formatar área (hectares)
export function formatArea(hectares: number): string {
  return `${hectares.toLocaleString('pt-BR')} ha`;
}

// Formatar peso
export function formatWeight(kg: number, unit: 'kg' | 'ton' | 'arroba' = 'kg'): string {
  switch (unit) {
    case 'ton':
      return `${(kg / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ton`;
    case 'arroba':
      return `${(kg / 15).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} @`;
    default:
      return `${kg.toLocaleString('pt-BR')} kg`;
  }
}

// Formatar porcentagem
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Formatar número com separador de milhar
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Formatar chave de acesso NF-e
export function formatNFeAccessKey(key: string): string {
  const clean = key.replace(/\D/g, '');
  return clean.replace(/(\d{4})/g, '$1 ').trim();
}

// Parse de valor monetário brasileiro para number
export function parseCurrency(value: string): number {
  const clean = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

// Capitalizar primeira letra
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Truncar texto
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Pluralizar palavra
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
