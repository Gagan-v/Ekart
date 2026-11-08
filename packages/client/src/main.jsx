import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: { primary: { main: "#4f46e5" }, secondary: { main: "#4338ca" }, background: { default: "#f7f8fc", paper: "#fff" }, text: { primary: "#202338", secondary: "#687087" } },
  typography: { fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", button: { textTransform: "none", fontWeight: 600 }, h4: { fontWeight: 750 }, h5: { fontWeight: 700 } },
  shape: { borderRadius: 12 },
  components: { MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { padding: "10px 20px" } } }, MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } }, MuiOutlinedInput: { styleOverrides: { root: { background: "#fff" } } }, MuiTableCell: { styleOverrides: { head: { fontWeight: 700, background: "#f1f3fa" } } } }
});
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}><BrowserRouter>
      <App />
    </BrowserRouter></ThemeProvider>
  </StrictMode>
);
