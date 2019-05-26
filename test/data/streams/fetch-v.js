import bacon from 'baconjs';

// Simulated external data source
export default function fetchV() {
    return bacon.later(50, 3);
}
