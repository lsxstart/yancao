import type { DroneDetectionRecord, ScreenPlot } from "../api";

interface WarningPanelProps {
  detection?: DroneDetectionRecord;
  plot?: ScreenPlot;
}

const detectedDiseaseName = "烟草病毒病";

function getDiseaseDegree(level?: string, rate = 0) {
  if (level) return level;
  if (rate > 15) return "重度";
  if (rate >= 5) return "中度";
  return "轻度";
}

export function WarningPanel({ detection, plot }: WarningPanelProps) {
  if (!plot && !detection) return null;

  const totalCount = detection?.totalPlants ?? 0;
  const diseasedCount = detection?.infectedPlants ?? 0;
  const normalCountFromApi = detection?.healthyPlants;
  const normalCount = totalCount - diseasedCount;
  const diseaseRatio = Number((detection?.infectionRate ?? 0).toFixed(1));
  const healthyRatio = Number(Math.max(0, 100 - diseaseRatio).toFixed(1));
  const diseaseDegree = getDiseaseDegree(detection?.diseaseLevel, diseaseRatio);
  const plotCoordinate = plot?.latitude && plot?.longitude
    ? `${plot.latitude.toFixed(2)}°N, ${plot.longitude.toFixed(2)}°E`
    : "暂无坐标";

  return (
    <div className="plot-monitor">
      <section className="plot-monitor-result" aria-label="检测结果">
        <div>
          <span>病害识别结果</span>
        </div>
        <strong>{detection?.diseaseName ?? detectedDiseaseName}</strong>
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
          <strong>{normalCountFromApi ?? normalCount}</strong>
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
