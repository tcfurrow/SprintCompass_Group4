import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Card, CardHeader, CardContent, Typography } from "@mui/material";
import theme from "../theme";

const ProductBacklogComponent = () => {
  return (
    <ThemeProvider theme={theme}>
      <Card style={{ marginTop: "10%" }}>
        <CardHeader
          title="Sprint Compass - Product Backlog"
          style={{ textAlign: "center" }}
        />
        <CardContent style={{ textAlign: "center" }}>
          <Typography variant="body3" color="primary">
            Product Backlog
          </Typography>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default ProductBacklogComponent;
