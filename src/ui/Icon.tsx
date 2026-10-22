import { ICONS, type IconName } from "./icons";

export function Icon({ name, className = "", label }: { name: IconName; className?: string; label?: string }) {
  return (
    <svg
      className={`i ${className}`}
      viewBox="0 0 24 24"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
