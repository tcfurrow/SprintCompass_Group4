// File Name:    ProjectTaskDetailsDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import DialogSlideTransition from "./effects/DialogSlideTransition";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Input,
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
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import theme from "../../theme";
import EditSubtaskDialog from "./EditSubtaskDialog";
import YesNoDialog from "./YesNoDialog";

const ProjectTaskDetailsDialog = (props) => {
    const projectId = props.projectId;
    const projectTask = props.projectTask;
    const teamMemberList = props.teamMemberList;

    const [newSubtaskName, setNewSubtaskName] = useState("");
    const [newSubtaskInitialHoursEstimate, setNewSubtaskInitialHoursEstimate] = useState(0.0);
    const [subtaskToEdit, setSubtaskToEdit] = useState(null);
    const [subtaskToDelete, setSubtaskToDelete] = useState(null);
    const [newSubtaskNameAlreadyExists, setNewSubtaskNameAlreadyExists] = useState(false);

    const onSubtaskUpdatedFromDialog = (subtaskId, updatedTitle, updatedTotalHoursWorked, updatedHoursReestimate) => {
        const subtask = projectTask.subtasks.find(subtask => subtask.id === subtaskId);
        
        if (subtask !== null) {
            props?.onSubtaskUpdated(subtaskId, updatedTitle, subtask.assignedTo?.id ?? null, subtask.status, updatedTotalHoursWorked, updatedHoursReestimate);
            setSubtaskToEdit(null);
        }
    }

    const onCreateNewSubtaskClicked = () => {
        const subtaskAlreadyExists = getExistingSubtaskByTitle(newSubtaskName) !== null;

        setNewSubtaskNameAlreadyExists(subtaskAlreadyExists);

        if (projectTask === null || newSubtaskName.trim().length === 0 || newSubtaskInitialHoursEstimate <= 0.0 || subtaskAlreadyExists) {
            return;
        }

        props?.onCreateNewSubtaskClicked(projectTask.sprintId, projectId, projectTask.parentProductBacklogTask.id, newSubtaskName, newSubtaskInitialHoursEstimate);

        setNewSubtaskName("");
        setNewSubtaskInitialHoursEstimate(0.0);
    }

    const onSubtaskTeamMemberAssignedToUpdated = (event, subtaskId) => {
        const subtask = projectTask.subtasks.find(subtask => subtask.id === subtaskId);

        if (subtask !== null) {
            let teamMemberId = event.target.value;

            if (teamMemberId === -1) {
                teamMemberId = null;
            }

            props?.onSubtaskUpdated(subtaskId, subtask.title, event.target.value, subtask.status, subtask.totalHoursWorked, subtask.hoursReestimate);
        }
    }

    const onSubtaskStatusUpdated = (event, subtaskId) => {
        const subtask = projectTask.subtasks.find(subtask => subtask.id === subtaskId);

        if (subtask !== null) {
            props?.onSubtaskUpdated(subtaskId, subtask.title, subtask.assignedTo?.id ?? null, event.target.value, subtask.totalHoursWorked, subtask.hoursReestimate);
        }
    }

    const onConfirmDeleteSubtask = () => {
        props?.onDeleteSubtask(subtaskToDelete);
        setSubtaskToDelete(null);
    }

    const onNewSubtaskNameChanged = (event) => {
        setNewSubtaskName(event.target.value);
        setNewSubtaskNameAlreadyExists(false);
    }

    const getExistingSubtaskByTitle = (title) => {
        return projectTask?.subtasks.find(subtask => subtask.title.toLowerCase().trim() === title.toLowerCase().trim()) ?? null;
    }

    const onCloseButtonClicked = () => {
        setNewSubtaskName("");
        setNewSubtaskInitialHoursEstimate(0.0);

        props?.onCloseClicked();
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
                                        <Typography color="common.white" variant="body1">Hour(s) Estimate</Typography>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                        <Typography color="common.white" variant="body1">Total Hours Worked</Typography>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                        <Typography color="common.white" variant="body1">Hour(s) Re-estimate</Typography>
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
                                                <Typography>{subtask.title}</Typography>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <FormControl size="small" fullWidth>
                                                    <InputLabel>Team Member</InputLabel>
                                                    <Select
                                                        label="Team Member"
                                                        value={subtask.assignedTo?.id ?? -1}
                                                        onChange={(e) => onSubtaskTeamMemberAssignedToUpdated(e, subtask.id)}
                                                    >
                                                        <MenuItem value={-1}>Unassigned</MenuItem>
                                                        {
                                                            teamMemberList?.map((teamMember, teamMemberIndex) => (
                                                                <MenuItem value={teamMember.id}>
                                                                    {`${teamMember.user.firstName} ${teamMember.user.lastName}`}
                                                                </MenuItem>
                                                            ))
                                                        }
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <FormControl size="small" fullWidth>
                                                    <InputLabel>Status</InputLabel>
                                                    <Select
                                                        label="Status"
                                                        value={subtask.status}
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
                                                <Typography>{subtask.initialHoursEstimate} hour(s)</Typography>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <Typography>{subtask.totalHoursWorked} hour(s)</Typography>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <Typography>{subtask.hoursReestimate} hour(s)</Typography>
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                <div className="flex-gap">
                                                    <Button
                                                        aria-label="Edit Subtask"
                                                        title="Edit Subtask"
                                                        onClick={() => setSubtaskToEdit(projectTask.subtasks.find(currSubtask => currSubtask.id === subtask.id))}
                                                        variant="outlined"
                                                        className="icon-only-button"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Button>
                                                    <Button
                                                        aria-label="Delete Subtask"
                                                        title="Delete Subtask"
                                                        onClick={() => setSubtaskToDelete(projectTask.subtasks.find(currSubtask => currSubtask.id === subtask.id))}
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
                    <div>
                        <Typography variant="body1" className="margin-bottom__xsmall">Add New Subtask</Typography>
                        <div className="flex-gap">
                            <TextField
                                label="Subtask Name"
                                size="small"
                                variant="outlined"
                                onChange={onNewSubtaskNameChanged}
                                value={newSubtaskName}
                                fullWidth
                            />
                            <Input
                                placeholder="Initial Hours Estimate"
                                type="number"
                                onChange={(e) => setNewSubtaskInitialHoursEstimate(e.target.value)}
                                value={newSubtaskInitialHoursEstimate}
                                fullWidth
                            />
                            <Button
                                onClick={onCreateNewSubtaskClicked}
                                variant="outlined"
                                style={{ width: "30rem" }}
                                disabled={newSubtaskName.trim().length === 0 || newSubtaskInitialHoursEstimate <= 0.0 || newSubtaskNameAlreadyExists}
                            >
                                Create Sub-task
                            </Button>
                        </div>
                        {
                            newSubtaskNameAlreadyExists
                            &&
                            <Typography className="margin-top__small">ERROR: The subtask you have entered already exists in this user story!</Typography>
                        }
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseButtonClicked}>Close</Button>
                </DialogActions>
            </Dialog>
            <EditSubtaskDialog
                openDialog={subtaskToEdit !== null}
                subtask={subtaskToEdit}
                onUpdate={onSubtaskUpdatedFromDialog}
                onCancel={() => setSubtaskToEdit(null)}
            />
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
