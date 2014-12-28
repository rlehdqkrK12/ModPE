var cm = clientMessage;

var sin, cos, tan, yaw, ns, we;
var bannedBlock = [8, 9, 79, 0];
var waterBlock = [8, 9];

var state = {
	smartMoving: true,
	run: false,
	fly: false,
	water: false,
	sneak: false
};
var doubleTouch = {
	onTick: 0,
	offTick: 0,
	axisSpeed: -1
};
var playerPos = new Vec3();
playerPos.speed = -1;
playerPos.compass = null;

function Vec3(x, y, z) {
	if (x === undefined) x = -1;
	if (y === undefined) y = -1;
	if (z === undefined) z = -1;
	this.x = x;
	this.y = y;
	this.z = z;
}
Vec3.createFromEntity = function(ent) {
	return new Vec3(Entity.getX(ent), Entity.getY(ent), Entity.getZ(ent));
};
Vec3.prototype = {};
Vec3.prototype.toString = function() {
	return "[" + [this.x, this.y, this.z].join(", ") + "]";
};
Vec3.prototype.toArray = function() {
	return [this.x, this.y, this.z];
};
Vec3.prototype.equals = function(vec3) {
	return this.x === vec3.x && this.y === vec3.y && this.z === vec3.z;
};
function getEntitySpeed(entity) {
	return Math.sqrt(Entity.getVelX(entity) * Entity.getVelX(entity) + Entity.getVelZ(entity) * Entity.getVelZ(entity));
}
function isBannedBlockUnder() {
	return bannedBlock.indexOf(Level.getTile(Player.getX(), Player.getY() - 2, Player.getZ())) > -1;
}
function makeFootprint(x, y, z) {
	if (x === undefined) x = Player.getX();
	if (y === undefined) y = Player.getY() - 2;
	if (z === undefined) z = Player.getZ();
	var temp = [Level.getTile(x, y, z), Level.getData(x, y, z)];
	Level.destroyBlock(x, y, z, false);
	Level.setTile(x, y, z, temp[0], temp[1]);
}

function modTick() {
	if (state.smartMoving) {
		state.fly = Player.isFlying();
		state.water = waterBlock.indexOf(Level.getTile(Player.getX(), Player.getY() - 1, Player.getZ())) > -1;
		playerPos.speed = getEntitySpeed(Player.getEntity());
		yaw = Entity.getYaw(Player.getEntity())+360;
		sin = -Math.sin(yaw / 180 * Math.PI);
		cos = Math.cos(yaw / 180 * Math.PI);
		ns = Entity.getVelX(Player.getEntity());
		we = Entity.getVelZ(Player.getEntity());
		ModPE.setFov(72 + playerPos.speed * 15);
		if (!state.fly) {
			/*if (playerPos.speed > 0.01){
				cm(playerPos.speed);
			}*/
			switch (doubleTouch.onTick) {
			case -1:
				if (playerPos.speed < 0.01) {
					doubleTouch.onTick = 0;
					doubleTouch.offTick = 0;
					playerPos.compass = null;
					state.run = false;
				}
				break;
			case 0:
				if (playerPos.speed > 0.03) {
					doubleTouch.onTick ++;
					doubleTouch.axisSpeed = playerPos.speed;
					if (ns > 0 && we > 0) {
						playerPos.compass = "1"
					}else if (ns < 0 && we < 0) {
						playerPos.compass = "2"
					}else if (ns < 0 && we > 0) {
						playerPos.compass = "3"
					}else if (ns > 0 && we < 0) {
						playerPos.compass = "4"
					}
				}
				break;
			case 1:
				if (doubleTouch.offTick > 15) {
					doubleTouch.onTick = -1;
					doubleTouch.offTick = 0;
				}
				if (playerPos.speed < doubleTouch.axisSpeed) {
					doubleTouch.onTick ++;
					doubleTouch.offTick = 0;
				}else {
					doubleTouch.offTick ++;
					doubleTouch.axisSpeed = playerPos.speed;
				}
				break;
			case 2:
				if (doubleTouch.offTick > 10) {
					doubleTouch.onTick = -1;
					doubleTouch.offTick = 0;
				}
				if (playerPos.speed > doubleTouch.axisSpeed) {
					doubleTouch.onTick ++;
					doubleTouch.offTick = 0;
					if (ns > 0 && we > 0) {
						playerPos.compass += "1"
					}else if (ns < 0 && we < 0) {
						playerPos.compass += "2"
					}else if (ns < 0 && we > 0) {
						playerPos.compass += "3"
					}else if (ns > 0 && we < 0) {
						playerPos.compass += "4"
					}
				}else {
					doubleTouch.offTick ++;
					doubleTouch.axisSpeed = playerPos.speed;
				}
				break;
			case 3: //touchImpact
				doubleTouch.onTick = 0;
				doubleTouch.offTick = 0;
				if (playerPos.compass == "11") {
					if (state.sneak) {
						state.sneak = false;
				    	Entity.setSneaking(Player.getEntity(), false);
					}else {
						if (playerPos.speed > 0.06) {
					    	state.run = true;
				     		doubleTouch.onTick = -1;
					    }
					}
				}else if (playerPos.compass == "22") {
					if (!state.sneak) {
						state.sneak = true;
				    	Entity.setSneaking(Player.getEntity(), true);
					}
				}else if (playerPos.compass == "33") {
					if (playerPos.speed > 0.06) {
					}else {
					}
				}else if (playerPos.compass == "44") {
					if (playerPos.speed > 0.06) {
					}else {
					}
				}
				break;
			}
			if (state.run && !state.water && !isBannedBlockUnder() && Entity.getVelY(Player.getEntity()) < 0.01) {
				Entity.setVelX(Player.getEntity(), ns*1.32);
				Entity.setVelZ(Player.getEntity(), we*1.32);
				//makeFootprint();
			}
		}else {
			doubleTouch.onTick = 0;
			doubleTouch.offTick = 0;
			state.run = false;
		}
	}
}
