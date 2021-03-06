// File Name:    EditSubtaskDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import DialogSlideTransition from "./effects/DialogSlideTransition";
import { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Input,
    TextField,
    Typography
} from "@mui/material";

const EditSubtaskDialog = (props) => {
    const subtask = props.subtask;
    
    const [subtaskTitle, setSubtaskTitle] = useState("");
    const [totalHoursWorked, setTotalHoursWorked] = useState(0.0);
    const [hoursReestimate, setHoursReestimate] = useState(0.0);

    useEffect(() => {
        if (subtask != null) {
            setSubtaskTitle(subtask.title);
            setTotalHoursWorked(subtask.totalHoursWorked);
            setHoursReestimate(subtask.hoursReestimate);
        }
    }, [ subtask ])

    const onUpdateButtonClicked = () => {
        props?.onUpdate(subtask.id, subtaskTitle, parseFloat(totalHoursWorked), parseFloat(hoursReestimate));
    }

    return (
        <Dialog
            open={props?.openDialog}
            TransitionComponent={DialogSlideTransition}
            maxWidth="sm"
            keepMounted
            fullWidth
        >
            <DialogTitle>Edit Subtask - Id: {subtask?.id}</DialogTitle>
            <DialogContent className="padding__small">
                <TextField
                    label="Subtask Title"
                    variant="outlined"
                    className="margin-bottom__small"
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    value={subtaskTitle}
                    fullWidth
                />
                <div className="margin-bottom__small">
                    <Typography variant="body1">Total Hours Worked:</Typography>
                    <Input
                        type="number"
                        onChange={(e) => setTotalHoursWorked(e.target.value)}
                        value={totalHoursWorked}
                        fullWidth
                    />
                </div>
                <div>
                    <Typography variant="body1">Hours Re-estimate:</Typography>
                    <Input
                        type="number"
                        onChange={(e) => setHoursReestimate(e.target.value)}
                        value={hoursReestimate}
                        fullWidth
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onUpdateButtonClicked}>Update</Button>
                <Button onClick={props?.onCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditSubtaskDialog;
