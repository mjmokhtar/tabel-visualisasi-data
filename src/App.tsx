import { useState, useEffect } from 'react';
import { Plus, Trash2, Table as TableIcon, PieChart, BarChart3, LineChart, Palette, Info } from 'lucide-react';
import DataTable from './components/DataTable';
import ChartDisplay from './components/ChartDisplay';
import { COLOR_THEMES } from './colorThemes';
import { 
  detectDataType, 
  getRecommendedCharts, 
  getDataTypeExplanation,
  getChartSuitability,
  DataType 
} from './dataTypeDetection';

interface TableData {
  name: string;
  columns: string[];
  rows: { [key: string]: string | number }[];
  colors?: string[];
  dataType?: DataType;
}

type ChartType = 'table' | 'pie' | 'bar' | 'line' | 'area';

function App() {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<string[]>(['']);
  const [rows, setRows] = useState<{ [key: string]: string | number }[]>([{}]);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [viewType, setViewType] = useState<ChartType>('table');
  
  // Color customization states
  const [selectedTheme, setSelectedTheme] = useState<string>('Default');
  const [customColors, setCustomColors] = useState<{ [key: string]: string }>({});
  const [useCustomColors, setUseCustomColors] = useState(false);
  
  // Data type detection
  const [dataTypeMode, setDataTypeMode] = useState<DataType>('auto');
  const [detectedDataType, setDetectedDataType] = useState<DataType | null>(null);

  const addColumn = () => {
    setColumns([...columns, '']);
  };

  const removeColumn = (index: number) => {
    const columnName = columns[index];
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
    
    const newRows = rows.map(row => {
      const newRow = { ...row };
      delete newRow[columnName];
      return newRow;
    });
    setRows(newRows);

    const newCustomColors = { ...customColors };
    delete newCustomColors[columnName];
    setCustomColors(newCustomColors);
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

      if (customColors[oldColumnName]) {
        const newCustomColors = { ...customColors };
        newCustomColors[value] = newCustomColors[oldColumnName];
        delete newCustomColors[oldColumnName];
        setCustomColors(newCustomColors);
      }
    }
  };

  const updateColumnColor = (columnName: string, color: string) => {
    setCustomColors({
      ...customColors,
      [columnName]: color,
    });
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

  const getColors = (): string[] => {
    if (useCustomColors) {
      const theme = COLOR_THEMES.find(t => t.name === selectedTheme);
      const themeColors = theme?.colors || COLOR_THEMES[0].colors;
      
      return columns.map((col, index) => 
        customColors[col] || themeColors[index % themeColors.length]
      );
    } else {
      const theme = COLOR_THEMES.find(t => t.name === selectedTheme);
      return theme?.colors || COLOR_THEMES[0].colors;
    }
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

    // Create temporary data for detection
    const tempData: TableData = {
      name: tableName,
      columns: validColumns,
      rows: validRows,
    };

    // Auto-detect data type
    const detection = detectDataType(tempData);
    const finalDataType = dataTypeMode === 'auto' ? detection.type : dataTypeMode;
    
    setDetectedDataType(detection.type);

    setTableData({
      name: tableName,
      columns: validColumns,
      rows: validRows,
      colors: getColors(),
      dataType: finalDataType,
    });
    setViewType('table');
  };

  const resetForm = () => {
    setTableName('');
    setColumns(['']);
    setRows([{}]);
    setTableData(null);
    setViewType('table');
    setSelectedTheme('Default');
    setCustomColors({});
    setUseCustomColors(false);
    setDataTypeMode('auto');
    setDetectedDataType(null);
  };

  // Get chart recommendations based on data type
  const getChartRecommendations = () => {
    if (!tableData) return { recommended: [], notRecommended: [] };
    
    const effectiveDataType = tableData.dataType || 'auto';
    return getRecommendedCharts(effectiveDataType);
  };

  const chartRecommendations = getChartRecommendations();

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

            {/* Data Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Tipe Data
              </label>
              <select
                value={dataTypeMode}
                onChange={(e) => setDataTypeMode(e.target.value as DataType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="auto">Auto Detect</option>
                <option value="category">Kategori (untuk proporsi/persentase)</option>
                <option value="timeseries">Time Series (untuk tren)</option>
                <option value="multiseries">Multi-Series (untuk perbandingan)</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                {getDataTypeExplanation(dataTypeMode)}
              </p>
              
              {detectedDataType && dataTypeMode === 'auto' && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <strong>Terdeteksi:</strong> {getDataTypeExplanation(detectedDataType)}
                </div>
              )}
            </div>

            {/* Color Theme Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Tema Warna
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                disabled={useCustomColors}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {COLOR_THEMES.map((theme) => (
                  <option key={theme.name} value={theme.name}>
                    {theme.name}
                  </option>
                ))}
              </select>
              
              {/* Color Preview */}
              <div className="mt-3 flex gap-2">
                {COLOR_THEMES.find(t => t.name === selectedTheme)?.colors.slice(0, 8).map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded border-2 border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Custom Color Toggle */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useCustom"
                  checked={useCustomColors}
                  onChange={(e) => setUseCustomColors(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="useCustom" className="text-sm text-gray-700 cursor-pointer">
                  Gunakan warna kustom
                </label>
              </div>
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
                    
                    {/* Custom Color Picker */}
                    {useCustomColors && col.trim() !== '' && (
                      <div className="relative">
                        <input
                          type="color"
                          value={customColors[col] || '#3B82F6'}
                          onChange={(e) => updateColumnColor(col, e.target.value)}
                          className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                          title="Pilih warna"
                        />
                      </div>
                    )}
                    
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
                <>
                  {/* Chart Type Buttons with Recommendations */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Chart yang direkomendasikan:</p>
                    <div className="flex flex-wrap gap-2">
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
                      
                      {(['pie', 'bar', 'line', 'area'] as const).map((type) => {
                        const isRecommended = chartRecommendations.recommended.includes(type);
                        const suitability = getChartSuitability(type, tableData.dataType || 'auto');
                        const Icon = type === 'pie' ? PieChart : type === 'bar' ? BarChart3 : LineChart;
                        
                        return (
                          <button
                            key={type}
                            onClick={() => setViewType(type)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition relative group ${
                              viewType === type
                                ? 'bg-blue-600 text-white'
                                : isRecommended
                                ? 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-300'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 opacity-60'
                            }`}
                            title={suitability.reason}
                          >
                            <Icon className="w-4 h-4" />
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                            {isRecommended && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {viewType !== 'table' && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                        {getChartSuitability(viewType as any, tableData.dataType || 'auto').reason}
                      </div>
                    )}
                  </div>
                </>
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
