import bacon from 'baconjs';
import fetchBaseValue from '../streams/fetch-base-value';

export default function getData(props, hydration) {
    const {power = 1} = props;

    // Get baseValue from hydration if hydrating, or from an external data source if not hydrating.
    const baseValue$ = hydration
        ? bacon.constant(hydration.baseValue)
        : fetchBaseValue();

    // Calculate x based on baseValue (from external data source) and power (from props)
    const x$ = baseValue$.map((baseValue) => baseValue ** power);

    return bacon.combineTemplate({
        state: {
            x: x$,
        },
        hydration: {
            baseValue: baseValue$,
        },
    });
}
