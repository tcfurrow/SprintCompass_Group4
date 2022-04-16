// File Name:    ReportsComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import "../scss/App.scss";
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
  Typography,
} from "@mui/material";
import React, { useEffect, useReducer } from "react";
import {
  faArrowLeft,
  faEdit,
  faPlus,
  faRunning,
  faTrash,
  faUser,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemeProvider } from "@mui/material/styles";
import YesNoDialog from "./ui/YesNoDialog";
import { httpDelete, httpGet } from "../utils/ApiUtilities";
import theme from "../theme";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const ReportsComponent = (props) => {
  const navigate = useNavigate();

  const initialState = {
    selectedTeamId: -1,
    teamList: [],
    projectsList: [],
    projectId: -1,
    projectToDelete: null,
    backlogList: [],
    sprintsList: [],
    summary: [],
    showDeleteProjectWarningDialog: false,
    projectedDeletedSuccessfully: false,
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
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
  }, [state.selectedTeamId]);

  useEffect(() => {
    if (state.projectId === -1) {
      return;
    } else if (state.projectId > 0) {
      (async () => {
        await fetchProjectBacklog(state.projectId);
        await fetchSprints(state.projectId);
      })();
    }
  }, [state.projectId]);

  useEffect(() => {
    console.log("summary");
    console.log(state.summary);
  }, [state.summary]);

  const onTeamNameSelected = (e, selectedOption) => {
    setState({ teamName: selectedOption, selectedTeamId: selectedOption.id });
  };

  const onProjectSelected = (e, selectedOption) => {
    setState({
      projectName: selectedOption.name,
      projectId: selectedOption.id,
    });
  };

  const fetchTeams = async () => {
    try {
      props.showSnackbarMessage("Fetching list of teams...");

      const teamList = await httpGet("api/team");

      if (teamList?.length >= 0) {
        props.showSnackbarMessage(`Found ${teamList.length} team(s).`);
        setState({ teamList: teamList });
      }
    } catch (error) {
      props.showSnackbarMessage(
        "An error occurred while attempting to fetch the list of teams!"
      );
    }
  };

  const fetchTeamProjects = async (teamId) => {
    try {
      setState({ projectsList: [] });
      props.showSnackbarMessage(
        `Fetching list of projects for team id ${teamId}...`
      );

      const teamProjects = await httpGet(`api/project/${teamId}`);

      if (teamProjects !== null) {
        props.showSnackbarMessage(`Found ${teamProjects.length} project(s).`);
        setState({ projectsList: teamProjects });
      }
    } catch (error) {
      props.showSnackbarMessage(
        "An error occurred while attempting to fetch the list of projects."
      );
    }
  };

  const fetchSprints = async (projectId) => {
    try {
      setState({ sprintsList: [] });

      props.showSnackbarMessage(`Fetching list of sprints for ${projectId}...`);
      const sprints = await httpGet(`api/sprint/${projectId}`);
      if (sprints !== null) {
        props.showSnackbarMessage(`Found ${sprints.length} sprint(s).`);
        setState({ sprintsList: sprints });
        console.log(sprints);
        for (let i = 0; i < sprints.length; i++) {
          let subs = [];
          for (let j = 0; j < sprints[i].userStories.length; j++) {
            for (
              let k = 0;
              k < sprints[i].userStories[j].subtasks.length;
              k++
            ) {
              let subTemp = {
                memberId: sprints[i].userStories[j].subtasks[k].assignedTo.id,
                firstName:
                  sprints[i].userStories[j].subtasks[k].assignedTo.firstName,
                lastName:
                  sprints[i].userStories[j].subtasks[k].assignedTo.lastName,
                totalHoursWorked:
                  sprints[i].userStories[j].subtasks[k].totalHoursWorked,
              };
              if (subTemp != null || subTemp != undefined) {
                subs.push(subTemp);
              }
            }
            let temp = {
              priority:
                sprints[i].userStories[j].parentProductBacklogTask.priority,
              title: sprints[i].userStories[j].parentProductBacklogTask.title,
              hours: subs,
            };
            state.summary.push(temp);
          }
        }
      }
    } catch (error) {
      console.log(error);
      props.showSnackbarMessage(
        "An error occurred while attempting to fetch the list of sprints."
      );
    }
  };

  const fetchProjectBacklog = async (projectId) => {
    try {
      setState({ backlogList: [] });
      props.showSnackbarMessage(
        `Fetching list of backlog tasks for ${projectId}...`
      );
      const backlog = await httpGet(`api/backlog/${projectId}`);
      if (backlog !== null) {
        props.showSnackbarMessage(`Found ${backlog.length} task(s).`);
        setState({ backlogList: backlog });
      }
    } catch (error) {
      props.showSnackbarMessage(
        "An error occurred while attempting to fetch the list of backlog tasks."
      );
    }
  };

  const renderReportTable = () => {
    return (
      <div>
        <Typography variant="h6" className="margin-bottom__small">
          Details for {state.projectName}
        </Typography>
        <TableContainer
          component={Paper}
          style={{ maxHeight: 300 }}
          className="backlog-tasks-table margin-bottom__small"
        >
          <Table aria-label="Current Project's Team Summary" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  style={{ backgroundColor: theme.palette.primary.main }}
                >
                  <Typography color="common.white" variant="h6">
                    Priority
                  </Typography>
                </TableCell>
                <TableCell
                  style={{ backgroundColor: theme.palette.primary.main }}
                >
                  <Typography color="common.white" variant="h6">
                    Task
                  </Typography>
                </TableCell>
                <TableCell
                  style={{ backgroundColor: theme.palette.primary.main }}
                >
                  <Typography color="common.white" variant="h6">
                    Team Member
                  </Typography>
                </TableCell>
                <TableCell
                  style={{ backgroundColor: theme.palette.primary.main }}
                >
                  <Typography color="common.white" variant="h6">
                    Actual Hours
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.summary.map((task, index) => (
                <TableRow
                  key={`task-${index}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  style={{ backgroundColor: theme.palette.common.white }}
                >
                  <TableCell component="th" scope="row">
                    <Typography>{task.priority}</Typography>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography>{task.title}</Typography>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography>
                      {console.log(task.hours)} {task.hours[1].lastName}
                    </Typography>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography>{task.hours[1].totalHoursWorked}</Typography>
                  </TableCell>
                  {/* {task.hours.map((hour, index2) => (
                    <TableRow
                      key={`task-${index2}`}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      style={{ backgroundColor: theme.palette.common.white }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography>{hour.firstName}</Typography>
                      </TableCell>
                    </TableRow>
                  ))} */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Card>
        <CardHeader
          title="Sprint Compass - Team Summary Report"
          className="align-text__center"
        />
        <CardContent className="align-text__center">
          <div className="grid__split-evenly">
            <Autocomplete
              options={state.teamList}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              renderInput={(params) => (
                <TextField {...params} label="Team Name" variant="outlined" />
              )}
              onChange={onTeamNameSelected}
              className="margin-bottom__small"
              disabled={state.teamList.length === 0}
              fullWidth
            />
            <Autocomplete
              options={state.projectsList}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              renderInput={(params) => (
                <TextField {...params} label="Products" variant="outlined" />
              )}
              onChange={onProjectSelected}
              className="margin-bottom__small"
              disabled={state.teamList.length === 0}
              fullWidth
            />
          </div>
          {state.projectId > -1 && renderReportTable()}
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default ReportsComponent;
