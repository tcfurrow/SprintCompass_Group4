import { forwardRef, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide,
    TextField
} from "@mui/material";

const CreateNewSprintDialogTransition = forwardRef(function Transition (props, ref) {
    return (
        <Slide direction="down" ref={ref} {...props} />
    );
});

const CreateNewSprintDialog = (props) => {
    const [sprintName, setSprintName] = useState("");

    const onCreateSprintButtonClicked = () => {
        props?.onCreateNewSprintButtonClicked(sprintName);
        setSprintName("");
    }

    return (
        <Dialog
            open={props?.openDialog}
            TransitionComponent={CreateNewSprintDialogTransition}
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

export default CreateNewSprintDialog;
