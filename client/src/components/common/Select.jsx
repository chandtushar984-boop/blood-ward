import React from "react";

export default function Select({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = "Select an option",
  icon: Icon,
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
      <div className="relative rounded-lg">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full text-xs font-medium rounded-lg border border-theme bg-theme-input text-theme-input py-2.5 transition-all outline-none appearance-none ${
            Icon ? "pl-9 pr-8" : "px-3 pr-8"
          } ${
            error
              ? "border-[#A61B2B] ring-1 ring-[#A61B2B]/30"
              : "focus:border-[#315B83] focus:ring-1 focus:ring-[#315B83]/20"
          } disabled:bg-theme-subtle disabled:text-theme-muted disabled:cursor-not-allowed cursor-pointer`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-theme-card text-theme-muted">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={typeof opt === "object" ? opt.value : opt}
              value={typeof opt === "object" ? opt.value : opt}
              className="bg-theme-card text-theme-primary"
            >
              {typeof opt === "object" ? opt.label : opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-theme-muted">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 font-medium pl-1">{error}</p>}
    </div>
  );
}
