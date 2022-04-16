// File Name:    ProductBacklogComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import { useEffect, useReducer } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { httpGet, httpInsert } from "../utils/ApiUtilities";
import {
  Autocomplete,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Modal,
  Box,
} from "@mui/material";
import {
  faArrowLeft,
  faEdit,
  faPlus,
  faTrash,
  faUser,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import theme from "../theme";
import "../scss/App.scss";

const ProductBacklogComponent = (props) => {
  const initialState = {
    selectedTeamId: -1,
    teamName: "",
    projectName: "",
    teamList: [],
    projectsList: [],
    backlogList: [],
    modalOpen: false,
    taskTitle: "",
    taskDescription: "",
    taskPriority: -1,
    taskRelativeEstimate: -1,
    taskCost: -1,
    projectId: -1,
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

  const handleModalOpen = () => {
    setState({ modalOpen: true });
  };
  const handleModalClose = () => {
    setState({ modalOpen: false });
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

  const onTeamNameSelected = (e, selectedOption) => {
    setState({ teamName: selectedOption, selectedTeamId: selectedOption.id });
  };

  const onProjectSelected = (e, selectedOption) => {
    setState({
      projectName: selectedOption.name,
      projectId: selectedOption.id,
    });
  };

  const onAddTaskButtonClicked = () => {
    handleModalOpen();
    renderAddTaskModal();
  };

  const isModalInputInvalid =
    state.taskTitle.trim().length === 0 ||
    state.taskDescription.trim().length === 0 ||
    state.taskPriority === -1 ||
    state.taskRelativeEstimate === -1 ||
    state.taskCost === -1 ||
    state.projectId < 1;

  const onTaskTitleChange = (e) => {
    setState({ taskTitle: e.target.value });
  };

  const onTaskDescriptionChange = (e) => {
    setState({ taskDescription: e.target.value });
  };

  const onTaskPriorityChange = (e) => {
    setState({ taskPriority: e.target.value });
  };

  const onTaskRelativeEstimateChange = (e) => {
    setState({ taskRelativeEstimate: e.target.value });
  };

  const onTaskCostChange = (e) => {
    setState({ taskCost: e.target.value });
  };

  const clearInputFields = () => {
    setState({
      title: "",
      description: "",
      priority: "",
      relativeEstimate: "",
      cost: "",
    });
  };

  const onAddTaskToDatabaseButtonClicked = async () => {
    try {
      props.showSnackbarMessage("Adding backlog task...");

      const backlogTask = {
        projectId: state.projectId,
        title: state.taskTitle,
        description: state.taskDescription,
        priority: parseInt(state.taskPriority),
        relativeEstimate: parseInt(state.taskRelativeEstimate),
        cost: parseInt(state.taskCost),
      };

      console.log(backlogTask);

      const addBacklogTaskResponse = await httpInsert(
        "api/backlog",
        backlogTask
      );

      if (addBacklogTaskResponse !== null && !addBacklogTaskResponse.error) {
        props.showSnackbarMessage(
          `Backlog task added successfully (id: ${addBacklogTaskResponse.addedProject.id})!`
        );
        clearInputFields();
        handleModalClose();
      } else {
        props.showSnackbarMessage(
          "Failed to add backlog task due to server-side issue."
        );
      }
    } catch (error) {
      props.showSnackbarMessage(
        "An error occurred while attempting to add the backlog task!"
      );
      console.log(error);
    }
  };

  const renderAddTaskModal = () => {
    return (
      <Modal
        open={state.modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="modal__container"
      >
        <Box className="modal__content">
          <TextField
            onChange={onTaskTitleChange}
            placeholder="Task title"
            autoFocus={true}
          />
          <TextField
            onChange={onTaskDescriptionChange}
            placeholder="Task description"
          />
          <TextField
            onChange={onTaskPriorityChange}
            placeholder="Task priority"
          />
          <TextField
            onChange={onTaskRelativeEstimateChange}
            placeholder="Task relative estimate"
          />
          <TextField onChange={onTaskCostChange} placeholder="Task cost" />
          <Button
            variant="outlined"
            disabled={isModalInputInvalid}
            onClick={onAddTaskToDatabaseButtonClicked}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Backlog Task To Database
          </Button>
        </Box>
      </Modal>
    );
  };

  const onEditProjectButtonClicked = (event) => {
    // const projectId = parseInt(
    //   event.currentTarget.getAttribute("data-project-id-to-update")
    // );
    // const projectToUpdate = state.teamProjects.find(
    //   (project) => project.id === projectId
    // );
    // navigate("/edit_project", {
    //   state: {
    //     project: projectToUpdate,
    //   },
    // });
  };

  const onDeleteProjectButtonClicked = (event) => {
    // TODO: We should probably do data validation here to make sure that the project id is indeed an integer
    // const projectId = parseInt(
    //   event.currentTarget.getAttribute("data-project-id-to-delete")
    // );
    // const projectToDelete = state.teamProjects.find(
    //   (project) => project.id === projectId
    // );
    // setState({
    //   projectToDelete: projectToDelete,
    //   showDeleteProjectWarningDialog: true,
    // });
  };

  const renderProjectTable = () => {
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
          <Table aria-label="Current Project's Backlog" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  style={{ backgroundColor: theme.palette.primary.main }}
                >
                  <Typography color="common.white" variant="h6">
                    ID
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
                    Description
                  </Typography>
                </TableCell>
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
                    Rel Est
                  </Typography>
                </TableCell>
                <TableCell
                  style={{ backgroundColor: theme.palette.primary.main }}
                >
                  <Typography color="common.white" variant="h6">
                    Cost
                  </Typography>
                </TableCell>
                <TableCell
                  style={{ backgroundColor: theme.palette.primary.main }}
                >
                  <Typography color="common.white" variant="h6">
                    Action
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
                    <Typography>{task.id}</Typography>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography>{task.title}</Typography>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography>{task.description}</Typography>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography>{task.priority}</Typography>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography>{task.relativeEstimate}</Typography>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography>{task.cost}</Typography>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <div className="flex-gap">
                      <Button
                        aria-label="Edit Project"
                        onClick={onEditProjectButtonClicked}
                        data-project-id-to-update={task.id}
                        variant="outlined"
                        className="icon-only-button"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        aria-label="Delete Project"
                        onClick={onDeleteProjectButtonClicked}
                        data-project-id-to-delete={task.id}
                        variant="outlined"
                        className="icon-only-button"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="action-buttons-container">
          <Button variant="outlined" onClick={onAddTaskButtonClicked}>
            <FontAwesomeIcon icon={faPlus} />
            Add Backlog Task
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      {state.modalOpen === true && renderAddTaskModal()}
      <Card>
        <CardHeader
          title="Sprint Compass - Product Backlog"
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
          {state.projectId > -1 && renderProjectTable()}
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default ProductBacklogComponent;
