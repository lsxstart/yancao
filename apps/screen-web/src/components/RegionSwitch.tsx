import type { ScreenZone } from "../api";

interface RegionSwitchProps {
  regions: ScreenZone[];
  selectedRegionId?: number;
  onChange: (regionId: number) => void;
}

export function RegionSwitch({ regions, selectedRegionId, onChange }: RegionSwitchProps) {
  return (
    <select
      aria-label="地区切换"
      className="region-select"
      onChange={(event) => onChange(Number(event.target.value))}
      value={selectedRegionId ?? ""}
    >
      {regions.map((region) => (
        <option key={region.id} value={region.id}>
          {region.zoneName}
        </option>
      ))}
    </select>
  );
}
