import { $fromInput, Test$ } from './utils';
import GomodoroCounter$ from './gomodoro-counter';
import CalculateDuration$ from './calculate-duration';

// eslint-disable-next-line no-console
if (process.env.NODE_ENV !== 'development') console.clear();

const prompt = [
    'Type the corresponfing number and press enter.',
    '   [1] Gomodoro counter.',
    '   [2] Calculate duration.',
    '',
].join('\n');

const input$ = $fromInput(prompt)
    .switchMap((input) => {
        switch (input) {
            case '1': return GomodoroCounter$;
            case '2': return CalculateDuration$;
            case '0': return Test$;
            default: throw new Error('Invalid option', JSON.stringify(input));
        }
    });

/* eslint-disable no-console */
input$.subscribe(
    response => console.log('Response:', response),
    (error) => {
        console.error('Error:', error);
        process.exit(1);
    },
    () => {
        console.log('DONE');
        process.exit(0);
    },
);
/* eslint-enable no-console */
