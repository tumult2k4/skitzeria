import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface LayoutItem {
    x: number;
    width: number;
}

interface ImageLayout {
    layout: LayoutItem[];
}

export const usePanAndZoom = (
    containerRef: React.RefObject<HTMLElement>,
    imageLayout: ImageLayout,
    totalWidth: number,
) => {
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 0.5 });
  const isPanning = useRef(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });
  const animationRef = useRef<{ id: number | null }>({ id: null });

  const pan = useCallback((dx: number) => {
    setTransform(t => ({ ...t, x: t.x + dx, y: t.y }));
  }, []);

  const zoom = useCallback((factor: number, centerX: number, centerY: number) => {
    if (!containerRef.current) return;
    const { width: viewportWidth, height: viewportHeight } = containerRef.current.getBoundingClientRect();
    
    setTransform(t => {
        const newScale = Math.max(0.1, Math.min(5, t.scale * factor));
        if (Math.abs(newScale - t.scale) < 0.001) return t;

        const scaleRatio = newScale / t.scale;
        
        const newX = t.x + (centerX - viewportWidth / 2) * (1 - scaleRatio) / newScale;
        const newY = t.y + (centerY - viewportHeight / 2) * (1 - scaleRatio) / newScale;
        
        return { scale: newScale, x: newX, y: newY };
    });
  }, [containerRef]);
  
  const snapToNearest = useCallback(() => {
    if (!containerRef.current || imageLayout.layout.length === 0 || totalWidth <= 0) {
        return;
    }

    const viewportWidth = containerRef.current.getBoundingClientRect().width;
    
    // The world coordinate at the center of the screen
    const worldXAtScreenCenter = (viewportWidth / 2 - transform.x) / transform.scale;

    // Find the equivalent position within a single layout sequence
    const wrappedWorldX = (worldXAtScreenCenter % totalWidth + totalWidth) % totalWidth;

    let closestItem = imageLayout.layout[0];
    let minDistance = Infinity;

    // Find the closest item in the base layout
    for (const item of imageLayout.layout) {
        const itemCenterX = item.x + item.width / 2;
        const distance = Math.abs(itemCenterX - wrappedWorldX);
        if (distance < minDistance) {
            minDistance = distance;
            closestItem = item;
        }
    }
    
    const closestItemCenterX = closestItem.x + closestItem.width / 2;
    
    // Find the physically nearest instance of this item
    const n = Math.round((worldXAtScreenCenter - closestItemCenterX) / totalWidth);
    const targetItemWorldCenterX = closestItemCenterX + (n * totalWidth);

    // Calculate the required transform.x to center this item
    const targetX = viewportWidth / 2 - (targetItemWorldCenterX * transform.scale);
    
    const startX = transform.x;
    if (Math.abs(startX - targetX) < 1) return; // Already close enough

    const startTime = performance.now();
    const duration = 300; // ms

    const animate = (now: number) => {
        const elapsed = now - startTime;
        if (elapsed >= duration) {
            setTransform(t => ({...t, x: targetX}));
            animationRef.current.id = null;
            return;
        }

        const progress = elapsed / duration;
        const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

        const currentX = startX + (targetX - startX) * easedProgress;
        setTransform(t => ({...t, x: currentX}));

        animationRef.current.id = requestAnimationFrame(animate);
    };
    
    if (animationRef.current.id) cancelAnimationFrame(animationRef.current.id);
    animationRef.current.id = requestAnimationFrame(animate);

  }, [transform.x, transform.scale, containerRef, imageLayout, totalWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const cancelAnimation = () => {
        if (animationRef.current.id) {
            cancelAnimationFrame(animationRef.current.id);
            animationRef.current.id = null;
        }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelAnimation();
      const { deltaY } = e;
      const { width, height } = container.getBoundingClientRect();
      const factor = deltaY < 0 ? 1.1 : 1 / 1.1;
      zoom(factor, width / 2, height / 2);
    };

    const handleMouseDown = (e: MouseEvent) => { cancelAnimation(); isPanning.current = true; lastPanPoint.current = { x: e.clientX, y: e.clientY }; };
    const handleMouseMove = (e: MouseEvent) => { if (!isPanning.current) return; const dx = (e.clientX - lastPanPoint.current.x); pan(dx); lastPanPoint.current = { x: e.clientX, y: e.clientY }; };
    const handleMouseUp = () => { if (isPanning.current) { isPanning.current = false; snapToNearest(); } };
    const handleTouchStart = (e: TouchEvent) => { if(e.touches.length === 1) { cancelAnimation(); isPanning.current = true; lastPanPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; } };
    const handleTouchMove = (e: TouchEvent) => { if (!isPanning.current || e.touches.length !== 1) return; const dx = (e.touches[0].clientX - lastPanPoint.current.x); pan(dx); lastPanPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const handleTouchEnd = () => { if (isPanning.current) { isPanning.current = false; snapToNearest(); } };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      cancelAnimation();
    };
  }, [pan, zoom, snapToNearest]);

  // Adjust pan speed based on scale.
  // The original hook had this logic inside handleMouseMove, which is less clean.
  // This effect ensures pan respects the current zoom level.
  const scaledPan = useCallback((dx: number) => {
      pan(dx / transform.scale);
  }, [pan, transform.scale]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleMouseMove = (e: MouseEvent) => { if (!isPanning.current) return; const dx = (e.clientX - lastPanPoint.current.x); scaledPan(dx); lastPanPoint.current = { x: e.clientX, y: e.clientY }; };
    const handleTouchMove = (e: TouchEvent) => { if (!isPanning.current || e.touches.length !== 1) return; const dx = (e.touches[0].clientX - lastPanPoint.current.x); scaledPan(dx); lastPanPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    
    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove);
    
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchmove', handleTouchMove);
    }
  }, [scaledPan]);


  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (isInitialLoad.current && imageLayout.layout.length > 0) {
      isInitialLoad.current = false;
      const timeoutId = setTimeout(() => snapToNearest(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [imageLayout, snapToNearest]);

  return { transform, pan, zoom };
};