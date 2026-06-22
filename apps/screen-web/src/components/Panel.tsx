import type { PropsWithChildren, ReactNode } from "react";

interface PanelProps extends PropsWithChildren {
  title: string;
  action?: ReactNode;
  className?: string;
}

export function Panel({ title, action, className = "", children }: PanelProps) {
  return (
    <section className={`screen-panel ${className}`}>
      <header className="panel-header">
        <h2>{title}</h2>
        {action}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}
