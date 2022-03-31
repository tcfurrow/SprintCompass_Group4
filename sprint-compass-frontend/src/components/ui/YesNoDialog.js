// File Name:    YesNoDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import { forwardRef } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide
} from "@mui/material";

const YesNoDialogTransition = forwardRef(function Transition (props, ref) {
    return (
        <Slide direction="up" ref={ref} {...props} />
    );
});

const YesNoDialog = (props) => {
    return (
        <Dialog
            open={props?.openDialog}
            TransitionComponent={YesNoDialogTransition}
            onClose={props?.onClose}
            keepMounted
        >
            <DialogTitle>{props?.title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{props?.content}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props?.onYesClicked}>Yes</Button>
                <Button onClick={props?.onNoClicked}>No</Button>
            </DialogActions>
        </Dialog>
    );
}

export default YesNoDialog;
