import {Observable, Subject, BehaviorSubject, ReplaySubject, of as observableOf} from 'rxjs';

import hasValueNow from '../src/has-value-now';

describe('hasValueNow(observable$)', () => {
    test('observableOf(1) => true', () => {
        expect(hasValueNow(observableOf(1))).toBe(true);
    });

    test('new Observable() => false', () => {
        expect(hasValueNow(new Observable())).toBe(false);
    });

    test('new Subject() => false', () => {
        expect(hasValueNow(new Subject())).toBe(false);
    });

    // Subscribing to a Subject doesn't produce an initial event
    test('new Subject().next(1) => true', () => {
        const subject$ = new Subject();
        subject$.next(1);
        expect(hasValueNow(subject$)).toBe(false);
    });

    // Subscribing to a BehaviorSubject always produces an initial event
    test('new BehaviorSubject(1) => true', () => {
        expect(hasValueNow(new BehaviorSubject(1))).toBe(true);
    });

    // Subscribing to a ReplaySubject before pushing events doesn't produce an initial event
    test('new ReplaySubject(1) => false', () => {
        expect(hasValueNow(new ReplaySubject())).toBe(false);
    });

    // Subscribing to a ReplaySubject after pushing an event produces an initial event
    test('new ReplaySubject(1).next(1) => true', () => {
        const replaySubject$ = new ReplaySubject();
        replaySubject$.next(1);
        expect(hasValueNow(replaySubject$)).toBe(true);
    });
});
