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
const TORQUE_FORDE = 1500;

cc.Class({
    extends: cc.Component,

    properties: {
        button: {
            default: null,
            type: cc.Button,
        },

        stone: {
            default: null,
            type: cc.Node,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.throwed = false;
        this.stoneBody = null;
        this.torque = 0;
    },



    start () {

    },

    onTouchBegan: function(event) {
        if(!this.throwed) {
            this.throwed = true;
            let touchLoc = event.touch.getLocation();

            let vec = cc.v2(touchLoc).sub(this.stone.position);
            //this.stone.rotation = -Math.atan2(vec.y, vec.x) * 180 / Math.PI;

            let distance =  vec.mag();
            let velocity =  vec.normalize().mulSelf(600);

            this.stoneBody = this.stone.getComponent(cc.RigidBody);
            this.stoneBody.linearVelocity = velocity;
           // this.stoneBody.applyAngularImpulse();
           // cc.log("touch began: rotation=%f, distance=%f velocity(%f, %f)", this.stone.rotation, distance, velocity.x, velocity.y);
        }
    },

    update (dt) {
        let dragConstant = 0.001;
    
        if(this.stoneBody) {
            let velocity = this.stoneBody.linearVelocity;     //线性速度   
            let speed = velocity.mag();                  //速率
            let angularVelocity = this.stoneBody.angularVelocity;
            cc.log("----------------------------------------------------------------------");
            cc.log("flying: velocity(%f, %f), speed=%f angle=%f angularVelocity=%f", velocity.x, velocity.y, speed, angularVelocity);
            
            if (speed === 0) {
                this.stone.rotation = 0;
                this.throwed = false;
                this.torque = 0;
                return;
            }

            if( this.throwed ) { 
                this.torque = 0;
                if(velocity.x > 0) this.torque = -TORQUE_FORDE;
                if(velocity.x < 0) this.torque = TORQUE_FORDE;
                this.stoneBody.applyTorque(this.torque, true);

                let angularVelocity = this.stoneBody.angularVelocity;
                if(Math.abs(angularVelocity) > MAX_ANGLE_SPEED) {
                    angularVelocity = Math.abs(angularVelocity) / angularVelocity * MAX_ANGLE_SPEED;
                    this.stoneBody.angularVelocity = angularVelocity;
                }
            }
          
           
            return;
            let direction = velocity.normalize();       //线性速度归一化

            //cc.log("direction(%f, %f)", direction.x, direction.y);

            let pointingDirection = this.stoneBody.getWorldVector( cc.v2( 1, 0 ) );
            let flightDirection = this.stoneBody.linearVelocity;
            let flightSpeed = flightDirection.mag();


            if(velocity.x > 0) {
                this.torque = TORQUE;
            }else if(velocity.x < 0) {
                this.torque = -TORQUE;
            }

            // cc.log("pointingDirection(%f, %f)", pointingDirection.x, pointingDirection.y);
            // cc.log("flightDirection(%f, %f)", flightDirection.x, flightDirection.y);
            // cc.log("flightSpeed = %f", flightSpeed);

            flightDirection.normalizeSelf();    //线性速度归一化

            //cc.log("flightDirection normalizeSelf = %f , ", flightDirection.x, flightDirection.y);

            let dot = cc.pDot( flightDirection, pointingDirection );    //向量点乘
            
            let dragForceMagnitude = (1 - Math.abs(dot)) * flightSpeed * flightSpeed * dragConstant * this.stoneBody.getMass();

            var force = flightDirection.mul(-dragForceMagnitude);      //阻力 
           // let stoneCenterPosition = this.stoneBody.getWorldCenter ();
            //let stoneCenterPosition = this.stoneBody.getWorldPoint( cc.v2( 20, 0 ) );
           // this.stoneBody.applyForce( force, stoneCenterPosition, false );
            this.stoneBody.applyForceToCenter(force, false);

            // cc.log("dragForceMagnitude = %f", dragForceMagnitude);
            // cc.log("dot = %f", dot);
            // cc.log("mass = %f", this.stoneBody.getMass());
            // cc.log("force(%f, %f)", force.x, force.y);
        }
    },
});
