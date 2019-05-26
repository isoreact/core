import React from 'react';

import useIsomorphicContext from '../../../../src/use-isomorphic-context';

import SimpleContext from '../../context/simple-context';

function Simple() {
    const state = useIsomorphicContext(SimpleContext);

    return (
        <section>
            {!!state && state.x}
        </section>
    );
}

export default Simple;
