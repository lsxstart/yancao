import { useEffect, useState, type MouseEvent, type WheelEvent } from "react";
import type { DroneDetectionRecord } from "../api";
import { assetUrl } from "../assets";

interface InspectionImage {
  id: string;
  title: string;
  src: string;
  alt: string;
  description: string;
}

interface MapPanelProps {
  detection?: DroneDetectionRecord;
}

export function MapPanel({ detection }: MapPanelProps) {
  const [previewImage, setPreviewImage] = useState<InspectionImage | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ pointerX: number; pointerY: number; imageX: number; imageY: number } | null>(null);

  useEffect(() => {
    if (!previewImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

  const openPreview = (image: InspectionImage) => {
    setPreviewImage(image);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setDragStart(null);
  };

  const inspectionImages: InspectionImage[] = [
    {
      id: "source",
      title: "地块原始图片",
      src: detection?.oriImageUrl || assetUrl("/pic/display/原始地块1.jpg"),
      alt: "地块原始图片",
      description: "无人机采集的原始地块影像"
    },
    {
      id: "detection",
      title: "检测地块图片",
      src: detection?.resultImageUrl || assetUrl("/pic/display/检测地块1.jpg"),
      alt: "检测地块图片",
      description: "烟草病毒病识别结果影像"
    }
  ];

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextScale = event.deltaY < 0 ? scale + 0.15 : scale - 0.15;
    setScale(Math.min(4, Math.max(0.5, Number(nextScale.toFixed(2)))));
  };

  const resetPreview = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setDragStart(null);
  };

  const handleMouseDown = (event: MouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    setDragStart({
      pointerX: event.clientX,
      pointerY: event.clientY,
      imageX: position.x,
      imageY: position.y
    });
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    setPosition({
      x: dragStart.imageX + event.clientX - dragStart.pointerX,
      y: dragStart.imageY + event.clientY - dragStart.pointerY
    });
  };

  const stopDragging = () => {
    setDragStart(null);
  };

  return (
    <div className="inspection-shell">
      {inspectionImages.map((image) => (
        <article className={`inspection-card ${image.id === "detection" ? "result" : ""}`} key={image.id}>
          <header>
            <strong>{image.title}</strong>
          </header>
          <button className="inspection-image-button" onClick={() => openPreview(image)} type="button">
            <img decoding="async" src={image.src} alt={image.alt} />
          </button>
        </article>
      ))}

      {previewImage && (
        <div className="image-preview-modal" role="dialog" aria-modal="true" aria-label={previewImage.title}>
          <div className="image-preview-backdrop" onClick={() => setPreviewImage(null)} />
          <section className="image-preview-panel">
            <header className="image-preview-head">
              <div>
                <span>{previewImage.description}</span>
                <strong>{previewImage.title}</strong>
              </div>
              <div className="image-preview-actions">
                <button onClick={resetPreview} type="button">重置</button>
                <button onClick={() => setPreviewImage(null)} type="button">关闭</button>
              </div>
            </header>
            <div
              className={`image-preview-stage ${dragStart ? "is-dragging" : ""}`}
              onMouseLeave={stopDragging}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onWheel={handleWheel}
            >
              <img
                alt={previewImage.alt}
                draggable={false}
                onMouseDown={handleMouseDown}
                src={previewImage.src}
                style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
              />
            </div>
            <footer className="image-preview-foot">
              <span>缩放 {Math.round(scale * 100)}%</span>
              <span>鼠标滚轮缩放，按住图片拖拽</span>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
