import bacon from 'baconjs';

// Simulated external data source
export default function fetchBaseValue() {
    return bacon.later(50, 5);
}
