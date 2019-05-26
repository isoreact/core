import React from 'react';
import styled from 'styled-components';

import useIsomorphicContext from '../../../../src/use-isomorphic-context';

import NestedWithStylesContext from '../../context/nested-with-styles-context';
import {IsoSimple} from '../isomorphic/iso-simple';

const StyledSection = styled.section`
    padding: 7px;
    background: #bbb;
`;

const StyledList = styled.ul`
    margin: 7px;
    background: #666;
    color: #ddd;
`;

// Not really nested
export default function NestedWithStyles() {
    const {a, b} = useIsomorphicContext(NestedWithStylesContext);

    return (
        <StyledSection>
            <StyledList>
                <li>
                    {a}
                </li>
                <li>
                    {b}
                </li>
                <li>
                    <IsoSimple power={4}/>
                </li>
            </StyledList>
        </StyledSection>
    );
}
