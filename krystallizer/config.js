export const config = {
  collisionTiles: {
    path: "./assets/collision_tiles.png",
    tilesize: 64,
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
    images: "../assets",
    levels: "../levels",
  },
  general: {
    loadLastLevel: true,
    newFileName: "untitled.js",
    undoDepth: 50,
  },
  /** Font face and size for entity labels and the grid coordinates. */
  labels: {
    draw: true,
    font: "10px Bitstream Vera Sans Mono, Monaco, sans-serif",
    step: 32,
  },
  layerDefaults: {
    width: 10,
    height: 10,
    tilesize: 32,
  },
  storageKeys: {
    lastLevel: "krystallizer_lastLevel",
  },
};
