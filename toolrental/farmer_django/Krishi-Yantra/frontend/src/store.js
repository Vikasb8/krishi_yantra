import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
// FIX 1: Import thunk as a named export, not default
import { thunk } from 'redux-thunk'; 

// Import your reducers
import { userLoginReducer, userRegisterReducer, myBookingsListReducer, myToolsListReducer,myToolBookingsListReducer  } from './reducers/userReducers';
import { toolListReducer, toolDetailsReducer } from './reducers/toolReducers';

const reducer = combineReducers({
    userLogin: userLoginReducer,
    userRegister: userRegisterReducer,
    toolList: toolListReducer,
    toolDetails: toolDetailsReducer,
    myBookingsList: myBookingsListReducer,
    myToolsList: myToolsListReducer, 
    myToolBookingsList: myToolBookingsListReducer,
});

function parseStoredUserInfo() {
    try {
        const raw = localStorage.getItem('userInfo');
        if (!raw) return null;
        const u = JSON.parse(raw);
        if (u && typeof u.access === 'string' && u.access.length > 0) return u;
        localStorage.removeItem('userInfo');
        return null;
    } catch {
        localStorage.removeItem('userInfo');
        return null;
    }
}

const userInfoFromStorage = parseStoredUserInfo();

const initialState = {
    userLogin: { userInfo: userInfoFromStorage },
};

const middleware = [thunk];

// FIX 2: This is the modern, correct way to connect to the Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    reducer,
    initialState,
    composeEnhancers(applyMiddleware(...middleware))
);

export default store;
