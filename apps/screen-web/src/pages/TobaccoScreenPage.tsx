import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { tobaccoApi } from "@yancao/sdk";
import { DiseaseShowcase } from "../components/DiseaseShowcase";
import { MapPanel } from "../components/MapPanel";
import { Panel } from "../components/Panel";
import { RegionSwitch } from "../components/RegionSwitch";
import { StatsPanel } from "../components/StatsPanel";
import { VideoPanel } from "../components/VideoPanel";
import { WarningPanel } from "../components/WarningPanel";
import { WeatherPanel } from "../components/WeatherPanel";
import { useScreenStore } from "../stores/useScreenStore";

export function TobaccoScreenPage() {
  const selectedRegionId = useScreenStore((state) => state.selectedRegionId);
  const selectedPlotId = useScreenStore((state) => state.selectedPlotId);
  const setSelectedRegionId = useScreenStore((state) => state.setSelectedRegionId);
  const setSelectedPlotId = useScreenStore((state) => state.setSelectedPlotId);

  const regionsQuery = useQuery({ queryKey: ["regions"], queryFn: tobaccoApi.getRegions });
  const plotsQuery = useQuery({
    queryKey: ["plots", selectedRegionId],
    queryFn: () => tobaccoApi.getPlots(selectedRegionId)
  });
  const plotQuery = useQuery({
    queryKey: ["plot-detail", selectedPlotId],
    queryFn: () => tobaccoApi.getPlotDetail(selectedPlotId)
  });
  const weatherQuery = useQuery({
    queryKey: ["weather", selectedRegionId],
    queryFn: () => tobaccoApi.getWeather(selectedRegionId)
  });
  const diseaseCasesQuery = useQuery({
    queryKey: ["disease-cases"],
    queryFn: tobaccoApi.getDiseaseCases
  });

  const diseaseCase = useMemo(() => {
    return diseaseCasesQuery.data?.find((item) => item.riskLevel === plotQuery.data?.diseaseLevel)
      ?? diseaseCasesQuery.data?.[0];
  }, [diseaseCasesQuery.data, plotQuery.data?.diseaseLevel]);
  const selectedRegionName = regionsQuery.data?.find((region) => region.id === selectedRegionId)?.name ?? "";

  const handleLogout = () => {
    localStorage.removeItem("YANCAO_SCREEN_TOKEN");
    window.location.reload();
  };

  return (
    <main className="screen-page">
      <header className="screen-title">
        <div>
          <h1>烟草病虫害监测与防治大屏</h1>
        </div>
        <RegionSwitch
          regions={regionsQuery.data ?? []}
          selectedRegionId={selectedRegionId}
          onChange={setSelectedRegionId}
        />
        <button className="screen-logout" onClick={handleLogout} type="button">
          退出登录
        </button>
      </header>

      <section className="screen-layout">
        <Panel
          title="病虫害检测图像"
          className="map-panel"
          action={
            <select
              aria-label="地块图像切换"
              className="panel-select"
              onChange={(event) => setSelectedPlotId(event.target.value)}
              value={selectedPlotId}
            >
              {(plotsQuery.data ?? []).map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.name}
                </option>
              ))}
            </select>
          }
        >
          <MapPanel />
        </Panel>

        <Panel title="地块监测信息" className="warnings-panel">
          <WarningPanel plot={plotQuery.data} />
        </Panel>

        <Panel
          title="视频监控"
          className="video-panel"
          action={
            <select
              aria-label="视频切换"
              className="panel-select"
              onChange={(event) => setSelectedPlotId(event.target.value)}
              value={selectedPlotId}
            >
              {(plotsQuery.data ?? []).map((plot, index) => (
                <option key={plot.id} value={plot.id}>
                  视频{index + 1}
                </option>
              ))}
            </select>
          }
        >
          <VideoPanel
            plots={plotsQuery.data ?? []}
            selectedPlotId={selectedPlotId}
          />
        </Panel>

        <Panel
          title="气象信息"
          className="weather-panel"
          action={
            <select
              aria-label="气象地块切换"
              className="panel-select"
              onChange={(event) => setSelectedPlotId(event.target.value)}
              value={selectedPlotId}
            >
              {(plotsQuery.data ?? []).map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.name}
                </option>
              ))}
            </select>
          }
        >
          <WeatherPanel weather={weatherQuery.data} />
        </Panel>

        <Panel title="烟区病害统计" className="stats-panel">
          <StatsPanel plots={plotsQuery.data ?? []} regionName={selectedRegionName} />
        </Panel>

        <Panel title="典型病虫害展示" className="disease-panel">
          <DiseaseShowcase
            diseaseCases={diseaseCasesQuery.data ?? []}
            preferredCase={diseaseCase}
            plot={plotQuery.data}
          />
        </Panel>
      </section>
    </main>
  );
}
