import bacon from 'baconjs';
import fetchV from '../streams/fetch-v';
import fetchW from '../streams/fetch-w';

export default function getData(props, hydration) {
    const {coefficient = 1} = props;

    // Get {v, w} from hydration if hydrating, or from an external data source if not hydrating.
    const v$ = hydration
        ? bacon.constant(hydration.v)
        : fetchV();

    const w$ = hydration
        ? bacon.constant(hydration.w)
        : fetchW();

    // Calculate {a, b} based on v (from external data source) and coefficient (from props)
    const a$ = v$.map((v) => coefficient * v);
    const b$ = w$.map((w) => coefficient * w);

    return bacon.combineTemplate({
        state: {
            a: a$,
            b: b$,
        },
        hydration: {
            v: v$,
            w: w$,
        },
    });
}
