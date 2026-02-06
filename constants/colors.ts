const CommonColors = {
  primary: "#2CB5A0",
  accent: "#F4A261",
  success: "#2ECC71",
  danger: "#E63946",
  warning: "#F39C12",
  info: "#3498DB",

  // Category colors
  categoryAcademic: "#4A90E2",
  categoryFiction: "#9B59B6",
  categorySelfHelp: "#2ECC71",
  categoryProfessional: "#E74C3C",
  categoryChildren: "#F39C12",
  categoryScience: "#3498DB",
  categoryMedical: "#E67E22",
  categoryEngineering: "#1ABC9C",
};

export const LightColors = {
  ...CommonColors,
  background: "#FFFFFF",
  surface: "#F7F7F7",
  textPrimary: "#222222",
  textSecondary: "#666666",
  border: "#E5E5E5",
};

export const DarkColors = {
  ...CommonColors,
  background: "#121212",
  surface: "#1E1E1E",
  textPrimary: "#FFFFFF",
  textSecondary: "#AAAAAA",
  border: "#333333",
};

// Default export for backward compatibility (Light)
export const Colors = LightColors;