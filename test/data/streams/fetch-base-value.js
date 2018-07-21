import {of as observableOf} from 'rxjs';
import {delay} from 'rxjs/operators';

// Simulated external data source
export default function fetchBaseValue() {
    return observableOf(5).pipe(delay(50));
}
