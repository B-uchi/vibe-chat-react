import { createStore } from 'redux';
import rootReducer from './rootReducer';


const middlewares = [];
const store = createStore(rootReducer);

    
export default store;