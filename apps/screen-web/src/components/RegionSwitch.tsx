import type { Region, RegionId } from "@yancao/domain";

interface RegionSwitchProps {
  regions: Region[];
  selectedRegionId: RegionId;
  onChange: (regionId: RegionId) => void;
}

export function RegionSwitch({ regions, selectedRegionId, onChange }: RegionSwitchProps) {
  return (
    <select
      aria-label="地区切换"
      className="region-select"
      onChange={(event) => onChange(event.target.value as RegionId)}
      value={selectedRegionId}
    >
      {regions.map((region) => (
        <option key={region.id} value={region.id}>
          {region.name}
        </option>
      ))}
    </select>
  );
}
