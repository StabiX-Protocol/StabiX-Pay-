export type HistoryFilterType =
  | "date"
  | "asset"
  | "amount"
  | "type";

export type HistoryFilters = {
  type: string | null;
  asset: string | null;

  date: string | null;

  fromDate: string | null;
  toDate: string | null;

  minAmount: number | null;
  maxAmount: number | null;

  tempMin: number | null;
  tempMax: number | null;
};

export const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
  type: null,
  asset: null,

  date: null,

  fromDate: null,
  toDate: null,

  minAmount: null,
  maxAmount: null,

  tempMin: null,
  tempMax: null,
};