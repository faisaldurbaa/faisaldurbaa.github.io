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

type ChartDataset = {
  borderColor?: unknown;
  backgroundColor?: unknown;
  fill?: unknown;
  pointBackgroundColor?: unknown;
};

// Chart colours come from the sheet's own tokens (src/styles/global.css), so charts
// follow the blueprint / whiteprint theme instead of the colours written in content.
export const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#143C9E';

// Canvas and Chart.js's colour helpers need plain rgba(), so expand the hex tokens.
const alpha = (color: string, a: number) => {
  const hex = /^#([0-9a-f]{6})$/i.exec(color)?.[1];
  if (!hex) return color;
  const n = parseInt(hex, 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

function seriesColors() {
  return [token('--ink'), token('--stamp'), token('--mark'), token('--muted')];
}

export function applyDatasetTheme<T extends { datasets?: ChartDataset[] }>(data: T): T {
  if (!Array.isArray(data.datasets)) return data;
  const colors = seriesColors();
  const datasets = data.datasets.map((dataset, index) => {
    const color = colors[index % colors.length]!;
    const next = { ...dataset };
    // Bars read as ink fills; lines as strokes with a faint wash when filled.
    next.borderColor = color;
    next.backgroundColor = next.fill ? alpha(color, 0.12) : alpha(color, 0.85);
    next.pointBackgroundColor = color;
    return next;
  });
  return { ...data, datasets };
}

export function getChartTheme(): ChartThemeColors {
  const ink = token('--ink');
  return {
    legend: token('--text'),
    tooltipBg: token('--ground'),
    tooltipTitle: ink,
    tooltipBody: token('--text'),
    tooltipBorder: ink,
    tick: token('--muted'),
    grid: token('--rule'),
  };
}

// Annotation lines in content are written for a white page; redraw them in the sheet's colours.
function themeAnnotation(annotation: unknown, theme: ChartThemeColors) {
  const source = annotation as { annotations?: Record<string, Record<string, unknown>> } | undefined;
  if (!source?.annotations) return {};
  const annotations: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(source.annotations)) {
    const label = (item['label'] ?? {}) as Record<string, unknown>;
    annotations[key] = {
      ...item,
      borderColor: theme.tick,
      borderWidth: 1.5,
      label: { ...label, display: true, backgroundColor: theme.tooltipBg, color: theme.tooltipTitle, borderColor: theme.tooltipBorder, borderWidth: 1, borderRadius: 0, font: { family: '"Barlow Semi Condensed", sans-serif', weight: '600' } },
    };
  }
  return { annotations };
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
        labels: { font: { family: '"Barlow Semi Condensed", sans-serif', size: 13, weight: '600' }, color: theme.legend, boxWidth: 14, boxHeight: 2 },
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.tooltipTitle,
        bodyColor: theme.tooltipBody,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 0,
        titleFont: { family: '"Barlow Semi Condensed", sans-serif', weight: '600' },
        bodyFont: { family: '"Barlow", sans-serif' },
        displayColors: true,
      },
      annotation: themeAnnotation(data.annotation, theme),
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: theme.tooltipBorder },
        ticks: {
          font: { family: '"Barlow", sans-serif', size: 11 },
          color: theme.tick,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: { color: theme.grid },
        border: { color: theme.tooltipBorder },
        ticks: {
          font: { family: '"Barlow", sans-serif', size: 11 },
          color: theme.tick,
        },
      },
    },
    animation: { duration: 900, easing: 'easeOutQuart' as const },
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
  document.querySelectorAll('canvas[data-chart-type]').forEach((canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const chart = Chart.getChart(canvas);
    if (!chart) return;
    const rawData = JSON.parse(canvas.dataset.chartData || '{}') as { datasets?: ChartDataset[]; annotation?: unknown };
    chart.data = applyDatasetTheme(rawData);
    chart.options = buildChartOptions(rawData);
    chart.update('none');
  });
}
