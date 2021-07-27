import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { logger } from "./logger";
import { rootReducer } from "./rootReducer";

export const makeStore = () => {
  let middlewares: any[] = [thunk];
  if (__DEV__) {
    middlewares.push(logger);
  }
  return createStore(rootReducer, applyMiddleware(...middlewares));
};
