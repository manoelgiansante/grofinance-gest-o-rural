import {
  formatCurrency,
  formatCurrencyNumber,
  formatCompactCurrency,
  formatCPF,
  formatCNPJ,
  formatCPFCNPJ,
  formatPhone,
  formatCEP,
  formatDateBR,
  formatDateTimeBR,
  formatRelativeDate,
  formatArea,
  formatWeight,
  formatPercentage,
  formatNumber,
  formatNFeAccessKey,
  parseCurrency,
  capitalize,
  truncate,
  pluralize,
} from '../formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('deve formatar valores monetários', () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toContain('1.234');
      expect(formatted).toContain('56');
      expect(formatCurrency(0)).toContain('0,00');
    });

    it('deve formatar valores negativos', () => {
      expect(formatCurrency(-100)).toContain('100,00');
    });
  });

  describe('formatCurrencyNumber', () => {
    it('deve formatar número sem símbolo de moeda', () => {
      expect(formatCurrencyNumber(1234.56)).toBe('1.234,56');
      expect(formatCurrencyNumber(0)).toBe('0,00');
    });
  });

  describe('formatCompactCurrency', () => {
    it('deve formatar valores em milhões', () => {
      expect(formatCompactCurrency(1500000)).toBe('R$ 1.5M');
      expect(formatCompactCurrency(2000000)).toBe('R$ 2.0M');
    });

    it('deve formatar valores em milhares', () => {
      expect(formatCompactCurrency(50000)).toBe('R$ 50k');
      expect(formatCompactCurrency(1000)).toBe('R$ 1k');
    });

    it('deve formatar valores menores normalmente', () => {
      expect(formatCompactCurrency(500)).toContain('500');
    });
  });

  describe('formatCPF', () => {
    it('deve formatar CPF', () => {
      expect(formatCPF('52998224725')).toBe('529.982.247-25');
    });

    it('deve retornar valor original se inválido', () => {
      expect(formatCPF('123')).toBe('123');
    });
  });

  describe('formatCNPJ', () => {
    it('deve formatar CNPJ', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
    });

    it('deve retornar valor original se inválido', () => {
      expect(formatCNPJ('123')).toBe('123');
    });
  });

  describe('formatCPFCNPJ', () => {
    it('deve formatar CPF automaticamente', () => {
      expect(formatCPFCNPJ('52998224725')).toBe('529.982.247-25');
    });

    it('deve formatar CNPJ automaticamente', () => {
      expect(formatCPFCNPJ('11222333000181')).toBe('11.222.333/0001-81');
    });
  });

  describe('formatPhone', () => {
    it('deve formatar celular (11 dígitos)', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
    });

    it('deve formatar telefone fixo (10 dígitos)', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
    });
  });

  describe('formatCEP', () => {
    it('deve formatar CEP', () => {
      expect(formatCEP('01310100')).toBe('01310-100');
    });

    it('deve retornar valor original se inválido', () => {
      expect(formatCEP('123')).toBe('123');
    });
  });

  describe('formatDateBR', () => {
    it('deve formatar data brasileira', () => {
      const date = new Date(2025, 0, 15); // mês 0-indexed
      expect(formatDateBR(date)).toBe('15/01/2025');
    });

    it('deve aceitar string de data', () => {
      const formatted = formatDateBR('2025-12-31T12:00:00');
      expect(formatted).toContain('2025');
    });

    it('deve retornar string vazia para data inválida', () => {
      expect(formatDateBR('invalid')).toBe('');
    });
  });

  describe('formatDateTimeBR', () => {
    it('deve formatar data e hora', () => {
      const date = new Date('2025-01-15T14:30:00');
      const formatted = formatDateTimeBR(date);
      expect(formatted).toMatch(/15\/01\/2025 14:30/);
    });
  });

  describe('formatRelativeDate', () => {
    it('deve retornar "Hoje" para data atual', () => {
      expect(formatRelativeDate(new Date())).toBe('Hoje');
    });

    it('deve retornar "Ontem" para ontem', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatRelativeDate(yesterday)).toBe('Ontem');
    });

    it('deve retornar dias para menos de uma semana', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      expect(formatRelativeDate(fiveDaysAgo)).toBe('5 dias atrás');
    });
  });

  describe('formatArea', () => {
    it('deve formatar área em hectares', () => {
      expect(formatArea(1500)).toBe('1.500 ha');
      expect(formatArea(150.5)).toBe('150,5 ha');
    });
  });

  describe('formatWeight', () => {
    it('deve formatar peso em kg', () => {
      expect(formatWeight(1500)).toBe('1.500 kg');
    });

    it('deve formatar peso em toneladas', () => {
      expect(formatWeight(1500, 'ton')).toBe('1,50 ton');
    });

    it('deve formatar peso em arrobas', () => {
      expect(formatWeight(450, 'arroba')).toBe('30,00 @');
    });
  });

  describe('formatPercentage', () => {
    it('deve formatar porcentagem', () => {
      expect(formatPercentage(25.5)).toBe('25.5%');
      expect(formatPercentage(100, 0)).toBe('100%');
    });
  });

  describe('formatNumber', () => {
    it('deve formatar número com separador de milhar', () => {
      expect(formatNumber(1000000)).toBe('1.000.000');
      expect(formatNumber(1234.567, 2)).toBe('1.234,57');
    });
  });

  describe('formatNFeAccessKey', () => {
    it('deve formatar chave de acesso NF-e', () => {
      const key = '35250112345678000190550010000124501000124501';
      expect(formatNFeAccessKey(key)).toBe(
        '3525 0112 3456 7800 0190 5500 1000 0124 5010 0012 4501'
      );
    });
  });

  describe('parseCurrency', () => {
    it('deve converter string monetária para número', () => {
      expect(parseCurrency('R$ 1.234,56')).toBe(1234.56);
      expect(parseCurrency('1.000,00')).toBe(1000);
    });

    it('deve retornar 0 para valor inválido', () => {
      expect(parseCurrency('abc')).toBe(0);
    });
  });

  describe('capitalize', () => {
    it('deve capitalizar primeira letra', () => {
      expect(capitalize('teste')).toBe('Teste');
      expect(capitalize('MAIUSCULA')).toBe('Maiuscula');
    });
  });

  describe('truncate', () => {
    it('deve truncar texto longo', () => {
      expect(truncate('Texto muito longo para exibir', 15)).toBe('Texto muito ...');
    });

    it('deve manter texto curto', () => {
      expect(truncate('Curto', 10)).toBe('Curto');
    });
  });

  describe('pluralize', () => {
    it('deve retornar singular para 1', () => {
      expect(pluralize(1, 'item', 'itens')).toBe('item');
    });

    it('deve retornar plural para mais de 1', () => {
      expect(pluralize(5, 'item', 'itens')).toBe('itens');
      expect(pluralize(0, 'item', 'itens')).toBe('itens');
    });
  });
});
