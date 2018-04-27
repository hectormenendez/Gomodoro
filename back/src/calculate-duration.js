import { Trace, Todoist, $fromInput, $fromItemId } from './utils';

const input$ = $fromInput('Item ID to calculate duration');

const RX = /\*\*Estimated:\*\* (\d+:\d+) \*\*Actual:\*\* (\d+:\d+)/i;

const getDuration = (item, duration = { est: [], act: [] }) => {
    const self = `getDuration(${item.id})`;
    Trace(`${self}:ini`);
    // populat the duration traversing all the children
    item.children.forEach((node) => {
        const subself = `${self}:node[${node.id}](${node.content.slice(0, 10)}…)`;
        Trace(`${subself}:ini`);
        // get duration recursively if this item has children of its own.
        if (node.children.length) getDuration(node, duration);
        // No childrens, store duration (if available)
        else if (node.notes.length) {
            node.notes.forEach((note) => {
                const nself = `${subself}:note[${note.id}](${note.content.slice(0, 10)}..)`;
                const match = note.content.match(RX);
                if (!match) return Trace(`${nself}:no-match`);
                const [est, act] = match
                    .slice(1, 3)
                    .map((text) => {
                        const [mm, ss] = text.split(':');
                        return { mm, ss };
                    });
                duration.est.push(est);
                duration.act.push(act);
                return Trace(`${nself}:match`, { est, act });
            });
        }
    });
    Trace(`${self}:duration`, JSON.stringify(duration));
    const calculate = (target) => {
        const sum = target.reduce((acc, cur) => ({
            mm: acc.mm + parseInt(cur.mm, 10),
            ss: acc.ss + parseInt(cur.ss, 10),
        }), { mm: 0, ss: 0 });
        const hh = Math.floor(sum.mm / 60);
        const mm = (sum.mm % 60) + Math.floor(sum.ss / 60);
        const ss = (sum.ss % 60);
        return [hh, mm, ss]
            .map(time => String(time).padStart(2, '0'))
            .join(':');
    };

    const est = calculate(duration.est);
    const act = calculate(duration.act);
    Trace(`${self}:end`);
    return `**Estimated:** ${est} **Actual:** ${act}`;
};

export default input$
    .map(input => parseInt(input, 10))
    .switchMap(id => $fromItemId(id))
    .switchMap((item) => {
        const note = getDuration(item);
        Todoist.notes.add(item.id, note);
        return Todoist
            .commit()
            .then(() => note);
    })
    .catch((err) => {
        throw new Error(`Error updating note: ${err.message}`);
    });
