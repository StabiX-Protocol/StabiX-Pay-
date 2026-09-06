"use client";

import { useEffect, useState } from "react";

import HistorySearch from "./components/HistorySearch";
import HistoryFilterBar from "./components/HistoryFilterBar";
import HistoryList from "./components/HistoryList";

import DateFilter from "./components/filters/DateFilter";
import AssetFilter from "./components/filters/AssetFilter";
import AmountFilter from "./components/filters/AmountFilter";
import TypeFilter from "./components/filters/TypeFilter";

type HistoryFilterType =
  | "date"
  | "asset"
  | "amount"
  | "type";

type HistoryFilters = {
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

const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
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

import {
  loadHistory,
  loadHistoryByDate,
  type Transaction,
} from "./lib/historyApi";

import { searchHistory } from "./lib/historySearch";

export default function HistoryPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [filters, setFilters] =
    useState<HistoryFilters>(DEFAULT_HISTORY_FILTERS);

  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] =
    useState<HistoryFilterType | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadHistory();
        setTransactions(data);
      } catch (error) {
        console.error(error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSearch(value: string) {
    setSearch(value);

    try {
      if (!value.trim()) {
        const data = await loadHistoryByDate(
          filters.date || undefined
        );

        setTransactions(data);
        return;
      }

      const data = await searchHistory(value);

      setTransactions(data);
    } catch (error) {
      console.error(error);
      setTransactions([]);
    }
  }

  function openFilter(type: HistoryFilterType) {
    setActiveFilter(type);
  }

  function closeFilter() {
    setActiveFilter(null);
  }

  function applyDateFilter(
    date: string | null,
    fromDate: string | null,
    toDate: string | null
  ) {
    setFilters((current) => ({
      ...current,
      date,
      fromDate,
      toDate,
    }));

    closeFilter();
  }

  function clearDateFilter() {
    setFilters((current) => ({
      ...current,
      date: null,
      fromDate: null,
      toDate: null,
    }));

    closeFilter();
  }

  function applyAssetFilter(asset: string | null) {
    setFilters((current) => ({
      ...current,
      asset,
    }));

    closeFilter();
  }

  function clearAssetFilter() {
    setFilters((current) => ({
      ...current,
      asset: null,
    }));

    closeFilter();
  }

  function applyAmountFilter(
    min: number | null,
    max: number | null
  ) {
    setFilters((current) => ({
      ...current,
      minAmount: min,
      maxAmount: max,
    }));

    closeFilter();
  }

  function clearAmountFilter() {
    setFilters((current) => ({
      ...current,
      minAmount: null,
      maxAmount: null,
    }));

    closeFilter();
  }

  function applyTypeFilter(type: string | null) {
    setFilters((current) => ({
      ...current,
      type,
    }));

    closeFilter();
  }

  function clearTypeFilter() {
    setFilters((current) => ({
      ...current,
      type: null,
    }));

    closeFilter();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-md px-4 pb-28">

        <h1 className="pt-6 text-2xl font-bold">
          Transaction History
        </h1>

        <HistorySearch
          value={search}
          onChange={handleSearch}
        />

        <HistoryFilterBar
          onOpenFilter={openFilter}
        />

        {loading ? (
          <div className="py-8 text-sm text-[var(--muted)]">
            Loading...
          </div>
        ) : (
          <HistoryList
            transactions={transactions}
            filters={filters}
            emptyText={
              search.trim()
                ? "No results"
                : "No transactions"
            }
          />
        )}

      </div>

      {activeFilter === "date" && (
        <DateFilter
          currentDate={filters.date}
          currentFromDate={filters.fromDate}
          currentToDate={filters.toDate}
          onApply={applyDateFilter}
          onClear={clearDateFilter}
          onClose={closeFilter}
        />
      )}

      {activeFilter === "asset" && (
        <AssetFilter
          currentAsset={filters.asset}
          onApply={applyAssetFilter}
          onClear={clearAssetFilter}
          onClose={closeFilter}
        />
      )}

      {activeFilter === "amount" && (
        <AmountFilter
          currentMin={filters.minAmount}
          currentMax={filters.maxAmount}
          onApply={applyAmountFilter}
          onClear={clearAmountFilter}
          onClose={closeFilter}
        />
      )}

      {activeFilter === "type" && (
        <TypeFilter
          currentType={filters.type}
          onApply={applyTypeFilter}
          onClear={clearTypeFilter}
          onClose={closeFilter}
        />
      )}

    </main>
  );
}