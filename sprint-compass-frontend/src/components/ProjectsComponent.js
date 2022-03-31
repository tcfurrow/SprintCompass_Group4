// File Name:    ProjectsComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import {
    Autocomplete,
    Button,
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import React, { useEffect, useReducer } from "react";
import { faArrowLeft, faPlus, faUser, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemeProvider } from "@mui/material/styles";
import { httpGet } from "../utils/ApiUtilities";
import theme from "../theme";
import { useNavigate } from "react-router-dom";
import "../scss/App.scss";

const ProjectsComponent = (props) => {
    const navigate = useNavigate();

    const initialState = {
        selectedTeamId: -1,
        teamList: [],
        teamProjects: []
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    useEffect(() => {
        // NOTE: This is in an IIFE to get rid of a warning (useEffect() is synchronous)
        (async () => {
            await fetchTeams();
        })();
    }, []);

    useEffect(() => {
        if (state.selectedTeamId === -1) {
            return;
        }

        (async () => {
            await fetchTeamProjects(state.selectedTeamId);
        })();
    }, [ state.selectedTeamId ]);

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

    const fetchTeamProjects = async (teamId) => {
        try {
            props.showSnackbarMessage(`Fetching list of projects for team id ${teamId}...`);

            const teamProjects = await httpGet(`api/project/${teamId}`);

            if (teamProjects !== null) {
                props.showSnackbarMessage(`Found ${teamProjects.length} project(s).`);
                setState({ teamProjects: teamProjects });
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to fetch the list of projects.");
        }
    }

    const onTeamNameSelected = (event, selectedTeam) => {
        setState({ selectedTeamId: selectedTeam.id });
    }

    const onSelectDifferentTeamButtonClicked = () => {
        setState({
            selectedTeamId: -1,
            teamProjects: []
        });
    }

    const onAddProjectButtonClicked = () => {
        navigate("/add_project");
    }

    const onAddTeamMemberButtonClicked = () => {
        navigate("/add_team_member");
    }

    const renderSelectTeamPage = () => {
        return (
            <div>
                <Typography className="margin-bottom__small">Select a team name from the dropdown below to view their projects and team members.</Typography>
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
                    disabled={state.teamList.length === 0}
                    fullWidth
                />
            </div>
        );
    }

    const renderTeamInformationPage = () => {
        return (
            <div>
                <Button variant="contained" onClick={onSelectDifferentTeamButtonClicked} className="margin-bottom__small">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Select Different Team
                </Button>
                <Typography variant="h4" className="margin-bottom__small word break-text-on-overflow ">
                    Group Name: {state.teamProjects?.length > 0 ? state.teamProjects[0].team.name : "Resolving..."}
                </Typography>
                <div className="grid__two-col">
                    <div>
                        <Typography variant="h6" className="margin-bottom__small">Projects</Typography>
                        <TableContainer component={Paper} style={{ maxHeight: 300 }} className="team-project-table margin-bottom__small">
                            <Table aria-label="Current Team's Projects" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                            <Typography
                                                color="common.white"
                                                variant="h6"
                                            >
                                                Project Name
                                            </Typography>
                                        </TableCell>
                                        <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                            <Typography
                                                color="common.white"
                                                variant="h6"
                                            >
                                                Description
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {state.teamProjects.map((teamProject, index) => (
                                        <TableRow
                                            key={`project-${index}`}
                                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                            style={{ backgroundColor: theme.palette.common.white }}
                                        >
                                            <TableCell component="th" scope="row">
                                                <Typography>
                                                    {teamProject.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <Typography>
                                                    {teamProject.description}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <div className="action-buttons-container">
                            <Button variant="outlined" onClick={onAddProjectButtonClicked}>
                                <FontAwesomeIcon icon={faPlus} />
                                Add Project
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Typography variant="h6" className="margin-bottom__small">Team Members</Typography>
                        <List className="team-member-list margin-bottom__small">
                            <ul>
                                {
                                    state.teamProjects[0].team.members.map((teamMember, index) => (
                                        <ListItem key={`team-member-${index}`}>
                                            <FontAwesomeIcon icon={faUser} />
                                            <ListItemText primary={`${teamMember.firstName} ${teamMember.lastName}`} />
                                        </ListItem>
                                    ))
                                }
                            </ul>
                        </List>
                        <div className="action-buttons-container">
                            <Button variant="outlined" onClick={onAddTeamMemberButtonClicked}>
                                <FontAwesomeIcon icon={faUserPlus} />
                                Add Team Member
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Card>
                <CardHeader
                    title="Projects"
                    className="align-text__center"
                />
                <CardContent>
                    <div className="card-content-wrapper">
                        {state.selectedTeamId === -1 && renderSelectTeamPage()}
                        {state.selectedTeamId >= 0 && state.teamProjects.length > 0 && renderTeamInformationPage()}
                    </div>
                </CardContent>
            </Card>
        </ThemeProvider>
    );
};

export default ProjectsComponent;
