// File Name:    TeamSummaryReportDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import autoTable from "jspdf-autotable";
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
  Typography,
} from "@mui/material";
import theme from "../../theme";

const TeamSummaryReportDialog = (props) => {
  const initialState = {
    backlog: [],
    sprints: [],
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);
  const projectId = props?.projectId;

  useEffect(() => {
    (async () => {
      await fetchProject();
    })();
  }, [projectId]);

  const fetchProject = async () => {
    const backlogData = await httpGet(`api/backlog/${projectId}`);
    const sprintsData = await httpGet(`api/sprint/${projectId}`);

    try {
      if (backlogData !== null) {
        setState({ backlog: backlogData });
        //console.log(backlogData);
      }

      if (sprintsData !== null) {
        setState({ sprints: sprintsData });
        //console.log(sprintsData);
      }
    } catch (error) {
      /*props.showSnackbarMessage(
        "An error occurred while attempting to fetch projects."
      );*/
    }
  };

  const generateTeamSummary = () => {
    if (state.sprints === null || state.sprints.length === 0) {
      return null;
    }

    let teamMembers = [];
    let teamSummaryReport = [];
    teamMembers = state.sprints[0].project.team.members;
    // teamMembers.forEach((member) => {
    //   console.log(`team member: ${member.user.id} ${member.user.firstName}`);
    // });
    state.backlog.forEach((task) => {
      let taskSummary = {
        id: task.id,
        priority: task.priority,
        title: task.title,
        subtaskSummary: [],
      };
      teamSummaryReport.push(taskSummary);
    });

    console.log("", teamSummaryReport);

    let userStories = state.sprints
      .filter((sprint) => sprint.userStories.length > 0)
      .map((sprint) => sprint.userStories);
    console.log("", userStories);

    teamSummaryReport?.forEach((task) => {
      let memberData;
      teamMembers.forEach((member) => {
        memberData = {
          id: member.user.id,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
          totalHours: 0,
        };

        userStories?.forEach((story) => {
          let i = 0;

          if (story !== null) {
            //console.log("story:");
            //console.log("", story);
            if (story[i].parentProductBacklogTask.id === task.id) {
              console.log(
                `${story[i].parentProductBacklogTask.id} = ${task.id}`
              );
              console.log("", story[i].subtasks);
              story[i].subtasks?.forEach((substory) => {
                if (substory.assignedTo != null) {
                  if (substory.assignedTo.user.id === memberData.id) {
                    console.log(
                      `if ${substory.assignedTo.user.id} and ${memberData.id}`
                    );
                    memberData.totalHours += substory.totalHoursWorked;
                  } else {
                    console.log(
                      `else ${substory.assignedTo.user.id} and ${memberData.id}`
                    );
                  }
                }
              });
            } else {
              console.log(
                `${story[i].parentProductBacklogTask.id} != ${task.id}`
              );
            }
            i++;
          }
        });

        if (memberData.totalHours > 0) {
          task.subtaskSummary.push(memberData);
        }
      });
    });

    return teamSummaryReport;
  };

  const getTeamSummaryOverallTotal = () => {
    //
  };

  const onExportToPdfButtonClicked = () => {
    const summaryReportPdf = new jsPDF();
    const teamSummaryTableElement = document.getElementById(
      "team-summary-report-table"
    );

    if (teamSummaryTableElement !== null) {
      summaryReportPdf.text(`Team Summary Report - ${props.teamName}`, 10, 10);
      summaryReportPdf.autoTable({ html: "#team-summary-report-table" });
      summaryReportPdf.save("team_summary_report.pdf");
    }
  };

  return (
    <Dialog
      open={props?.openDialog}
      TransitionComponent={DialogSlideTransition}
      maxWidth="lg"
      keepMounted
      fullWidth
    >
      <DialogTitle>Project Team Name:</DialogTitle>
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
                <TableCell
                  style={{ backgroundColor: theme.palette.primary.main }}
                >
                  <Typography
                    color="common.white"
                    variant="body1"
                    className="align-text__center"
                  >
                    Priority
                  </Typography>
                </TableCell>
                <TableCell
                  style={{ backgroundColor: theme.palette.primary.main }}
                >
                  <Typography
                    color="common.white"
                    variant="body1"
                    className="align-text__center"
                  >
                    User Stories
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            {generateTeamSummary()?.map((teamSummary, backlogIndex) => (
              <TableBody>
                <TableRow
                  key={`sprint-summary-row-${backlogIndex}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  style={{ backgroundColor: theme.palette.primary.main }}
                >
                  <TableCell component="th" scope="row">
                    <Typography
                      color="common.white"
                      variant="body1"
                      className="align-text__right"
                    >
                      {teamSummary.priority}
                    </Typography>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography
                      color="common.white"
                      variant="body1"
                      className="align-text__center"
                    >
                      {teamSummary.title}
                    </Typography>
                  </TableCell>
                </TableRow>
                {teamSummary.subtaskSummary.map(
                  (summaryChunk, subtaskIndex) => (
                    <TableRow
                      key={`sprint-summary-subtask-row-${subtaskIndex}`}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      style={{ backgroundColor: theme.palette.common.white }}
                      size="small"
                    >
                      <TableCell component="th" scope="row">
                        {/* Left empty on purpose. */}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <Typography
                          variant="body1"
                          className="align-text__right"
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
                  )
                )}
              </TableBody>
            ))}
            <TableFooter>
              {getTeamSummaryOverallTotal()?.map(
                (overallTotal, overallTotalIndex) => (
                  <TableRow>
                    <TableCell>
                      <Typography
                        color="common.black"
                        variant="body1"
                        className="align-text__left"
                        strong
                      >
                        <strong>Total</strong>
                      </Typography>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {/* Left empty on purpose. */}
                    </TableCell>
                    <TableCell>
                      <Typography
                        color="common.black"
                        variant="body1"
                        className="align-text__center"
                      >
                        {overallTotal.percentageCompleteTotal.toFixed(0)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color="common.black"
                        variant="body1"
                        className="align-text__center"
                      >
                        {overallTotal.originalHoursEstimateTotal}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color="common.black"
                        variant="body1"
                        className="align-text__center"
                      >
                        {overallTotal.actualHoursWorkedTotal}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color="common.black"
                        variant="body1"
                        className="align-text__center"
                      >
                        {overallTotal.reestimateToCompleteTotal}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={props?.onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamSummaryReportDialog;
