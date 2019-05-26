import React from 'react';

import useIsomorphicContext from '../../../../src/use-isomorphic-context';

import VerySimpleContext from '../../context/very-simple-context';

function VerySimple() {
    const {x} = useIsomorphicContext(VerySimpleContext);

    return (
        <section>
            {x}
        </section>
    );
}

export default VerySimple;
