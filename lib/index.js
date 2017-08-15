"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = require("react");
var classnames = require("classnames");
var css_animations_helpers_1 = require("@iotch/css-animations-helpers");
var MOUNTED = 'MOUNTED';
var ENTERING = 'ENTERING';
var ENTERED = 'ENTERED';
var EXITING = 'EXITING';
var EXITED = 'EXITED';
var COMPLETED = 'COMPLETED';
/**
 * Component that mounts/unmounts its children depending
 * on CSS animation/transition duration
 */
var AnimationAware = (function (_super) {
    tslib_1.__extends(AnimationAware, _super);
    /**
     * @param  {Props}  props
     * @param  {Object} context
     * @return {void}
     */
    function AnimationAware(props, context) {
        var _this = _super.call(this, props, context) || this;
        /**
         * Runs entering phases
         *
         * @return {void}
         */
        _this.doEnter = function () {
            var setPhase = _this.setPhase;
            setPhase(MOUNTED, function () { return setPhase(ENTERING, function () { return setPhase(ENTERED); }); });
        };
        /**
         * Runs exiting phases
         *
         * @return {void}
         */
        _this.doExit = function () {
            var setPhase = _this.setPhase;
            setPhase(EXITING, function () { return setPhase(EXITED, function () { return setPhase(COMPLETED); }); });
        };
        /**
         * Sets next phase and executes a callback when done
         *
         * @param {String}   phase
         * @param {Function} done
         * @param {Boolean}  force
         */
        _this.setPhase = function (phase, done, force) {
            var that = _this;
            var userCallback = that.props['on' + phase.charAt(0) + phase.slice(1).toLowerCase()];
            // clear previous active timeout if any
            that.timeoutId && clearTimeout(that.timeoutId);
            that.setState({
                phase: phase
            }, function () {
                var timeout = force ? 0 : getTimeout(that.el);
                that.timeoutId = setTimeout(done, timeout);
                // user callbacks
                userCallback && userCallback(timeout);
            });
        };
        _this.state = {
            phase: props.show ? ENTERED : COMPLETED,
        };
        return _this;
    }
    AnimationAware.prototype.componentDidMount = function () {
        var that = this;
        var props = that.props;
        if (props.show) {
            if (props.animateAppear) {
                that.begin(true, true);
            }
            else {
                var onEntered = props.onEntered;
                onEntered && onEntered(getTimeout(that.el));
            }
        }
    };
    AnimationAware.prototype.componentWillReceiveProps = function (nextProps) {
        var nextShow = nextProps.show;
        if (this.props.show !== nextShow) {
            this.begin(nextShow);
        }
    };
    AnimationAware.prototype.componentWillUnmount = function () {
        clearTimeout(this.timeoutId);
    };
    AnimationAware.prototype.render = function () {
        var that = this;
        var phase = that.state.phase;
        var _a = that.props, children = _a.children, className = _a.className, keepMounted = _a.keepMounted;
        var child = react_1.Children.only(children);
        if (phase === COMPLETED && !keepMounted) {
            return null;
        }
        return react_1.cloneElement(child, {
            ref: function (el) { return that.el = el; },
            className: classnames(child.props.className, className, phase.toLowerCase()),
        });
    };
    /**
     * Begins enter/exit animation
     *
     * @param  {Boolean}  isEnter
     * @param  {Boolean}  noForce
     * @return {void}
     */
    AnimationAware.prototype.begin = function (isEnter, noForce) {
        var that = this;
        var currentPhase = that.state.phase;
        var setPhase = that.setPhase, doEnter = that.doEnter, doExit = that.doExit;
        if (isEnter) {
            // force required phase to start if phase is wrong
            if (currentPhase !== COMPLETED && noForce === false) {
                setPhase(COMPLETED, doEnter, true);
            }
            else {
                doEnter();
            }
        }
        else {
            if (currentPhase !== ENTERED && noForce === false) {
                setPhase(ENTERED, doExit, true);
            }
            else {
                doExit();
            }
        }
    };
    return AnimationAware;
}(react_1.Component));
exports.default = AnimationAware;
/**
 * Gets element's longest defined transition or
 * animation timeout (duration + delay)
 */
function getTimeout(element) {
    if (!element) {
        return 0;
    }
    var data = css_animations_helpers_1.getAnimationsData(element);
    var props = [data.animation, data.transition];
    var values = [];
    var baseProp = 'duration';
    for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        for (var i_1 = 0; i_1 < prop[baseProp].length; i_1++) {
            values.push((prop[baseProp][i_1] || 0) + (prop['delay'][i_1] || 0));
        }
    }
    return Math.max.apply(Math, values);
}
