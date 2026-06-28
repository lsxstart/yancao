import { useState, type CSSProperties } from "react";
import type { DroneDetectionRecord, ScreenPlot } from "../api";

interface StatsPanelProps {
  detections: DroneDetectionRecord[];
  plots: ScreenPlot[];
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

function getRate(record?: DroneDetectionRecord) {
  return Number((record?.infectionRate ?? 0).toFixed(1));
}

function getGrade(rate: number): DiseaseGrade {
  if (rate < 5) return "light";
  if (rate <= 15) return "medium";
  return "heavy";
}

function getLatestDetections(detections: DroneDetectionRecord[]) {
  const map = new Map<number, DroneDetectionRecord>();
  detections
    .slice()
    .sort((a, b) => String(b.detectTime ?? b.createTime ?? "").localeCompare(String(a.detectTime ?? a.createTime ?? "")))
    .forEach((record) => {
      if (!map.has(record.plotId)) {
        map.set(record.plotId, record);
      }
    });
  return map;
}

export function StatsPanel({ detections, plots, regionName }: StatsPanelProps) {
  const [hoveredGrade, setHoveredGrade] = useState<DiseaseGrade | null>(null);
  const latestDetections = getLatestDetections(detections);
  const plotStats = plots.map((plot) => {
    const detection = latestDetections.get(plot.id);
    const diseaseRate = getRate(detection);
    return {
      ...plot,
      detection,
      diseaseRate,
      grade: getGrade(diseaseRate)
    };
  });
  const groupedPlots = gradeOrder.reduce<Record<DiseaseGrade, typeof plotStats>>(
    (groups, grade) => {
      groups[grade] = plotStats.filter((plot) => plot.grade === grade);
      return groups;
    },
    {} as Record<DiseaseGrade, typeof plotStats>
  );
  const activeGrade = hoveredGrade ?? "heavy";
  const currentRate = plotStats.length
    ? Number((plotStats.reduce((sum, plot) => sum + plot.diseaseRate, 0) / plotStats.length).toFixed(1))
    : 0;
  const maxRate = Math.ceil(Math.max(15, ...plotStats.map((plot) => plot.diseaseRate)) / 5) * 5;
  const yTicks = [maxRate, Math.round(maxRate / 2), 0];
  const diseaseRates = plotStats.map((plot) => plot.diseaseRate);
  const maxDiseaseRate = Math.max(...diseaseRates);
  const minDiseaseRate = Math.min(...diseaseRates);
  const firstMaxIndex = plotStats.findIndex((item) => item.diseaseRate === maxDiseaseRate);
  const firstMinIndex = plotStats.findIndex((item) => item.diseaseRate === minDiseaseRate);
  let dashOffset = 0;

  return (
    <div className="region-stats">
      <section className="region-risk-chart">
        <div className="region-risk-ring">
          <svg viewBox="0 0 120 120" role="img" aria-label={`${regionName}病害等级结构`}>
            <circle className="region-risk-ring-bg" cx="60" cy="60" r={ringRadius} />
            {gradeOrder.map((grade) => {
              const count = groupedPlots[grade].length;
              const dashLength = plotStats.length ? (count / plotStats.length) * ringCircumference : 0;
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
            <strong>{plotStats.length}</strong>
            <span>{regionName}</span>
          </div>
          <div className="region-risk-tooltip">
            <strong>{gradeMeta[activeGrade].label}地块</strong>
            {groupedPlots[activeGrade].length > 0 ? (
              groupedPlots[activeGrade].map((plot) => (
                <span key={plot.id}>{plot.plotName}</span>
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

      <section className="region-bar-panel">
        <div className="region-bar-chart-with-axis" role="img" aria-label="各烟田发病率柱状图">
          <div className="region-bar-y-axis">
            {yTicks.map((tick) => (
              <span key={tick}>{tick}%</span>
            ))}
          </div>
          <div className="region-bar-plot">
            <div className="region-bar-grid">
              {yTicks.map((tick) => (
                <i key={tick} />
              ))}
            </div>
            <div className="region-bar-chart">
              {plotStats.map((plot, index) => {
                const height = `${Math.max(18, plot.diseaseRate / maxRate * 100)}%`;
                const shouldShowValue = index === firstMaxIndex || index === firstMinIndex;
                return (
                  <div className="region-bar-item" key={plot.id} title={`${plot.plotName}：${plot.diseaseRate}%`}>
                    <div className="region-bar-column" style={{ "--bar-height": height } as CSSProperties}>
                      {shouldShowValue ? <span>{plot.diseaseRate}%</span> : null}
                      <i style={{ height, background: gradeMeta[plot.grade].color }} />
                    </div>
                    <em />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="region-trend-summary">
          当前平均发病率{currentRate}%，共监测{plotStats.length}个烟田
        </p>
      </section>
    </div>
  );
}
