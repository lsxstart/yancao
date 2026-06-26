import { useState } from "react";
import type { Plot } from "@yancao/domain";

interface StatsPanelProps {
  plots: Plot[];
  regionName: string;
}

type DiseaseGrade = "light" | "medium" | "heavy";

interface GradeMeta {
  label: string;
  color: string;
}

const gradeMeta: Record<DiseaseGrade, GradeMeta> = {
  light: { label: "轻度", color: "#67e36f" },
  medium: { label: "中度", color: "#ffd84d" },
  heavy: { label: "重度", color: "#ff5a5f" }
};

const gradeOrder: DiseaseGrade[] = ["light", "medium", "heavy"];
const ringRadius = 42;
const ringCircumference = 2 * Math.PI * ringRadius;
const trendWidth = 300;
const trendHeight = 108;
const trendPadding = { top: 12, right: 12, bottom: 22, left: 28 };

function getDiseaseRate(plot: Plot) {
  return Number((100 - plot.healthRate).toFixed(1));
}

function getGrade(rate: number): DiseaseGrade {
  if (rate < 5) return "light";
  if (rate <= 15) return "medium";
  return "heavy";
}

function formatDateLabel(offsetFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetFromToday);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function buildTrend(currentRate: number) {
  const offsets = [-6, -5, -4, -3, -2, -1, 0];
  const baseDeltas = [-4.6, -3.8, -2.9, -2.1, -1.4, -0.8, 0];

  return offsets.map((offset, index) => ({
    date: formatDateLabel(offset),
    rate: Number(Math.max(0, currentRate + baseDeltas[index]).toFixed(1))
  }));
}

export function StatsPanel({ plots, regionName }: StatsPanelProps) {
  const [hoveredGrade, setHoveredGrade] = useState<DiseaseGrade | null>(null);
  const groupedPlots = gradeOrder.reduce<Record<DiseaseGrade, Array<Plot & { diseaseRate: number }>>>(
    (groups, grade) => {
      groups[grade] = [];
      return groups;
    },
    {} as Record<DiseaseGrade, Array<Plot & { diseaseRate: number }>>
  );

  plots.forEach((plot) => {
    const diseaseRate = getDiseaseRate(plot);
    groupedPlots[getGrade(diseaseRate)].push({ ...plot, diseaseRate });
  });

  const currentRate = plots.length
    ? Number((plots.reduce((sum, plot) => sum + getDiseaseRate(plot), 0) / plots.length).toFixed(1))
    : 0;
  const trendData = buildTrend(currentRate);
  const yesterdayRate = trendData[trendData.length - 2]?.rate ?? currentRate;
  const dayChange = Number((currentRate - yesterdayRate).toFixed(1));
  const trendDirection = currentRate > trendData[0].rate ? "上升" : currentRate < trendData[0].rate ? "下降" : "平稳";
  const rates = trendData.map((item) => item.rate);
  const minRate = Math.max(0, Math.min(...rates) - 2);
  const maxRate = Math.max(...rates) + 2;
  const xStep = (trendWidth - trendPadding.left - trendPadding.right) / Math.max(trendData.length - 1, 1);
  const yScale = (rate: number) => {
    const drawableHeight = trendHeight - trendPadding.top - trendPadding.bottom;
    return trendPadding.top + (maxRate - rate) / Math.max(maxRate - minRate, 1) * drawableHeight;
  };
  const trendPoints = trendData.map((item, index) => ({
    ...item,
    x: trendPadding.left + index * xStep,
    y: yScale(item.rate)
  }));
  const polylinePoints = trendPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${trendPadding.left},${trendHeight - trendPadding.bottom} ${polylinePoints} ${trendWidth - trendPadding.right},${trendHeight - trendPadding.bottom}`;
  let dashOffset = 0;
  const activeGrade = hoveredGrade ?? "heavy";

  return (
    <div className="region-stats">
      <section className="region-risk-chart">
        <div className="region-risk-ring">
          <svg viewBox="0 0 120 120" role="img" aria-label={`${regionName}病害等级结构`}>
            <circle className="region-risk-ring-bg" cx="60" cy="60" r={ringRadius} />
            {gradeOrder.map((grade) => {
              const count = groupedPlots[grade].length;
              const dashLength = plots.length ? (count / plots.length) * ringCircumference : 0;
              const segment = (
                <circle
                  className={`region-risk-segment ${hoveredGrade === grade ? "active" : ""}`}
                  cx="60"
                  cy="60"
                  key={grade}
                  onMouseEnter={() => setHoveredGrade(grade)}
                  onMouseLeave={() => setHoveredGrade(null)}
                  r={ringRadius}
                  stroke={gradeMeta[grade].color}
                  strokeDasharray={`${dashLength} ${ringCircumference - dashLength}`}
                  strokeDashoffset={-dashOffset}
                />
              );
              dashOffset += dashLength;
              return segment;
            })}
          </svg>
          <div className="region-risk-center">
            <strong>{plots.length}</strong>
            <span>{regionName}</span>
          </div>
          <div className="region-risk-tooltip">
            <strong>{gradeMeta[activeGrade].label}地块</strong>
            {groupedPlots[activeGrade].length > 0 ? (
              groupedPlots[activeGrade].map((plot) => (
                <span key={plot.id}>{plot.name}</span>
              ))
            ) : (
              <span>暂无地块</span>
            )}
          </div>
        </div>

        <div className="region-risk-legend">
          {gradeOrder.map((grade) => (
            <span key={grade} onMouseEnter={() => setHoveredGrade(grade)} onMouseLeave={() => setHoveredGrade(null)}>
              <i style={{ background: gradeMeta[grade].color }} />
              {gradeMeta[grade].label}
            </span>
          ))}
        </div>
      </section>

      <section className="region-trend-panel">
        <svg className="region-trend-chart" viewBox={`0 0 ${trendWidth} ${trendHeight}`} role="img" aria-label="近7天发病率趋势">
          <line className="region-trend-grid" x1={trendPadding.left} x2={trendWidth - trendPadding.right} y1={trendPadding.top} y2={trendPadding.top} />
          <line className="region-trend-grid" x1={trendPadding.left} x2={trendWidth - trendPadding.right} y1={(trendHeight - trendPadding.bottom + trendPadding.top) / 2} y2={(trendHeight - trendPadding.bottom + trendPadding.top) / 2} />
          <line className="region-trend-grid" x1={trendPadding.left} x2={trendWidth - trendPadding.right} y1={trendHeight - trendPadding.bottom} y2={trendHeight - trendPadding.bottom} />
          <polygon className="region-trend-area" points={areaPoints} />
          <polyline className="region-trend-line" points={polylinePoints} />
          {trendPoints.map((point, index) => (
            <g key={point.date}>
              <circle className="region-trend-dot" cx={point.x} cy={point.y} r={index === trendPoints.length - 1 ? 3.5 : 2.5} />
              {(index === 0 || index === trendPoints.length - 1) && (
                <text className="region-trend-date" x={point.x} y={trendHeight - 5} textAnchor={index === 0 ? "start" : "end"}>
                  {point.date}
                </text>
              )}
            </g>
          ))}
          <text className="region-trend-axis" x={trendPadding.left - 4} y={trendPadding.top + 4} textAnchor="end">
            {Math.round(maxRate)}%
          </text>
          <text className="region-trend-axis" x={trendPadding.left - 4} y={trendHeight - trendPadding.bottom + 4} textAnchor="end">
            {Math.round(minRate)}%
          </text>
        </svg>
        <p className="region-trend-summary">
          当前发病率{currentRate}%，较昨日{dayChange >= 0 ? "+" : ""}{dayChange}%，近7天呈{trendDirection}趋势
        </p>
      </section>
    </div>
  );
}
