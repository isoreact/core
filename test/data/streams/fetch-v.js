import {of as observableOf} from 'rxjs';
import {delay} from 'rxjs/operators';

// Simulated external data source
export default function fetchV() {
    return observableOf(3).pipe(delay(50));
}
