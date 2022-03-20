import React, { useState, useReducer, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Autocomplete, Card, CardHeader, CardContent, TextField, Typography } from "@mui/material";
import theme from "../theme";

const ProductBacklogComponent = () => {
  const initialState = {
    teamName: "",
    productName: "",
    team: [],
    products: [],
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  const handleTeamInput = (e, selectedOption) => {
    setState({ teamName: selectedOption });
  };

  const handleProjectInput = (e, selectedOption) => {
    setState({ projectName: selectedOption });
  };
  return (
    <ThemeProvider theme={theme}>
      <Card style={{ marginTop: "10%" }}>
        <CardHeader
          title="Sprint Compass - Product Backlog"
          style={{ textAlign: "center" }}
        />
        <CardContent style={{ textAlign: "center" }}>
        <Autocomplete
            options={state.team}
            getOptionLabel={(option) => option}
            onChange={handleTeamInput}
            style={{ width: 300, marginTop: 30, marginBottom: 30 }}
            value={state.teamName}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Team"
                variant="outlined"
                fullWidth
              />
            )}
          />
        <Autocomplete
            options={state.products}
            getOptionLabel={(option) => option}
            onChange={handleProjectInput}
            style={{ width: 300, marginTop: 30, marginBottom: 30 }}
            value={state.productName}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Products"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default ProductBacklogComponent;
