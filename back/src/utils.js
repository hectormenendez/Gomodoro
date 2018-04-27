import TodoistClient from 'todoist-js';
import { Observable } from 'rxjs';

import { todoist as Config } from '../config.json';

export const Todoist = new TodoistClient(Config.token);

export const Exception = (message) => {
    if (process.env.NODE_ENV !== 'development') {
        process.stderr.write(`\n${message}\n`);
        process.exit(1);
    }
    throw new Error(message);
};

export const Trace = (...args) => {
    if (process.env.NODE_ENV !== 'development') return null;
    return console.log(...['[DEBUG] '].concat(args)); // eslint-disable-line no-console
};


// import State from '../state.json';
export const State$ = Observable
    .fromPromise(Todoist.sync())
    .do(() => Trace('State$'))
    .publishReplay()
    .refCount();

// export const State$ = Observable.of(State);

export const $fromInput = text => Observable.create((observer) => {
    Trace(`$fromInput(${text.slice(0, 10)}…)`);
    process.stdout.write(`${text}\n`);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
        observer.next(String(data).trim());
        observer.complete();
    });
});

export const $fromItemId = id => Observable
    .of(null)
    .do(() => {
        if (typeof id !== 'number')
            throw new Error('Invalid identifier type, expecting number');
        Trace(`$fromItemId(${id}):ini`);
    })
    // Obtain the state, get the items and start observing each item.
    .switchMap(() => State$.switchMap(state => state.items))
    .filter(item => item.id === id)
    .catch((err) => {
        throw new Error(`Error fechting item: ${err.message}`);
    })
    // having the item object, populate its children and notes.
    .switchMap((item) => {
        const children$ = State$
            .map(({ items }) => items.filter(node => node.parent_id === id))
            .switchMap(children => !children.length
                ? Observable.of([])
                : Observable
                    .from(children)
                    .mergeMap(child => $fromItemId(child.id))
                    .toArray(),
            );
        const notes$ = State$
            .map(({ notes }) => notes.filter(node => node.item_id === id));
        return Observable.combineLatest(children$, notes$, [item]);
    })
    .map(([children, notes, item]) => ({ ...item, children, notes }))
    .do(() => Trace(`$fromItemId(${id}):end`));

