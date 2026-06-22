import type { Plot } from "@yancao/domain";

interface StatsPanelProps {
  plots: Plot[];
  regionName: string;
}

export function StatsPanel({ plots, regionName }: StatsPanelProps) {
  const averageDiseaseRate =
    plots.length > 0
      ? Number((plots.reduce((sum, plot) => sum + (100 - plot.healthRate), 0) / plots.length).toFixed(1))
      : 0;

  return (
    <div className="region-stats">
      <div className="region-stats-head">
        <article>
          <span>当前烟区</span>
          <strong>{regionName}</strong>
        </article>
        <article>
          <span>地块数量</span>
          <strong>{plots.length}</strong>
        </article>
        <article className="warning">
          <span>平均发病比例</span>
          <strong>{averageDiseaseRate}%</strong>
        </article>
      </div>
      <div className="region-plot-list">
        {plots.map((plot, index) => {
          const diseaseRate = Number((100 - plot.healthRate).toFixed(1));
          return (
            <div className="region-plot-row" key={plot.id}>
              <span>地块{index + 1}</span>
              <strong>{plot.name}</strong>
              <div>
                <i style={{ width: `${diseaseRate}%` }} />
              </div>
              <b>{diseaseRate}%</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}
