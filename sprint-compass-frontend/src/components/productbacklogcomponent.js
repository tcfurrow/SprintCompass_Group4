// File Name:    ProductBacklogComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import { useReducer } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Autocomplete, Card, CardHeader, CardContent, TextField } from "@mui/material";
import theme from "../theme";
import "../scss/App.scss";

const ProductBacklogComponent = (props) => {
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
    }

    const handleProjectInput = (e, selectedOption) => {
        setState({ projectName: selectedOption });
    }

    return (
        <ThemeProvider theme={theme}>
            <Card>
                <CardHeader
                    title="Sprint Compass - Product Backlog"
                    className="align-text__center"
                />
                <CardContent className="align-text__center">
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
