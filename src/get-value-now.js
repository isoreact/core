/**
 * Get the current value of an RxJS Observable if it has a current value.
 *
 * @param {Observable} observable$    - an RxJS Observable
 * @param {Object}     options        - options
 * @param {string}     [options.errorMessage] - an alternative error message to display when the observable has no immediate value
 * @returns {*} the current value of the Observable, if any
 * @throws if the observable does not immediately produce a value
 */
export default function getValueNow(
    observable$,
    {
        errorMessage = 'Expected observable to produce a value immediately, but it did\'t.',
    } = {},
) {
    let hasValue = false;
    let value;

    observable$
        .subscribe((v) => {
            hasValue = true;
            value = v;
        })
        .unsubscribe();

    if (!hasValue) {
        throw new Error(errorMessage);
    }

    return value;
}
