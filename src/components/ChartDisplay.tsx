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
  colors?: string[]; // Custom colors array
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

  // Check if we have single row with multiple columns (transpose case)
  const isSingleRowMultipleColumns = data.rows.length === 1 && data.columns.length > 1;

  const prepareChartData = () => {
    // If single row with multiple columns, transpose the data
    // Convert columns to rows for proper visualization
    if (isSingleRowMultipleColumns) {
      return data.columns.map((col, index) => {
        const value = data.rows[0][col];
        return {
          name: col,
          value: typeof value === 'string' ? Number(value) || 0 : value || 0,
          color: COLORS[index % COLORS.length], // Assign color
        };
      });
    }

    // Normal case: multiple rows
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

  const preparePieData = () => {
    // If single row with multiple columns, each column becomes a pie slice
    if (isSingleRowMultipleColumns) {
      return data.columns.map((col, index) => {
        const value = data.rows[0][col];
        return {
          name: col,
          value: typeof value === 'string' ? Number(value) || 0 : value || 0,
          color: COLORS[index % COLORS.length],
        };
      });
    }

    // Normal case: use first column as label, second as value
    const labelColumn = data.columns[0];
    const valueColumn = data.columns[1] || data.columns[0];

    return data.rows.map((row, index) => {
      const value = row[valueColumn];
      return {
        name: String(row[labelColumn] || 'Unknown'),
        value: typeof value === 'string' ? Number(value) || 0 : value || 0,
        color: COLORS[index % COLORS.length],
      };
    });
  };

  const chartData = chartType === 'pie' ? preparePieData() : prepareChartData();

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
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
        // For single row transpose case, use 'name' as X-axis
        if (isSingleRowMultipleColumns) {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {chartData.map((entry: any, index) => (
                  <Bar
                    key={`bar-${index}`}
                    dataKey="value"
                    fill={entry.color || COLORS[index % COLORS.length]}
                    name={entry.name}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          );
        }

        // Normal case: first column as X-axis, rest as bars
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
        // For single row transpose case, use 'name' as X-axis
        if (isSingleRowMultipleColumns) {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  name="Nilai"
                />
              </LineChart>
            </ResponsiveContainer>
          );
        }

        // Normal case: first column as X-axis, rest as lines
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
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        // For single row transpose case, use 'name' as X-axis
        if (isSingleRowMultipleColumns) {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  name="Nilai"
                />
              </AreaChart>
            </ResponsiveContainer>
          );
        }

        // Normal case: first column as X-axis, rest as areas
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
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
                  fill={COLORS[index % COLORS.length]}
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
