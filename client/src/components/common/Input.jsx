import React from "react";

export default function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  prefix,
  className = "",
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-[#1E293B] dark:text-zinc-200">
          {label} {required && <span className="text-[#A61B2B] font-bold">*</span>}
        </label>
      )}
      <div className="relative rounded-lg flex items-stretch">
        {prefix && (
          <div className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-theme bg-theme-subtle text-theme-muted text-xs font-medium select-none">
            {prefix}
          </div>
        )}
        <div className="relative flex-1">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-muted">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`w-full text-xs font-medium bg-theme-input text-theme-input placeholder-theme-muted py-2.5 transition-all outline-none ${
              prefix ? "rounded-r-lg border border-theme" : "rounded-lg border border-theme"
            } ${Icon ? "pl-9 pr-3" : "px-3"} ${
              error
                ? "border-[#A61B2B] ring-1 ring-[#A61B2B]/30"
                : "focus:border-[#315B83] focus:ring-1 focus:ring-[#315B83]/20"
            } disabled:bg-theme-subtle disabled:text-theme-muted disabled:cursor-not-allowed`}
            {...props}
          />
        </div>
      </div>
      {error && <p className="text-[11px] text-[#A61B2B] font-medium pl-0.5">{error}</p>}
    </div>
  );
}
