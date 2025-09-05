// HelpHint.jsx
import React, { useRef, useState } from "react";
import { usePopper } from "react-popper";
import { FiHelpCircle } from "react-icons/fi";

export default function HelpHint({ text }) {
  const [open, setOpen] = useState(false);
  const refEl = useRef(null);
  const popEl = useRef(null);

  // colado ao ícone, do lado direito
  const { styles, attributes } = usePopper(refEl.current, popEl.current, {
    placement: "right", // pode ser "right", "left", "top", "bottom"
    modifiers: [
      {
        name: "offset",
        options: { offset: [0, 4] }, // distância entre o ícone e o popper
      },
    ],
  });

  return (
    <span className="inline-flex items-center">
      <button
        type="button"
        ref={refEl}
        aria-label="Help"
        aria-describedby={open ? "hint-pop" : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="help-hint-btn"
      >
        <FiHelpCircle size={16} />
      </button>

      {open && (
        <div
          id="hint-pop"
          ref={popEl}
          role="tooltip"
          className="help-hint-pop"
          style={styles.popper} 
          {...attributes.popper}
        >
          {text}
        </div>
      )}
    </span>
  );
}
