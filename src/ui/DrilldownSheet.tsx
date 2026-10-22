"use client";
import { useEffect, type ReactNode } from "react";
import { ScreenHeader } from "./ScreenHeader";

export type DrilldownSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  ariaLabel?: string;
};

/**
 * Full-height slide-over sheet for mobile views (replacing centered desktop modals).
 * Locks to 100dvh with a fixed ScreenHeader, momentum-scrollable body, and pinned thumb-zone CTA.
 */
export function DrilldownSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  left,
  right,
  children,
  footer,
  className = "",
  ariaLabel,
}: DrilldownSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="drilldown-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title ?? "Sheet"}
    >
      <div
        className={`drilldown-sheet ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <ScreenHeader
          title={title}
          subtitle={subtitle}
          left={left}
          right={right}
          onBack={onClose}
          className="drilldown-sheet-hdr"
        />

        {/* Scrollable Body Container */}
        <div className="drilldown-sheet-body">
          {children}
        </div>

        {/* Optional Pinned Bottom CTA */}
        {footer && (
          <footer className="drilldown-sheet-footer">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
