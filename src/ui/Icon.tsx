import type { CSSProperties } from "react";
import { ICONS, type IconName } from "./icons";

export function Icon({
  name,
  className = "",
  label,
  style,
}: {
  name: IconName;
  className?: string;
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={`i ${className}`}
      style={style}
      viewBox="0 0 24 24"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
