import React from 'react';
import PropTypes from 'prop-types';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import getValueNow from './get-value-now';

class Connector extends React.Component {
    static propTypes = {
        component: PropTypes.oneOfType([PropTypes.instanceOf(React.Component), PropTypes.func]).isRequired,
        data$: PropTypes.instanceOf(Observable).isRequired,
        distinctBy: PropTypes.func,
    };

    static defaultProps = {
        distinctBy: (value) => value,
    };

    state = {
        value: getValueNow(this.props.data$),
    };

    componentDidMount() {
        this.subscription = this.props.data$
            .pipe(
                distinctUntilChanged((a, b) => this.props.distinctBy(a) === this.props.distinctBy(b))
            )
            .subscribe((value) => {
                this.setState(() => ({value}));
            });
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    render() {
        return (
            <this.props.component {...this.state.value} />
        );
    }
}

const Connect = ({
    context: Context,
    distinctBy,
    children,
}) => (
    <Context.Consumer>
        {({data$}) => (
            <Connector
                component={children}
                data$={data$}
                distinctBy={distinctBy}
            />
        )}
    </Context.Consumer>
);

Connect.propTypes = {
    context: PropTypes.object.isRequired,
    distinctBy: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.instanceOf(React.Component), PropTypes.func]).isRequired,
};

export default Connect;
