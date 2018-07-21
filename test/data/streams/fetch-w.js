import {of as observableOf} from 'rxjs';
import {delay} from 'rxjs/operators';

// Simulated external data source
export default function fetchW() {
    return observableOf(8).pipe(delay(30));
}
