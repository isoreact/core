import {Observable, Subject, BehaviorSubject, ReplaySubject, of as observableOf} from 'rxjs';

import getValueNow from '../src/get-value-now';

describe('getValueNow(observable$)', () => {
    test('observableOf(1) => true', () => {
        expect(getValueNow(observableOf(1))).toBe(1);
    });

    test('new Observable() => error', () => {
        expect(() => getValueNow(new Observable())).toThrow();
    });

    test('new Subject() => error', () => {
        expect(() => getValueNow(new Subject())).toThrow();
    });

    // Subscribing to a Subject doesn't produce an initial event
    test('new Subject().next(1) => true', () => {
        const subject$ = new Subject();
        subject$.next(1);
        expect(() => getValueNow(subject$)).toThrow();
    });

    // Subscribing to a BehaviorSubject always produces an initial event
    test('new BehaviorSubject(1) => true', () => {
        expect(getValueNow(new BehaviorSubject(1))).toBe(1);
    });

    // Subscribing to a ReplaySubject before pushing events doesn't produce an initial event
    test('new ReplaySubject(1) => error', () => {
        expect(() => getValueNow(new ReplaySubject())).toThrow();
    });

    // Subscribing to a ReplaySubject after pushing an event produces an initial event
    test('new ReplaySubject(1).next(1) => true', () => {
        const replaySubject$ = new ReplaySubject();
        replaySubject$.next(1);
        expect(getValueNow(replaySubject$)).toBe(1);
    });
});
