"use client";
import { Icon } from "./Icon";

export type TouchStepperProps = {
  value: number | string;
  onChange: (val: number | string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  name?: string;
  id?: string;
  label?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * Standardized Touch Stepper ported from the Presyo onboarding pattern.
 * Provides generous touch targets (44px hit-box), active scale feedback,
 * and an underlying numeric input accessible to assistive tech and forms.
 */
export function TouchStepper({
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  placeholder = "0",
  prefix,
  suffix,
  name,
  id,
  label,
  ariaLabel,
  className = "",
  disabled = false,
}: TouchStepperProps) {
  const numericValue = typeof value === "number" ? value : Number(value) || 0;

  const handleDec = () => {
    if (disabled || numericValue <= min) return;
    onChange(Math.max(min, numericValue - step));
  };

  const handleInc = () => {
    if (disabled || numericValue >= max) return;
    onChange(Math.min(max, numericValue + step));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`touch-stepper-wrap ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="touch-stepper-label">
          {label}
        </label>
      )}
      <div className="touch-stepper">
        <button
          type="button"
          className="touch-stepper-btn dec"
          onClick={handleDec}
          disabled={disabled || numericValue <= min}
          aria-label={label ? `Bawasan ang ${label}` : "Bawasan"}
        >
          <Icon name="minus" />
        </button>

        <div className="touch-stepper-val-wrap">
          {prefix && <span className="touch-stepper-prefix">{prefix}</span>}
          <input
            id={id}
            name={name}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={value}
            placeholder={placeholder}
            onChange={handleInputChange}
            aria-label={ariaLabel ?? label}
            disabled={disabled}
            className="touch-stepper-input"
          />
          {suffix && <span className="touch-stepper-suffix">{suffix}</span>}
        </div>

        <button
          type="button"
          className="touch-stepper-btn inc"
          onClick={handleInc}
          disabled={disabled || numericValue >= max}
          aria-label={label ? `Dagdagan ang ${label}` : "Dagdagan"}
        >
          <Icon name="plus" />
        </button>
      </div>
    </div>
  );
}
