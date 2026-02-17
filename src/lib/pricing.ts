export type TaxLine = {
  code: string;
  label: string;
  rate: number;
  taxableBase: number;
  amount: number;
};

export type TaxProfileInputLine = {
  id?: string;
  label: string;
  rate: number;
  appliesTo: "NIGHTLY" | "CLEANING" | "SERVICE" | "ALL";
  order?: number;
  isActive?: boolean;
};

export type TaxProfileInput = {
  id?: string;
  name?: string;
  country?: string;
  state?: string | null;
  county?: string | null;
  city?: string | null;
  vatRate?: number | null;
  gstRate?: number | null;
  lines?: TaxProfileInputLine[];
};

export type PricingInput = {
  nights: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  locationValue?: string | null;
  taxPercentage?: number | null;
  taxProfile?: TaxProfileInput | null;
};

export type PricingBreakdown = {
  subtotal: number;
  taxableBase: number;
  totalTaxRate: number;
  taxLines: TaxLine[];
  taxAmount: number;
  total: number;
  vatAmount: number;
  gstAmount: number;
};

const roundToCurrency = (value: number) => Math.round(value);

const isUsLocation = (locationValue?: string | null) => {
  if (!locationValue) return false;
  const normalized = locationValue.toLowerCase();
  return (
    normalized.includes("united states") ||
    normalized.includes(" usa") ||
    normalized.includes(" us,") ||
    normalized.endsWith(", us") ||
    normalized.includes("u.s.") ||
    normalized.includes("tennessee") ||
    normalized.includes(", tn")
  );
};

const isSeviervilleTn = (locationValue?: string | null) => {
  if (!locationValue) return false;
  const normalized = locationValue.toLowerCase();
  return normalized.includes("sevierville") && (normalized.includes("tennessee") || normalized.includes(", tn") || normalized.includes(" tn "));
};

export const calculatePricingBreakdown = ({
  nights,
  pricePerNight,
  cleaningFee,
  serviceFee,
  locationValue,
  taxPercentage,
  taxProfile,
}: PricingInput): PricingBreakdown => {
  const nightlySubtotal = roundToCurrency(pricePerNight * nights);
  const cleaningSubtotal = roundToCurrency(cleaningFee);
  const serviceSubtotal = roundToCurrency(serviceFee);
  const subtotal = nightlySubtotal + cleaningSubtotal + serviceSubtotal;
  const taxableBase = subtotal;
  const safeTaxPercentage = Math.max(0, Number(taxPercentage || 0));
  const safeVatRate = Math.max(0, Number(taxProfile?.vatRate || 0));
  const safeGstRate = Math.max(0, Number(taxProfile?.gstRate || 0));

  let taxLines: TaxLine[] = [];
  const activeProfileLines = (taxProfile?.lines || []).filter((line) => line && line.isActive !== false && Number(line.rate) > 0);

  if (activeProfileLines.length > 0) {
    taxLines = [...activeProfileLines]
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((line, index) => {
        const appliesTo = line.appliesTo || "ALL";
        const lineBase = appliesTo === "NIGHTLY"
          ? nightlySubtotal
          : appliesTo === "CLEANING"
            ? cleaningSubtotal
            : appliesTo === "SERVICE"
              ? serviceSubtotal
              : subtotal;

        return {
          code: line.id || `profile_line_${index}`,
          label: line.label,
          rate: Number(line.rate),
          taxableBase: lineBase,
          amount: 0,
        };
      });
  } else if (isSeviervilleTn(locationValue)) {
    taxLines = [
      { code: "sales_tax", label: "Sales tax", rate: 9.75, taxableBase: subtotal, amount: 0 },
      { code: "lodging_tax", label: "Occupancy/Lodging tax", rate: 3, taxableBase: subtotal, amount: 0 },
    ];
  } else if (isUsLocation(locationValue)) {
    taxLines = safeTaxPercentage > 0
      ? [{ code: "sales_tax", label: "Sales tax", rate: safeTaxPercentage, taxableBase: subtotal, amount: 0 }]
      : [];
  } else if (safeTaxPercentage > 0) {
    taxLines = [{ code: "tax", label: "Taxes", rate: safeTaxPercentage, taxableBase: subtotal, amount: 0 }];
  }

  const vatAmount = safeVatRate > 0 ? roundToCurrency(subtotal * (safeVatRate / 100)) : 0;
  const gstAmount = safeGstRate > 0 ? roundToCurrency(subtotal * (safeGstRate / 100)) : 0;
  if (vatAmount > 0) {
    taxLines.push({
      code: "vat",
      label: "VAT",
      rate: safeVatRate,
      taxableBase: subtotal,
      amount: vatAmount,
    });
  }
  if (gstAmount > 0) {
    taxLines.push({
      code: "gst",
      label: "GST",
      rate: safeGstRate,
      taxableBase: subtotal,
      amount: gstAmount,
    });
  }

  taxLines = taxLines.map((line) => ({
    ...line,
    amount: line.amount || roundToCurrency(line.taxableBase * (line.rate / 100)),
  }));

  const taxAmount = taxLines.reduce((sum, line) => sum + line.amount, 0);
  const totalTaxRate = taxLines.reduce((sum, line) => sum + line.rate, 0);
  const total = subtotal + taxAmount;

  return {
    subtotal,
    taxableBase,
    totalTaxRate,
    taxLines,
    taxAmount,
    total,
    vatAmount,
    gstAmount,
  };
};
