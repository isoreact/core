import bacon from 'baconjs';

export default function getData(props) {
    const {power = 1} = props;

    return bacon.combineTemplate({
        state: {
            x: 5 ** power,
        },
    });
}
