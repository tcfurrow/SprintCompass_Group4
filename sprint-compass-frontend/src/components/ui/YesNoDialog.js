// File Name:    YesNoDialog.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import DialogSlideTransition from "./effects/DialogSlideTransition";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";

const YesNoDialog = (props) => {
    return (
        <Dialog
            open={props?.openDialog}
            TransitionComponent={DialogSlideTransition}
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
