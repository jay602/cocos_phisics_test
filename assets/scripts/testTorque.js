// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const MAX_ANGLE_SPEED = 5 * Math.PI * 32 / 180;
const TORQUE_FORDE = 2000;

cc.Class({
    extends: cc.Component,

    properties: {
        stone: {
            default: null,
            type: cc.Node,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.left = false;
        this.right = false;
        this.torque = 0;
        this.body = this.node.getComponent(cc.RigidBody);
        cc.log("MAX_ANGLE_SPEED = %f", MAX_ANGLE_SPEED);

    },

    start () {

    },

    onKeyPressed: function(event) {
        switch(event.keyCode) {
            case cc.KEY.a:
                this.left = true;
                cc.log("press a");
                break;
            case cc.KEY.d:
                this.right = true;
                cc.log("press d");
                break;
        }
    },

    onKeyUp: function(event) {
        switch(event.keyCode) {
            case cc.KEY.a:
                this.left = false;
                cc.log("release a");
                break;
            case cc.KEY.d:
                this.right = false;
                cc.log("release d");
                break;
        }
    },

    update (dt) {
        this.torque = 0;
        if(this.left) this.torque = TORQUE_FORDE;
        if(this.right) this.torque = -TORQUE_FORDE;

        this.body.applyTorque(this.torque, true);

        let angularVelocity = this.body.angularVelocity;
        if(Math.abs(angularVelocity) > MAX_ANGLE_SPEED) {
            angularVelocity = Math.abs(angularVelocity) / angularVelocity * MAX_ANGLE_SPEED;
            this.body.angularVelocity = angularVelocity;
        }
    },
});
