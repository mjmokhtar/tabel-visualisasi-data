// Data type detection and visualization recommendations

export type DataType = 'auto' | 'category' | 'timeseries' | 'multiseries';

export interface DataTypeInfo {
  type: DataType;
  confidence: 'high' | 'medium' | 'low';
  recommendedCharts: ('pie' | 'bar' | 'line' | 'area')[];
  reason: string;
}

export interface TableData {
  name: string;
  columns: string[];
  rows: { [key: string]: string | number }[];
}

/**
 * Detects the data type based on structure
 */
export function detectDataType(data: TableData): DataTypeInfo {
  const { columns, rows } = data;
  
  // Case 1: Single row with multiple columns (Category)
  if (rows.length === 1 && columns.length > 1) {
    return {
      type: 'category',
      confidence: 'high',
      recommendedCharts: ['pie', 'bar'],
      reason: '1 baris dengan banyak kategori - cocok untuk melihat proporsi/persentase',
    };
  }
  
  // Case 2: Multiple rows with 2 columns (Time Series - Single Metric)
  if (rows.length > 1 && columns.length === 2) {
    const firstColValues = rows.map(row => row[columns[0]]);
    const hasNumericFirstCol = firstColValues.every(val => 
      typeof val === 'number' || !isNaN(Number(val))
    );
    
    // If first column is numeric (like timestamps or indices)
    if (hasNumericFirstCol) {
      return {
        type: 'timeseries',
        confidence: 'high',
        recommendedCharts: ['line', 'area', 'bar'],
        reason: 'Data berurutan dengan 1 metrik - cocok untuk melihat tren',
      };
    }
    
    // First column is labels (like month names, categories)
    return {
      type: 'timeseries',
      confidence: 'medium',
      recommendedCharts: ['line', 'area', 'bar'],
      reason: 'Data dengan label dan 1 metrik - cocok untuk melihat perubahan',
    };
  }
  
  // Case 3: Multiple rows with 3+ columns (Multi-Series)
  if (rows.length > 1 && columns.length >= 3) {
    const firstColValues = rows.map(row => row[columns[0]]);
    const allNumeric = firstColValues.every(val => 
      typeof val === 'number' || !isNaN(Number(val))
    );
    
    // Check if other columns are numeric
    const otherColsNumeric = columns.slice(1).every(col => 
      rows.every(row => {
        const val = row[col];
        return typeof val === 'number' || !isNaN(Number(val));
      })
    );
    
    if (otherColsNumeric) {
      return {
        type: 'multiseries',
        confidence: 'high',
        recommendedCharts: ['line', 'area', 'bar'],
        reason: 'Multiple series untuk dibandingkan - cocok untuk melihat perbedaan tren',
      };
    }
  }
  
  // Case 4: Multiple rows, 1 column (Unusual, but handle it)
  if (rows.length > 1 && columns.length === 1) {
    return {
      type: 'category',
      confidence: 'low',
      recommendedCharts: ['bar'],
      reason: 'Data sederhana dengan 1 kolom',
    };
  }
  
  // Default fallback
  return {
    type: 'multiseries',
    confidence: 'low',
    recommendedCharts: ['bar', 'line'],
    reason: 'Struktur data kompleks - pilih visualisasi yang sesuai',
  };
}

/**
 * Get recommended charts for a given data type
 */
export function getRecommendedCharts(dataType: DataType): {
  recommended: ('pie' | 'bar' | 'line' | 'area')[];
  notRecommended: ('pie' | 'bar' | 'line' | 'area')[];
} {
  const allCharts: ('pie' | 'bar' | 'line' | 'area')[] = ['pie', 'bar', 'line', 'area'];
  
  let recommended: ('pie' | 'bar' | 'line' | 'area')[];
  
  switch (dataType) {
    case 'category':
      recommended = ['pie', 'bar'];
      break;
    case 'timeseries':
      recommended = ['line', 'area', 'bar'];
      break;
    case 'multiseries':
      recommended = ['line', 'area', 'bar'];
      break;
    default:
      recommended = allCharts;
  }
  
  const notRecommended = allCharts.filter(chart => !recommended.includes(chart));
  
  return { recommended, notRecommended };
}

/**
 * Get user-friendly explanation for data type
 */
export function getDataTypeExplanation(dataType: DataType): string {
  switch (dataType) {
    case 'category':
      return 'Data kategori - cocok untuk melihat proporsi atau perbandingan antar kategori';
    case 'timeseries':
      return 'Data time series - cocok untuk melihat tren atau perubahan dari waktu ke waktu';
    case 'multiseries':
      return 'Data multi-series - cocok untuk membandingkan beberapa metrik sekaligus';
    default:
      return 'Pilih tipe data sesuai dengan kebutuhan visualisasi Anda';
  }
}

/**
 * Get chart suitability info
 */
export function getChartSuitability(
  chartType: 'pie' | 'bar' | 'line' | 'area',
  dataType: DataType
): {
  suitable: boolean;
  reason: string;
} {
  const suitabilityMatrix: {
    [key in DataType]: {
      [key in 'pie' | 'bar' | 'line' | 'area']: { suitable: boolean; reason: string };
    };
  } = {
    auto: {
      pie: { suitable: true, reason: 'Auto-detect akan menentukan kesesuaian' },
      bar: { suitable: true, reason: 'Auto-detect akan menentukan kesesuaian' },
      line: { suitable: true, reason: 'Auto-detect akan menentukan kesesuaian' },
      area: { suitable: true, reason: 'Auto-detect akan menentukan kesesuaian' },
    },
    category: {
      pie: { suitable: true, reason: 'Ideal untuk melihat proporsi/persentase tiap kategori' },
      bar: { suitable: true, reason: 'Bagus untuk membandingkan nilai antar kategori' },
      line: { suitable: false, reason: 'Tidak cocok - data tidak memiliki kontinuitas waktu' },
      area: { suitable: false, reason: 'Tidak cocok - data tidak memiliki kontinuitas waktu' },
    },
    timeseries: {
      pie: { suitable: false, reason: 'Tidak cocok - pie chart untuk proporsi, bukan tren waktu' },
      bar: { suitable: true, reason: 'Bisa digunakan untuk melihat perubahan per periode' },
      line: { suitable: true, reason: 'Ideal untuk melihat tren dan pola perubahan' },
      area: { suitable: true, reason: 'Bagus untuk melihat volume dan akumulasi' },
    },
    multiseries: {
      pie: { suitable: false, reason: 'Tidak cocok - pie chart hanya untuk 1 series' },
      bar: { suitable: true, reason: 'Bagus untuk membandingkan nilai antar series' },
      line: { suitable: true, reason: 'Ideal untuk membandingkan tren multiple series' },
      area: { suitable: true, reason: 'Bagus untuk melihat kontribusi tiap series (stacked)' },
    },
  };
  
  return suitabilityMatrix[dataType][chartType];
}
