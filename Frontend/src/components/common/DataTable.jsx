import React from "react";
import SkeletonLoader from "./SkeletonLoader";

const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = "No records found.",
  className = "",
}) => {
  if (isLoading) {
    return <SkeletonLoader variant="table" rows={5} columns={columns.length} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-12 text-center text-slate-500 dark:text-slate-400 transition-colors duration-200 ${className}`}>
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-xl transition-colors duration-200 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-4 px-6 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm text-slate-800 dark:text-slate-200 font-normal">
            {data.map((row, rowIndex) => (
              <tr
                key={row._id || row.id || row.membershipId || rowIndex}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-150 group"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`py-4 px-6 align-middle ${col.className || ""}`}
                  >
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                      ? row[col.accessorKey]
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
