export function getSelectedModel(): string {
  if (typeof window !== "undefined") {
    const storedModel = localStorage.getItem("selectedModel");
    return storedModel || "No model loaded";
  } else {
    // Default model
    return "No model loaded";
  }
}
