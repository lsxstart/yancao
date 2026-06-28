interface VideoPlot {
  id: number;
  name: string;
}

interface VideoPanelProps {
  plots: VideoPlot[];
  selectedPlotId?: number;
}

export function VideoPanel({ plots, selectedPlotId }: VideoPanelProps) {
  const selectedIndex = Math.max(plots.findIndex((plot) => plot.id === selectedPlotId), 0);
  const videoSrc = `/video/视频${(selectedIndex % 3) + 1}.mp4`;

  return (
    <div className="video-preview">
      <video
        autoPlay
        className="video-player"
        controls
        key={videoSrc}
        loop
        muted
        playsInline
        src={videoSrc}
      />
    </div>
  );
}
