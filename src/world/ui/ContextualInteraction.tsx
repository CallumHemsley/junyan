import { useEffect, useId, useRef, type ReactNode } from "react";
import type { Line } from "../../contracts";
import type { FeatureViewProps } from "../../neighbourhood/contracts";
import type { Job } from "../../features/repairs/rules";
import type { Target } from "../../features/cats/rules";
import FeatureLine from "../../neighbourhood/FeatureLine";
import "./contextual.css";

export type InteractionTarget =
  | { kind: "table"; table: number }
  | { kind: "kitchen" }
  | { kind: "repair"; job: Job }
  | { kind: "cat"; target: Target }
  | { kind: "garden"; plantId: string | null }
  | { kind: "apartment"; itemId: string | null };
export type DialogueProps = Pick<FeatureViewProps<unknown, unknown>, "onLookup" | "onPlay" | "recoveredWordIds" | "freshWordIds">;
export type InteractionAction = { id: string; control: ReactNode };
export type ContextualInteractionProps = DialogueProps & {
  target: InteractionTarget;
  title: ReactNode;
  dialogue?: readonly { line: Line; speaker?: ReactNode }[];
  actions?: readonly InteractionAction[];
  children?: ReactNode;
  onClose: () => void;
  returnFocusTo?: HTMLElement | null;
  suspended?: boolean;
};

export function ContextualInteraction({ target, title, dialogue = [], actions = [], children, onClose, returnFocusTo, suspended = false, ...words }: ContextualInteractionProps) {
  const titleId = useId();
  const closeButton = useRef<HTMLButtonElement>(null);
  const invokingElement = useRef(returnFocusTo ?? (typeof document === "undefined" ? null : document.activeElement));
  useEffect(() => {
    const invoking = invokingElement.current;
    closeButton.current?.focus({ preventScroll: true });
    return () => { if (invoking instanceof HTMLElement && invoking.isConnected) invoking.focus({ preventScroll: true }); };
  }, []);
  return (
    <section className="world-context" role="dialog" aria-labelledby={titleId} inert={suspended} data-target={target.kind}
      onKeyDown={event => { event.stopPropagation(); if (event.key === "Escape") { event.preventDefault(); onClose(); } }}
      onKeyUp={event => event.stopPropagation()}>
      <header className="world-context-heading">
        <h2 id={titleId}>{title}</h2>
        <button ref={closeButton} className="world-context-close" aria-label="继续走走" onClick={onClose}>×</button>
      </header>
      <div className="world-context-scroll" tabIndex={0} role="region" aria-labelledby={titleId}>
        {dialogue.map(({ line, speaker }, index) => <div className="world-context-dialogue" key={`${line.id}-${index}`}>
          {speaker && <p className="world-context-speaker">{speaker}</p>}
          <FeatureLine line={line} {...words} />
        </div>)}
        {children}
      </div>
      {actions.length > 0 && <footer className="world-context-actions">
        {actions.map(action => <div className="world-context-action" key={action.id}>{action.control}</div>)}
      </footer>}
    </section>
  );
}

export function WorldPocketBar({ journalCount, trayCount, onJournal, onTray }: {
  journalCount: number; trayCount: number; onJournal: () => void; onTray: () => void;
}) {
  return <nav className="world-pocket-bar" aria-label="本子与托盘">
    <button onClick={onJournal}>本子 <span>{journalCount}</span></button>
    <button onClick={onTray}>托盘 <span>{trayCount}/6</span></button>
  </nav>;
}
