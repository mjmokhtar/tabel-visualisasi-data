import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TableData {
  name: string;
  columns: string[];
  rows: { [key: string]: string | number }[];
  colors?: string[];
  dataType?: 'category' | 'timeseries' | 'multiseries';
}

interface ChartDisplayProps {
  data: TableData;
  chartType: 'pie' | 'bar' | 'line' | 'area';
}

// Default colors (fallback)
const DEFAULT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
];

export default function ChartDisplay({ data, chartType }: ChartDisplayProps) {
  // Use custom colors from data or fall back to default
  const COLORS = data.colors || DEFAULT_COLORS;

  const prepareChartData = () => {
    const dataType = data.dataType || 'category';

    // CATEGORY: Single row, multiple columns -> transpose
    if (dataType === 'category') {
      if (data.rows.length === 1 && data.columns.length > 1) {
        return data.columns.map((col, index) => {
          const value = data.rows[0][col];
          return {
            name: col,
            value: typeof value === 'string' ? Number(value) || 0 : value || 0,
            color: COLORS[index % COLORS.length],
          };
        });
      }
    }

    // TIME SERIES: All columns are metrics, create index-based x-axis
    if (dataType === 'timeseries') {
      return data.rows.map((row, rowIndex) => {
        const chartRow: { [key: string]: string | number } = {
          index: rowIndex + 1, // Auto-generated index (1, 2, 3...)
          indexLabel: `Baris ${rowIndex + 1}`, // Label for display
        };
        
        data.columns.forEach((col) => {
          const value = row[col];
          chartRow[col] = typeof value === 'string' ? Number(value) || 0 : value || 0;
        });
        
        return chartRow;
      });
    }

    // MULTI-SERIES: First column is label, rest are metrics
    if (dataType === 'multiseries') {
      return data.rows.map((row) => {
        const chartRow: { [key: string]: string | number } = {};
        data.columns.forEach((col) => {
          const value = row[col];
          if (typeof value === 'string' && !isNaN(Number(value))) {
            chartRow[col] = Number(value);
          } else {
            chartRow[col] = value || '';
          }
        });
        return chartRow;
      });
    }

    // Default fallback
    return data.rows.map((row) => {
      const chartRow: { [key: string]: string | number } = {};
      data.columns.forEach((col) => {
        const value = row[col];
        if (typeof value === 'string' && !isNaN(Number(value))) {
          chartRow[col] = Number(value);
        } else {
          chartRow[col] = value || '';
        }
      });
      return chartRow;
    });
  };

  const chartData = prepareChartData();
  const dataType = data.dataType || 'category';

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        // Only for category type
        if (dataType !== 'category') {
          return (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Pie chart hanya tersedia untuk tipe data Kategori
            </div>
          );
        }

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry: any, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        if (dataType === 'category') {
          // Category: Each column becomes a bar
          const legendPayload = chartData.map((entry: any, index) => ({
            value: entry.name,
            type: 'rect' as const,
            color: entry.color || COLORS[index % COLORS.length],
            id: entry.name,
          }));

          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend payload={legendPayload} iconType="rect" />
                <Bar dataKey="value" legendType="none">
                  {chartData.map((entry: any, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          );
        }

        if (dataType === 'timeseries') {
          // Time series: All columns as separate bars
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="indexLabel" />
                <YAxis />
                <Tooltip />
                <Legend />
                {data.columns.map((col, index) => (
                  <Bar
                    key={col}
                    dataKey={col}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          );
        }

        // Multi-series: First column as X-axis, rest as bars
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={data.columns[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.columns.slice(1).map((col, index) => (
                <Bar
                  key={col}
                  dataKey={col}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        if (dataType === 'category') {
          return (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Line chart tidak cocok untuk tipe data Kategori
            </div>
          );
        }

        if (dataType === 'timeseries') {
          // Time series: All columns as separate lines
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="indexLabel" />
                <YAxis />
                <Tooltip />
                <Legend />
                {data.columns.map((col, index) => (
                  <Line
                    key={col}
                    type="monotone"
                    dataKey={col}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={3}
                    dot={{ fill: COLORS[index % COLORS.length], r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          );
        }

        // Multi-series: First column as X-axis, rest as lines
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={data.columns[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.columns.slice(1).map((col, index) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={3}
                  dot={{ fill: COLORS[index % COLORS.length], r: 6 }}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        if (dataType === 'category') {
          return (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Area chart tidak cocok untuk tipe data Kategori
            </div>
          );
        }

        if (dataType === 'timeseries') {
          // Time series: All columns as separate areas
          return (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  {data.columns.map((col, index) => (
                    <linearGradient key={col} id={`gradient-${col}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="indexLabel" />
                <YAxis />
                <Tooltip />
                <Legend />
                {data.columns.map((col, index) => (
                  <Area
                    key={col}
                    type="monotone"
                    dataKey={col}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    fill={`url(#gradient-${col})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          );
        }

        // Multi-series: First column as X-axis, rest as areas (stacked)
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                {data.columns.slice(1).map((col, index) => (
                  <linearGradient key={col} id={`gradient-${col}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={data.columns[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.columns.slice(1).map((col, index) => (
                <Area
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  fill={`url(#gradient-${col})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderChart()}
      {chartData.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Tidak ada data untuk ditampilkan
        </div>
      )}
    </div>
  );
}
