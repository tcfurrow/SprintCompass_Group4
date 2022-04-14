import DialogSlideTransition from "./effects/DialogSlideTransition";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
import { useState } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import theme from "../../theme";
import YesNoDialog from "./YesNoDialog";

const ProjectTaskDetailsDialog = (props) => {
    const projectTask = props.projectTask;

    const [newSubtaskName, setNewSubtaskName] = useState("");
    const [subtaskToDelete, setSubtaskToDelete] = useState(null);

    const onCreateNewSubtaskClicked = () => {
        if (newSubtaskName.trim().length === 0) {
            return;
        }

        props?.onCreateNewSubtaskClicked(newSubtaskName);
    }

    const onSubtaskStatusUpdated = (event, subtaskId) => {
        const subtaskTitle = projectTask.subtasks.find(subtask => subtask.id === subtaskId).title;

        props?.onSubtaskUpdated(subtaskId, subtaskTitle, event.target.value);
    }

    const onConfirmDeleteSubtask = () => {
        props?.onDeleteSubtask(subtaskToDelete);
        setSubtaskToDelete(null);
    }

    return (
        <div>
            <Dialog
                open={props?.openDialog}
                TransitionComponent={DialogSlideTransition}
                onClose={props?.onClose}
                maxWidth="lg"
                keepMounted
                fullWidth
            >
                <DialogTitle><strong>Task:</strong> {projectTask?.parentProductBacklogTask.title}</DialogTitle>
                <DialogContent className="padding__small">
                    <Typography variant="body1" className="margin-bottom__small"><strong>Description:</strong> {projectTask?.parentProductBacklogTask.description}</Typography>
                    <TableContainer component={Paper} style={{ maxHeight: 300 }} className="team-project-table subtle-shadow margin-bottom__small">
                        <Table aria-label="User Story Subtasks" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                        <Typography color="common.white" variant="body1">Subtask Title</Typography>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                        <Typography color="common.white" variant="body1">Team Member Assigned To</Typography>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                        <Typography color="common.white" variant="body1">Status</Typography>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                        <Typography color="common.white" variant="body1">Actions</Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    projectTask?.subtasks.map((subtask, index) => (
                                        <TableRow
                                            key={`sprint-subtask-row-${index}`}
                                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                            style={{ backgroundColor: theme.palette.common.white }}
                                        >
                                            <TableCell component="th" scope="row">
                                                <Typography key={`table-row-user-story-priority-${index}`}>
                                                    {subtask.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <Typography key={`table-row-user-story-priority-${index}`}>
                                                    Implement This
                                                </Typography>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <FormControl size="small" fullWidth>
                                                    <InputLabel>Status</InputLabel>
                                                    <Select
                                                        key={`table-row-user-story-subtask-status-${index}`}
                                                        value={subtask.status}
                                                        label="Status"
                                                        onChange={(e) => onSubtaskStatusUpdated(e, subtask.id)}
                                                    >
                                                        <MenuItem value={0}>Open</MenuItem>
                                                        <MenuItem value={1}>Planned</MenuItem>
                                                        <MenuItem value={3}>Development</MenuItem>
                                                        <MenuItem value={4}>Testing</MenuItem>
                                                        <MenuItem value={5}>Closed</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <Button
                                                    aria-label="Delete Subtask"
                                                    title="Delete Subtask"
                                                    onClick={() => setSubtaskToDelete(projectTask.subtasks.find(currSubtask => currSubtask.id === subtask.id))}
                                                    variant="outlined"
                                                    className="icon-only-button"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div>
                        <Typography variant="body1" className="margin-bottom__small">Add New Subtask</Typography>
                        <div className="flex-gap">
                            <TextField
                                label="Subtask Name"
                                variant="outlined"
                                onChange={(e) => setNewSubtaskName(e.target.value)}
                                fullWidth
                            />
                            <Button
                                onClick={onCreateNewSubtaskClicked}
                                variant="outlined"
                                style={{ width: "22rem" }}
                                disabled={newSubtaskName.trim().length === 0}
                            >
                                Create Sub-task
                            </Button>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={props?.onCloseClicked}>Close</Button>
                </DialogActions>
            </Dialog>
            <YesNoDialog
                openDialog={subtaskToDelete !== null}
                title="Delete Sub-task Confirmation"
                content={subtaskToDelete !== null ? `Are you sure you want to delete the sub-task "${subtaskToDelete.title}" (id: ${subtaskToDelete.id})? This operation can not be reversed.` : ""}
                onYesClicked={onConfirmDeleteSubtask}
                onNoClicked={() => setSubtaskToDelete(null)}
            />
        </div>
    );
}

export default ProjectTaskDetailsDialog;
