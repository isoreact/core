import React from 'react';
import propTypes from 'prop-types';
import {Observable} from 'rxjs';

import getValueNow from './get-value-now';
import hasValueNow from './has-value-now';

class Connector extends React.Component {
    static propTypes = {
        component: propTypes.oneOfType([propTypes.instanceOf(React.Component), propTypes.func]).isRequired,
        data$: propTypes.instanceOf(Observable).isRequired,
        loadingProp: propTypes.string.isRequired,
    };

    state = {
        [this.props.loadingProp]: !hasValueNow(this.props.data$),
        ...(hasValueNow(this.props.data$) ? getValueNow(this.props.data$) : {}),
    };

    componentDidMount() {
        this.subscription = this.props.data$.subscribe((data) => {
            this.setState(() => ({
                [this.props.loadingProp]: false,
                ...data,
            }));
        });
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    render() {
        return (
            <this.props.component {...this.state} />
        );
    }
}

const Connect = ({
    context: Context,
    children,
}) => (
    <Context.Consumer>
        {({data$, loadingProp}) => (
            <Connector
                component={children}
                data$={data$}
                loadingProp={loadingProp}
            />
        )}
    </Context.Consumer>
);

Connect.propTypes = {
    context: propTypes.object.isRequired,
    children: propTypes.oneOfType([propTypes.instanceOf(React.Component), propTypes.func]).isRequired,
};

export default Connect;
