// Data type detection and visualization recommendations (Manual Mode Only)

export type DataType = 'category' | 'timeseries' | 'multiseries';

export interface DataTypeInfo {
  type: DataType;
  recommendedCharts: ('pie' | 'bar' | 'line' | 'area')[];
  disabledCharts: ('pie' | 'bar' | 'line' | 'area')[];
  description: string;
  xAxisLabel: string;
  yAxisLabel: string;
}

/**
 * Get chart recommendations and info for a given data type
 */
export function getDataTypeInfo(dataType: DataType): DataTypeInfo {
  const infoMap: Record<DataType, DataTypeInfo> = {
    category: {
      type: 'category',
      recommendedCharts: ['pie', 'bar'],
      disabledCharts: ['line', 'area'],
      description: 'Data kategori - cocok untuk melihat proporsi atau perbandingan antar kategori',
      xAxisLabel: 'Kategori',
      yAxisLabel: 'Nilai',
    },
    timeseries: {
      type: 'timeseries',
      recommendedCharts: ['line', 'area', 'bar'],
      disabledCharts: ['pie'],
      description: 'Data time series - cocok untuk melihat tren atau perubahan dari waktu ke waktu',
      xAxisLabel: 'Waktu/Urutan',
      yAxisLabel: 'Nilai',
    },
    multiseries: {
      type: 'multiseries',
      recommendedCharts: ['line', 'area', 'bar'],
      disabledCharts: ['pie'],
      description: 'Data multi-series - cocok untuk membandingkan beberapa metrik sekaligus',
      xAxisLabel: 'Label',
      yAxisLabel: 'Nilai',
    },
  };

  return infoMap[dataType];
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
    category: {
      pie: { suitable: true, reason: 'Ideal untuk melihat proporsi/persentase tiap kategori' },
      bar: { suitable: true, reason: 'Bagus untuk membandingkan nilai antar kategori' },
      line: { suitable: false, reason: 'Tidak cocok - data kategori tidak memiliki kontinuitas waktu' },
      area: { suitable: false, reason: 'Tidak cocok - data kategori tidak memiliki kontinuitas waktu' },
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

/**
 * Check if chart type is enabled for data type
 */
export function isChartEnabled(
  chartType: 'pie' | 'bar' | 'line' | 'area',
  dataType: DataType
): boolean {
  const info = getDataTypeInfo(dataType);
  return !info.disabledCharts.includes(chartType);
}
