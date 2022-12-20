import {combineReducers} from 'redux';

import BLEReducer from './BLEReducer';
import DataReducer from './DataReducer';

export default combineReducers({
  BLEs: BLEReducer,
  Data: DataReducer,
});
