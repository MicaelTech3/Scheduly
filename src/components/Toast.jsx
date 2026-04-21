import { useState, useCallback } from "react";

let _setToast = null;

export function toast(msg, duration = 3000) {
  if (_setToast) _setToast({ msg, id: Date.now() });
}

export default function Toast() {
  const [item, setItem] = useState(null);

  _setToast = ({ msg, id }) => {
    setItem({ msg, id });
    setTimeout(() => setItem(null), 3000);
  };

  if (!item) return null;
  return <div className="toast">{item.msg}</div>;
}
