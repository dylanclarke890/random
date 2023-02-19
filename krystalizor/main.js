import { Krystalizor } from "./krystalizor.js";

document.addEventListener("DOMContentLoaded", () => {
  const visibilityIcons = document.querySelectorAll(".layer__visibility");
  for (let i = 0; i < visibilityIcons.length; i++) {
    const icon = visibilityIcons[i];
    icon.addEventListener("click", () => {
      icon.dataset.checked = icon.dataset.checked === "true" ? "false" : "true";
    });
  }
});
new Krystalizor();
