// File Name:    CreateNewProjectTaskDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";
import DialogSlideTransition from "./effects/DialogSlideTransition";

const CreateNewProjectTaskDialog = (props) => {
    const [sprintName, setSprintName] = useState("");

    const onCreateSprintButtonClicked = () => {
        props?.onCreateNewSprintButtonClicked(sprintName);
        setSprintName("");
    }

    return (
        <Dialog
            open={props?.openDialog}
            TransitionComponent={DialogSlideTransition}
            onClose={props?.onClose}
            maxWidth="sm"
            keepMounted
            fullWidth
        >
            <DialogTitle>Create New Sprint</DialogTitle>
            <DialogContent className="padding__small">
                <TextField
                    label="Sprint Name"
                    variant="outlined"
                    className="margin-bottom__small"
                    onChange={(e) => setSprintName(e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCreateSprintButtonClicked}>Create Sprint</Button>
                <Button onClick={props?.onCancelClicked}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateNewProjectTaskDialog;
