/// <reference types="react" />
import * as React from 'react';
import { Component } from 'react';
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
    constructor(props: Props, context: any);
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: Props): void;
    componentWillUnmount(): void;
    render(): React.ReactElement<any> | null;
    /**
     * Begins enter/exit animation
     *
     * @param  {Boolean}  isEnter
     * @param  {Boolean}  noForce
     * @return {void}
     */
    protected begin(isEnter?: boolean, noForce?: boolean): void;
    /**
     * Runs entering phases
     *
     * @return {void}
     */
    protected doEnter: () => void;
    /**
     * Runs exiting phases
     *
     * @return {void}
     */
    protected doExit: () => void;
    /**
     * Sets next phase and executes a callback when done
     *
     * @param {String}   phase
     * @param {Function} done
     * @param {Boolean}  force
     */
    protected setPhase: (phase: string, done?: Function | undefined, force?: boolean | undefined) => void;
}
export declare type CallbackType = (phaseDuration: number) => any;
export interface Props extends React.HTMLProps<AnimationAware> {
    children: React.ReactElement<any>;
    show: boolean;
    animateAppear?: boolean;
    keepMounted?: boolean;
    onMounted?: CallbackType;
    onEntering?: CallbackType;
    onEntered?: CallbackType;
    onExiting?: CallbackType;
    onExited?: CallbackType;
    onCompleted?: CallbackType;
}
export interface State {
    phase: string;
}
