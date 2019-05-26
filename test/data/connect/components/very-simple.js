import React from 'react';

import Connect from '../../../../src/connect';

import VerySimpleContext from '../../context/very-simple-context';

const VerySimple = () => (
    <section>
        <Connect context={VerySimpleContext}>
            {({x}) => x}
        </Connect>
    </section>
);

export default VerySimple;
