import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Note: deliberately not wrapped in <React.StrictMode>. The Chat engine
// (screens/Chat.tsx) drives its beat queue through a plain ref mutated
// inside a useEffect, not through state — StrictMode's dev-only double
// effect invocation would advance that queue twice per trigger, silently
// skipping/duplicating beats. That's a dev-mode-only artifact (StrictMode's
// double-invoke never happens in production builds), but it made local
// testing unreliable, so it's left off entirely for this ref-driven design.
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
