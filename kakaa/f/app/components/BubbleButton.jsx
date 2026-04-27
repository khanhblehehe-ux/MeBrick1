"use client";

import "./BubbleButton.css";

export default function BubbleButton({ children, onClick, style = {} }) {
  return (
    <button className="bubble-button" onClick={onClick} style={style}>
      {children}
    </button>
  );
}
