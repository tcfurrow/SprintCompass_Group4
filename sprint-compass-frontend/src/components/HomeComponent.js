// File Name:    HomeComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import "../scss/App.scss";
import { Button, Card, CardHeader, CardContent, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import theme from "../theme";

const HomeComponent = () => {
    const navigate = useNavigate();

    return (
        <ThemeProvider theme={theme}>
            <Card>
                <CardHeader
                    title="Welcome to SprintCompass"
                    className="align-text__center"
                />
                <CardContent>
                    <Typography variant="h6" className="margin-bottom__xsmall align-text__center">What would you like to do?</Typography>
                    <div className="flex-gap flex-center">
                        <Button variant="contained" onClick={() => navigate("/backlog")}>Manage Product Backlog</Button>
                        <Button variant="contained" onClick={() => navigate("/user_manager")}>Manage Users</Button>
                        <Button variant="contained" onClick={() => navigate("/projects")}>View Projects</Button>
                    </div>
                </CardContent>
            </Card>
        </ThemeProvider>
    );
};

export default HomeComponent;
