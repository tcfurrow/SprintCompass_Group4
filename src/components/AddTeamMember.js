// File Name:    EditProjectComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import {
    Autocomplete,
    Button,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Typography
} from "@mui/material";
import { useReducer, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { httpUpdate, httpGet, httpInsert } from "../utils/ApiUtilities";
import theme from "../theme";
import { faUpload, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../scss/App.scss";
import { useLocation, useNavigate } from "react-router-dom";
// import AdapterDateFns from "@mui/lab/AdapterDateFns";
// import LocalizationProvider from "@mui/lab/LocalizationProvider";
// import DesktopDatePicker from "@mui/lab/DesktopDatePicker";

const AddTeamMemberComponent = (props) => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialState = {
        firstName: "",
        lastName: "",
        role: [],
        selectedRoleId: -1
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    useEffect(() => {
        (async () => {
            await fetchRoles();
        })();
    }, []);

    const fetchRoles = async () => {
        try {
            props.showSnackbarMessage("Fetching roles for new member...");

            const roleList = await httpGet("api/role");

            if (roleList?.length >= 0) {
                props.showSnackbarMessage(`Found ${roleList.length} roles.`);
                setState({ role: roleList });
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to fetch the list of roles!");
        }
    }

    const clearInputFields = () => {
        setState({
            firstName: "",
            lastName: "",
            selectedRoleId: -1
        });
    }

    const onFirstNameTextFieldValueChange = (event) => {
        setState({ firstName: event.target.value });
    }
    const onLastNameTextFieldValueChange = (event) => {
        setState({ lastName: event.target.value });
    }
    const onRoleSelected = (event, selectedRole) => {
        setState({ selectedRoleId: selectedRole.id });
    }
    const onBackButtonClicked = () => {
        navigate("/projects");
    }

    const onAddTeamMemberButtonClicked = async () => {
        try {
            props.showSnackbarMessage("Adding Team Member...");

            const teamMember = {
                firstName: state.firstName,
                lastName: state.lastName,
                roleId: state.selectedRoleId
            };

            const addTeamMemberResponse = await httpInsert("api/team", teamMember);

            if (addTeamMemberResponse !== null && !addTeamMemberResponse.error) {
                props.showSnackbarMessage(`Team Member added successfully (id: ${addTeamMemberResponse.userAdded.id})!`);
                clearInputFields();
            } else {
                props.showSnackbarMessage("Failed to add team member due to server-side issue.");
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to add the team member!");
            console.log(error);
        }
    }
    return (
        <ThemeProvider theme={theme}>
            <Card>
            <Button variant="contained" onClick={onBackButtonClicked} className="margin-bottom__small">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back
                </Button>
                <CardHeader
                    className="align-text__center"
                />
                <CardContent>
                    <div className="card-content-wrapper">
                        {
                            <div>
                                <div className="grid__split-evenly">
                                    <TextField
                                        label="First Name"
                                        variant="outlined"
                                        className="margin-bottom__small"
                                        onChange={onFirstNameTextFieldValueChange}
                                        value={state.firstName}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Last Name"
                                        variant="outlined"
                                        className="margin-bottom__small"
                                        onChange={onLastNameTextFieldValueChange}
                                        value={state.lastName}
                                        fullWidth
                                    />
                                     <Autocomplete
                                        options={state.role}
                                        getOptionLabel={(option) => option}
                                        renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Members Role"
                                        variant="outlined"
                                    />
                                        )}
                                        onChange={onRoleSelected}
                                        className="margin-bottom__small"
                                        disabled={state.role.length === 0}
                                        fullWidth
                                    />
                                </div>
                                <Button
                                    variant="outlined"
                                    onClick={onAddTeamMemberButtonClicked}
                                >
                                    <FontAwesomeIcon icon={faUpload} className="margin-right__xsmall" />
                                    Add Team Member
                                </Button>
                            </div>
                        }
                    </div>
                </CardContent>
            </Card>
        </ThemeProvider>
    );
}

export default AddTeamMemberComponent;
