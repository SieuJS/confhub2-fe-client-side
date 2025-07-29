// src/models/visualization/visualization.ts

export type FieldType = 'dimension' | 'measure';

export interface DataField {
  id: string;
  name: string;
  type: FieldType;
  accessor?: (dataItem: any) => string | number | null | any[];
  aggregation?: 'count' | 'average' | 'sum' | 'none';
}

// MODIFIED: Thêm các loại biểu đồ mới
export type ChartType = 'none' | 'bar' | 'line' | 'pie' | 'scatter' | 'map' | 'treemap';

export interface ChartAxisConfig {
  fieldId: string | null;
}

export interface ChartColorConfig {
  fieldId: string | null;
}

export interface ChartSizeConfig {
    fieldId: string | null;
}

export interface ChartConfig {
  chartType: ChartType;
  xAxis: ChartAxisConfig; // Sẽ được dùng cho 'Category' hoặc 'Location' tùy biểu đồ
  yAxis: ChartAxisConfig; // Sẽ được dùng cho 'Value' hoặc 'Size'
  color: ChartColorConfig; // Sẽ được dùng cho 'Legend' hoặc 'Color'
  // Tạm thời chưa dùng size, có thể thêm sau
}

export interface ChartOptions {
  title: string;
  showLegend: boolean;
  showToolbox: boolean;
}

export interface ProcessedChartData {
  categories?: string[];
  series: any[];
  legendData?: string[];
  // NEW: Thêm các thuộc tính cho biểu đồ bản đồ
  visualMap?: any; 
}

// MODIFIED: Cập nhật danh sách các loại biểu đồ có sẵn
export const AVAILABLE_CHART_TYPES: { id: ChartType, name: string }[] = [
    { id: 'none', name: 'Select Chart Type' },
    { id: 'bar', name: 'Bar Chart' },
    { id: 'line', name: 'Line Chart' },
    { id: 'pie', name: 'Pie Chart' },
    { id: 'map', name: 'Map Chart' },
    { id: 'treemap', name: 'Treemap' },
    { id: 'scatter', name: 'Scatter Plot' },
];