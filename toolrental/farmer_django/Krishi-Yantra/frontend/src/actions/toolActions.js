import apiClient from '../api/apiClient';
import {
    TOOL_LIST_REQUEST,
    TOOL_LIST_SUCCESS,
    TOOL_LIST_FAIL,
    TOOL_DETAILS_REQUEST,
    TOOL_DETAILS_SUCCESS,
    TOOL_DETAILS_FAIL,
} from '../constants/toolConstants';

export const listTools = () => async (dispatch) => {
    try {
        dispatch({ type: TOOL_LIST_REQUEST });
        const { data } = await apiClient.get('/api/tools/');
        dispatch({
            type: TOOL_LIST_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: TOOL_LIST_FAIL,
            payload: error.response?.data.detail || error.message,
        });
    }
};

export const listToolDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: TOOL_DETAILS_REQUEST });
        const { data } = await apiClient.get(`/api/tools/${id}`);
        dispatch({
            type: TOOL_DETAILS_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: TOOL_DETAILS_FAIL,
            payload: error.response?.data.detail || error.message,
        });
    }
};