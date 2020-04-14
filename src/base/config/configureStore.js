import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { default as thunk } from "redux-thunk";
import logger from 'redux-logger';
import rootReducer from './appReducer'
import initialState from '../config/initialState';
const middleware =(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'buildprod' ) ? 
[ thunk ] : [ thunk,logger];

const enhancersDevToolExt = compose(
 window.devToolsExtension ? window.devToolsExtension(): f => f
);

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(...middleware),
  // Required! Enable Redux DevTools with the monitors you chose
  enhancersDevToolExt
  // Optional. Lets you write ?debug_session=<key> in address bar to persist debug sessions
  //persistState(getDebugSessionKey())
)

const store = createStore(
    rootReducer,
    initialState,
    enhancer
);
export default store;