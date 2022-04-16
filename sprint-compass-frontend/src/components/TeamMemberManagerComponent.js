// File Name:    TeamMemberManager.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import "../scss/App.scss";
import {
    Autocomplete,
    Button,
    Card,
    CardContent,
    CardHeader,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useEffect, useReducer } from "react";
import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { httpDelete, httpGet, httpInsert, httpUpdate } from "../utils/ApiUtilities";
import theme from "../theme";
import { useLocation, useNavigate } from "react-router-dom";
import YesNoDialog from "./ui/YesNoDialog";

const TeamMemberManagerComponent = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const initialState = {
        userList: [],
        teamMemberList: [],
        roleList: [],
        userAutocompleteSelectedValue: null,
        roleAutocompleteSelectedValue: null,
        teamMemberToRemove: null
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    useEffect(() => {
        (async () => {
            await fetchData();
        })();
    }, []);

    const disableAddUserButton =
        state.userList === 0
            || state.userAutocompleteSelectedValue === null
            || state.roleAutocompleteSelectedValue === null;

    const fetchData = async () => {
        if (location?.state?.teamId == null) {
            return;
        }

        const teamId = location.state.teamId; 

        try {
            props.showSnackbarMessage("Fetching all users, team members, and roles...");

            const users = await httpGet("api/user");
            const teamMembers = await httpGet(`api/teammember/${teamId}`);
            const roles = await httpGet("api/role");

            if (users !== null && teamMembers !== null && roles !== null) {
                props.showSnackbarMessage(`Found ${users.length} user(s), ${teamMembers.length} team member(s), and ${roles.length} role(s).`);
                
                setState({
                    userList: users,
                    teamMemberList: teamMembers,
                    roleList: roles
                });
            } else {
                props.showSnackbarMessage("Failed to fetch users, team members, and roles due to server-side issue.");
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to fetch the users, team member list, and roles.");
        }
    }

    const onGoBackButtonClicked = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate("/", { replace: true });
        }
    }

    const onAddUserButtonClicked = async () => {
        try {
            props?.showSnackbarMessage(`Adding user ${state.userAutocompleteSelectedValue.firstName} ${state.userAutocompleteSelectedValue.lastName} to current team...`);
            
            const teamId = location.state.teamId; 
            const addTeamMemberResponse = await httpInsert(`api/teammember/${teamId}/${state.userAutocompleteSelectedValue.id}/${state.roleAutocompleteSelectedValue.id}`);

            if (addTeamMemberResponse?.teamMemberAdded) {
                props.showSnackbarMessage(`The user ${addTeamMemberResponse.addedTeamMember.user.firstName} ${addTeamMemberResponse.addedTeamMember.user.lastName} (id: ${addTeamMemberResponse.addedTeamMember.user.id}) was successfully added.`);

                const updatedTeamMemberList = [ ...state.teamMemberList, addTeamMemberResponse.addedTeamMember ];

                setState({ teamMemberList: updatedTeamMemberList });
            } else {
                props.showSnackbarMessage(`Failed to add user "${addTeamMemberResponse.addedTeamMember.user.firstName} ${addTeamMemberResponse.addedTeamMember.user.lastName}" (id: ${addTeamMemberResponse.addedTeamMember.user.id}) to current team due to server-side issue.`);
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to add the user to the team.");
        }
    }

    const onTeamMemberRoleUpdated = async (event, teamMemberId) => {
        try {
            const roleId = event.target.value;
            const updateTeamMemberResponse = await httpUpdate(`api/teammember/${teamMemberId}/${roleId}`);

            if (updateTeamMemberResponse?.success) {
                props.showSnackbarMessage("The team member was successfully updated!");

                const updatedTeamMember = updateTeamMemberResponse.updatedTeamMember;
                const updatedTeamMemberList = [ ...state.teamMemberList ];
                const teamMemberIndex = updatedTeamMemberList.findIndex(teamMember => teamMember.id === updatedTeamMember.id);

                updatedTeamMemberList[teamMemberIndex] = updatedTeamMember;

                setState({ teamMemberList: updatedTeamMemberList });
            } else {
                props.showSnackbarMessage("Failed to add update the team member due to a server-side issue.");
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to update the team member.");
        }
    }

    const removeTeamMember = async () => {
        try {
            props.showSnackbarMessage("Removing user from team...");

            const removeTeamMemberResponse = await httpDelete(`api/teammember/${state.teamMemberToRemove.id}`);

            if (removeTeamMemberResponse?.errorMessage.length === 0) {
                if (removeTeamMemberResponse.teamMemberDeleted) {
                    props.showSnackbarMessage("The user was successfully removed from the team.");

                    const updatedTeamMemberList = [ ...state.teamMemberList ];
                    const teamMemberIndex = updatedTeamMemberList.findIndex(teamMember => teamMember.id === removeTeamMemberResponse.teamMemberId);

                    updatedTeamMemberList.splice(teamMemberIndex, 1);

                    setState({ teamMemberList: updatedTeamMemberList });
                }
            } else {
                props.showSnackbarMessage(`Failed to remove the team member due to a server-side issue. Reason: ${removeTeamMemberResponse?.errorMessage}`);
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to remove the team member.");
            console.log(error);
        } finally {
            setState({ teamMemberToRemove: null });
        }
    } 

    return (
        <ThemeProvider theme={theme}>
            <Card>
                <CardHeader
                    title={location?.state?.teamId == null ? "Manage Team Members" : `Manage Team Members - ${location.state.teamName}`}
                    className="align-text__center"
                />
                <CardContent>
                    <div className="card-content-wrapper">
                        {
                            location?.state?.teamId == null
                            &&
                            <Typography>ERROR: No team has been selected.</Typography>
                        }
                        {
                            location?.state?.teamId != null
                            &&
                            <div>
                                <Button variant="contained" onClick={onGoBackButtonClicked} className="margin-bottom__small">
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    Go Back
                                </Button>
                                <Typography variant="h6" className="margin-bottom__small">Team Members - Total: {state.teamMemberList.length}</Typography>
                                <TableContainer component={Paper} style={{ maxHeight: 300 }} className="team-project-table subtle-shadow margin-bottom__small">
                                    <Table aria-label="Current Team Members" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                    <Typography color="common.white" variant="body1">Name</Typography>
                                                </TableCell>
                                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                    <Typography color="common.white" variant="body1">Role</Typography>
                                                </TableCell>
                                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                    <Typography color="common.white" variant="body1">Actions</Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                state.teamMemberList.map((teamMember, index) => (
                                                    <TableRow
                                                        key={`team-member-row-${index}`}
                                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                                        style={{ backgroundColor: theme.palette.common.white }}
                                                    >
                                                        <TableCell component="th" scope="row">
                                                            <Typography>{teamMember.user.firstName} {teamMember.user.lastName}</Typography>
                                                        </TableCell>
                                                        <TableCell component="th" scope="row">
                                                            <FormControl size="small" fullWidth>
                                                                <InputLabel>Role</InputLabel>
                                                                <Select
                                                                    key={`team-member-role-${index}`}
                                                                    label="Role"
                                                                    value={teamMember.role}
                                                                    onChange={(e) => onTeamMemberRoleUpdated(e, teamMember.id)}
                                                                >
                                                                    {
                                                                        state.roleList.map((role, roleIndex) => (
                                                                            <MenuItem key={`role-menu-item-${roleIndex}`} value={role.id}>{role.name}</MenuItem>
                                                                        ))
                                                                    }
                                                                </Select>
                                                            </FormControl>
                                                        </TableCell>
                                                        <TableCell component="th" scope="row">
                                                            <div className="flex-gap">
                                                                <Button
                                                                    aria-label="Remove Team Member"
                                                                    title="Remove Team Member"
                                                                    onClick={() => setState({ teamMemberToRemove: teamMember })}
                                                                    variant="outlined"
                                                                    className="icon-only-button"
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Typography variant="h6" className="margin-bottom__small">Add User To Team</Typography>
                                <Autocomplete
                                    options={state.userList.filter(user => state.teamMemberList.findIndex(teamMember => teamMember.user.id === user.id) === -1)}
                                    getOptionLabel={(option) => `${option?.firstName} ${option?.lastName}`}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="User"
                                            variant="outlined"
                                        />
                                    )}
                                    onChange={(event, userData) => setState({ userAutocompleteSelectedValue: userData })}
                                    className="margin-bottom__small"
                                    fullWidth
                                />
                                <Autocomplete
                                    options={state.roleList}
                                    getOptionLabel={(option) => option.name}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Role"
                                            variant="outlined"
                                        />
                                    )}
                                    onChange={(event, roleData) => setState({ roleAutocompleteSelectedValue: roleData })}
                                    className="margin-bottom__small"
                                    fullWidth
                                />
                                <Button
                                    variant="outlined"
                                    onClick={onAddUserButtonClicked}
                                    disabled={disableAddUserButton}
                                    fullWidth
                                >
                                    Add User
                                </Button>
                            </div>
                        }
                    </div>
                </CardContent>
            </Card>
            <YesNoDialog
                openDialog={state.teamMemberToRemove !== null}
                title="Remove Team Member Confirmation"
                content={`Are you sure you want to remove the team member "${state.teamMemberToRemove?.user.firstName} ${state.teamMemberToRemove?.user.lastName}" (id: ${state.teamMemberToRemove?.id})? This operation can not be reversed.`}
                onYesClicked={removeTeamMember}
                onNoClicked={() => setState({ teamMemberToRemove: null })}
            />
        </ThemeProvider>
    );
}

export default TeamMemberManagerComponent;