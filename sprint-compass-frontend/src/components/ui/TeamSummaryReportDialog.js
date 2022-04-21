// File Name:    TeamSummaryReportDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import DialogSlideTransition from "./effects/DialogSlideTransition";
import { httpGet } from "../../utils/ApiUtilities";
import { useEffect, useReducer } from "react";
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
import theme from "../../theme";

const TeamSummaryReportDialog = (props) => {
    const initialState = {
        backlog: [],
        sprints: []
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);
    const projectId = props?.projectId;

    useEffect(() => {
        (async () => {
            await fetchProject();
        })();
    }, [ projectId ]);

    const fetchProject = async () => {
        const backlogData = await httpGet(`api/backlog/${projectId}`);
        const sprintsData = await httpGet(`api/sprint/${projectId}`);

        try {
            if (backlogData !== null) {
                setState({ backlog: backlogData });
            }

            if (sprintsData !== null) {
                setState({ sprints: sprintsData });
            }
        } catch (error) {
            console.log(`An error occurred: ${error}`)
        }
    }

    // Sorts by priority in ascending order
    const compareBacklog = (lhs, rhs) => {
        if (lhs.priority === rhs.priority) {
            return 0;
        }

        return lhs.priority < rhs.priority ? -1 : 1;
    }

    const generateTeamSummary = () => {
        if (state.sprints === null || state.sprints.length === 0) {
            return null;
        }

        let teamMembers = state.sprints[0].project.team.members;
        let teamSummaryReport = [];
        
        let backlog = [ ...state.backlog ];
        backlog.sort(compareBacklog);

        backlog.forEach(task => {
            let taskSummary = {
                backlogTaskId: task.id,
                priority: task.priority,
                title: task.title,
                subtaskSummary: []
            };

            teamSummaryReport.push(taskSummary);
        });
        
        const sprintsWithUserStories = state.sprints.filter(sprint => sprint.userStories.length > 0);
        let userStories = [];

        for (let sprint of sprintsWithUserStories) {
            for (let userStory of sprint.userStories) {
                userStories.push(userStory);
            }
        }

        teamSummaryReport?.forEach(task => {
            const currentUserStory = userStories.filter(userStory => userStory.parentProductBacklogTask.id === task.backlogTaskId);

            currentUserStory?.forEach(userStory => {
                teamMembers.forEach(member => {
                    let teamMemberHoursSummary = {
                        id: member.id,
                        firstName: member.user.firstName,
                        lastName: member.user.lastName,
                        totalHours: 0.0
                    };

                    userStory.subtasks.forEach(subtask => {
                        if (subtask.assignedTo?.id === member.id) {
                            teamMemberHoursSummary.totalHours += subtask.totalHoursWorked;
                        }
                    });

                    if (teamMemberHoursSummary.totalHours > 0.0) {
                        task.subtaskSummary.push(teamMemberHoursSummary);
                    }
                });
            });
        });

        return teamSummaryReport;
    }

    const getTeamSummaryHoursTotal = () => {
        const teamHoursSummary = generateTeamSummary();

        if (teamHoursSummary === null) {
            return 0.0;
        }

        let totalHours = 0.0;

        for (const backlogSummary of teamHoursSummary) {
            for (const memberHoursSummary of backlogSummary.subtaskSummary) {
                totalHours += memberHoursSummary.totalHours;
            }
        }

        return totalHours;
    }

    const onExportToPdfButtonClicked = () => {
        const summaryReportPdf = new jsPDF();
        const teamSummaryTableElement = document.getElementById("#team-summary-report-table");

        if (teamSummaryTableElement !== null) {
            summaryReportPdf.text(`Team Summary Report - ${props.teamName}`, 10, 10);
            summaryReportPdf.autoTable({ html: "#team-summary-report-table" });
            summaryReportPdf.save("team_summary_report.pdf");
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
            <DialogTitle>Project Team Name: {props.teamName}</DialogTitle>
            <DialogContent className="padding__small">
                <Button
                    variant="outlined"
                    onClick={onExportToPdfButtonClicked}
                    className="margin-bottom__small"
                >
                    Export to PDF
                </Button>
                <TableContainer
                    component={Paper}
                    style={{ minHeight: 300, maxHeight: 600 }}
                    className="team-project-table subtle-shadow margin-bottom__small"
                >
                    <Table
                        id="team-summary-report-table"
                        aria-label="Team Summary Report"
                        stickyHeader
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography
                                        color="common.white"
                                        variant="body1"
                                        className="align-text__center"
                                    >
                                        <strong>Priority</strong>
                                    </Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography
                                        color="common.white"
                                        variant="body1"
                                        className="align-text__center"
                                    >
                                        <strong>User Stories</strong>
                                    </Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography
                                        color="common.white"
                                        variant="body1"
                                        className="align-text__center"
                                    >
                                        <strong>Team Member</strong>
                                    </Typography>
                                </TableCell>
                                <TableCell style={{ backgroundColor: theme.palette.primary.main }}>
                                    <Typography
                                        color="common.white"
                                        variant="body1"
                                        className="align-text__center"
                                    >
                                        <strong>Actual Hours</strong>
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        {
                            generateTeamSummary()?.map((teamSummary, backlogIndex) => (
                                <TableBody key={`sprint-summary-row-${backlogIndex}`}>
                                    <TableRow
                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                        style={{ backgroundColor: theme.palette.primary.main }}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Typography
                                                color="common.white"
                                                variant="body1"
                                                className="align-text__center"
                                            >
                                                <strong>{teamSummary.priority}</strong>
                                            </Typography>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <Typography
                                                color="common.white"
                                                variant="body1"
                                                className="align-text__left"
                                            >
                                                <strong>{teamSummary.title}</strong>
                                            </Typography>
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {/* Left empty on purpose. */}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {/* Left empty on purpose. */}
                                        </TableCell>
                                    </TableRow>
                                    {
                                        teamSummary.subtaskSummary.map((summaryChunk, summaryChunkIndex) => (
                                            <TableRow
                                                key={`sprint-summary-subtask-row-${summaryChunkIndex}`}
                                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                                style={{ backgroundColor: theme.palette.common.white }}
                                                size="small"
                                            >
                                                <TableCell component="th" scope="row">
                                                    {/* Left empty on purpose. */}
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                    {/* Left empty on purpose. */}
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                    <Typography
                                                        variant="body1"
                                                        className="align-text__left"
                                                    >
                                                        {summaryChunk.firstName} {summaryChunk.lastName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                    <Typography
                                                        variant="body1"
                                                        className="align-text__center"
                                                    >
                                                        {summaryChunk.totalHours}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            ))
                        }
                        <TableFooter>
                            <TableRow>
                                <TableCell>
                                    {/* Left empty on purpose. */}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    <Typography
                                        color="common.black"
                                        variant="body1"
                                        className="align-text__left"
                                    >
                                        <strong>Total</strong>
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        color="common.black"
                                        variant="body1"
                                        className="align-text__center"
                                    >
                                        {/* Left empty on purpose. */}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        color="common.black"
                                        variant="body1"
                                        className="align-text__center"
                                    >
                                        <strong>{getTeamSummaryHoursTotal()}</strong>
                                    </Typography>
                                </TableCell>
                            </TableRow>
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

export default TeamSummaryReportDialog;
