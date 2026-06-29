"use client";

import { useState, useRef, useEffect, ChangeEvent, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

interface ImageCropperProps {
  aspectRatio: number; // e.g., 1 for Profile (square), 1.33 (4/3) for Projects
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
  onClose: () => void;
  title?: string;
}

export default function ImageCropper({ aspectRatio, onCropComplete, onClose, title = "Crop Image" }: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset states when changing image
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Drag handlers for repositioning
  const startDrag = (clientX: number, clientY: number) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const onDrag = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    onDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    onDrag(touch.clientX, touch.clientY);
  };

  // Generate cropped image and optimize to WebP
  const handleSave = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // We will output a high-res optimized version
    // Profile: 400x400, Project: 800x600 (4:3)
    const targetWidth = aspectRatio === 1 ? 400 : 800;
    const targetHeight = targetWidth / aspectRatio;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Get cropping coordinates
    const containerRect = container.getBoundingClientRect();
    const cropBoxWidth = containerRect.width - 40; // 20px padding left/right
    const cropBoxHeight = cropBoxWidth / aspectRatio;
    
    // Position of crop box relative to container
    const cropBoxLeft = 20;
    const cropBoxTop = (containerRect.height - cropBoxHeight) / 2;

    // Calculate source rect coordinates on the actual image
    const imgRect = img.getBoundingClientRect();

    // Scale ratio between actual image file and the displayed img element
    const renderScaleX = img.naturalWidth / imgRect.width;
    const renderScaleY = img.naturalHeight / imgRect.height;

    // Coordinates of the crop box relative to the displayed image
    const cropXOnImg = (cropBoxLeft - imgRect.left + containerRect.left) * renderScaleX;
    const cropYOnImg = (cropBoxTop - imgRect.top + containerRect.top) * renderScaleY;
    const cropWOnImg = cropBoxWidth * renderScaleX;
    const cropHOnImg = cropBoxHeight * renderScaleY;

    // Draw slice of image onto canvas
    ctx.drawImage(
      img,
      cropXOnImg,
      cropYOnImg,
      cropWOnImg,
      cropHOnImg,
      0,
      0,
      targetWidth,
      targetHeight
    );

    // Optimize automatically to WebP with 0.82 quality
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedUrl = URL.createObjectURL(blob);
          onCropComplete(blob, croppedUrl);
        }
      },
      "image/webp",
      0.82
    );
  };

  return (
    <div className="modal-backdrop" style={{ display: "flex" }}>
      <div className="modal-box" style={{ maxWidth: "480px", padding: "1.75rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 className="section-title" style={{ fontSize: "1.25rem" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="12" />
            </svg>
          </button>
        </div>

        {/* Input Trigger */}
        {!imageSrc && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              height: "240px",
              border: "2px dashed var(--border-md)",
              borderRadius: "var(--r-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              cursor: "pointer",
              background: "var(--bg-card)",
              transition: "border-color 150ms ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--blue)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-md)")}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--blue-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{ fontSize: "0.875rem", color: "var(--text-2)" }}>Upload image file</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>JPG, PNG, WEBP</span>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          style={{ display: "none" }} 
        />

        {/* Interactive Cropper Area */}
        {imageSrc && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Viewport Frame Container */}
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchMove={handleTouchMove}
              onTouchEnd={endDrag}
              style={{
                position: "relative",
                height: "280px",
                width: "100%",
                background: "#040712",
                borderRadius: "var(--r-md)",
                overflow: "hidden",
                cursor: isDragging ? "grabbing" : "grab",
              }}
            >
              {/* Image element with scaling and translation */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Upload preview"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{
                  position: "absolute",
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transformOrigin: "center center",
                  maxHeight: "100%",
                  maxWidth: "100%",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  margin: "auto",
                  pointerEvents: "auto",
                  userSelect: "none",
                }}
              />

              {/* Crop Box Mask Overlay */}
              <div 
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  boxShadow: "0 0 0 9999px rgba(4, 7, 18, 0.7)",
                  // Crop Box centered
                  margin: "auto",
                  border: "2px dashed var(--blue)",
                  borderRadius: aspectRatio === 1 ? "50%" : "8px",
                  // Set crop dimensions
                  width: "calc(100% - 40px)",
                  aspectRatio: aspectRatio,
                  maxWidth: "100%",
                  maxHeight: "calc(100% - 40px)",
                }}
              />
            </div>

            {/* Slider zoom tool */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-2)" }}>
                <span>Zoom Scale</span>
                <span>{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "var(--blue)",
                  background: "var(--border)",
                  height: "4px",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-3)", textAlign: "center" }}>
                Drag image to center the desired crop area.
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button 
                className="btn-ghost" 
                onClick={() => {
                  setImageSrc(null);
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                style={{ flex: 1, justifyContent: "center" }}
              >
                Change File
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSave}
                style={{ flex: 1, justifyContent: "center" }}
              >
                Apply Crop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
