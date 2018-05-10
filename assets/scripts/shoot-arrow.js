// http://www.iforce2d.net/b2dtut/sticky-projectiles
// http://www.emanueleferonato.com/2012/12/14/box2d-flying-arrow-engine-first-attempt/

cc.Class({
    extends: cc.Component,

    properties: {
        arrow: {
            type: cc.Node,
            default: null
        }
    },

    onEnable: function () {
        cc.director.setClearColor( cc.hexToColor('#2f69d2') );
        
        var physicsManager =  cc.director.getPhysicsManager();
        physicsManager.enabled = true;
        physicsManager.enabledAccumulator = true;

        this.debugDrawFlags = cc.director.getPhysicsManager().debugDrawFlags;
        cc.director.getPhysicsManager().debugDrawFlags = 
            cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit
            ;
    },

    onDisable: function () {
        cc.director.getPhysicsManager().debugDrawFlags = this.debugDrawFlags;
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.arrowBodies = [];
    },

    onTouchBegan: function (event) {
        return; 
        let touchLoc = event.touch.getLocation();

        let node = cc.instantiate(this.arrow);
        node.active = true;

        let vec = cc.v2(touchLoc).sub(node.position);
        node.rotation = -Math.atan2(vec.y, vec.x) * 180 / Math.PI;
       
        cc.director.getScene().addChild(node);

        let distance =  vec.mag();
        let velocity =  vec.normalize().mulSelf(600);

        let arrowBody = node.getComponent(cc.RigidBody);
        arrowBody.linearVelocity = velocity;

        this.arrowBodies.push(arrowBody);

        cc.log("touch began: rotation=%f, distance=%f velocity(%f, %f)", node.rotation, distance, velocity.x, velocity.y);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        let dragConstant = 0.1;
        let arrowBodies = this.arrowBodies;
        for (let i = 0; i < arrowBodies.length; i++) {
            let arrowBody = arrowBodies[i];

            let velocity = arrowBody.linearVelocity;     //线性速度   
            let speed = velocity.mag();                  //速率
            cc.log("----------------------------------------------------------------------");
            cc.log("flying: velocity(%f, %f), speed=%f", velocity.x, velocity.y, speed);

            if (speed === 0) continue;
            let direction = velocity.normalize();       //线性速度归一化

            cc.log("direction(%f, %f)", direction.x, direction.y);

            let pointingDirection = arrowBody.getWorldVector( cc.v2( 1, 0 ) );
            let flightDirection = arrowBody.linearVelocity;
            let flightSpeed = flightDirection.mag();

            cc.log("pointingDirection(%f, %f)", pointingDirection.x, pointingDirection.y);
            cc.log("flightDirection(%f, %f)", flightDirection.x, flightDirection.y);
            cc.log("flightSpeed = %f", flightSpeed);

            flightDirection.normalizeSelf();    //线性速度归一化

            cc.log("flightDirection normalizeSelf = %f , ", flightDirection.x, flightDirection.y);
            
            let dot = cc.pDot( flightDirection, pointingDirection );    //向量点乘
            
            let dragForceMagnitude = (1 - Math.abs(dot)) * flightSpeed * flightSpeed * dragConstant * arrowBody.getMass();

            var force = flightDirection.mul(-dragForceMagnitude);      //阻力 
            let arrowTailPosition = arrowBody.getWorldPoint( cc.v2( -80, 0 ) );
            arrowBody.applyForce( force, arrowTailPosition, false );
            
            cc.log("dragForceMagnitude = %f", dragForceMagnitude);
            cc.log("dot = %f", dot);
            cc.log("mass = %f", arrowBody.getMass());
            cc.log("force(%f, %f)", force.x, force.y);
        }
    },
});
