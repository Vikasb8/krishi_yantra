import {
    TOOL_LIST_REQUEST,
    TOOL_LIST_SUCCESS,
    TOOL_LIST_FAIL,
    TOOL_DETAILS_REQUEST,
    TOOL_DETAILS_SUCCESS,
    TOOL_DETAILS_FAIL,
    TOOL_DETAILS_RESET,
} from '../constants/toolConstants';

export const toolListReducer = (state = { tools: [] }, action) => {
    switch (action.type) {
        case TOOL_LIST_REQUEST:
            return { loading: true, tools: [] };
        case TOOL_LIST_SUCCESS:
            return { loading: false, tools: action.payload };
        case TOOL_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const toolDetailsReducer = (state = { tool: {} }, action) => {
    switch (action.type) {
        case TOOL_DETAILS_REQUEST:
            return { loading: true, ...state };
        case TOOL_DETAILS_SUCCESS:
            // This line is critical. It must return an object with a 'tool' key.
            return { loading: false, tool: action.payload }; // ✅
        case TOOL_DETAILS_FAIL:
            return { loading: false, error: action.payload };
        case TOOL_DETAILS_RESET:
            return { loading: false, tool: {}, error: undefined };
        default:
            return state;
    }
};