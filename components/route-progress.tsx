"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // When pathname changes (navigation complete), finish and hide bar
  useEffect(() => {
    if (!visible) return;
    const finishTimer = setTimeout(() => {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 180);
      return () => clearTimeout(hideTimer);
    }, 10);

    return () => clearTimeout(finishTimer);
  }, [pathname, visible]);

  // Intercept clicks on internal links to show progress instantly
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      // Ignore downloads or external links
      if (target.hasAttribute("download") || target.target === "_blank") {
        return;
      }

      const url = new URL(target.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
        setVisible(true);
        setProgress(25);
        setTimeout(() => setProgress((p) => (p === 25 ? 65 : p)), 80);
        setTimeout(() => setProgress((p) => (p === 65 ? 85 : p)), 250);
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary-fixed shadow-[0_0_8px_rgba(109,40,217,0.6)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
