// File Name:    AddProjectComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import {
    Autocomplete,
    Button,
    Card,
    CardContent,
    CardHeader,
    TextField,
} from "@mui/material";
import { useEffect, useReducer } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { httpGet } from "../utils/ApiUtilities";
import theme from "../theme";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../scss/App.scss";
import { httpInsert } from "../utils/ApiUtilities";

const AddProjectComponent = (props) => {
    const initialState = {
        projectName: "",
        projectDescription: "",
        teamList: [],
        selectedTeamId: -1
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    useEffect(() => {
        (async () => {
            await fetchTeams();
        })();
    }, []);

    const isInputInvalid =
        state.projectName.trim().length === 0
            || state.projectDescription.trim().length === 0
            || state.selectedTeamId === -1;

    const fetchTeams = async () => {
        try {
            props.showSnackbarMessage("Fetching list of teams...");

            const teamList = await httpGet("api/team");

            if (teamList?.length >= 0) {
                props.showSnackbarMessage(`Found ${teamList.length} team(s).`);
                setState({ teamList: teamList });
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to fetch the list of teams!");
        }
    }
        
    const clearInputFields = () => {
        setState({
            projectName: "",
            projectDescription: "",
            selectedTeamId: -1
        });
    }

    const onProjectNameTextFieldValueChange = (event) => {
        setState({ projectName: event.target.value });
    }

    const onProjectDescriptionTextFieldValueChange = (event) => {
        setState({ projectDescription: event.target.value });
    }

    const onTeamNameSelected = (event, selectedTeam) => {
        setState({ selectedTeamId: selectedTeam.id });
    }

    const onAddProjectButtonClicked = async () => {
        try {
            props.showSnackbarMessage("Adding project...");

            const project = {
                projectName: state.projectName,
                projectDescription: state.projectDescription,
                teamId: state.selectedTeamId
            };

            const addProjectResponse = await httpInsert("api/project", project);

            if (addProjectResponse !== null && !addProjectResponse.error) {
                props.showSnackbarMessage(`Project added successfully (id: ${addProjectResponse.addedProject.id})!`);
                clearInputFields();
            } else {
                props.showSnackbarMessage("Failed to add project due to server-side issue.");
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to add the project!");
            console.log(error);
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <Card>
                <CardHeader
                    title="Add Project"
                    className="align-text__center"
                />
                <CardContent>
                    <div className="card-content-wrapper">
                        <div className="grid__split-evenly">
                            <TextField
                                label="Name"
                                variant="outlined"
                                className="margin-bottom__small"
                                onChange={onProjectNameTextFieldValueChange}
                                fullWidth
                            />
                            <TextField
                                label="Description"
                                variant="outlined"
                                className="margin-bottom__small"
                                onChange={onProjectDescriptionTextFieldValueChange}
                                fullWidth
                            />
                        </div>
                        <Autocomplete
                            options={state.teamList}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Team Name"
                                    variant="outlined"
                                />
                            )}
                            onChange={onTeamNameSelected}
                            className="margin-bottom__small"
                            disabled={state.teamList.length === 0}
                            fullWidth
                        />
                        <Button
                            variant="outlined"
                            onClick={onAddProjectButtonClicked}
                            disabled={isInputInvalid}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Add Project
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ThemeProvider>
    );
}

export default AddProjectComponent;
