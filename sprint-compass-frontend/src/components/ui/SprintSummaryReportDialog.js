// File Name:    ProjectTaskDetailsDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import autoTable from "jspdf-autotable";
import DialogSlideTransition from "./effects/DialogSlideTransition";
import { jsPDF } from "jspdf";
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

    const generateSprintSummary = () => {
        if (sprintList === null || selectedSprint == null) {
            return null;
        }

        let sprintSummaryReport = [];

        selectedSprint.userStories.forEach(userStory => {
            let userStorySummary = {
                productBacklogName: userStory.parentProductBacklogTask.title,
                subtaskSummary: []
            };

            userStory.subtasks.forEach(subtask => {
                let subtaskSummary = {
                    title: subtask.title,
                    assignedToName: subtask.assignedTo === null ? "Unassigned" : `${subtask.assignedTo.user.firstName} ${subtask.assignedTo.user.lastName}`,
                    originalHoursEstimate: subtask.initialHoursEstimate,
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

    const onExportToPdfButtonClicked = () => {
        const summaryReportPdf = new jsPDF();
        const sprintSummaryTableElement = document.getElementById("sprint-summary-report-table")
        
        if (sprintSummaryTableElement !== null) {
            let headerText = summaryReportPdf.splitTextToSize(`Sprint Summary Report - ${selectedSprint.name}`, 180);
            summaryReportPdf.text(10, 10, headerText);

            headerText = summaryReportPdf.splitTextToSize(`Project Team Name: ${selectedSprint.project.team.name}`, 180);
            summaryReportPdf.text(10, 20, headerText);

            summaryReportPdf.autoTable({
                html: "#sprint-summary-report-table",
                startY: 40,
                headStyles: {
                    fillColor: [ 147, 63, 181 ],
                    valign: "middle",
                    halign: "center"
                },
                columnStyles: {
                    0: {
                        halign: "right"
                    },
                    1: {
                        halign: "center"
                    },
                    2: {
                        halign: "center"
                    },
                    3: {
                        halign: "center"
                    },
                    4: {
                        halign: "center"
                    },
                    5: {
                        halign: "center"
                    }
                },
                footStyles: {
                    fillColor: [ 147, 63, 181 ],
                    halign: "center",
                    valign: "middle"
                },
                didParseCell: (hookData) => {
                    if (hookData.section === "body" && hookData.cell.raw.dataset?.isSubheader === "true") {
                        hookData.cell.styles.fontStyle = "bold";
                    }

                    if (hookData.section === "foot" && hookData.column.index === 0) {
                        hookData.cell.styles.halign = "left";
                    }
                }
            });

            summaryReportPdf.save("sprint_summary_report.pdf");
        }
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
                    onClick={onExportToPdfButtonClicked}
                    className="margin-bottom__small"
                >
                    Export to PDF
                </Button>
                <TableContainer component={Paper} style={{ minHeight: 300, maxHeight: 600 }} className="team-project-table subtle-shadow margin-bottom__small">
                    <Table id="sprint-summary-report-table" aria-label="Sprint Summary Report" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1" className="align-text__center"><strong>User Stories/Sub-tasks</strong></Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    {/* Left empty on purpose. */}
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1" className="align-text__center"><strong>Percentage Complete</strong></Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1" className="align-text__center"><strong>Original Hours Estimate</strong></Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1" className="align-text__center"><strong>Actual Hours Worked</strong></Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography color="common.white" variant="body1" className="align-text__center"><strong>Re-Estimate to Complete</strong></Typography>
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
                                        <TableCell component="th" scope="row" data-is-subheader="true">
                                            <Typography color="common.white" variant="body1" className="align-text__right">{userStorySummary.productBacklogName}</Typography>
                                        </TableCell>
                                        <TableCell component="th" scope="row" data-is-subheader="true">
                                            {/* Left empty on purpose. */}
                                        </TableCell>
                                        <TableCell component="th" scope="row" data-is-subheader="true">
                                            <Typography color="common.white" variant="body1" className="align-text__center">{userStorySummary.percentageCompleteTotal.toFixed(0)}%</Typography>
                                        </TableCell>
                                        <TableCell component="th" scope="row" data-is-subheader="true">
                                            <Typography color="common.white" variant="body1" className="align-text__center">{userStorySummary.originalHoursEstimateTotal}</Typography>
                                        </TableCell>
                                        <TableCell component="th" scope="row" data-is-subheader="true">
                                            <Typography color="common.white" variant="body1" className="align-text__center">{userStorySummary.actualHoursWorkedTotal}</Typography>
                                        </TableCell>
                                        <TableCell component="th" scope="row" data-is-subheader="true">
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
                                                <TableCell>
                                                    <Typography variant="body1" className="align-text__right">{subtaskSummary.title}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body1" className="align-text__center">{subtaskSummary.assignedToName}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {/* Left empty on purpose. */}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body1" className="align-text__center">{subtaskSummary.originalHoursEstimate}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                <Typography variant="body1" className="align-text__center">{subtaskSummary.totalHoursWorked}</Typography>
                                                </TableCell>
                                                <TableCell>
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
                                getSprintSummaryOverallTotal()?.map(overallTotal => (
                                    <TableRow>
                                        <TableCell>
                                            <Typography color="common.black" variant="body1" className="align-text__left" strong><strong>Total</strong></Typography>
                                        </TableCell>
                                        <TableCell>
                                            {/* Left empty on purpose. */}
                                        </TableCell>
                                        <TableCell>
                                            <Typography color="common.black" variant="body1" className="align-text__center"><strong>{overallTotal.percentageCompleteTotal.toFixed(0)}%</strong></Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography color="common.black" variant="body1" className="align-text__center"><strong>{overallTotal.originalHoursEstimateTotal}</strong></Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography color="common.black" variant="body1" className="align-text__center"><strong>{overallTotal.actualHoursWorkedTotal}</strong></Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography color="common.black" variant="body1" className="align-text__center"><strong>{overallTotal.reestimateToCompleteTotal}</strong></Typography>
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
