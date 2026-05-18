import { useState, useRef, useEffect, useCallback } from "react";

const THRESHOLD = 72;
const MAX_PULL = 100;

export default function usePullToRefresh(onRefresh) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const isPulling = useRef(false);
  const containerRef = useRef(null); // kept for backward compat, not used for events

  useEffect(() => {
    const scrollEl = document.getElementById("root");

    const getScrollTop = () => scrollEl ? scrollEl.scrollTop : 0;

    const handleTouchStart = (e) => {
      if (refreshing || getScrollTop() > 0) return;
      startY.current = e.touches[0].clientY;
      isPulling.current = false;
    };

    const handleTouchMove = (e) => {
      if (startY.current === null || refreshing) return;
      if (getScrollTop() > 0) {
        startY.current = null;
        return;
      }
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) return;
      isPulling.current = true;
      e.preventDefault();
      setPullDistance(Math.min(delta * 0.45, MAX_PULL));
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) {
        startY.current = null;
        return;
      }
      isPulling.current = false;
      startY.current = null;
      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(THRESHOLD);
        await onRefresh?.();
        setRefreshing(false);
      }
      setPullDistance(0);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [refreshing, pullDistance, onRefresh]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return { containerRef, pullDistance, refreshing, progress };
}