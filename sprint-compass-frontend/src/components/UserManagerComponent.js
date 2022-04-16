// File Name:    UserManagerComponent.js
// By:           Darian Benam, Jordan Fox, Teresa Furrow

import "../scss/App.scss";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    Typography
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import { useEffect, useReducer } from "react";
import { httpDelete, httpGet, httpInsert } from "../utils/ApiUtilities";
import YesNoDialog from "./ui/YesNoDialog";

const UserManagerComponent = (props) => {
    const initialState = {
        firstNameTextFieldValue: "",
        lastNameTextFieldValue: "",
        userList: [],
        userToDelete: null
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [state, setState] = useReducer(reducer, initialState);

    useEffect(() => {
        (async () => {
            await fetchUsers();
        })();
    }, []);

    const isInputInvalid = state.firstNameTextFieldValue.length === 0 || state.lastNameTextFieldValue.length === 0;

    const fetchUsers = async () => {
        try {
            setState({ userList: [] });

            props.showSnackbarMessage("Fetching all users...");
            
            const users = await httpGet("api/user");

            if (users !== null) {
                setState({ userList: users });         
                props.showSnackbarMessage(`Fetched ${users.length} user(s).`);
            } else {
                props.showSnackbarMessage("A server-side error occurred while attempting to fetch the users.");
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to fetch the users.");
        }
    }

    const onAddUserButtonClicked = async () => {
        try {
            props.showSnackbarMessage(`Adding user ${state.firstNameTextFieldValue} ${state.lastNameTextFieldValue}.`);

            const user = {
                firstName: state.firstNameTextFieldValue,
                lastName: state.lastNameTextFieldValue
            };

            const addUserResponse = await httpInsert("api/user", user);

            if (addUserResponse?.success) {
                const addedUser = addUserResponse.addedUser;
                const updatedUserList = [ ...state.userList, addedUser ];  

                setState({
                    userList: updatedUserList,
                    firstNameTextFieldValue: "",
                    lastNameTextFieldValue: ""
                });

                props.showSnackbarMessage(`The new user was created successfully (id: ${addedUser.id}).`);
            } else {
                props.showSnackbarMessage("A server-side error occurred while attempting to add the user.");
            }
        } catch (error) {
            props.showSnackbarMessage("An error occurred while attempting to add the user.");
        }
    }

    const deleteUser = async () => {
        if (state.userToDelete === null) {
            return;
        }

        try {
            props.showSnackbarMessage(`Deleting user ""${state.userToDelete.firstName} ${state.userToDelete.lastName}" (id: ${state.userToDelete.id})...`);

            const deleteUserResponse = await httpDelete(`api/user/${state.userToDelete.id}`);

            if (deleteUserResponse?.errorMessage.length === 0 || deleteUserResponse?.userDeleted) {
                const updatedUserList = [ ...state.userList ];
                const userIndexToRemove = updatedUserList.findIndex(user => user.id === state.userToDelete.id);

                if (userIndexToRemove !== -1) {
                    updatedUserList.splice(userIndexToRemove, 1);
                    setState({ userList: updatedUserList });
                }

                props.showSnackbarMessage(`The user ""${state.userToDelete.firstName} ${state.userToDelete.lastName}" (id: ${state.userToDelete.id}) was deleted successfully!`);
            } else {
                props.showSnackbarMessage(`A server-side error occurred while attempting to delete the user. Reason ${deleteUserResponse?.errorMessage ?? "N/A"}.`);
            }
        } catch (error) {
            props.showSnackbarMessage(`An error occurred while attempting to delete the user.`);
        } finally {
            setState({ userToDelete: null });
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <Card>
                <CardHeader
                    title="User Manager"
                    className="align-text__center"
                />
                <CardContent>
                    <div className="card-content-wrapper">
                        <div className="grid__two-col-t2">
                            <div>
                                <Typography variant="h6" className="margin-bottom__small">Users</Typography>
                                <List className="sprint-list subtle-shadow margin-bottom__small">
                                    {
                                        state.userList.map((userListItem, index) => (
                                            <ListItem key={`user-list-item-${index}`} disablePadding>
                                                <ListItemButton
                                                    onClick={() => setState({ userToDelete: state.userList.find(user => user.id === userListItem.id) })}
                                                >
                                                    <ListItemText primary={`${userListItem.firstName} ${userListItem.lastName}`} />
                                                </ListItemButton>
                                            </ListItem>
                                        ))
                                    }
                                </List>
                                <Typography variant="body1" className="margin-bottom__small">Want to delete a user? Click on their name!</Typography>
                            </div>
                            <div>
                                <Typography variant="h6" className="margin-bottom__small">Add New User</Typography>
                                <div className="grid__split-evenly">
                                    <TextField
                                        label="First Name"
                                        variant="outlined"
                                        className="margin-bottom__small"
                                        onChange={(event) => setState({ firstNameTextFieldValue: event.target.value })}
                                        value={state.firstNameTextFieldValue}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Last Name"
                                        variant="outlined"
                                        className="margin-bottom__small"
                                        onChange={(event) => setState({ lastNameTextFieldValue: event.target.value })}
                                        value={state.lastNameTextFieldValue}
                                        fullWidth
                                    />
                                </div>
                                <Button
                                    variant="outlined"
                                    onClick={onAddUserButtonClicked}
                                    disabled={isInputInvalid}
                                    fullWidth
                                >
                                    <FontAwesomeIcon icon={faAdd} />
                                    Add User
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <YesNoDialog
                openDialog={state.userToDelete !== null}
                title="Delete User Confirmation"
                content={`Are you sure you want to delete the user "${state.userToDelete?.firstName} ${state.userToDelete?.lastName}" (id: ${state.userToDelete?.id})? This operation can not be reversed.`}
                onYesClicked={deleteUser}
                onNoClicked={() => setState({ userToDelete: null })}
            />
        </ThemeProvider>
    );
}

export default UserManagerComponent;
