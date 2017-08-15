import * as React from 'react';
import { Component, cloneElement, Children } from 'react';
import * as classnames from 'classnames';
import { getAnimationsData } from '@iotch/css-animations-helpers';

const MOUNTED   = 'MOUNTED';
const ENTERING  = 'ENTERING';
const ENTERED   = 'ENTERED';
const EXITING   = 'EXITING';
const EXITED    = 'EXITED';
const COMPLETED = 'COMPLETED';

/**
 * Component that mounts/unmounts its children depending
 * on CSS animation/transition duration
 */
export default class AnimationAware extends Component<Props, State> {

    /**
     * Element reference
     * @type {HTMLElement}
     */
    protected el: HTMLElement;

    /**
     * Current active timeout id
     * @type {mixed}
     */
    protected timeoutId: any;

    /**
     * @param  {Props}  props
     * @param  {Object} context
     * @return {void}
     */
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {
            phase: props.show ? ENTERED : COMPLETED,
        }
    }

    public componentDidMount() {
        const that = this;
        const props = that.props;
        if (props.show) {
            if (props.animateAppear) {
                that.begin(true, true);
            } else {
                const onEntered = props.onEntered;
                onEntered && onEntered(getTimeout(that.el));
            }
        }
    }

    public componentWillReceiveProps(nextProps: Props) {
        const nextShow = nextProps.show;
        if (this.props.show !== nextShow) {
            this.begin(nextShow);
        }
    }

    public componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    public render() {
        const that = this;
        const phase = that.state.phase;
        const { children, className, keepMounted } = that.props;
        const child = Children.only(children);

        if (phase === COMPLETED && !keepMounted) {
            return null;
        }

        return cloneElement(child, {
            ref: (el: any) => that.el = el,
            className: classnames(
                child.props.className,
                className,
                phase.toLowerCase()
            ),
        });
    }

    /**
     * Begins enter/exit animation
     *
     * @param  {Boolean}  isEnter
     * @param  {Boolean}  noForce
     * @return {void}
     */
    protected begin(isEnter?: boolean, noForce?: boolean) {
        const that = this;
        const currentPhase = that.state.phase;
        const { setPhase, doEnter, doExit } = that;

        if (isEnter) {
            // force required phase to start if phase is wrong
            if (currentPhase !== COMPLETED && noForce === false) {
                setPhase(COMPLETED, doEnter, true);
            } else {
                doEnter();
            }
        } else {
            if (currentPhase !== ENTERED && noForce === false) {
                setPhase(ENTERED, doExit, true);
            } else {
                doExit();
            }
        }
    }

    /**
     * Runs entering phases
     *
     * @return {void}
     */
    protected doEnter = () => {
        const setPhase = this.setPhase;
        setPhase(MOUNTED, () => setPhase(ENTERING, () => setPhase(ENTERED)));
    }

    /**
     * Runs exiting phases
     *
     * @return {void}
     */
    protected doExit = () => {
        const setPhase = this.setPhase;
        setPhase(EXITING, () => setPhase(EXITED, () => setPhase(COMPLETED)));
    }

    /**
     * Sets next phase and executes a callback when done
     *
     * @param {String}   phase
     * @param {Function} done
     * @param {Boolean}  force
     */
    protected setPhase = (phase: string, done?: Function, force?: boolean) => {
        const that = this;
        const userCallback
            = that.props['on' + phase.charAt(0) + phase.slice(1).toLowerCase()];

        // clear previous active timeout if any
        that.timeoutId && clearTimeout(that.timeoutId);

        that.setState({
            phase: phase
        }, function() {
            const timeout = force ? 0 : getTimeout(that.el);
            that.timeoutId = setTimeout(done, timeout);

            // user callbacks
            userCallback && userCallback(timeout);
        });
    }
}

export type CallbackType = (phaseDuration: number) => any;

export interface Props extends React.HTMLProps<AnimationAware> {
    children: React.ReactElement<any>,

    // element visibility
    show: boolean,

    // animate if element is visible by defalut
    animateAppear?: boolean,

    // keep element mounted on completed phase
    keepMounted?: boolean,

    // phases callbacks
    onMounted?: CallbackType,
    onEntering?: CallbackType,
    onEntered?: CallbackType,
    onExiting?: CallbackType,
    onExited?: CallbackType,
    onCompleted?: CallbackType,
}

export interface State {
    phase: string,
}

/**
 * Gets element's longest defined transition or
 * animation timeout (duration + delay)
 */
function getTimeout(element: HTMLElement) {
    if (!element) {
        return 0;
    }

    const data = getAnimationsData(element);
    const props = [data.animation, data.transition];
    const values: number[] = [];
    const baseProp = 'duration';

    for(let i = 0; i < props.length; i++) {
        const prop = props[i];
        for(let i = 0; i < prop[baseProp].length; i++) {
            values.push((prop[baseProp][i] || 0) + (prop['delay'][i] || 0));
        }
    }

    return Math.max.apply(Math, values);
}