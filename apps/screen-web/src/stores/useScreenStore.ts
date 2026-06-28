import { create } from "zustand";

interface ScreenState {
  selectedRegionId?: number;
  selectedPlotId?: number;
  setSelectedRegionId: (regionId: number) => void;
  setSelectedPlotId: (plotId: number) => void;
}

export const useScreenStore = create<ScreenState>()((set) => ({
  selectedRegionId: undefined,
  selectedPlotId: undefined,
  setSelectedRegionId: (selectedRegionId) =>
    set(() => ({
      selectedRegionId,
      selectedPlotId: undefined
    })),
  setSelectedPlotId: (selectedPlotId) => set(() => ({ selectedPlotId }))
}));
