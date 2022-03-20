import React, { useState, useReducer, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Card, CardHeader, CardContent, Typography, TextField } from "@mui/material";
import DatePicker from 'react-datepicker'
import theme from "../theme";
import 'react-datepicker/dist/react-datepicker.css'

const ProjectsComponent = () => {
     const initialState = {
       equivalentHours: "",
       storyPoints: "",
       cost: "",
    };

    const [startDate, setStartDate] = useState(new Date());

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    const handleEqHoursInput = (e) => {
      setState({ equivalentHours: e.target.value });
      };

    const handleStoryPointsInput = (e) => {
      setState({ storyPoints: e.target.value });
      };

    const handleCostInput = (e) => {
      setState({ cost: e.target.value });
      };

  return (
 
    <ThemeProvider theme={theme}>
      <Card style={{ marginTop: "10%" }}>
        <CardHeader
          title="Sprint Compass - Projects"
          style={{ textAlign: "center" }}
        />
        <CardContent style={{ textAlign: "center" }}>
        <Typography variant="body3" color="primary">
            Project Start Date
        </Typography>
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        <p></p>
        <Typography variant="body3" color="primary">
        Enter Number of Hours Equivalent to a Story Point
        </Typography>
        <TextField
        value={state.equivalentHours}
        onChange={handleEqHoursInput}
        />
        <p></p>
        <Typography variant="body3" color="primary">
        Enter Estimated Number of Story Points
        </Typography>
        <TextField
        onChange={handleStoryPointsInput}
        value={state.storyPoints}
        />
        <p></p>
        <Typography variant="body3" color="primary">
        Enter Estimated Cost for Appliction Development
        </Typography>
        <TextField
        onChange={handleCostInput}
        value={state.cost}
        />
        <p></p>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default ProjectsComponent;
