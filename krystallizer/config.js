export const config = {
  /** Font face and size for entity labels and the grid coordinates. */
  labels: {
    draw: true,
    step: 32,
    font: "10px Bitstream Vera Sans Mono, Monaco, sans-serif",
  },
  /** Colors to use for the background, selection boxes, text and the grid. */
  colors: {
    clear: "#000000", // Background Color
    highlight: "#ceff36", // Currently selected tile or entity
    primary: "#ffffff", // Labels and layer bounds
    secondary: "#555555", // Grid and tile selection bounds
    selection: "#ff9933", // Selection cursor box on tile maps
  },
  directories: {
    levels: "../levels",
    images: "../assets/",
  },
};
