import type { RegionId } from "@yancao/domain";
import { create } from "zustand";

interface ScreenState {
  selectedRegionId: RegionId;
  selectedPlotId: string;
  setSelectedRegionId: (regionId: RegionId) => void;
  setSelectedPlotId: (plotId: string) => void;
}

export const useScreenStore = create<ScreenState>()((set) => ({
  selectedRegionId: "xunyi",
  selectedPlotId: "xunyi-003",
  setSelectedRegionId: (selectedRegionId) =>
    set(() => ({
      selectedRegionId,
      selectedPlotId:
        selectedRegionId === "xunyi"
          ? "xunyi-003"
          : selectedRegionId === "wugong"
            ? "wugong-002"
            : "yanan-006"
    })),
  setSelectedPlotId: (selectedPlotId) => set(() => ({ selectedPlotId }))
}));
