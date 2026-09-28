import React from 'react';

export class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <section className={this.props.inline ? 'load-failure' : 'loading'} role="alert">
          <h1>Let’s get you back on track.</h1>
          <p>Something did not load correctly. Your saved records are still on the server.</p>
          <button className="button primary" onClick={() => window.location.reload()}>
            Reload FitTrack
          </button>
        </section>
      );
    return this.props.children;
  }
}
