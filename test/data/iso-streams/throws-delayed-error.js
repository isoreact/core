import bacon from 'baconjs';

export default function getData() {
    return bacon
        .later(1, null)
        .flatMapLatest(() => new bacon.Error('Nope!'))
        .toProperty();
}
