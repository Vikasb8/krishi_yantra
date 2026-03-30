import {
    USER_LOGIN_REQUEST,
    USER_LOGIN_SUCCESS,
    USER_LOGIN_FAIL,
    USER_LOGOUT,

    USER_REGISTER_REQUEST,
    USER_REGISTER_SUCCESS,
    USER_REGISTER_FAIL,

    USER_LIST_BOOKINGS_REQUEST,
    USER_LIST_BOOKINGS_SUCCESS,
    USER_LIST_BOOKINGS_FAIL,
    USER_LIST_TOOLS_REQUEST,
    USER_LIST_TOOLS_SUCCESS,
    USER_LIST_TOOLS_FAIL,

    USER_UPDATE_PROFILE_REQUEST,
    USER_UPDATE_PROFILE_SUCCESS,
    USER_UPDATE_PROFILE_FAIL,
    USER_UPDATE_PROFILE_RESET,
} from '../constants/userConstants';

// This reducer handles the state for a logged-in user.
export const userLoginReducer = (state = {}, action) => {
    switch (action.type) {
        case USER_LOGIN_REQUEST:
            // When a login request starts, set loading to true.
            return { loading: true };

        case USER_LOGIN_SUCCESS:
            // When login is successful, stop loading and store user info.
            return { loading: false, userInfo: action.payload };

        case USER_LOGIN_FAIL:
            // If login fails, stop loading and store the error message.
            return { loading: false, error: action.payload };

        case USER_LOGOUT:
            // When logging out, clear all user info from the state.
            return {};

        default:
            return state;
    }
};


export const userRegisterReducer = (state = {}, action) => {
    switch (action.type) {
        case USER_REGISTER_REQUEST:
            return { loading: true };
        case USER_REGISTER_SUCCESS:
            return { loading: false, userInfo: action.payload };
        case USER_REGISTER_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};


export const myBookingsListReducer = (state = { bookings: [] }, action) => {
    switch (action.type) {
        case USER_LIST_BOOKINGS_REQUEST:
            return { loading: true };
        case USER_LIST_BOOKINGS_SUCCESS:
            return { loading: false, bookings: action.payload };
        case USER_LIST_BOOKINGS_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const myToolsListReducer = (state = { tools: [] }, action) => {
    switch (action.type) {
        case USER_LIST_TOOLS_REQUEST:
            return { loading: true };
        case USER_LIST_TOOLS_SUCCESS:
            return { loading: false, tools: action.payload };
        case USER_LIST_TOOLS_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const myToolBookingsListReducer = (state = { bookings: [] }, action) => {
    switch (action.type) {
        case 'USER_LIST_TOOL_BOOKINGS_REQUEST': return { loading: true };
        case 'USER_LIST_TOOL_BOOKINGS_SUCCESS': return { loading: false, bookings: action.payload };
        case 'USER_LIST_TOOL_BOOKINGS_FAIL': return { loading: false, error: action.payload };
        default: return state;
    }
};

export const userUpdateProfileReducer = (state = {}, action) => {
    switch (action.type) {
        case USER_UPDATE_PROFILE_REQUEST:
            return { loading: true };
        case USER_UPDATE_PROFILE_SUCCESS:
            return { loading: false, success: true, userInfo: action.payload };
        case USER_UPDATE_PROFILE_FAIL:
            return { loading: false, error: action.payload };
        case USER_UPDATE_PROFILE_RESET:
            return {};
        default:
            return state;
    }
};