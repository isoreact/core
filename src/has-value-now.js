/**
 * Does the RxJS <code>Observable</code> have a value, such that subscribing to the observable will synchronously
 * produce an event?
 *
 * @param {Observable} observable$ - an RxJS <code>Observable</code>
 * @returns {boolean} <code>true</code> if the Observable has a value now, or <code>false</code> if it doesn't
 */
export default function hasValueNow(observable$) {
    let resolved = false;

    observable$
        .subscribe(() => {
            resolved = true;
        })
        .unsubscribe();

    return resolved;
}
