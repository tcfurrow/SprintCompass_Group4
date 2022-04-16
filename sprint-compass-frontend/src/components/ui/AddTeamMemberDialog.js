// File Name:    AddTeamMemberDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import DialogSlideTransition from "./effects/DialogSlideTransition";
import { useEffect, useState } from "react";
import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Input,
    TextField,
    Typography
} from "@mui/material";

const AddTeamMemberDialog = (props) => {
    const onAddButtonClicked = () => {
        props?.onAdd();
    }

    return (
        <Dialog
            open={props?.openDialog}
            TransitionComponent={DialogSlideTransition}
            maxWidth="sm"
            keepMounted
            fullWidth
        >
            <DialogTitle>Add Team Member To: </DialogTitle>
            <DialogContent className="padding__small">
                <Autocomplete
                    options={[]}
                    getOptionLabel={(option) => option}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="User"
                            variant="outlined"
                        />
                    )}
                    className="margin-bottom__small"
                    fullWidth
                />
                <Autocomplete
                    options={[]}
                    getOptionLabel={(option) => option}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Role"
                            variant="outlined"
                        />
                    )}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onAddButtonClicked}>Add</Button>
                <Button onClick={props?.onCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddTeamMemberDialog;
