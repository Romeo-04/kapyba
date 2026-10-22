import type { ReactNode } from "react";
import { Icon } from "./Icon";

export type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
};

/**
 * Standardized Screen Header across the KapyBa app.
 * Matches the 44px circular control rhythm, title hierarchy, and spacing of the onboarding flow.
 */
export function ScreenHeader({
  title,
  subtitle,
  left,
  right,
  onBack,
  backLabel = "Bumalik",
  className = "",
}: ScreenHeaderProps) {
  const renderLeft = () => {
    if (left !== undefined) return left;
    if (onBack) {
      return (
        <button
          type="button"
          className="simula-back"
          onClick={onBack}
          aria-label={backLabel}
        >
          <Icon name="back" />
        </button>
      );
    }
    return <span className="hdr-spacer" aria-hidden="true" />;
  };

  const renderRight = () => {
    if (right !== undefined) return right;
    return <span className="hdr-spacer" aria-hidden="true" />;
  };

  return (
    <header className={`screen-header ${className}`.trim()}>
      <div className="screen-header-bar">
        {renderLeft()}
        <div className="screen-header-center">
          {title && <h2 className="screen-header-title">{title}</h2>}
          {subtitle && <p className="screen-header-sub mute">{subtitle}</p>}
        </div>
        {renderRight()}
      </div>
    </header>
  );
}
