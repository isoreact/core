import React from 'react';
import propTypes from 'prop-types';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

class Connector extends React.Component {
    static propTypes = {
        component: propTypes.oneOfType([propTypes.instanceOf(React.Component), propTypes.func]).isRequired,
        data$: propTypes.instanceOf(Observable).isRequired,
        distinctBy: propTypes.func,
        name: propTypes.string,
        elementId: propTypes.string,
    };

    static defaultProps = {
        distinctBy: (value) => value,
    };

    constructor(props) {
        super(props);

        this.observer = (value) => {
            this.state = {value};
        };

        this.subscription = props
            .data$
            .pipe(
                distinctUntilChanged((a, b) => props.distinctBy(a) === props.distinctBy(b))
            )
            .subscribe((value) => {
                this.observer(value);
            });

        // The stream must produce an event immediately on subscription so we can render something.
        if (!this.state) {
            this.subscription.unsubscribe();
            this.subscription = undefined;

            const {name, elementId} = props;

            if (elementId) {
                console.error(
                    `Cannot hydrate isomorphic component "${name}" at DOM node "#${elementId}"`
                    + ' because the Observable returned by its getData() function does not produce'
                    + ' its first event to subscribers immediately.'
                );
            } else {
                console.error(
                    `Cannot render isomorphic component "${name}" because the Observable returned`
                    + ' by its getData() function does not produce its first event to subscribers'
                    + ' immediately.'
                );
            }
        }

        this.observer = () => {};
    }

    componentDidMount() {
        if (this.state) {
            this.observer = (value) => {
                this.setState({value});
            };

            if (!this.subscription) {
                this.subscription = this
                    .props
                    .data$
                    .pipe(
                        distinctUntilChanged((a, b) => this.props.distinctBy(a) === this.props.distinctBy(b))
                    )
                    .subscribe((value) => {
                        this.observer(value);
                    });
            }
        }
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }

    render() {
        return this.state
            ? <this.props.component {...this.state.value} />
            : null;
    }
}

const Connect = ({
    context: Context,
    distinctBy,
    children,
}) => (
    <Context.Consumer>
        {({data$, name, elementId}) => (
            <Connector
                component={children}
                {...{data$, distinctBy, name, elementId}}
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
