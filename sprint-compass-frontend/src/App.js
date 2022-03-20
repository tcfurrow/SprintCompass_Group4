import {
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useReducer } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { Route, Routes } from "react-router-dom";
import HomeComponent from "./components/homecomponent";
import ProjectsComponent from "./components/projectscomponent";
import ProductBacklogComponent from "./components/productbacklogcomponent";
import "./scss/App.scss";

function App() {
  const initialState = {
    msg: "",
    anchorEl: null,
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  const handleClose = () => {
    setState({ anchorEl: null });
  };
  const handleClick = (event) => {
    setState({ anchorEl: event.currentTarget });
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar color="primary" position="sticky">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Sprint Compass
          </Typography>
          <IconButton
            onClick={handleClick}
            color="inherit"
            style={{ marginLeft: "auto", paddingRight: "1vh" }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={state.anchorEl}
            open={Boolean(state.anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} component={Link} to="/home">
              Home
            </MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/projects">
              Projects
            </MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/backlog">
              Product Backlog
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <div>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/home" element={<HomeComponent />} />
          <Route path="/projects" element={<ProjectsComponent />} />
          <Route path="/backlog" element={<ProductBacklogComponent />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
