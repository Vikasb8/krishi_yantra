import apiClient from '../api/apiClient';
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
} from '../constants/userConstants';

// Action to log in a user
export const login = (email, password) => async (dispatch) => {
    try {
        dispatch({ type: USER_LOGIN_REQUEST });

        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        // IMPORTANT: Your Django backend needs an endpoint for token authentication.
        // DRF-SimpleJWT provides this at '/api/users/token/'.
        const { data } = await apiClient.post(
            '/api/users/token/', // This is the standard JWT endpoint
            { 'username': email, 'password': password },
            config
        );

        const merged = { ...data, email };

        dispatch({
            type: USER_LOGIN_SUCCESS,
            payload: merged,
        });

        localStorage.setItem('userInfo', JSON.stringify(merged));

    } catch (error) {
        dispatch({
            type: USER_LOGIN_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
};

// Action to log out a user
export const logout = () => (dispatch) => {
    // Remove user info from local storage.
    localStorage.removeItem('userInfo');
    // Dispatch the logout action to clear the state.
    dispatch({ type: USER_LOGOUT });
};

export const register = (name, email, phone, address, password) => async (dispatch) => {
    try {
        dispatch({ type: USER_REGISTER_REQUEST });

        const config = {
            headers: { 'Content-Type': 'application/json' },
        };

        await apiClient.post(
            '/api/users/register/',
            { 'name': name, 'email': email, 'phone': phone, 'address': address, 'password': password },
            config
        );

        const { data: tokens } = await apiClient.post(
            '/api/users/token/',
            { username: email, password: password },
            config
        );

        const merged = { ...tokens, email, name };

        dispatch({
            type: USER_REGISTER_SUCCESS,
            payload: merged,
        });

        dispatch({
            type: USER_LOGIN_SUCCESS,
            payload: merged,
        });

        localStorage.setItem('userInfo', JSON.stringify(merged));

    } catch (error) {
        dispatch({
            type: USER_REGISTER_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
};


export const listMyBookings = () => async (dispatch, getState) => {
    try {
        dispatch({ type: USER_LIST_BOOKINGS_REQUEST });

        const { data } = await apiClient.get('/api/users/mybookings/');

        dispatch({
            type: USER_LIST_BOOKINGS_SUCCESS,
            payload: data,
        });

    } catch (error) {
        dispatch({
            type: USER_LIST_BOOKINGS_FAIL,
            payload: 'Could not fetch bookings.',
        });
    }
};

export const listMyTools = () => async (dispatch, getState) => {
    try {
        dispatch({ type: USER_LIST_TOOLS_REQUEST });

        const { data } = await apiClient.get('/api/users/mytools/');

        dispatch({
            type: USER_LIST_TOOLS_SUCCESS,
            payload: data,
        });

    } catch (error) {
        dispatch({
            type: USER_LIST_TOOLS_FAIL,
            payload: 'Could not fetch tools.',
        });
    }
};


export const listMyToolBookings = () => async (dispatch, getState) => {
    try {
        dispatch({ type: 'USER_LIST_TOOL_BOOKINGS_REQUEST' });
        const { data } = await apiClient.get('/api/users/mytoolbookings/');
        dispatch({ type: 'USER_LIST_TOOL_BOOKINGS_SUCCESS', payload: data });
    } catch (error) {
        dispatch({ type: 'USER_LIST_TOOL_BOOKINGS_FAIL', payload: 'Could not fetch data.' });
    }
};

export const updateUserProfile = (user) => async (dispatch) => {
    try {
        dispatch({ type: USER_UPDATE_PROFILE_REQUEST });

        const config = {
            headers: { 'Content-Type': 'application/json' },
        };

        const { data } = await apiClient.put(
            '/api/users/profile/',
            user,
            config
        );

        dispatch({
            type: USER_UPDATE_PROFILE_SUCCESS,
            payload: data,
        });

        dispatch({
            type: USER_LOGIN_SUCCESS,
            payload: data,
        });

        localStorage.setItem('userInfo', JSON.stringify(data));

    } catch (error) {
        dispatch({
            type: USER_UPDATE_PROFILE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
};