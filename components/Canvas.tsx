import React, { useRef, useEffect, useMemo, useState } from 'react';
import type { Settings, DisplayMode } from '../types';
import { usePanAndZoom } from '../hooks/usePanAndZoom';

interface ImageObject {
  id: string;
  img: HTMLImageElement;
  width: number;
  height: number;
}

interface CanvasProps {
  images: ImageObject[];
  settings: Settings;
  displayMode: DisplayMode;
}

const Canvas: React.FC<CanvasProps> = ({ images, settings, displayMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [autoScrollX, setAutoScrollX] = useState(0);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setCanvasSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });
        resizeObserver.observe(container);

        const { width, height } = container.getBoundingClientRect();
        setCanvasSize({ width, height });
        
        return () => resizeObserver.disconnect();
    }, []);

    const shuffledImages = useMemo(() => {
        // Fisher-Yates shuffle to randomize the order of sketches.
        const array = [...images];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }, [images]);

    const imageLayout = useMemo(() => {
        if (canvasSize.height === 0) {
            return { layout: [], totalWidth: 0 };
        }
        const maxHeight = canvasSize.height * 0.5;
        let currentX = 50;

        const layout = shuffledImages.map(imgObj => {
            let renderWidth = imgObj.width;
            let renderHeight = imgObj.height;

            if (renderHeight > maxHeight) {
                const scaleRatio = maxHeight / renderHeight;
                renderHeight = maxHeight;
                renderWidth = renderWidth * scaleRatio;
            }

            const position = { x: currentX, y: 0, width: renderWidth, height: renderHeight };
            currentX += renderWidth + 100; // Add spacing
            return { ...imgObj, ...position };
        });
        const totalWidth = currentX - 50;
        return { layout, totalWidth };
    }, [shuffledImages, canvasSize.height]);

    const { transform } = usePanAndZoom(containerRef, imageLayout, imageLayout.totalWidth);

    // Effect for auto-scrolling in disco mode
    useEffect(() => {
        let scrollFrameId: number;
        if (displayMode === 'disco') {
            const scroll = () => {
                setAutoScrollX(prev => prev - 0.5); // Adjust speed here
                scrollFrameId = requestAnimationFrame(scroll);
            };
            scrollFrameId = requestAnimationFrame(scroll);
        } else {
            setAutoScrollX(0); // Reset scroll when leaving disco mode
        }
        return () => {
            if (scrollFrameId) {
                cancelAnimationFrame(scrollFrameId);
            }
        };
    }, [displayMode]);


    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!context || !canvas || !containerRef.current || canvasSize.width === 0) return;

        const animSettings = settings.animationSettings[displayMode];

        const colorMap = new Map<string, string>();
        const colorModePalette = settings.colorPalettes.color;
        if ((displayMode === 'color' || displayMode === 'disco') && colorModePalette.sketchColors && colorModePalette.sketchColors.length > 0) {
            imageLayout.layout.forEach((item, index) => {
                const color = colorModePalette.sketchColors![index % colorModePalette.sketchColors!.length];
                colorMap.set(item.id, color);
            });
        }

        const render = (time: number) => {
            const { width, height } = canvasSize;
            canvas.width = width;
            canvas.height = height;
            
            const currentPalette = settings.colorPalettes[displayMode];

            // Background
            if (displayMode === 'disco' && currentPalette.gradientPresets && currentPalette.activeGradientPreset) {
                const activePreset = currentPalette.gradientPresets[currentPalette.activeGradientPreset];
                if (activePreset) {
                    const gradient = context.createLinearGradient(0, 0, width, height);
                     activePreset.colors.forEach((color, index) => {
                        const offset = (index / activePreset.colors.length + time * 0.00005 * activePreset.speed) % 1;
                        gradient.addColorStop(offset, color);
                     });
                    context.save();
                    context.fillStyle = gradient;
                    context.filter = `hue-rotate(${(time * 0.01 * activePreset.speed)}deg)`;
                    context.fillRect(0, 0, width, height);
                    context.restore();
                }
            } else {
                context.fillStyle = currentPalette.background;
                context.fillRect(0, 0, width, height);
            }

            context.save();
            context.translate(width / 2, height / 2);
            context.scale(transform.scale, transform.scale);
            
            let currentPanX = transform.x;
            if (displayMode === 'disco') {
                // autoScrollX is a screen-space value, convert to world space for transform
                currentPanX += autoScrollX / transform.scale;
            }
            
            context.translate(-width / 2 + currentPanX, -height / 2 + transform.y);
            
            const canvasCenterY = height / 2;

            const drawBatch = (offsetX: number) => {
                for (const item of imageLayout.layout) {
                    if (item.img.complete) {
                        const itemCenterY = item.y + item.height / 2;
                        context.save();
                        context.translate(item.x + offsetX, canvasCenterY - itemCenterY);
                        
                        // Apply disco effects if in disco mode
                        if (displayMode === 'disco') {
                           const intensity = animSettings.intensity ?? 1;
                           const speed = animSettings.speed ?? 1;
                           const glowSize = Math.sin(time * 0.001 * speed) * 5 * intensity + (10 * intensity);
                           context.shadowBlur = glowSize > 0 ? glowSize : 0;
                           context.shadowColor = settings.colorPalettes.disco.accent;
                        }

                        // Determine if and how to colorize the sketch
                        let fillColor: string | undefined;
                        if (displayMode === 'bw') {
                            fillColor = settings.colorPalettes.bw.foreground;
                        } else if (displayMode === 'color' || displayMode === 'disco') {
                            fillColor = colorMap.get(item.id);
                        }

                        // Draw the sketch
                        if (fillColor) {
                            const offscreenCanvas = document.createElement('canvas');
                            offscreenCanvas.width = item.width;
                            offscreenCanvas.height = item.height;
                            const offscreenCtx = offscreenCanvas.getContext('2d');

                            if (offscreenCtx) {
                                offscreenCtx.fillStyle = fillColor;
                                offscreenCtx.fillRect(0, 0, item.width, item.height);
                                offscreenCtx.globalCompositeOperation = 'destination-in';
                                offscreenCtx.drawImage(item.img, 0, 0, item.width, item.height);
                                context.drawImage(offscreenCanvas, 0, 0, item.width, item.height);
                            }
                        } else {
                            context.drawImage(item.img, 0, 0, item.width, item.height);
                        }

                        context.restore();
                    }
                }
            }

            if (imageLayout.totalWidth > 0) {
                 // Calculate visible world x-coordinates
                const worldX_left = (0 - width / 2) / transform.scale + width / 2 - currentPanX;
                const worldX_right = (width - width / 2) / transform.scale + width / 2 - currentPanX;

                // Determine which repeating batches are visible
                const firstBatchIndex = Math.floor(worldX_left / imageLayout.totalWidth);
                const lastBatchIndex = Math.ceil(worldX_right / imageLayout.totalWidth);
                
                // Draw all visible batches to create a truly infinite effect
                for (let i = firstBatchIndex; i <= lastBatchIndex; i++) {
                    drawBatch(i * imageLayout.totalWidth);
                }
            } else {
                drawBatch(0); // Fallback if there are no images
            }


            context.restore();
            animationFrameId.current = requestAnimationFrame(render);
        };

        render(0);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [displayMode, settings, imageLayout, transform, canvasSize, autoScrollX]);

    return (
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};

export default Canvas;