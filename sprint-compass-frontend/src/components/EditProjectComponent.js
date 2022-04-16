// File Name:    EditProjectComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import {
    Button,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Typography
} from "@mui/material";
import { useReducer } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { httpUpdate } from "../utils/ApiUtilities";
import theme from "../theme";
import { faUpload, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../scss/App.scss";
import { useLocation, useNavigate} from "react-router-dom";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";

const EditProjectComponent = (props) => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialState = {
        projectName: location?.state?.project?.name ?? "",
        projectDescription: location?.state?.project?.description ?? "",
        projectStartDate: location?.state?.project?.startDate ?? null,
        selectedTeamId: -1,
        teamProjects: [],
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    const onProjectNameTextFieldValueChange = (event) => {
        setState({ projectName: event.target.value });
    }

    const onProjectDescriptionTextFieldValueChange = (event) => {
        setState({ projectDescription: event.target.value });
    }

    const onProjectStartDateValueChanged = (selectedDate) => {
        setState({ projectStartDate: selectedDate });
    }
    const onBackButtonClicked = () => {
        navigate("/projects");
    }

    const onUpdateProjectButtonClicked = async () => {
        try {
            props.showSnackbarMessage("Updating project...");

            const project = {
                projectName: state.projectName,
                projectDescription: state.projectDescription,
                projectStartDate: state.projectStartDate
            };

            const updateProjectResponse = await httpUpdate(`api/project/${location.state.project.id}`, project);

            if (updateProjectResponse !== null && updateProjectResponse.projectUpdated) {
                props.showSnackbarMessage(`Project was updated successfully!`);
            } else {
                props.showSnackbarMessage("Failed to update the project due to server-side issue.");
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to update the project!");
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <Card>            
                <CardHeader
                    title={
                        location?.state?.project != null
                            ? `Update Project - ${location.state.project.name} (id: ${location.state.project.id})`
                            : "Update Project - Error"
                    }
                    className="align-text__center"
                />
                <CardContent>
                    <div className="card-content-wrapper">
                        <Button variant="contained" onClick={onBackButtonClicked} className="margin-bottom__medium">
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Go Back
                        </Button>
                        {
                            location?.state?.project == null // Is null or undefined
                            &&
                            <Typography>No project has been supplied!</Typography>
                        }
                        {
                            location?.state?.project != null // Is not null or undefined
                            &&
                            <div>
                                <div className="grid__split-evenly">
                                    <TextField
                                        label="Name"
                                        variant="outlined"
                                        className="margin-bottom__small"
                                        onChange={onProjectNameTextFieldValueChange}
                                        value={state.projectName}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Description"
                                        variant="outlined"
                                        className="margin-bottom__small"
                                        onChange={onProjectDescriptionTextFieldValueChange}
                                        value={state.projectDescription}
                                        fullWidth
                                    />
                                </div>
                                <div className="margin-bottom__small">
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DesktopDatePicker
                                            label="Project Start Date"
                                            onChange={onProjectStartDateValueChanged}
                                            renderInput={(props) =>
                                                <TextField {...props}
                                                fullWidth
                                            />}
                                        />
                                    </LocalizationProvider>
                                </div>
                                <Button
                                    variant="outlined"
                                    onClick={onUpdateProjectButtonClicked}
                                    fullWidth
                                >
                                    <FontAwesomeIcon icon={faUpload} className="margin-right__xsmall" />
                                    Update Project
                                </Button>
                            </div>
                        }
                    </div>
                </CardContent>
            </Card>
        </ThemeProvider>
    );
}

export default EditProjectComponent;
