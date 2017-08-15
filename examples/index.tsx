import * as React from 'react';
import { render } from 'react-dom';
import AnimationAware from '../src';
import './styles';

class ExampleComponent extends React.Component<any, any> {

    public state = {
        show: false,
    }

    public render() {
        const log = (...args: any[]) => {
            return console.log.bind(console, ...args);
        };

        return <div>
            <button onClick={this.toggle}>toggle</button>
            <AnimationAware
                show={this.state.show}
                animateAppear={false}
                keepMounted={false}
                onMounted={log('onMounted')}
                onEntering={log('onEntering')}
                onEntered={log('onEntered')}
                onExiting={log('onExiting')}
                onExited={log('onExited')}
                onCompleted={log('onCompleted')}
            >
                <p className="animatable" />
            </AnimationAware>
        </div>;
    }

    protected toggle = () => {
        this.setState({
            show: !this.state.show
        });
    }
}

render(<ExampleComponent />, document.getElementById('app'));