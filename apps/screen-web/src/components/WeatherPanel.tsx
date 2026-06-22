import type { WeatherCondition } from "@yancao/domain";

interface WeatherPanelProps {
  weather?: WeatherCondition | null;
}

export function WeatherPanel({ weather }: WeatherPanelProps) {
  if (!weather) return null;

  const items = [
    ["气温", `${weather.temperature} ℃`, "thermo"],
    ["风向", weather.windDirection, "compass"],
    ["雨量", `${weather.rainfall} mm/m`, "rain"],
    ["风速", `${weather.windSpeed} m/s`, "wind"],
    ["光照", `${weather.illuminance} Lux`, "sun"],
    ["湿度", `${weather.humidity} %`, "drop"]
  ];

  return (
    <div className="weather-grid">
      {items.map(([label, value, icon]) => (
        <div className="weather-item" key={label}>
          <i className={`weather-icon icon-${icon}`} aria-hidden="true" />
          <div>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
