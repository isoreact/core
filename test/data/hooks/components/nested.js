import React from 'react';

import useIsomorphicContext from '../../../../src/use-isomorphic-context';

import NestedContext from '../../context/nested-context';
import {IsoSimple} from '../isomorphic/iso-simple';

// Not really nested
export default function Nested() {
    const {isLoading, a, b} = useIsomorphicContext(NestedContext);

    return (
        <section>
            {isLoading ? (
                <div>
                    Loading...
                </div>
            ) : (
                <ul>
                    <li>
                        {a}
                    </li>
                    <li>
                        {b}
                    </li>
                    <li>
                        <IsoSimple power={4} />
                    </li>
                </ul>
            )}
        </section>
    );
}
