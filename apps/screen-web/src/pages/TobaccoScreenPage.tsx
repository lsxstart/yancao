import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { tobaccoApi } from "@yancao/sdk";
import { screenApi } from "../api";
import { DiseaseShowcase } from "../components/DiseaseShowcase";
import { MapPanel } from "../components/MapPanel";
import { Panel } from "../components/Panel";
import { RegionSwitch } from "../components/RegionSwitch";
import { StatsPanel } from "../components/StatsPanel";
import { VideoPanel } from "../components/VideoPanel";
import { WarningPanel } from "../components/WarningPanel";
import { WeatherPanel } from "../components/WeatherPanel";
import { useScreenStore } from "../stores/useScreenStore";

const mockWeather = {
  regionId: "mock" as never,
  temperature: 23.2,
  windDirection: "西北风",
  rainfall: 0.3,
  soilMoisture: 16.7,
  windSpeed: 1.2,
  illuminance: 50000,
  humidity: 43.2,
  soilTemperature: 23.1
};

export function TobaccoScreenPage() {
  const selectedRegionId = useScreenStore((state) => state.selectedRegionId);
  const selectedPlotId = useScreenStore((state) => state.selectedPlotId);
  const setSelectedRegionId = useScreenStore((state) => state.setSelectedRegionId);
  const setSelectedPlotId = useScreenStore((state) => state.setSelectedPlotId);

  const regionsQuery = useQuery({ queryKey: ["screen-zones"], queryFn: screenApi.getZones });
  const plotsQuery = useQuery({ queryKey: ["screen-plots"], queryFn: screenApi.getPlots });
  const droneDetectionsQuery = useQuery({ queryKey: ["screen-drone-detections"], queryFn: screenApi.getDroneDetections });
  const diseaseCasesQuery = useQuery({ queryKey: ["disease-cases"], queryFn: tobaccoApi.getDiseaseCases });
  const regions = regionsQuery.data?.records ?? [];
  const allPlots = plotsQuery.data?.records ?? [];
  const droneDetections = droneDetectionsQuery.data?.records ?? [];
  const plots = useMemo(() => allPlots.filter((plot) => !selectedRegionId || plot.zoneId === selectedRegionId), [allPlots, selectedRegionId]);
  const selectedRegion = regions.find((region) => region.id === selectedRegionId);
  const selectedPlot = plots.find((plot) => plot.id === selectedPlotId) ?? plots[0];
  const selectedRegionName = selectedRegion?.zoneName ?? "";
  const selectedPlotDetection = useMemo(() => {
    return droneDetections
      .filter((record) => record.plotId === selectedPlot?.id)
      .sort((a, b) => String(b.detectTime ?? b.createTime ?? "").localeCompare(String(a.detectTime ?? a.createTime ?? "")))[0];
  }, [droneDetections, selectedPlot?.id]);
  const regionDetections = useMemo(() => {
    const plotIds = new Set(plots.map((plot) => plot.id));
    return droneDetections.filter((record) => plotIds.has(record.plotId));
  }, [droneDetections, plots]);

  useEffect(() => {
    if (!selectedRegionId && regions[0]) {
      setSelectedRegionId(regions[0].id);
    }
  }, [regions, selectedRegionId, setSelectedRegionId]);

  useEffect(() => {
    if (plots.length > 0 && (!selectedPlotId || !plots.some((plot) => plot.id === selectedPlotId))) {
      setSelectedPlotId(plots[0].id);
    }
  }, [plots, selectedPlotId, setSelectedPlotId]);

  const diseaseCase = useMemo(() => {
    return diseaseCasesQuery.data?.[0];
  }, [diseaseCasesQuery.data]);

  const handleLogout = () => {
    localStorage.removeItem("YANCAO_SCREEN_TOKEN");
    window.location.reload();
  };

  return (
    <main className="screen-page">
      <header className="screen-title">
        <img className="screen-logo" src="/logo/9547aa6d08d7a72e9a040a7918a7cfe6.png" alt="平台标识" />
        <div>
          <h1>烟草病毒病人工智能监测预警大屏</h1>
        </div>
        <RegionSwitch
          regions={regions}
          selectedRegionId={selectedRegionId}
          onChange={setSelectedRegionId}
        />
        <button className="screen-logout" onClick={handleLogout} type="button">
          退出登录
        </button>
      </header>

      <section className="screen-layout">
        <Panel
          title="无人机烟田检测"
          className="map-panel"
          action={
            <select
              aria-label="地块图像切换"
              className="panel-select"
              onChange={(event) => setSelectedPlotId(Number(event.target.value))}
              value={selectedPlot?.id ?? ""}
            >
              {plots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.plotName}
                </option>
              ))}
            </select>
          }
        >
          <MapPanel detection={selectedPlotDetection} />
        </Panel>

        <Panel title="地块监测信息" className="warnings-panel">
          <WarningPanel detection={selectedPlotDetection} plot={selectedPlot} />
        </Panel>

        <Panel
          title="视频监控"
          className="video-panel"
          action={
            <select
              aria-label="视频切换"
              className="panel-select"
              onChange={(event) => setSelectedPlotId(Number(event.target.value))}
              value={selectedPlot?.id ?? ""}
            >
              {plots.map((plot, index) => (
                <option key={plot.id} value={plot.id}>
                  视频{index + 1}
                </option>
              ))}
            </select>
          }
        >
          <VideoPanel
            plots={plots.map((plot) => ({ id: plot.id, name: plot.plotName }))}
            selectedPlotId={selectedPlot?.id}
          />
        </Panel>

        <Panel
          title="气象信息"
          className="weather-panel"
          action={
            <select
              aria-label="气象地块切换"
              className="panel-select"
              onChange={(event) => setSelectedPlotId(Number(event.target.value))}
              value={selectedPlot?.id ?? ""}
            >
              {plots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.plotName}
                </option>
              ))}
            </select>
          }
        >
          <WeatherPanel weather={mockWeather} />
        </Panel>

        <Panel title="烟区病害统计" className="stats-panel">
          <StatsPanel detections={regionDetections} plots={plots} regionName={selectedRegionName} />
        </Panel>

        <Panel title="典型病害" className="disease-panel">
          <DiseaseShowcase
            diseaseCases={diseaseCasesQuery.data ?? []}
            preferredCase={diseaseCase}
          />
        </Panel>
      </section>
    </main>
  );
}
