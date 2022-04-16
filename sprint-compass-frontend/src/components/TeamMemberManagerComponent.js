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
    Typography
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useEffect, useReducer } from "react";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { httpDelete, httpGet, httpInsert, httpUpdate } from "../utils/ApiUtilities";
import theme from "../theme";
import { useLocation } from "react-router-dom";
import CreateNewProjectTaskDialog from "./ui/CreateNewProjectTaskDialog";

const TeamMemberManagerComponent = (props) => {
    const location = useLocation();

    const initialState = {
        teamMemberList: []
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    useEffect(() => {
        (async () => {
            await fetchTeamMembers();
        })();
    }, []);

    const fetchTeamMembers = async () => {
        if (location?.state?.teamId == null) {
            return;
        }

        const teamId = location.state.teamId; 

        try {
            props.showSnackbarMessage("Fetching all team members...");

            const teamMembers = await httpGet(`api/teammember/${teamId}`);

            if (teamMembers !== null) {
                props.showSnackbarMessage(`Found ${teamMembers.length} team member(s).`);
                setState({ teamMemberList: teamMembers });
            } else {

            }
        } catch (error) {

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
                                <Typography variant="h6" className="margin-bottom__small">Team Members - Total: {state.teamMemberList.length}</Typography>
                                <TableContainer component={Paper} style={{ maxHeight: 300 }} className="team-project-table subtle-shadow margin-bottom__small">
                                    <Table aria-label="Current Team Members" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                    <Typography color="common.white" variant="body1">First Name</Typography>
                                                </TableCell>
                                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                    <Typography color="common.white" variant="body1">Last Name</Typography>
                                                </TableCell>
                                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                    <Typography color="common.white" variant="body1">Role</Typography>
                                                </TableCell>
                                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                    <Typography color="common.white" variant="body1">Action</Typography>
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
                                                            <Typography>{teamMember.user.firstName}</Typography>
                                                        </TableCell>
                                                        <TableCell component="th" scope="row">
                                                            <Typography>{teamMember.user.lastName}</Typography>
                                                        </TableCell>
                                                        <TableCell component="th" scope="row">
                                                        <FormControl size="small" fullWidth>
                                                            <InputLabel>Role</InputLabel>
                                                            <Select
                                                                key={`team-member-role-${index}`}
                                                                label="Role"
                                                                value={teamMember.role}
                                                            >
                                                                {/* TODO: If there is time, get these values from the database. */}
                                                                <MenuItem value={1}>Team Member</MenuItem>
                                                                <MenuItem value={2}>Project Manager</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        </TableCell>
                                                        <TableCell component="th" scope="row">
                                                            <div className="flex-gap">
                                                                <Button
                                                                    aria-label="Remove Team Member"
                                                                    title="Remove Team Member"
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
                            </div>
                        }
                    </div>
                </CardContent>
            </Card>
        </ThemeProvider>
    );
}

export default TeamMemberManagerComponent;