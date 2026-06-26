import type { Plot } from "@yancao/domain";

interface WarningPanelProps {
  plot?: Plot | null;
}

const detectedDiseaseName = "烟草病毒病";

const plotCoordinates: Record<string, string> = {
  "xunyi-003": "35.12°N, 108.33°E",
  "xunyi-001": "35.10°N, 108.31°E",
  "xunyi-007": "35.09°N, 108.36°E",
  "fuxian-002": "35.99°N, 109.38°E",
  "baoji-006": "34.36°N, 107.24°E"
};

export function WarningPanel({ plot }: WarningPanelProps) {
  if (!plot) return null;

  const totalCount = Math.round(plot.areaMu * 120);
  const diseasedCount = Math.round(totalCount * (100 - plot.healthRate) / 100);
  const normalCount = totalCount - diseasedCount;
  const diseaseRatio = Number((100 - plot.healthRate).toFixed(1));
  const healthyRatio = Number(plot.healthRate.toFixed(1));
  const diseaseDegree = diseaseRatio >= 30 ? "重度" : diseaseRatio >= 15 ? "中度" : "轻度";
  const plotCoordinate = plotCoordinates[plot.id] ?? "35.12°N, 108.33°E";

  return (
    <div className={`plot-monitor level-${plot.diseaseLevel}`}>
      <section className="plot-monitor-result" aria-label="检测结果">
        <div>
          <span>病害识别结果</span>
        </div>
        <strong>{detectedDiseaseName}</strong>
      </section>

      <section className="plot-monitor-scale" aria-label="烟苗健康分布">
        <div className="plot-monitor-scale-labels">
          <span>健康 {healthyRatio}%</span>
          <span>发病 {diseaseRatio}%</span>
        </div>
        <div className="plot-monitor-track">
          <i className="plot-monitor-healthy" style={{ width: `${healthyRatio}%` }} />
          <i className="plot-monitor-sick" style={{ width: `${diseaseRatio}%` }} />
        </div>
      </section>

      <section className="plot-monitor-counts">
        <div>
          <span>正常烟苗</span>
          <strong>{normalCount}</strong>
        </div>
        <div className="danger">
          <span>疑似病株</span>
          <strong>{diseasedCount}</strong>
        </div>
        <div>
          <span>发病程度</span>
          <strong>{diseaseDegree}</strong>
        </div>
        <div className="location">
          <span>地块位置</span>
          <strong>{plotCoordinate}</strong>
        </div>
      </section>
    </div>
  );
}
