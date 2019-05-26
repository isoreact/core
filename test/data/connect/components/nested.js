import React from 'react';

import Connect from '../../../../src/connect';

import NestedContext from '../../context/nested-context';
import {IsoSimple} from '../isomorphic/iso-simple';

const Nested = () => (
    <section>
        <Connect context={NestedContext}>
            {({isLoading}) => isLoading ? (
                <div>
                    Loading...
                </div>
            ) : (
                <ul>
                    <Connect context={NestedContext}>
                        {({a}) => (
                            <li>
                                {a}
                            </li>
                        )}
                    </Connect>
                    <Connect context={NestedContext}>
                        {({b}) => (
                            <li>
                                {b}
                            </li>
                        )}
                    </Connect>
                    <li>
                        <IsoSimple power={4} />
                    </li>
                </ul>
            )}
        </Connect>
    </section>
);

export default Nested;
