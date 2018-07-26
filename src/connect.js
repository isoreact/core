import React from 'react';
import propTypes from 'prop-types';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import getValueNow from './get-value-now';
import hasValueNow from './has-value-now';

class Connector extends React.Component {
    static propTypes = {
        component: propTypes.oneOfType([propTypes.instanceOf(React.Component), propTypes.func]).isRequired,
        data$: propTypes.instanceOf(Observable).isRequired,
        distinctBy: propTypes.func,
        loadingProp: propTypes.string.isRequired,
    };

    static defaultProps = {
        distinctBy: (value) => value,
    };

    state = {
        [this.props.loadingProp]: !hasValueNow(this.props.data$),
        ...(hasValueNow(this.props.data$) ? getValueNow(this.props.data$) : {}),
    };

    componentDidMount() {
        this.subscription = this.props.data$
            .pipe(
                distinctUntilChanged((a, b) => this.props.distinctBy(a) === this.props.distinctBy(b))
            )
            .subscribe((data) => {
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
    distinctBy,
    children,
}) => (
    <Context.Consumer>
        {({data$, loadingProp}) => (
            <Connector
                component={children}
                data$={data$}
                distinctBy={distinctBy}
                loadingProp={loadingProp}
            />
        )}
    </Context.Consumer>
);

Connect.propTypes = {
    context: propTypes.object.isRequired,
    distinctBy: propTypes.func,
    children: propTypes.oneOfType([propTypes.instanceOf(React.Component), propTypes.func]).isRequired,
};

export default Connect;
