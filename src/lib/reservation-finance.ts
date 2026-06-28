// Centralized financial logic for reservations dashboard.
// Mapping (validated against reservation LP37J):
//   Receita bruta           = total_amount        (reserveTotal / listingInvoiceTotal)
//   Receita pós-taxa canal  = sell_price_corrected
//   Taxas de canal          = coalesce(total_forward_fee_all, total_forward_fee, 0)
//   Comissão                = company_commission
//   Receita líquida         = buy_price (direto; já desconta taxas e comissão — NÃO subtrair novamente)
//   Ticket médio            = receita bruta / quantidade de reservas confirmadas
export const num = (v: any) => Number(v ?? 0) || 0;

export function reservationGross(r: any): number {
  // reserveTotal (mapeado para total_amount na view). Fallback para sell_price_corrected
  // apenas quando total_amount não estiver disponível.
  return num(r?.total_amount ?? r?.sell_price_corrected);
}

export function reservationRevenueAfterChannelFee(r: any): number {
  return num(r?.sell_price_corrected);
}

export function reservationChannelFees(r: any): number {
  // total_forward_fee_all tem prioridade; se ausente, usa total_forward_fee; senão fees_amount.
  const v = r?.total_forward_fee_all ?? r?.total_forward_fee ?? r?.fees_amount;
  return num(v);
}

export function reservationCommission(r: any): number {
  return num(r?.company_commission);
}

export function reservationNet(r: any): number {
  // Receita líquida vem direto de buy_price; não subtrair taxas/comissão novamente.
  if (r?.buy_price != null) return num(r.buy_price);
  // Fallback defensivo se buy_price não vier preenchido.
  return reservationGross(r) - reservationChannelFees(r) - reservationCommission(r);
}
