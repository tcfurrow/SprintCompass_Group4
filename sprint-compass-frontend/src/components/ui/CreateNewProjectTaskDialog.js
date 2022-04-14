import DialogSlideTransition from "./effects/DialogSlideTransition";
import { useEffect, useState } from "react";
import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";

const CreateNewProjectTaskDialog = (props) => {
    const [selectedBacklogId, setSelectedBacklogId] = useState(null);

    const onCreateButtonClicked = () => {
        if (selectedBacklogId === null) {
            return;
        }

        props?.onCreate(props.selectedSprint.id, selectedBacklogId);
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
            <DialogTitle>Add Project Task to {props?.selectedSprint?.name}</DialogTitle>
            <DialogContent className="padding__small">
                {
                    props.selectedSprint !== null
                    &&
                    <Autocomplete
                        options={props.selectedSprint.project.productBacklog}
                        getOptionLabel={(option) => `${option.title} [priority: ${option.priority}]`}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Product Backlog"
                                variant="outlined"
                            />
                        )}
                        onChange={(e, value) => setSelectedBacklogId(value?.id)}
                        className="margin-bottom__small"
                        fullWidth
                    />
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={onCreateButtonClicked}>Create</Button>
                <Button onClick={props?.onCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateNewProjectTaskDialog;
