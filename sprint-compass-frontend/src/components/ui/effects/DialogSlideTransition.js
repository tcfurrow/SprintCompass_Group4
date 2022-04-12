// File Name:    DialogSlideTransition.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import { forwardRef } from "react";
import { Slide } from "@mui/material";

const DialogSlideTransition = forwardRef(function Transition (props, ref) {
    return (
        <Slide direction="down" ref={ref} {...props} />
    );
});

export default DialogSlideTransition;
