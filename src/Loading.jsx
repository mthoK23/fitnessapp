import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
export function PageSkeleton({ full = false }) {
  return (
    <div
      className={`skeleton-page ${full ? 'skeleton-full' : ''}`}
      role="status"
      aria-label="Loading your FitTrack space"
      aria-busy="true"
    >
      <span className="sr-only">Loading your FitTrack space…</span>
      <div aria-hidden="true">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-subtitle" />
        <div className="skeleton skeleton-hero" />
        <div className="skeleton-metrics">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-metric" />
          ))}
        </div>
        <div className="skeleton skeleton-chart" />
      </div>
    </div>
  );
}
export function LoadFailure({ message, onRetry }) {
  return (
    <main className="load-failure">
      <AlertCircle size={36} />
      <span className="eyebrow">LOADING PAUSED</span>
      <h1>Let’s try that again.</h1>
      <p role="alert">{message}</p>
      <p>We won’t keep retrying in the background. Continue when you’re ready.</p>
      <button className="button primary" onClick={onRetry}>
        <RefreshCw size={17} />
        Retry loading
      </button>
    </main>
  );
}
