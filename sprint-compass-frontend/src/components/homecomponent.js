import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Card, CardHeader, CardContent, Typography } from "@mui/material";
import theme from "../theme";

const HomeComponent = () => {
  return (
    <ThemeProvider theme={theme}>
      <Card style={{ marginTop: "10%" }}>
        <CardHeader
          title="Sprint Compass - Home"
          style={{ textAlign: "center" }}
        />
        <CardContent style={{ textAlign: "center" }}>
          <Typography variant="body3" color="primary">
            Darian Benam, Jordan Fox, Teresa Furrow © 2022
          </Typography>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default HomeComponent;
