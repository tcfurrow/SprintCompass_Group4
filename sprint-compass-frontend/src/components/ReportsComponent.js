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
      })();
    }
  }, [state.projectId]);

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
              </TableRow>
            </TableHead>
            <TableBody>
              {state.backlogList.map((task, index) => (
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
