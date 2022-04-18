// File Name:    ProjectTaskDetailsDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import DialogSlideTransition from "./effects/DialogSlideTransition";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableFooter,
    Typography
} from "@mui/material";
import theme from "./../../theme";

const SprintSummaryReportDialog = (props) => {
    const sprintList = props?.sprintList;
    const selectedSprint = props?.selectedSprint;

    const getPreviousSprint = (sprintId) => {
        const sprintIndex = sprintList.findIndex(sprint => sprint.id === sprintId);
    
        if (sprintIndex - 1 < 0) {
            return null;
        }

        return sprintList[sprintIndex - 1];
    }

    const generateSprintSummary = () => {
        if (sprintList === null || selectedSprint == null) {
            return null;
        }

        const previousSprint = getPreviousSprint(selectedSprint.id);
        let sprintSummaryReport = [];

        selectedSprint.userStories.forEach(userStory => {
            let userStorySummary = {
                productBacklogName: userStory.parentProductBacklogTask.title,
                subtaskSummary: []
            };

            userStory.subtasks.forEach(subtask => {
                const previousUserStory = previousSprint?.userStories.find(previousUserStory => previousUserStory.parentProductBacklogTask.id === userStory.parentProductBacklogTask.id);
                const previousSubtask = previousUserStory?.subtasks.find(previousSubtask => subtask.title === previousSubtask.title);

                let subtaskSummary = {
                    title: subtask.title,
                    assignedToName: subtask.assignedTo === null ? "Unassigned" : `${subtask.assignedTo.user.firstName} ${subtask.assignedTo.user.lastName}`,
                    originalHoursEstimate: previousSubtask?.hoursReestimate ?? "N/A",
                    totalHoursWorked: subtask.totalHoursWorked,
                    reestimateToComplete: subtask.hoursReestimate
                };

                userStorySummary.subtaskSummary.push(subtaskSummary);
            });

            userStorySummary.originalHoursEstimateTotal = userStorySummary.subtaskSummary.reduce((accumulator, subtaskSummary) => {
                if (subtaskSummary.originalHoursEstimate === "N/A") {
                    return accumulator;
                }

                return accumulator + subtaskSummary.originalHoursEstimate
            }, 0);
            
            userStorySummary.actualHoursWorkedTotal = userStorySummary.subtaskSummary.reduce((accumulator, subtaskSummary) => accumulator + subtaskSummary.totalHoursWorked, 0);
            userStorySummary.reestimateToCompleteTotal = userStorySummary.subtaskSummary.reduce((accumulator, subtaskSummary) => accumulator + subtaskSummary.reestimateToComplete, 0);

            userStorySummary.percentageCompleteTotal = userStorySummary.actualHoursWorkedTotal / (userStorySummary.actualHoursWorkedTotal + userStorySummary.reestimateToCompleteTotal);

            if (isNaN(userStorySummary.percentageCompleteTotal)) {
                userStorySummary.percentageCompleteTotal = 0;
            } else {
                userStorySummary.percentageCompleteTotal *= 100.0;
            }

            sprintSummaryReport.push(userStorySummary);
        });

        return sprintSummaryReport;
    }

    // NOTE: This will always return an array with one item only.
    const getSprintSummaryOverallTotal = () => {
        const sprintSummary = generateSprintSummary();

        let totalUserStories = 0;
        let percentageCompleteTotal = 0.0;
        let originalHoursEstimateTotal = 0.0;
        let actualHoursWorkedTotal = 0.0;
        let reestimateToCompleteTotal = 0.0;

        if (sprintSummary !== null) {
            for (let userStory of sprintSummary) {
                percentageCompleteTotal += userStory.percentageCompleteTotal;
                originalHoursEstimateTotal += userStory.originalHoursEstimateTotal;
                actualHoursWorkedTotal += userStory.actualHoursWorkedTotal;
                reestimateToCompleteTotal += userStory.reestimateToCompleteTotal;

                totalUserStories++;
            }
        }

        return [ {
            percentageCompleteTotal: totalUserStories > 0 ? percentageCompleteTotal / totalUserStories : 0,
            originalHoursEstimateTotal: originalHoursEstimateTotal,
            actualHoursWorkedTotal: actualHoursWorkedTotal,
            reestimateToCompleteTotal: reestimateToCompleteTotal
        } ];
    }

    return (
        <Dialog
            open={props?.openDialog}
            TransitionComponent={DialogSlideTransition}
            maxWidth="lg"
            keepMounted
            fullWidth
        >
            <DialogTitle>Project Team Name: {selectedSprint?.project.team.name}</DialogTitle>
            <DialogContent className="padding__small">
                <Button
                    variant="outlined"
                    onClick={() => alert("Not implemented yet.")}
                    className="margin-bottom__small"
                >
                    Export to PDF
                </Button>
                <TableContainer component={Paper} style={{ minHeight: 300, maxHeight: 600 }} className="team-project-table subtle-shadow margin-bottom__small">
                    <Table aria-label="Sprint Summary Report" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }} colSpan={2}>
                                    <Typography color="common.white" variant="body1" className="align-text__center">User Stories/Sub-tasks</Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1" className="align-text__center">Percentage Complete</Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1" className="align-text__center">Original Hours Estimate</Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1" className="align-text__center">Actual Hours Worked</Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1" className="align-text__center">Re-Estimate to Complete</Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        {
                            generateSprintSummary()?.map((userStorySummary, backlogIndex) => (
                                <TableBody>
                                    <TableRow
                                        key={`sprint-summary-row-${backlogIndex}`}
                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                        style={{ backgroundColor: theme.palette.primary.main }}
                                    >
                                        <TableCell component="th" scope="row" colSpan={2}>
                                            <Typography color="common.white" variant="body1" className="align-text__right">{userStorySummary.productBacklogName}</Typography>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <Typography color="common.white" variant="body1" className="align-text__center">{userStorySummary.percentageCompleteTotal.toFixed(0)}%</Typography>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <Typography color="common.white" variant="body1" className="align-text__center">{userStorySummary.originalHoursEstimateTotal}</Typography>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <Typography color="common.white" variant="body1" className="align-text__center">{userStorySummary.actualHoursWorkedTotal}</Typography>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <Typography color="common.white" variant="body1" className="align-text__center">{userStorySummary.reestimateToCompleteTotal}</Typography>
                                        </TableCell>
                                    </TableRow>
                                    {
                                        userStorySummary.subtaskSummary.map((subtaskSummary, subtaskIndex) => (
                                            <TableRow
                                                key={`sprint-summary-subtask-row-${subtaskIndex}`}
                                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                                style={{ backgroundColor: theme.palette.common.white }}
                                                size="small"
                                            >
                                                <TableCell component="th" scope="row">
                                                    <Typography variant="body1" className="align-text__right">{subtaskSummary.title}</Typography>
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                    <Typography variant="body1" className="align-text__center">{subtaskSummary.assignedToName}</Typography>
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                    {/* Left empty on purpose. */}
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                    <Typography variant="body1" className="align-text__center">{subtaskSummary.originalHoursEstimate}</Typography>
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                <Typography variant="body1" className="align-text__center">{subtaskSummary.totalHoursWorked}</Typography>
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                    <Typography variant="body1" className="align-text__center">{subtaskSummary.reestimateToComplete}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            ))
                        }
                        <TableFooter>
                            {
                                getSprintSummaryOverallTotal()?.map((overallTotal, overallTotalIndex) => (
                                    <TableRow>
                                        <TableCell colSpan={2}>
                                            <Typography color="common.black" variant="body1" className="align-text__left" strong><strong>Total</strong></Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography color="common.black" variant="body1" className="align-text__center">{overallTotal.percentageCompleteTotal.toFixed(0)}%</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography color="common.black" variant="body1" className="align-text__center">{overallTotal.originalHoursEstimateTotal}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography color="common.black" variant="body1" className="align-text__center">{overallTotal.actualHoursWorkedTotal}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography color="common.black" variant="body1" className="align-text__center">{overallTotal.reestimateToCompleteTotal}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableFooter>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={props?.onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default SprintSummaryReportDialog;
