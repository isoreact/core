import bacon from 'baconjs';

// Simulated external data source
export default function fetchW() {
    return bacon.later(30, 8);
}
