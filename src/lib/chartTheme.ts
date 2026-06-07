export interface ChartThemeColors {
  legend: string;
  tooltipBg: string;
  tooltipTitle: string;
  tooltipBody: string;
  tooltipBorder: string;
  tick: string;
  grid: string;
}

export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

const SLATE_DATASET_PALETTE = {
  light: [
    { border: 'rgb(30 41 59)', fill: 'rgba(30, 41, 59, 0.8)', lineFill: 'rgba(30, 41, 59, 0.5)' },
    { border: 'rgb(51 65 85)', fill: 'rgba(51, 65, 85, 0.7)', lineFill: 'rgba(51, 65, 85, 0.4)' },
    { border: 'rgb(100 116 139)', fill: 'rgba(100, 116, 139, 0.6)', lineFill: 'rgba(100, 116, 139, 0.35)' },
  ],
  dark: [
    { border: 'rgb(226 232 240)', fill: 'rgba(226, 232, 240, 0.85)', lineFill: 'rgba(226, 232, 240, 0.2)' },
    { border: 'rgb(148 163 184)', fill: 'rgba(148, 163, 184, 0.75)', lineFill: 'rgba(148, 163, 184, 0.18)' },
    { border: 'rgb(100 116 139)', fill: 'rgba(100, 116, 139, 0.65)', lineFill: 'rgba(100, 116, 139, 0.15)' },
  ],
} as const;

function isSlateChartColor(color: unknown): boolean {
  if (typeof color !== 'string') return false;
  return /30[, ]+41[, ]+59|51[, ]+65[, ]+85|100[, ]+116[, ]+139/.test(color);
}

type ChartDataset = {
  borderColor?: unknown;
  backgroundColor?: unknown;
  fill?: unknown;
};

export function applyDatasetTheme<T extends { datasets?: ChartDataset[] }>(data: T): T {
  if (!Array.isArray(data.datasets)) return data;

  const palette = isDarkMode() ? SLATE_DATASET_PALETTE.dark : SLATE_DATASET_PALETTE.light;
  const datasets = data.datasets.map((dataset, index) => {
    const next = { ...dataset };
    const border = String(next.borderColor ?? '');
    const fill = String(next.backgroundColor ?? '');
    const needsRemap = isSlateChartColor(border) || isSlateChartColor(fill);
    if (!needsRemap) return next;

    const colors = palette[index % palette.length] ?? palette[0];
    if (!colors) return next;
    if (border) next.borderColor = colors.border;
    if (fill) {
      next.backgroundColor = next.fill === false ? colors.lineFill : colors.fill;
    }
    return next;
  });

  return { ...data, datasets };
}

export function getChartTheme(): ChartThemeColors {
  const dark = isDarkMode();
  return dark
    ? {
        legend: '#e2e8f0',
        tooltipBg: '#1e293b',
        tooltipTitle: '#f1f5f9',
        tooltipBody: '#cbd5e1',
        tooltipBorder: '#475569',
        tick: '#94a3b8',
        grid: '#334155',
      }
    : {
        legend: '#1f2937',
        tooltipBg: '#ffffff',
        tooltipTitle: '#1f2937',
        tooltipBody: '#4b5563',
        tooltipBorder: '#e5e7eb',
        tick: '#4b5563',
        grid: '#e5e7eb',
      };
}

export function buildChartOptions(
  data: { datasets?: unknown[]; annotation?: unknown },
  theme: ChartThemeColors = getChartTheme(),
) {
  const datasets = Array.isArray(data.datasets) ? data.datasets : [];
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: 'top' as const,
        labels: { font: { family: 'Inter, sans-serif' }, color: theme.legend },
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.tooltipTitle,
        bodyColor: theme.tooltipBody,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
      },
      annotation: data.annotation ? data.annotation : {},
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Inter, sans-serif', size: 10 },
          color: theme.tick,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: { color: theme.grid, borderDash: [5, 5] },
        ticks: {
          font: { family: 'Inter, sans-serif', size: 10 },
          color: theme.tick,
        },
      },
    },
    animation: { duration: 1000, easing: 'easeInOutCubic' as const },
  };
}

export async function refreshChartsOnThemeChange(
  Chart: {
    getChart: (el: HTMLCanvasElement) => {
      data: { datasets?: ChartDataset[] };
      options: Record<string, unknown>;
      update: (mode?: string) => void;
    } | undefined;
  },
) {
  const theme = getChartTheme();
  document.querySelectorAll('canvas[data-chart-type]').forEach((canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const chart = Chart.getChart(canvas);
    if (!chart) return;

    const rawData = JSON.parse(canvas.dataset.chartData || '{}') as { datasets?: ChartDataset[] };
    chart.data = applyDatasetTheme(rawData);

    const options = chart.options as {
      plugins?: {
        legend?: { labels?: { color?: string } };
        tooltip?: Record<string, string | number>;
      };
      scales?: {
        x?: { ticks?: { color?: string } };
        y?: { ticks?: { color?: string }; grid?: { color?: string } };
      };
    };

    if (options.plugins?.legend?.labels) {
      options.plugins.legend.labels.color = theme.legend;
    }
    if (options.plugins?.tooltip) {
      options.plugins.tooltip.backgroundColor = theme.tooltipBg;
      options.plugins.tooltip.titleColor = theme.tooltipTitle;
      options.plugins.tooltip.bodyColor = theme.tooltipBody;
      options.plugins.tooltip.borderColor = theme.tooltipBorder;
    }
    if (options.scales?.x?.ticks) {
      options.scales.x.ticks.color = theme.tick;
    }
    if (options.scales?.y) {
      if (options.scales.y.ticks) options.scales.y.ticks.color = theme.tick;
      if (options.scales.y.grid) options.scales.y.grid.color = theme.grid;
    }

    chart.update('none');
  });
}
