// File Name:    CreateTeamDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import DialogSlideTransition from "./effects/DialogSlideTransition";
import { useState } from "react";
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

const CreateTeamDialog = (props) => {
    const [teamName, setTeamName] = useState("");

    const isInputInvalid = teamName.trim().length === 0;

    const onCreateTeam = () => {
        props?.onCreateTeam(teamName);
        setTeamName("");
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
            <DialogTitle>Create New Team</DialogTitle>
            <DialogContent className="padding__small">
                <TextField
                    label="Team Name"
                    variant="outlined"
                    className="margin-bottom__small"
                    onChange={(e) => setTeamName(e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCreateTeam} disabled={isInputInvalid}>Create</Button>
                <Button onClick={props?.onCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateTeamDialog;
