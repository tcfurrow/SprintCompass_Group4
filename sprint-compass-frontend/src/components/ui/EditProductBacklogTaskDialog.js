// File Name:    EditProductBacklogTaskDialog.js
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

const EditProductBacklogTaskDialog = (props) => {
    const productBacklogTask = props.productBacklogTask;

    const [priority, setPriority] = useState();
    const [title, setTitle] = useState();
    const [description, setDescription] = useState();
    const [relativeEstimate, setRelativeEstimate] = useState();
    const [cost, setCost] = useState();

    useEffect(() => {
        setPriority(productBacklogTask?.priority ?? 0);
        setTitle(productBacklogTask?.title ?? "");
        setDescription(productBacklogTask?.description ?? "");
        setRelativeEstimate(productBacklogTask?.relativeEstimate ?? 0);
        setCost(productBacklogTask?.cost ?? 0.0);
    }, [ productBacklogTask ]);

    const onUpdateButtonClicked = () => {
        props?.onUpdate(productBacklogTask.id, priority, title, description, relativeEstimate, cost);
    }

    return (
        <Dialog
            open={props?.openDialog}
            TransitionComponent={DialogSlideTransition}
            maxWidth="md"
            keepMounted
            fullWidth
        >
            <DialogTitle>Edit Product Backlog Task - Id: {productBacklogTask?.id}</DialogTitle>
            <DialogContent className="padding__small">
                <div className="margin-bottom__small">
                    <Typography variant="body1">Priority:</Typography>
                    <Input
                        type="number"
                        onChange={(e) => setPriority(e.target.value >= 0.0 ? e.target.value : 0.0)}
                        value={priority}
                        fullWidth
                    />
                </div>
                <TextField
                    label="Title"
                    variant="outlined"
                    className="margin-bottom__small"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    fullWidth
                />
                <TextField
                    label="Description"
                    variant="outlined"
                    className="margin-bottom__small"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    fullWidth
                />
                <div className="margin-bottom__small">
                    <Typography variant="body1">Relative Estimate:</Typography>
                    <Input
                        type="number"
                        onChange={(e) => setRelativeEstimate(e.target.value)}
                        value={relativeEstimate}
                        fullWidth
                    />
                </div>
                <div>
                    <Typography variant="body1">Cost ($):</Typography>
                    <Input
                        type="number"
                        onChange={(e) => setCost(e.target.value >= 0.0 ? e.target.value : 0.0)}
                        value={cost}
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

export default EditProductBacklogTaskDialog;
