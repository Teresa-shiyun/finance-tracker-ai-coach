"use client";

import { useRef, useState } from "react";
import { parseCsv } from "@/lib/csv";
import type { Transaction } from "@/lib/types";

interface Props {
  onImport: (txs: Transaction[]) => void;
}

export default function CsvImport({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const result = parseCsv(text);
      if (result.transactions.length === 0) {
        setStatus(`Parsed ${result.total} rows but couldn't extract any transactions. Check that your CSV has Date, Description, and Amount columns.`);
        return;
      }
      onImport(result.transactions);
      setStatus(
        `Imported ${result.transactions.length} transaction${result.transactions.length === 1 ? "" : "s"}` +
          (result.skipped ? ` (skipped ${result.skipped} unparseable row${result.skipped === 1 ? "" : "s"}).` : ".")
      );
    };
    reader.onerror = () => setStatus("Could not read the file.");
    reader.readAsText(file);
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-md border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-zinc-400 transition hover:border-accent2 hover:text-white"
      >
        Click to choose a CSV file
      </button>
      <p className="text-xs text-zinc-500">
        Supports common bank exports — looks for <em>Date</em>, <em>Description</em> and{" "}
        <em>Amount</em> (or <em>Debit</em>/<em>Credit</em>) columns.
      </p>
      {status && (
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-zinc-300">
          {status}
        </div>
      )}
    </div>
  );
}
