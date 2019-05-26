import bacon from 'baconjs';

export default function getData() {
    return bacon
        .constant(null)
        .flatMapLatest(() => new bacon.Error('Nope!'))
        .toProperty();
}
