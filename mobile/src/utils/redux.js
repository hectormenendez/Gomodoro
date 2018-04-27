import PropTypes from 'prop-types';
import Thunk from 'redux-thunk';
import { composeWithDevTools as ComposeWithDevTools } from 'redux-devtools-extension';
import {
    createStore as CreateStore,
    combineReducers as CombineReducers,
    applyMiddleware as ApplyMiddleware,
} from 'redux';

const ReduxMiddleware = ApplyMiddleware(Thunk);

export function Store(reducers, initStore) {
    return CreateStore(
        CombineReducers(reducers), // Root reducer
        initStore,
        __DEV__ // eslint-disable-line no-undef
            ? ComposeWithDevTools({})(ReduxMiddleware)
            : ReduxMiddleware,
    );
}

export function Factory(initState, declarations, prefix) {
    PropTypes.checkPropTypes(
        {
            initState: PropTypes.any.isRequired,
            declarations: PropTypes.objectOf(PropTypes.shape({
                action: PropTypes.func.isRequired,
                reducer: PropTypes.func,
            })),
            prefix: PropTypes.string,
        },
        { initState, declarations, prefix },
        'arguments',
        'FactoryRedux',
    );
    const keys = Object.keys(declarations);
    const prefixer = value => prefix ? `${prefix}/${value}` : value;
    return {

        Actions: keys.reduce((acc, key) => {
            const type = prefixer(key);
            const fabricatedAction = declarations[key].action.bind(null, type);
            return { ...acc, [key]: fabricatedAction };
        }, {}),

        Reducers: function fabricatedReducers(prevState = initState, { type, payload }) {
            const match = keys
                .map(key => ({ key: prefixer(key), reducer: declarations[key].reducer }))
                .filter(({ key }) => key === type);
            // No matching declaration found, this is most likely @@INIT, return state.
            if (!match.length) return prevState;
            return match[0].reducer(prevState, payload);
        },
    };
}
