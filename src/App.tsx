import { useState } from 'react';
import { Plus, Trash2, Table as TableIcon, PieChart, BarChart3, LineChart } from 'lucide-react';
import DataTable from './components/DataTable';
import ChartDisplay from './components/ChartDisplay';

interface TableData {
  name: string;
  columns: string[];
  rows: { [key: string]: string | number }[];
}

type ChartType = 'table' | 'pie' | 'bar' | 'line' | 'area';

function App() {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<string[]>(['']);
  const [rows, setRows] = useState<{ [key: string]: string | number }[]>([{}]);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [viewType, setViewType] = useState<ChartType>('table');

  const addColumn = () => {
    setColumns([...columns, '']);
  };

  const removeColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
    const newRows = rows.map(row => {
      const newRow = { ...row };
      delete newRow[columns[index]];
      return newRow;
    });
    setRows(newRows);
  };

  const updateColumn = (index: number, value: string) => {
    const oldColumnName = columns[index];
    const newColumns = [...columns];
    newColumns[index] = value;
    setColumns(newColumns);

    if (oldColumnName && oldColumnName !== value) {
      const newRows = rows.map(row => {
        const newRow = { ...row };
        if (oldColumnName in newRow) {
          newRow[value] = newRow[oldColumnName];
          delete newRow[oldColumnName];
        }
        return newRow;
      });
      setRows(newRows);
    }
  };

  const addRow = () => {
    setRows([...rows, {}]);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  const updateCell = (rowIndex: number, columnName: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [columnName]: value,
    };
    setRows(newRows);
  };

  const generateTable = () => {
    const validColumns = columns.filter(col => col.trim() !== '');

    if (!tableName.trim() || validColumns.length === 0) {
      alert('Mohon isi nama tabel dan minimal satu kolom');
      return;
    }

    const validRows = rows.filter(row =>
      Object.keys(row).some(key => row[key] && String(row[key]).trim() !== '')
    );

    if (validRows.length === 0) {
      alert('Mohon isi minimal satu baris data');
      return;
    }

    setTableData({
      name: tableName,
      columns: validColumns,
      rows: validRows,
    });
    setViewType('table');
  };

  const resetForm = () => {
    setTableName('');
    setColumns(['']);
    setRows([{}]);
    setTableData(null);
    setViewType('table');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Tabel & Visualisasi Data
          </h1>
          <p className="text-gray-600">
            Buat tabel dan visualisasikan data Anda dengan mudah
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <TableIcon className="w-6 h-6 text-blue-600" />
              Input Data
            </h2>

            {/* Table Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Tabel
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Contoh: Penjualan Bulanan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Columns */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Kolom
                </label>
                <button
                  onClick={addColumn}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Kolom
                </button>
              </div>
              <div className="space-y-2">
                {columns.map((col, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => updateColumn(index, e.target.value)}
                      placeholder={`Kolom ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    {columns.length > 1 && (
                      <button
                        onClick={() => removeColumn(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Data Baris
                </label>
                <button
                  onClick={addRow}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Baris
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Baris {rowIndex + 1}
                      </span>
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(rowIndex)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {columns.filter(col => col.trim() !== '').map((col, colIndex) => (
                        <input
                          key={colIndex}
                          type="text"
                          value={row[col] || ''}
                          onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                          placeholder={col || `Kolom ${colIndex + 1}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={generateTable}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
              >
                Generate Tabel
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Display Area */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {tableData ? tableData.name : 'Preview'}
              </h2>

              {tableData && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setViewType('table')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      viewType === 'table'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <TableIcon className="w-4 h-4" />
                    Tabel
                  </button>
                  <button
                    onClick={() => setViewType('pie')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      viewType === 'pie'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <PieChart className="w-4 h-4" />
                    Pie Chart
                  </button>
                  <button
                    onClick={() => setViewType('bar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      viewType === 'bar'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setViewType('line')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      viewType === 'line'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <LineChart className="w-4 h-4" />
                    Line Chart
                  </button>
                  <button
                    onClick={() => setViewType('area')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      viewType === 'area'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <LineChart className="w-4 h-4" />
                    Area Chart
                  </button>
                </div>
              )}
            </div>

            {tableData ? (
              viewType === 'table' ? (
                <DataTable data={tableData} />
              ) : (
                <ChartDisplay data={tableData} chartType={viewType} />
              )
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <TableIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Silakan isi data dan klik "Generate Tabel"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
