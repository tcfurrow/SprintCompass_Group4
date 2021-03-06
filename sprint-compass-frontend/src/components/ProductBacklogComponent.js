// File Name:    ProductBacklogComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import "../scss/App.scss";
import { faEdit, faEye, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useReducer } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { httpDelete, httpGet, httpInsert, httpUpdate } from "../utils/ApiUtilities";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardHeader,
    CardContent,
    Modal,
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
import theme from "../theme";
import EditProductBacklogTaskDialog from "./ui/EditProductBacklogTaskDialog";
import TeamSummaryReportDialog from "./ui/TeamSummaryReportDialog";
import YesNoDialog from "./ui/YesNoDialog";

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
        productBacklogTaskToEdit: null,
        productBacklogTaskToDelete: null,
        showTeamSummaryReportDialog: false
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: "currency",
        currency: "USD"
    });

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
    }, [ state.selectedTeamId ]);

    useEffect(() => {
        if (state.projectId < 0) {
            return;
        }

        (async () => {
            await fetchProjectBacklog(state.projectId);
        })();
    }, [ state.projectId ]);

    const handleModalOpen = () => {
        setState({ modalOpen: true });
    }

    const handleModalClose = () => {
        setState({ modalOpen: false });
    }

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
            setState({ projectsList: [] });

            props.showSnackbarMessage(`Fetching list of projects for team id ${teamId}...`);

            const teamProjects = await httpGet(`api/project/${teamId}`);

            if (teamProjects !== null) {
                props.showSnackbarMessage(`Found ${teamProjects.length} project(s).`);
                setState({ projectsList: teamProjects });
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to fetch the list of projects.");
        }
    }

    const fetchProjectBacklog = async (projectId) => {
        try {
            setState({ backlogList: [] });
            props.showSnackbarMessage(`Fetching list of backlog tasks for ${projectId}...`);

            const backlog = await httpGet(`api/backlog/${projectId}`);
            
            if (backlog !== null) {
                props.showSnackbarMessage(`Found ${backlog.length} task(s).`);
                setState({ backlogList: backlog });
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to fetch the list of backlog tasks.");
        }
    }

    const onTeamNameSelected = (e, selectedOption) => {
        setState({
            teamName: selectedOption,
            selectedTeamId: selectedOption.id
        });
    }

    const onProjectSelected = (e, selectedOption) => {
        setState({
            projectName: selectedOption.name,
            projectId: selectedOption.id,
        });
    }

    const onAddTaskButtonClicked = () => {
        handleModalOpen();
        renderAddTaskModal();
    }

    const isModalInputInvalid =
        state.taskTitle.trim().length === 0 ||
        state.taskDescription.trim().length === 0 ||
        state.taskPriority === -1 ||
        state.taskRelativeEstimate === -1 ||
        state.taskCost === -1 ||
        state.projectId < 1;

    const onTaskTitleChange = (e) => {
        setState({ taskTitle: e.target.value });
    }

    const onTaskDescriptionChange = (e) => {
        setState({ taskDescription: e.target.value });
    }

    const onTaskPriorityChange = (e) => {
        setState({ taskPriority: e.target.value });
    }

    const onTaskRelativeEstimateChange = (e) => {
        setState({ taskRelativeEstimate: e.target.value });
    }

    const onTaskCostChange = (e) => {
        setState({ taskCost: e.target.value });
    }

    const clearInputFields = () => {
        setState({
            title: "",
            description: "",
            priority: "",
            relativeEstimate: "",
            cost: ""
        });
    }

    const onAddTaskToDatabaseButtonClicked = async () => {
        try {
            props.showSnackbarMessage("Adding backlog task...");

            const backlogTask = {
                projectId: state.projectId,
                title: state.taskTitle,
                description: state.taskDescription,
                priority: parseInt(state.taskPriority),
                relativeEstimate: parseInt(state.taskRelativeEstimate),
                cost: parseFloat(state.taskCost)
            };

            const addBacklogTaskResponse = await httpInsert("api/backlog", backlogTask);

            if (addBacklogTaskResponse !== null && !addBacklogTaskResponse.error) {
                props.showSnackbarMessage(`Backlog task added successfully (id: ${addBacklogTaskResponse.backlogTask.id})!`);

                const updatedBacklogList = [ ...state.backlogList, addBacklogTaskResponse.backlogTask ];
                setState({ backlogList: updatedBacklogList });

                clearInputFields();
                handleModalClose();
            } else {
                props.showSnackbarMessage("Failed to add backlog task due to server-side issue.");
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to add the backlog task!");
            console.log(error);
        }
    }

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
                        label="Title"
                        onChange={onTaskTitleChange}
                        autoFocus={true}
                        className="margin-bottom__small"
                        size="small"
                    />
                    <TextField
                        label="Description"
                        onChange={onTaskDescriptionChange}
                        className="margin-bottom__small"
                        size="small"
                    />
                    <TextField
                        label="Priority"
                        onChange={onTaskPriorityChange}
                        className="margin-bottom__small"
                        size="small"
                    />
                    <TextField
                        label="Relative Estimate"
                        onChange={onTaskRelativeEstimateChange}
                        className="margin-bottom__small"
                        size="small"
                    />
                    <TextField
                        label="Cost"
                        onChange={onTaskCostChange}
                        className="margin-bottom__small"
                        size="small"
                    />
                    <Button
                        variant="outlined"
                        disabled={isModalInputInvalid}
                        onClick={onAddTaskToDatabaseButtonClicked}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Add Backlog Task
                    </Button>
                </Box>
            </Modal>
        );
    }

    const updateProductBacklogTask = async (productBacklogTaskId, priority, title, description, relativeEstimate, cost) => {
        setState({ productBacklogTaskToEdit: null });

        try {
            props.showSnackbarMessage(`Updating backlog task with the id of ${productBacklogTaskId}...`);

            const updatedProductBacklogTask = {
                priority: parseInt(priority),
                title: title,
                description: description,
                relativeEstimate: parseInt(relativeEstimate),
                cost: parseFloat(cost)
            };

            const updateBacklogTaskResponse = await httpUpdate(`api/backlog/${productBacklogTaskId}`, updatedProductBacklogTask);

            if (updateBacklogTaskResponse?.success) {
                props.showSnackbarMessage("The backlog task was updated successfully!");

                let updatedBacklogList = [ ...state.backlogList ];
                const backlogIndexToUpdate = updatedBacklogList.findIndex(backlogTask => backlogTask.id === productBacklogTaskId);

                if (backlogIndexToUpdate !== -1) {
                    updatedBacklogList[backlogIndexToUpdate] = updateBacklogTaskResponse.updatedBacklogTask;
                    setState({ backlogList: updatedBacklogList });
                }
            } else {
                props.showSnackbarMessage("Failed to update backlog task due to a server-side issue.");
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to update the backlog task.");
        }
    }

    const onDeleteProductBacklogTaskButtonClicked = (event, productBacklogId) => {
        const productBacklogTaskToDelete = state.backlogList.find(backlogTask => backlogTask.id === productBacklogId);

        if (productBacklogTaskToDelete !== null) {
            setState({ productBacklogTaskToDelete: productBacklogTaskToDelete });
        }
    }

    const deleteProductBacklogTask = async () => {
        if (state.productBacklogTaskToDelete === null) {
            return;
        }

        try {
            props.showSnackbarMessage(`Deleting product backlog task with the id of ${state.productBacklogTaskToDelete.id})...`);

            const deleteBacklogTaskResponse = await httpDelete(`api/backlog/${state.productBacklogTaskToDelete.id}`);

            if (deleteBacklogTaskResponse?.errorMessage.length > 0) {
                props.showSnackbarMessage(`Failed to delete product backlog task. Reason: ${deleteBacklogTaskResponse?.errorMessage}`);
            } else {
                if (deleteBacklogTaskResponse.productBacklogTaskDeleted) {
                    props.showSnackbarMessage(`The product backlog task was deleted successfully!`);

                    const indexToRemove = state.backlogList.findIndex(backlogTask => backlogTask.id === state.productBacklogTaskToDelete.id);
                    
                    if (indexToRemove !== -1) {
                        const updatedBacklogList = [ ...state.backlogList ];
                        updatedBacklogList.splice(indexToRemove, 1);

                        setState({ backlogList: updatedBacklogList });
                    }
                } else {
                    props.showSnackbarMessage(`Failed to delete product backlog task due to server-side issue.`);
                }
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to delete the product backlog task.");
        } finally {
            setState({ productBacklogTaskToDelete: null });
        }
    }

    const getTotalCost = () => {
        let totalCost = 0.0;

        state.backlogList.forEach(backlogTask => {
            totalCost += backlogTask.cost;
        });

        return totalCost;
    }

    const getTotalRelativeEstimate = () => {
        let totalRelativeEstimate = 0;

        state.backlogList.forEach(backlogTask => {
            totalRelativeEstimate += backlogTask.relativeEstimate;
        });

        return totalRelativeEstimate;
    }

    const renderProjectTable = () => {
        return (
            <div>
                <Typography variant="h6" className="margin-bottom__small">
                    Product Backlog for {state.projectName}
                </Typography>
                <TableContainer
                    component={Paper}
                    style={{ maxHeight: 300 }}
                    className="backlog-tasks-table subtle-shadow margin-bottom__small"
                >
                    <Table aria-label="Current Project's Backlog" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1">
                                        Priority
                                    </Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1">
                                        Task
                                    </Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1">
                                        Description
                                    </Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1">
                                        Relative Estimate
                                    </Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1">
                                        Cost
                                    </Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1">
                                        Action
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {state.backlogList.map((productBacklog, index) => (
                                <TableRow
                                    key={`product-backlog-${index}`}
                                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                    style={{ backgroundColor: theme.palette.common.white }}
                                >
                                    <TableCell component="th" scope="row">
                                        <Typography>{productBacklog.priority}</Typography>
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        <Typography>{productBacklog.title}</Typography>
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        <Typography>{productBacklog.description}</Typography>
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        <Typography>{productBacklog.relativeEstimate}</Typography>
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        <Typography>{currencyFormatter.format(productBacklog.cost)}</Typography>
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        <div className="flex-gap">
                                            <Button
                                                aria-label="Edit Product Backlog Task"
                                                title="Edit Product Backlog Task"
                                                onClick={() => setState({ productBacklogTaskToEdit: state.backlogList.find(backlogTask => backlogTask.id === productBacklog.id) })}
                                                variant="outlined"
                                                className="icon-only-button"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Button
                                                aria-label="Delete Product Backlog Task"
                                                onClick={(e) => onDeleteProductBacklogTaskButtonClicked(e, productBacklog.id)}
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
                <div className="align-text__left margin-bottom__small">
                    <Typography><strong>Total Cost:</strong> {currencyFormatter.format(getTotalCost())}</Typography>
                    <Typography><strong>Total Relative Estimate:</strong> {getTotalRelativeEstimate()}</Typography>
                </div>
                <div className="flex-gap flex-center">
                    <Button
                        variant="outlined"
                        className="auto-width-big-screens margin-bottom__small"
                        onClick={onAddTaskButtonClicked}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Add New Product To Backlog
                    </Button>
                    <Button
                        variant="outlined"
                        className="auto-width-big-screens margin-bottom__small"
                        onClick={() => setState({ showTeamSummaryReportDialog: true })}
                    >
                        <FontAwesomeIcon icon={faEye} />
                        View Team Summary Report
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
                    title="Manage Product Backlog"
                    className="align-text__center"
                />
                <CardContent className="align-text__center">
                    <div className="card-content-wrapper">
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
                                    <TextField
                                        {...params}
                                        label="Products"
                                        variant="outlined"
                                    />
                                )}
                                onChange={onProjectSelected}
                                className="margin-bottom__small"
                                disabled={state.teamList.length === 0}
                                fullWidth
                            />
                        </div>
                        {state.projectId > -1 && renderProjectTable()}
                    </div>
                </CardContent>
            </Card>
            <EditProductBacklogTaskDialog
                openDialog={state.productBacklogTaskToEdit !== null}
                productBacklogTask={state.productBacklogTaskToEdit}
                onUpdate={updateProductBacklogTask}
                onCancel={() => setState({ productBacklogTaskToEdit: null })}
            />
            <YesNoDialog
                openDialog={state.productBacklogTaskToDelete !== null}
                title="Delete Product Backlog Confirmation"
                content={`Are you sure you want to delete the product backlog task "${state.productBacklogTaskToDelete?.title}" (id: ${state.productBacklogTaskToDelete?.id})? This operation can not be reversed.`}
                onYesClicked={deleteProductBacklogTask}
                onNoClicked={() => setState({ productBacklogTaskToDelete: null })}
            />
            <TeamSummaryReportDialog
                openDialog={state.showTeamSummaryReportDialog}
                projectId={state.projectId}
                teamName={state.projectTeamName}
                onClose={() => setState({ showTeamSummaryReportDialog: false })}
            />
        </ThemeProvider>
    );
};

export default ProductBacklogComponent;