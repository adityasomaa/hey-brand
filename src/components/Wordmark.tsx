/**
 * The wordmark, drawn as three stacked type layers.
 *
 * The layering is the brand device for this site: printing plates slightly out
 * of register. It is used at three sizes — nav, hero, boot loader — and the
 * offsets are driven entirely by CSS custom properties, so a parent can move
 * the plates (hero pointer tracking, loader assembly) by writing two variables
 * on a DOM node instead of re-rendering React on every frame.
 *
 * Accessibility: the decorative plates are aria-hidden and only the top layer
 * carries the text, so a screen reader announces "Hey._.Brand!" exactly once.
 */

type WordmarkProps = {
  /** Rendered text. Kept as a prop so the name lives in config, not here. */
  text: string;
  /** Tailwind size/typography classes for the type itself. */
  className?: string;
  /** Colour of the two offset plates and the solid top layer. */
  tone?: "on-paper" | "on-ink";
  /** Turns the offset plates off entirely (nav, footer). */
  flat?: boolean;
};

export function Wordmark({
  text,
  className = "",
  tone = "on-paper",
  flat = false,
}: WordmarkProps) {
  const top = tone === "on-ink" ? "text-paper" : "text-ink";
  const plateB = tone === "on-ink" ? "text-paper/35" : "text-ink/25";

  if (flat) {
    return <span className={`${top} ${className}`}>{text}</span>;
  }

  return (
    <span
      className={`relative inline-block will-change-transform ${className}`}
      data-wordmark=""
    >
      {/* Plate 1 — accent. Sits furthest out of register. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none text-accent"
        style={{
          transform:
            "translate3d(var(--plate-a-x, 0px), var(--plate-a-y, 0px), 0)",
        }}
      >
        {text}
      </span>

      {/* Plate 2 — a ghost of the base colour, offset the other way. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 select-none ${plateB}`}
        style={{
          transform:
            "translate3d(var(--plate-b-x, 0px), var(--plate-b-y, 0px), 0)",
        }}
      >
        {text}
      </span>

      {/* Top plate — the readable one. */}
      <span className={`relative ${top}`}>{text}</span>
    </span>
  );
}
