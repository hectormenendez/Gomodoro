import PropTypes from 'prop-types';

import { Factory } from '~/utils/redux';
import { Actions as ActionsGomodoro } from '~/stores/gomodoro';

export const Name = 'SELECTED';

export const Types = PropTypes.shape({
    item: PropTypes.object,
    time: PropTypes.number,
    gomodoro: PropTypes.number,
});

export const State = {
    item: null,
    time: null,
    gomodoro: null,
};

export const { Actions, Reducers } = Factory(State, {

    /**
     * Establish a selected item.
     * @param {TodoistItem} item - An object containing the information about an item.
     * @see ~/stores/todoist
     */
    setItem: {
        action: (type, item) => dispatch => dispatch({ type, payload: item }),
        reducer: (state, item) => ({ time: State.time, item }),
    },

    /**
     * Establish a selectes time, according to given gomodoro unit.
     * @param {Number} gomodoro - A gomodoro number existing in the Gomodoro table.
     * @see ~/stores/gomodoro
     */
    setTime: {
        action: (type, gomodoro) => dispatch =>
            // Obtain the updated gomodoro table
            dispatch(ActionsGomodoro.get()).then(({ payload: gomodoros }) =>
                // Get the equivalent timeing and set it.
                dispatch({
                    type,
                    payload: {
                        gomodoro,
                        time: gomodoros[gomodoro] * 60 * 1000,
                    },
                })),
        reducer: (prevState, { time, gomodoro }) => ({ ...prevState, time, gomodoro }),

    },

    reset: {
        action: type => dispatch => dispatch({ type }),
        reducer: () => State,
    },

}, Name);
