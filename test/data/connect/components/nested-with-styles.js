import React from 'react';
import styled from 'styled-components';

import Connect from '../../../../src/connect';

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

const NestedWithStyles = () => (
    <StyledSection>
        <StyledList>
            <Connect context={NestedWithStylesContext}>
                {({a}) => (
                    <li>
                        {a}
                    </li>
                )}
            </Connect>
            <Connect context={NestedWithStylesContext}>
                {({b}) => (
                    <li>
                        {b}
                    </li>
                )}
            </Connect>
            <li>
                <IsoSimple power={4} />
            </li>
        </StyledList>
    </StyledSection>
);

export default NestedWithStyles;
