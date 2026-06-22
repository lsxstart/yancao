import type { Plot } from "@yancao/domain";

interface WarningPanelProps {
  plot?: Plot | null;
}

const detectedDiseaseName = "烟草病毒病";

export function WarningPanel({ plot }: WarningPanelProps) {
  if (!plot) return null;

  const totalCount = Math.round(plot.areaMu * 120);
  const diseasedCount = Math.round(totalCount * (100 - plot.healthRate) / 100);
  const normalCount = totalCount - diseasedCount;
  const diseaseRatio = Number((100 - plot.healthRate).toFixed(1));
  const healthyRatio = Number(plot.healthRate.toFixed(1));
  const diseaseDegree = diseaseRatio >= 30 ? "严重" : diseaseRatio >= 15 ? "中等" : "轻微";

  return (
    <div className={`plot-monitor level-${plot.diseaseLevel}`}>
      <section className="plot-monitor-result" aria-label="检测结果">
        <div>
          <span>识别结果</span>
          <strong>{detectedDiseaseName}</strong>
        </div>
        <b>{diseaseRatio}%</b>
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
          <span>检测总量</span>
          <strong>{totalCount}</strong>
        </div>
        <div>
          <span>发病程度</span>
          <strong>{diseaseDegree}</strong>
        </div>
      </section>
    </div>
  );
}
