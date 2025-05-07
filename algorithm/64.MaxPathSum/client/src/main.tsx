import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Material Icons for consistency with design
const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
document.head.appendChild(linkElement);

// Add Roboto font for consistency with design
const fontElement = document.createElement("link");
fontElement.rel = "stylesheet";
fontElement.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
document.head.appendChild(fontElement);

// Set document title
document.title = "Robot Path Visualizer";

createRoot(document.getElementById("root")!).render(<App />);
