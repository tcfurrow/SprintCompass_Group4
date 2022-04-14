import "../scss/App.scss";
import CreateNewSprintDialog from "./ui/CreateNewSprintDialog";
import YesNoDialog from "./ui/YesNoDialog";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { useEffect, useReducer } from "react";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemeProvider } from "@mui/material/styles";
import { httpDelete, httpGet, httpInsert, httpUpdate } from "../utils/ApiUtilities";
import theme from "../theme";
import { useLocation } from "react-router-dom";
import CreateNewProjectTaskDialog from "./ui/CreateNewProjectTaskDialog";
import ProjectTaskDetailsDialog from "./ui/ProjectTaskDetailsDialog";

const ViewSprintsComponent = (props) => {
    const location = useLocation();

    const initialState = {
        sprints: [],
        selectedSprint: null,
        selectedUserStory: null,
        projectTaskToDelete: null,
        showCreateNewSprintDialog: false,
        showCreateNewProjectTaskDialog: false,
        showProjectTaskDetailsDialog: false,
        showDeleteSprintWarningDialog: false
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    useEffect(() => {
        (async () => {
            await fetchSprints();
        })();
    }, []);

    const fetchSprints = async () => {
        if (location?.state?.project == null) {
            return;
        }

        setState({ sprints: [], selectedSprint: null });

        try {
            props.showSnackbarMessage(`Fetching sprints for project ${location.state.project.name} (id: ${location.state.project.id})...`);
            
            const sprints = await httpGet(`api/sprint/${location.state.project.id}`);

            if (sprints !== null) {
                setState({ sprints: sprints });
            }

            props.showSnackbarMessage(`Found ${sprints?.length} sprints for project ${location.state.project.name} (id: ${location.state.project.id})!`);
        } catch (error) {
            props.showSnackbarMessage(`An error occurred while attempting to fetch the sprints. Error message: ${error}`);
        }
    }

    const onSprintListItemButtonClicked = (event) => {
        const sprintIndex = parseInt(event.currentTarget.getAttribute("data-sprint-index"));

        if (sprintIndex >= 0 && sprintIndex <= state.sprints.length - 1) {
            const sprint = state.sprints[sprintIndex];
            
            setState({
                selectedSprint: sprint,
                selectedUserStory: null
            });
        }
    }

    const onCreateNewSprintButtonClicked = () => {
        setState({ showCreateNewSprintDialog: true });
    }

    const onCreateNewSprintDialogCreateSprintButtonClicked = async (sprintName) => {
        try {
            setState({ showCreateNewSprintDialog: false });

            props.showSnackbarMessage("Creating new sprint...");

            const sprint = {
                sprintName: sprintName
            };

            const createSprintResponse = await httpInsert(`api/sprint/${location.state.project.id}`, sprint);

            if (createSprintResponse !== null && createSprintResponse?.sprintAdded) {
                props.showSnackbarMessage(`Sprint "${sprintName}" has been created successfully!`);
                await fetchSprints(); // TODO: Instead of fetching all the sprints, maybe rewrite the HTTP method to return the added sprint, then add that to the state.sprints
            } else {
                props.showSnackbarMessage("Failed to create sprint due to server-side issue.");
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to create the sprint.");
        }
    }

    const onViewProjectTaskButtonClicked = (event, projectTaskIndex) => {
        if (state.selectedSprint === null) {
            return;
        }

        const selectedUserStory = state.selectedSprint.userStories[projectTaskIndex];

        setState({
            selectedUserStory: selectedUserStory,
            showProjectTaskDetailsDialog: true
        });
    }

    const createNewProjectTask = async (sprintId, productBacklogId) => {
        setState({ showCreateNewProjectTaskDialog: false });

        try {
            props.showSnackbarMessage("Creating new project task...");

            const createProjectTaskResponse = await httpInsert(`api/projecttask/${sprintId}/${productBacklogId}`);

            if (createProjectTaskResponse.projectTaskCreated) {
                props.showSnackbarMessage(`Project task has been created successfully!`);

                const sprintIndex = state.sprints.findIndex(sprint => sprint.id === state.selectedSprint.id);
                
                if (sprintIndex !== -1) {
                    const newProjectUserStories = state.sprints[sprintIndex].userStories;
                    newProjectUserStories.push(createProjectTaskResponse.projectTask);

                    const updatedSprints = [ ...state.sprints ];
                    updatedSprints[sprintIndex].userStories = newProjectUserStories;

                    setState({ sprints: updatedSprints });
                }
            } else {
                props.showSnackbarMessage(`Failed to create project task due to server-side issue.`);
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to create the project task.");
        }
    }

    const deleteProjectTask = async () => {
        try {
            props.showSnackbarMessage(`Deleting project task with the id of ${state.projectTaskToDelete.id}...`);

            const deleteProjectTaskResponse = await httpDelete(`api/projecttask/${state.projectTaskToDelete.id}`);

            if (deleteProjectTaskResponse?.projectTaskDeleted) {
                props.showSnackbarMessage(`The project task with the id of ${state.projectTaskToDelete.id} was deleted successfully!`);

                const sprintIndex = state.sprints.findIndex(sprint => sprint.id === state.selectedSprint.id);

                if (sprintIndex !== -1) {
                    const newProjectUserStories = state.sprints[sprintIndex].userStories;
                    const userStoryToRemoveIndex = newProjectUserStories.findIndex(userStory => userStory.id === state.projectTaskToDelete.id);

                    if (userStoryToRemoveIndex !== -1) {
                        const updatedSprints = [ ...state.sprints ];
                        updatedSprints[sprintIndex].userStories.splice(userStoryToRemoveIndex, 1);

                        setState({
                            sprints: updatedSprints,
                            selectedSprint: updatedSprints[sprintIndex]
                        });
                    }
                }
            } else {
                props.showSnackbarMessage(`Failed to delete project task due to server-side issue.`);
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to delete the project task.");
        } finally {
            setState({ projectTaskToDelete: null });
        }
    }

    const onDeleteSprintButtonClicked = () => {
        setState({ showDeleteSprintWarningDialog: true });
    }

    const onConfirmDeleteSprintButtonClicked = async () => {
        setState({ showDeleteSprintWarningDialog: false });

        const sprintToDelete = state.selectedSprint;

        try {
            const deleteSprintResult = await httpDelete(`api/sprint/${sprintToDelete.id}`);

            if (deleteSprintResult?.sprintDeleted) {
                props.showSnackbarMessage(`The sprint "${sprintToDelete.name}" (id: ${sprintToDelete.id}) was deleted successfully!`);
                
                // Remove the sprint from the list
                setState({
                    sprints: state.sprints.filter(sprint => sprint.id !== sprintToDelete.id),
                    selectedSprint: null
                });
            } else {
                props.showSnackbarMessage(`Failed to delete the "${sprintToDelete.name}" sprint (id: ${sprintToDelete.id}).`);
            }
        } catch (error) {
            props.showSnackbarMessage(`An error occurred while attempting to delete the sprint "${sprintToDelete.name}" project (id: ${sprintToDelete.id}).`);
        }
    }

    // NOTE: This button is defined in the ProjectTaskDetailsDialog component
    const createNewSubtask = async (subtaskTitle) => {
        if (state.selectedUserStory === null) {
            return;
        }

        try {
            props.showSnackbarMessage("Creating new subtask...");

            const subtask = {
                userStoryId: state.selectedUserStory.id,
                subtaskTitle: subtaskTitle
            };

            const createSubtaskResponse = await httpInsert(`api/projectsubtask`, subtask);

            if (createSubtaskResponse.subtaskCreated) {
                props.showSnackbarMessage(`Subtask "${subtaskTitle}" has been created successfully!`);

                const sprintIndex = state.sprints.findIndex(sprint => sprint.id === state.selectedSprint.id);
                
                if (sprintIndex !== -1) {
                    const projectTaskIndex = state.sprints[sprintIndex].userStories.findIndex(projectTask => projectTask.id === state.selectedUserStory.id);
                    
                    if (projectTaskIndex !== -1) {
                        let newSubtaskList = state.sprints[sprintIndex].userStories[projectTaskIndex].subtasks;
                        newSubtaskList.push(createSubtaskResponse.subtask);

                        const updatedSprints = [ ...state.sprints ];
                        updatedSprints[sprintIndex].userStories[projectTaskIndex].subtasks = newSubtaskList;

                        setState({
                            sprints: updatedSprints,
                            selectedUserStory: updatedSprints[sprintIndex].userStories[projectTaskIndex]
                        });
                    }
                }
            } else {
                props.showSnackbarMessage(`Failed to create subtask "${subtaskTitle}" due to server-side issue.`);
            }
        } catch (error) {
            props.showSnackbarMessage(`An error occurred while attempting to create the subtask "${subtaskTitle}".`);
        }
    }

    const onSubtaskUpdated = async (subtaskId, subtaskTitle, subtaskStatus) => {
        try {
            props.showSnackbarMessage("Updating subtask status...");
            
            const subtask = {
                title: subtaskTitle,
                status: subtaskStatus
            };

            const updateSubtaskResponse = await httpUpdate(`api/projectsubtask/${subtaskId}`, subtask);

            if (updateSubtaskResponse.subtaskUpdated) {
                props.showSnackbarMessage(`Subtask "${subtaskTitle}" has been updated successfully!`);

                const sprintIndex = state.sprints.findIndex(sprint => sprint.id === state.selectedSprint.id);
                
                if (sprintIndex !== -1) {
                    const projectTaskIndex = state.sprints[sprintIndex].userStories.findIndex(projectTask => projectTask.id === state.selectedUserStory.id);
                    
                    if (projectTaskIndex !== -1) {
                        let subtaskList = state.sprints[sprintIndex].userStories[projectTaskIndex].subtasks;
                        const subtaskIndex = subtaskList.findIndex(subtask => subtask.id === subtaskId);

                        subtaskList[subtaskIndex] = updateSubtaskResponse.subtask;

                        const updatedSprints = [ ...state.sprints ];
                        updatedSprints[sprintIndex].userStories[projectTaskIndex].subtasks = subtaskList;

                        setState({
                            sprints: updatedSprints,
                            selectedUserStory: updatedSprints[sprintIndex].userStories[projectTaskIndex]
                        });
                    }
                }
            } else {
                props.showSnackbarMessage(`Failed to update subtask "${subtaskTitle}" due to server-side issue.`);
            }
        } catch (error) {
            props.showSnackbarMessage(`An error occurred while attempting to update the subtask "${subtaskTitle}".`);
        }
    }

    const onDeleteSubtask = async (subtaskToDelete) => {
        if (subtaskToDelete === null) {
            return;
        }

        try {
            props.showSnackbarMessage(`Deleting subtask "${subtaskToDelete.parentProductBacklogTask.title}"...`);

            const deleteSubtaskResponse = await httpDelete(`api/projectsubtask/${subtaskToDelete.id}`);

            if (deleteSubtaskResponse?.subtaskDeleted) {
                props.showSnackbarMessage(`Subtask "${subtaskToDelete.parentProductBacklogTask.title}" has been deleted successfully!`);

                const sprintIndex = state.sprints.findIndex(sprint => sprint.id === state.selectedSprint.id);
                
                if (sprintIndex !== -1) {
                    const projectTaskIndex = state.sprints[sprintIndex].userStories.findIndex(projectTask => projectTask.id === state.selectedUserStory.id);
                    
                    if (projectTaskIndex !== -1) {
                        let subtaskList = state.sprints[sprintIndex].userStories[projectTaskIndex].subtasks;
                        const subtaskIndex = subtaskList.findIndex(subtask => subtask.id === subtaskToDelete.id);

                        subtaskList.splice(subtaskIndex, 1);

                        const updatedSprints = [ ...state.sprints ];
                        updatedSprints[sprintIndex].userStories[projectTaskIndex].subtasks = subtaskList;

                        setState({
                            sprints: updatedSprints,
                            selectedUserStory: updatedSprints[sprintIndex].userStories[projectTaskIndex]
                        });
                    }
                }
            } else {
                props.showSnackbarMessage(`Failed to delete subtask "${subtaskToDelete.parentProductBacklogTask.title}" due to server-side issue.`);
            }
        } catch (error) {
            props.showSnackbarMessage(`An error occurred while attempting to delete the subtask "${subtaskToDelete.parentProductBacklogTask.title}".`);
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <Card>
                <CardHeader
                    title={location?.state?.project == null ? "View Sprints" : `${location.state.project.name}'s Sprints`}
                    className="align-text__center"
                />
                <CardContent>
                    <div className="card-content-wrapper">
                        {
                            location?.state?.project == null // Is null or undefined
                            &&
                            <Typography>No project has been supplied!</Typography>
                        }
                        {
                            location?.state?.project != null // Is not null or undefined
                            &&
                            <div className="grid__two-col-t2">
                                <div>
                                    <Typography variant="h6" className="margin-bottom__small">Sprints</Typography>
                                    {
                                        state.sprints.length === 0
                                        &&
                                        <Typography variant="body1" className="margin-bottom__small">
                                            This project has no sprints!
                                        </Typography>
                                    }
                                    {
                                        state.sprints.length > 0
                                        &&
                                        <div>
                                            <List className="sprint-list subtle-shadow margin-bottom__small">
                                                {state.sprints.map((sprint, index) => (
                                                    <ListItem key={`sprint-list-item-${index}`} disablePadding>
                                                        <ListItemButton onClick={onSprintListItemButtonClicked} data-sprint-index={index}>
                                                            <ListItemText primary={sprint.name} />
                                                        </ListItemButton>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </div>
                                    }
                                    <Button
                                        onClick={onCreateNewSprintButtonClicked}
                                        variant="outlined"
                                        className="margin-bottom__small"
                                        fullWidth
                                    >
                                        Create New Sprint
                                    </Button>
                                </div>
                                <div>
                                    <Typography variant="h6" className="margin-bottom__small">
                                        {state.selectedSprint === null ? "Tasks" : `${state.selectedSprint.name}'s Tasks`}
                                    </Typography>
                                    {
                                        state.selectedSprint === null
                                        &&
                                        <Typography variant="body1" className="margin-bottom__small">No sprint selected!</Typography>
                                    }
                                    {
                                        state.selectedSprint !== null && state.selectedSprint.userStories.length === 0
                                        &&
                                        <Typography variant="body1" className="margin-bottom__small">This sprint contains zero tasks!</Typography>
                                    }
                                    {
                                        state.selectedSprint !== null && state.selectedSprint.userStories.length > 0
                                        &&
                                        <TableContainer component={Paper} style={{ maxHeight: 300 }} className="team-project-table subtle-shadow margin-bottom__small">
                                            <Table aria-label="Sprint's Tasks" stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                            <Typography color="common.white" variant="body1">Priority</Typography>
                                                        </TableCell>
                                                        <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                            <Typography color="common.white" variant="body1">Title</Typography>
                                                        </TableCell>
                                                        <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                            <Typography color="common.white" variant="body1">Description</Typography>
                                                        </TableCell>
                                                        <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                            <Typography color="common.white" variant="body1">Actions</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {
                                                        state.selectedSprint.userStories.map((userStory, index)  => (
                                                            <TableRow
                                                                key={`sprint-row-${index}`}
                                                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                                                style={{ backgroundColor: theme.palette.common.white }}
                                                            >
                                                                <TableCell component="th" scope="row">
                                                                    <Typography key={`table-row-user-story-priority-${index}`}>
                                                                        {userStory.parentProductBacklogTask.priority}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell component="th" scope="row">
                                                                    <Typography key={`table-row-user-story-title-${index}`}>
                                                                        {userStory.parentProductBacklogTask.title}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell component="th" scope="row">
                                                                    <Typography key={`table-row-user-story-description-${index}`}>
                                                                        {userStory.parentProductBacklogTask.description}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell component="th" scope="row">
                                                                    <div className="flex-gap">
                                                                        <Button
                                                                            aria-label="View Project Task"
                                                                            title="View Project Task"
                                                                            onClick={(e) => onViewProjectTaskButtonClicked(e, index)}
                                                                            variant="outlined"
                                                                            className="icon-only-button"
                                                                        >
                                                                            <FontAwesomeIcon icon={faEye} />
                                                                        </Button>
                                                                        <Button
                                                                            aria-label="Delete Project Task"
                                                                            title="Delete Project Task"
                                                                            onClick={() => setState({ projectTaskToDelete: state.selectedSprint.userStories[index] })}
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
                                    }
                                    {
                                        state.selectedSprint !== null
                                        &&
                                        <div className="action-buttons-container">
                                            <Button
                                                onClick={() => setState({ showCreateNewProjectTaskDialog: true })}
                                                variant="outlined"
                                                className="auto-width-big-screens margin-bottom__small"
                                            >
                                                Create New Task
                                            </Button>
                                            <Button variant="outlined" className="auto-width-big-screens margin-bottom__small" onClick={onDeleteSprintButtonClicked}>Delete Sprint</Button>
                                        </div>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </CardContent>
            </Card>
            <CreateNewSprintDialog
                openDialog={state.showCreateNewSprintDialog}
                onCreateNewSprintButtonClicked={onCreateNewSprintDialogCreateSprintButtonClicked}
                onCancelClicked={() => setState({ showCreateNewSprintDialog: false })}
            />
            <CreateNewProjectTaskDialog
                openDialog={state.showCreateNewProjectTaskDialog}
                selectedSprint={state.selectedSprint}
                onCreate={createNewProjectTask}
                onCancel={() => setState({ showCreateNewProjectTaskDialog: false })}
            />
            <ProjectTaskDetailsDialog
                openDialog={state.showProjectTaskDetailsDialog}
                projectTask={state.selectedUserStory}
                onSubtaskUpdated={onSubtaskUpdated}
                onDeleteSubtask={onDeleteSubtask}
                onCreateNewSubtaskClicked={createNewSubtask}
                onCloseClicked={() => setState({ showProjectTaskDetailsDialog: false })}
            />
            <YesNoDialog
                openDialog={state.showDeleteSprintWarningDialog}
                title="Delete Sprint Confirmation"
                content={`Are you sure you want to delete the sprint "${state.selectedSprint?.name}" (id: ${state.selectedSprint?.id})? This operation can not be reversed.`}
                onYesClicked={onConfirmDeleteSprintButtonClicked}
                onNoClicked={() => setState({ showDeleteSprintWarningDialog: false })}
            />
            <YesNoDialog
                openDialog={state.projectTaskToDelete !== null}
                title="Delete Project Task Confirmation"
                content={`Are you sure you want to delete the project task "${state.projectTaskToDelete?.parentProductBacklogTask.title}" (id: ${state.projectTaskToDelete?.id})? This operation can not be reversed.`}
                onYesClicked={deleteProjectTask}
                onNoClicked={() => setState({ projectTaskToDelete: null })}
            />
        </ThemeProvider>
    );
}

export default ViewSprintsComponent;
