import { useEffect } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="admin-page-heading">
      <div>
        <div className="admin-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading your workspace" }) {
  return (
    <div className="admin-loading" role="status">
      <LoaderCircle size={21} className="admin-spin" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ retry }) {
  return (
    <div className="admin-empty-state">
      <AlertCircle size={22} />
      <strong>We couldn’t load this view</strong>
      <span>Try again in a moment.</span>
      <button className="admin-button admin-button-secondary" onClick={retry}>
        Try again
      </button>
    </div>
  );
}

export function SearchField({ value, onChange, placeholder = "Search" }) {
  return (
    <label className="admin-search">
      <Search size={16} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <kbd>/</kbd>
    </label>
  );
}

export function StatusPill({ children }) {
  const tone = String(children).toLowerCase().replaceAll(" ", "-");
  return (
    <span className={`admin-status admin-status-${tone}`}>
      <i />
      {children}
    </span>
  );
}

export function SelectField({ value, onChange, options, ariaLabel }) {
  return (
    <label className="admin-select">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} />
    </label>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  detail = "Try changing your filters or search terms.",
}) {
  return (
    <div className="admin-empty-state">
      <Search size={22} />
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

export function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timeoutId = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className="admin-toast">
      <Check size={16} />
      <span>{message}</span>
      <button onClick={onClose} aria-label="Dismiss notification">
        <X size={15} />
      </button>
    </div>
  );
}
