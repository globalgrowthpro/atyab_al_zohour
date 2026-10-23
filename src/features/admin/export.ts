import * as XLSX from "xlsx";

export type ExportRow = Record<string, string | number>;

// Builds an RTL Excel workbook from the currently filtered rows and downloads it.
export function exportToExcel(fileName: string, sheetName: string, rows: ExportRow[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const keys = Object.keys(rows[0] ?? {});
  ws["!cols"] = keys.map((k) => ({ wch: Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length)) + 2 }));
  const wb = XLSX.utils.book_new();
  wb.Workbook = { Views: [{ RTL: true }] };
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileName}-${date}.xlsx`);
}
