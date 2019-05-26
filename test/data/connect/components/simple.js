import React from 'react';

import Connect from '../.././../../src/connect';

import SimpleContext from '../../context/simple-context';

const Simple = () => (
    <section>
        <Connect context={SimpleContext}>
            {({x}) => x || null}
        </Connect>
    </section>
);

export default Simple;
