import PropTypes from 'prop-types';
import {of as observableOf} from 'rxjs';

import hydrate from '../../../src/hydrate';
import isomorphic from '../../../src/isomorphic';

import VerySimple from '../components/very-simple';
import VerySimpleContext from '../context/very-simple-context';

const isoVerySimple = {
    name: 'iso-very-simple',
    component: VerySimple,
    context: VerySimpleContext,
    getData: (props) => {
        const {power = 1} = props;

        return observableOf({
            state: {
                x: 5 ** power,
            },
        });
    },
    propTypes: {
        power: PropTypes.number,
    },
};

export const IsoVerySimple = isomorphic(isoVerySimple);

export function hydrateVerySimple(options) {
    hydrate(IsoVerySimple, options);
}
