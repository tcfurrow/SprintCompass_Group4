// File Name:    App.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import "./scss/App.scss";
import {
    AppBar,
    Card,
    CardContent,
    IconButton,
    Menu,
    MenuItem,
    Snackbar,
    Toolbar,
    Typography
} from "@mui/material";
import React, { useReducer } from "react";
import { Route, Routes } from "react-router-dom";
import AddProjectComponent from "./components/AddProjectComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HomeComponent from "./components/HomeComponent";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ProductBacklogComponent from "./components/ProductBacklogComponent";
import ProjectsComponent from "./components/ProjectsComponent";
import ViewSprintsComponent from "./components/ViewSprintsComponent";
import { ThemeProvider } from "@mui/material/styles";
import { faCompass } from "@fortawesome/free-regular-svg-icons";
import theme from "./theme";
import EditProjectComponent from "./components/EditProjectComponent";
import UserManagerComponent from "./components/UserManagerComponent";
import TeamMemberManagerComponent from "./components/TeamMemberManagerComponent";

function App() {
    const initialState = {
        anchorEl: null,
        snackBarMessage: "",
        showSnackbar: false
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    const handleClose = () => {
        setState({ anchorEl: null });
    }

    const handleClick = (event) => {
        setState({ anchorEl: event.currentTarget });
    }

    const showSnackbarMessage = (message) => {
        setState({
            snackbarMessage: message,
            showSnackbar: true
        });
    }

    const onSnackbarClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setState({ showSnackbar: false });
    }

    return (
        <ThemeProvider theme={theme}>
            <AppBar color="primary" position="static">
                <Toolbar className="nav-bar">
                    <Typography variant="h5" color="inherit" className="nav-bar__brand">
                        <FontAwesomeIcon icon={faCompass} />
                        Sprint Compass
                    </Typography>
                    <IconButton
                        onClick={handleClick}
                        color="inherit"
                        className="nav-bar__icon"
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
                        <MenuItem onClick={handleClose} component={Link} to="/backlog">
                            Product Backlog
                        </MenuItem>
                        <MenuItem onClick={handleClose} component={Link} to="/user_manager">
                            User Manager
                        </MenuItem>
                        <MenuItem onClick={handleClose} component={Link} to="/projects">
                            Projects
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Routes>
                <Route path="/" element={<HomeComponent />} />
                <Route path="/home" element={<HomeComponent />} />
                <Route path="/projects" element={<ProjectsComponent showSnackbarMessage={showSnackbarMessage} />} />
                <Route path="/add_project" element={<AddProjectComponent showSnackbarMessage={showSnackbarMessage} />} />
                <Route path="/edit_project" element={<EditProjectComponent showSnackbarMessage={showSnackbarMessage} />} />
                <Route path="/user_manager" element={<UserManagerComponent showSnackbarMessage={showSnackbarMessage} />} />
                <Route path="/team_member_manager" element={<TeamMemberManagerComponent showSnackbarMessage={showSnackbarMessage} />} />
                <Route path="/backlog" element={<ProductBacklogComponent showSnackbarMessage={showSnackbarMessage} />} />
                <Route path="/view_sprints" element={<ViewSprintsComponent showSnackbarMessage={showSnackbarMessage} />} />
            </Routes>
            <Snackbar
                open={state.showSnackbar}
                message={state.snackbarMessage}
                autoHideDuration={3000}
                onClose={onSnackbarClose}
            />
            <Card className="align-text__center">
                <CardContent>
                    <Typography variant="body3" color="common.black">SprintCompass &#8212; Darian Benam, Jordan Fox, Teresa Furrow © 2022</Typography>
                </CardContent>
            </Card>
        </ThemeProvider>
    );
}

export default App;
