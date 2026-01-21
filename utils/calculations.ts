/**
 * Utilitários de cálculos financeiros e agrícolas para o Agrofinance
 */

// Calcular margem bruta
export function calculateGrossMargin(revenue: number, costs: number): number {
  return revenue - costs;
}

// Calcular margem percentual
export function calculateMarginPercentage(revenue: number, costs: number): number {
  if (revenue === 0) return 0;
  return ((revenue - costs) / revenue) * 100;
}

// Calcular margem por hectare
export function calculateMarginPerHectare(margin: number, area: number): number {
  if (area === 0) return 0;
  return margin / area;
}

// Calcular custo por hectare
export function calculateCostPerHectare(totalCost: number, area: number): number {
  if (area === 0) return 0;
  return totalCost / area;
}

// Calcular ROI (Retorno sobre Investimento)
export function calculateROI(profit: number, investment: number): number {
  if (investment === 0) return 0;
  return (profit / investment) * 100;
}

// Calcular break-even (ponto de equilíbrio)
export function calculateBreakEven(
  fixedCosts: number,
  pricePerUnit: number,
  variableCostPerUnit: number
): number {
  const contribution = pricePerUnit - variableCostPerUnit;
  if (contribution <= 0) return Infinity;
  return fixedCosts / contribution;
}

// Calcular produtividade (rendimento por hectare)
export function calculateYieldPerHectare(production: number, area: number): number {
  if (area === 0) return 0;
  return production / area;
}

// Calcular variação percentual
export function calculateVariation(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Calcular média móvel
export function calculateMovingAverage(values: number[], period: number): number[] {
  if (period > values.length) return [];

  const result: number[] = [];
  for (let i = period - 1; i < values.length; i++) {
    const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

// Calcular total de um array de valores
export function calculateTotal(items: { value: number }[]): number {
  return items.reduce((sum, item) => sum + item.value, 0);
}

// Calcular média
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// Calcular valor com juros compostos
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  periods: number
): number {
  return principal * Math.pow(1 + rate / 100, periods);
}

// Calcular parcela de financiamento (Price)
export function calculatePMT(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const monthlyRate = annualRate / 100 / 12;
  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

// Calcular dias até vencimento
export function calculateDaysUntilDue(dueDate: Date | string): number {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Calcular dias de atraso
export function calculateDaysOverdue(dueDate: Date | string): number {
  const days = calculateDaysUntilDue(dueDate);
  return days < 0 ? Math.abs(days) : 0;
}

// Calcular FUNRURAL (2,3% sobre vendas de pessoa física)
export function calculateFunrural(saleValue: number, aliquot: number = 2.3): number {
  return saleValue * (aliquot / 100);
}

// Calcular estoque médio
export function calculateAverageStock(openingStock: number, closingStock: number): number {
  return (openingStock + closingStock) / 2;
}

// Calcular giro de estoque
export function calculateStockTurnover(costOfGoodsSold: number, averageStock: number): number {
  if (averageStock === 0) return 0;
  return costOfGoodsSold / averageStock;
}

// Calcular custo médio ponderado (FIFO simplificado)
export function calculateWeightedAverageCost(
  batches: { quantity: number; unitCost: number }[]
): number {
  const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);
  if (totalQuantity === 0) return 0;

  const totalCost = batches.reduce((sum, b) => sum + b.quantity * b.unitCost, 0);
  return totalCost / totalQuantity;
}

// Calcular depreciação linear
export function calculateLinearDepreciation(
  acquisitionValue: number,
  residualValue: number,
  usefulLifeYears: number
): number {
  if (usefulLifeYears === 0) return 0;
  return (acquisitionValue - residualValue) / usefulLifeYears;
}

// Arredondar para 2 casas decimais
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
