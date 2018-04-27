import PropTypes from 'prop-types';
import { AsyncStorage } from 'react-native';

import Config from '~/utils/config.json';

import { Read, Write } from '~/utils/todoist';
import { Factory } from '~/utils/redux';
import { MilliToHuman } from '~/utils/time';

export const Name = 'TODOIST';

export const StoreKey = `${Config.storeKey}:${Name}`;

export const Types = PropTypes.shape({
    sync: PropTypes.string,
    items: PropTypes.array.isRequired,
});

export const State = {
    sync: null,
    items: [],
};


const getComment = (payload) => {
    const orig = MilliToHuman(payload.time.orig);
    const time = MilliToHuman(payload.expired
        ? payload.time.orig + payload.time.curr
        : payload.time.orig - payload.time.curr);
    return `**Estimated:** ${orig} **Actual:** ${time}`;
};

export const { Actions, Reducers } = Factory(State, {

    itemsReset: {
        action: () => dispatch => AsyncStorage
            .removeItem(StoreKey)
            .then(() => dispatch(Actions.itemsFetch())),
    },

    itemsFetch: {
        action: type => dispatch => AsyncStorage
            // Determine if there's something on the storage
            .getItem(StoreKey)
            .then(serializedStorage => serializedStorage
                ? JSON.parse(serializedStorage) // storage found, unserialize it.
                : { sync: '*', items: [] }, // no previous storage, setup first fetch.
            )
            // Combine the storage and the updated states
            .then(storage => Read(storage.sync, ['items'])
                .then(response => ({
                    sync: response.sync_token,
                    items: storage.items.concat(response.items),
                })),
            )
            // Update the storage with the new merged state.
            .then(payload => AsyncStorage
                .setItem(StoreKey, JSON.stringify(payload))
                .then(() => dispatch({ type, payload })),
            ),

        // Since the action did all the operations, just replace the store.
        reducer: (prevState, payload) => payload,
    },

    itemUpdate: {
        action: (type, payload) => (dispatch) => {
            const content = getComment(payload);
            const tasks = [
                ['note_add', { content, item_id: payload.item.id }],
            ];
            return Write(tasks).then(dispatch({ type }));
        },
        reducer: prevState => prevState,
    },

    itemComplete: {
        action: (type, payload) => (dispatch) => {
            const content = getComment(payload);
            const tasks = [
                ['note_add', { content, item_id: payload.item.id }],
                // use this instead of complete for recurring and subtasks
                ['item_close', { id: payload.item.id }],
            ];
            return Write(tasks)
                // get rid of the item in the storage
                .then(response => AsyncStorage
                    .getItem(StoreKey)
                    .then(serializedStorage => JSON.parse(serializedStorage))
                    .then(storage => ({ storage, response })),
                )
                .then(({ storage, response }) => {
                    const state = {
                        sync: response.sync_token,
                        items: storage.items.filter(item => item.id !== payload.item.id),
                    };
                    return AsyncStorage
                        .setItem(StoreKey, JSON.stringify(state))
                        .then(() => state);
                })
                .then(({ sync, items }) => dispatch({ type, payload: { sync, items } }));
        },

        reducer: (prevState, payload) => payload,
    },

}, Name);
