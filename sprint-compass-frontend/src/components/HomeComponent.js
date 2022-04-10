// File Name:    HomeComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Card, CardHeader, Modal, Typography, Box } from "@mui/material";
import theme from "../theme";
import "../scss/App.scss";

const HomeComponent = (props) => {
    return (
        <ThemeProvider theme={theme}>
            <Card>
                <CardHeader
                    title="Welcome to SprintCompass"
                    className="align-text__center"
                />
            </Card>
        </ThemeProvider>
    );
};

export default HomeComponent;
