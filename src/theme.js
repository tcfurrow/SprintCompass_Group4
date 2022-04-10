import { createTheme } from "@mui/material/styles";

export default createTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    common: { black: "#000", white: "#fff" },
    background: { paper: "#fff", default: "rgba(184, 171, 184, 1)" },
    primary: {
      light: "rgba(176, 121, 203, 1)",
      main: "rgba(147, 63, 181, 1)",
      dark: "rgba(119, 48, 159, 1)",
      contrastText: "#fff",
    },
    secondary: {
      light: "rgba(226, 255, 64, 1)",
      main: "rgba(245, 205, 0, 1)",
      dark: "rgba(197, 187, 17, 1)",
      contrastText: "#fff",
    },
    error: {
      light: "#e57373",
      main: "#f44336",
      dark: "#d32f2f",
      contrastText: "#fff",
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.54)",
      disabled: "rgba(0, 0, 0, 0.38)",
      hint: "rgba(0, 0, 0, 0.38)",
    },
  },
});
