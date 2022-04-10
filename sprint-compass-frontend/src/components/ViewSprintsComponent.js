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
import { ThemeProvider } from "@mui/material/styles";
import { httpDelete, httpGet, httpInsert } from "../utils/ApiUtilities";
import theme from "../theme";
import { useLocation } from "react-router-dom";

const ViewSprintsComponent = (props) => {
    const location = useLocation();

    const initialState = {
        sprints: [],
        selectedSprint: null,
        showCreateNewSprintDialog: false,
        showDeleteSprintWarningDialog: false,
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
            setState({ selectedSprint: sprint });
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

    const onCreateNewTaskButtonClicked = () => {

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
                                                            <Typography color="common.white" variant="h6">Priority</Typography>
                                                        </TableCell>
                                                        <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                            <Typography color="common.white" variant="h6">Title</Typography>
                                                        </TableCell>
                                                        <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                                            <Typography color="common.white" variant="h6">Description</Typography>
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
                                                                        {userStory.priority}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell component="th" scope="row">
                                                                    <Typography key={`table-row-user-story-title-${index}`}>
                                                                        {userStory.title}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell component="th" scope="row">
                                                                    <Typography key={`table-row-user-story-description-${index}`}>
                                                                        {userStory.description}
                                                                    </Typography>
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
                                            <Button variant="outlined" className="auto-width-big-screens margin-bottom__small">Create New Task</Button>
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
            <YesNoDialog
                openDialog={state.showDeleteSprintWarningDialog}
                title="Delete Sprint Confirmation"
                content={`Are you sure you want to delete the sprint "${state.selectedSprint?.name}" (id: ${state.selectedSprint?.id})? This operation can not be reversed.`}
                onYesClicked={onConfirmDeleteSprintButtonClicked}
                onNoClicked={() => setState({ showDeleteSprintWarningDialog: false })}
            />
        </ThemeProvider>
    );
}

export default ViewSprintsComponent;
