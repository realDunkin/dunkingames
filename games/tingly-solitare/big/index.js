/******************************************************************************

 * Spine Runtimes Software License

 * Version 2.3

 * 

 * Copyright (c) 2013-2015, Esoteric Software

 * All rights reserved.

 * 

 * You are granted a perpetual, non-exclusive, non-sublicensable and

 * non-transferable license to use, install, execute and perform the Spine

 * Runtimes Software (the "Software") and derivative works solely for personal

 * or internal use. Without the written permission of Esoteric Software (see

 * Section 2 of the Spine Software License Agreement), you may not (a) modify,

 * translate, adapt or otherwise create derivative works, improvements of the

 * Software or develop new applications using the Software or (b) remove,

 * delete, alter or obscure any trademarks or any copyright, trademark, patent

 * or other intellectual property or proprietary rights notices on or in the

 * Software, including any copy thereof. Redistributions in binary or source

 * form must include this license and terms.

 * 

 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE "AS IS" AND ANY EXPRESS OR

 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF

 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO

 * EVENT SHALL ESOTERIC SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,

 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,

 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;

 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,

 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR

 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF

 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 *****************************************************************************/



var spine = {

	radDeg: 180 / Math.PI,

	degRad: Math.PI / 180,

	temp: [],

    Float32Array: (typeof(Float32Array) === 'undefined') ? Array : Float32Array,

    Uint16Array: (typeof(Uint16Array) === 'undefined') ? Array : Uint16Array

};



spine.BoneData = function (name, parent) {

	this.name = name;

	this.parent = parent;

};

spine.BoneData.prototype = {

	length: 0,

	x: 0, y: 0,

	rotation: 0,

	scaleX: 1, scaleY: 1,

	inheritScale: true,

	inheritRotation: true,

	flipX: false, flipY: false

};



spine.BlendMode = {

	normal: 0,

	additive: 1,

	multiply: 2,

	screen: 3

};



spine.SlotData = function (name, boneData) {

	this.name = name;

	this.boneData = boneData;

};

spine.SlotData.prototype = {

	r: 1, g: 1, b: 1, a: 1,

	attachmentName: null,

	blendMode: spine.BlendMode.normal

};



spine.IkConstraintData = function (name) {

	this.name = name;

	this.bones = [];

};

spine.IkConstraintData.prototype = {

	target: null,

	bendDirection: 1,

	mix: 1

};



spine.Bone = function (boneData, skeleton, parent) {

	this.data = boneData;

	this.skeleton = skeleton;

	this.parent = parent;

	this.setToSetupPose();

};

spine.Bone.yDown = false;

spine.Bone.prototype = {

	x: 0, y: 0,

	rotation: 0, rotationIK: 0,

	scaleX: 1, scaleY: 1,

	flipX: false, flipY: false,

	m00: 0, m01: 0, worldX: 0, // a b x

	m10: 0, m11: 0, worldY: 0, // c d y

	worldRotation: 0,

	worldScaleX: 1, worldScaleY: 1,

	worldFlipX: false, worldFlipY: false,

	updateWorldTransform: function () {

		var parent = this.parent;

		if (parent) {

			this.worldX = this.x * parent.m00 + this.y * parent.m01 + parent.worldX;

			this.worldY = this.x * parent.m10 + this.y * parent.m11 + parent.worldY;

			if (this.data.inheritScale) {

				this.worldScaleX = parent.worldScaleX * this.scaleX;

				this.worldScaleY = parent.worldScaleY * this.scaleY;

			} else {

				this.worldScaleX = this.scaleX;

				this.worldScaleY = this.scaleY;

			}

			this.worldRotation = this.data.inheritRotation ? (parent.worldRotation + this.rotationIK) : this.rotationIK;

			this.worldFlipX = parent.worldFlipX != this.flipX;

			this.worldFlipY = parent.worldFlipY != this.flipY;

		} else {

			var skeletonFlipX = this.skeleton.flipX, skeletonFlipY = this.skeleton.flipY;

			this.worldX = skeletonFlipX ? -this.x : this.x;

			this.worldY = (skeletonFlipY != spine.Bone.yDown) ? -this.y : this.y;

			this.worldScaleX = this.scaleX;

			this.worldScaleY = this.scaleY;

			this.worldRotation = this.rotationIK;

			this.worldFlipX = skeletonFlipX != this.flipX;

			this.worldFlipY = skeletonFlipY != this.flipY;

		}

		var radians = this.worldRotation * spine.degRad;

		var cos = Math.cos(radians);

		var sin = Math.sin(radians);

		if (this.worldFlipX) {

			this.m00 = -cos * this.worldScaleX;

			this.m01 = sin * this.worldScaleY;

		} else {

			this.m00 = cos * this.worldScaleX;

			this.m01 = -sin * this.worldScaleY;

		}

		if (this.worldFlipY != spine.Bone.yDown) {

			this.m10 = -sin * this.worldScaleX;

			this.m11 = -cos * this.worldScaleY;

		} else {

			this.m10 = sin * this.worldScaleX;

			this.m11 = cos * this.worldScaleY;

		}

	},

	setToSetupPose: function () {

		var data = this.data;

		this.x = data.x;

		this.y = data.y;

		this.rotation = data.rotation;

		this.rotationIK = this.rotation;

		this.scaleX = data.scaleX;

		this.scaleY = data.scaleY;

		this.flipX = data.flipX;

		this.flipY = data.flipY;

	},

	worldToLocal: function (world) {

		var dx = world[0] - this.worldX, dy = world[1] - this.worldY;

		var m00 = this.m00, m10 = this.m10, m01 = this.m01, m11 = this.m11;

		if (this.worldFlipX != (this.worldFlipY != spine.Bone.yDown)) {

			m00 = -m00;

			m11 = -m11;

		}

		var invDet = 1 / (m00 * m11 - m01 * m10);

		world[0] = dx * m00 * invDet - dy * m01 * invDet;

		world[1] = dy * m11 * invDet - dx * m10 * invDet;

	},

	localToWorld: function (local) {

		var localX = local[0], localY = local[1];

		local[0] = localX * this.m00 + localY * this.m01 + this.worldX;

		local[1] = localX * this.m10 + localY * this.m11 + this.worldY;

	}

};



spine.Slot = function (slotData, bone) {

	this.data = slotData;

	this.bone = bone;

	this.setToSetupPose();

};

spine.Slot.prototype = {

	r: 1, g: 1, b: 1, a: 1,

	_attachmentTime: 0,

	attachment: null,

	attachmentVertices: [],

	setAttachment: function (attachment) {

		if (this.attachment == attachment) return;

		this.attachment = attachment;

		this._attachmentTime = this.bone.skeleton.time;

		this.attachmentVertices.length = 0;

	},

	setAttachmentTime: function (time) {

		this._attachmentTime = this.bone.skeleton.time - time;

	},

	getAttachmentTime: function () {

		return this.bone.skeleton.time - this._attachmentTime;

	},

	setToSetupPose: function () {

		var data = this.data;

		this.r = data.r;

		this.g = data.g;

		this.b = data.b;

		this.a = data.a;



		if (!data.attachmentName)

			this.setAttachment(null);

		else {

			var slotDatas = this.bone.skeleton.data.slots;

			for (var i = 0, n = slotDatas.length; i < n; i++) {

				if (slotDatas[i] == data) {

					this.attachment = null;

					this.setAttachment(this.bone.skeleton.getAttachmentBySlotIndex(i, data.attachmentName));

					break;

				}

			}

		}

	}

};



spine.IkConstraint = function (data, skeleton) {

	this.data = data;

	this.mix = data.mix;

	this.bendDirection = data.bendDirection;



	this.bones = [];

	for (var i = 0, n = data.bones.length; i < n; i++)

		this.bones.push(skeleton.findBone(data.bones[i].name));

	this.target = skeleton.findBone(data.target.name);

};

spine.IkConstraint.prototype = {

	apply: function () {

		var target = this.target;

		var bones = this.bones;

		switch (bones.length) {

		case 1:

			spine.IkConstraint.apply1(bones[0], target.worldX, target.worldY, this.mix);

			break;

		case 2:

			spine.IkConstraint.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.mix);

			break;

		}

	}

};

/** Adjusts the bone rotation so the tip is as close to the target position as possible. The target is specified in the world

 * coordinate system. */

spine.IkConstraint.apply1 = function (bone, targetX, targetY, alpha) {

	var parentRotation = (!bone.data.inheritRotation || !bone.parent) ? 0 : bone.parent.worldRotation;

	var rotation = bone.rotation;

	var rotationIK = Math.atan2(targetY - bone.worldY, targetX - bone.worldX) * spine.radDeg;

	if (bone.worldFlipX != (bone.worldFlipY != spine.Bone.yDown)) rotationIK = -rotationIK;

	rotationIK -= parentRotation;

	bone.rotationIK = rotation + (rotationIK - rotation) * alpha;

};

/** Adjusts the parent and child bone rotations so the tip of the child is as close to the target position as possible. The

 * target is specified in the world coordinate system.

 * @param child Any descendant bone of the parent. */

spine.IkConstraint.apply2 = function (parent, child, targetX, targetY, bendDirection, alpha) {

	var childRotation = child.rotation, parentRotation = parent.rotation;

	if (!alpha) {

		child.rotationIK = childRotation;

		parent.rotationIK = parentRotation;

		return;

	}

	var positionX, positionY, tempPosition = spine.temp;

	var parentParent = parent.parent;

	if (parentParent) {

		tempPosition[0] = targetX;

		tempPosition[1] = targetY;

		parentParent.worldToLocal(tempPosition);

		targetX = (tempPosition[0] - parent.x) * parentParent.worldScaleX;

		targetY = (tempPosition[1] - parent.y) * parentParent.worldScaleY;

	} else {

		targetX -= parent.x;

		targetY -= parent.y;

	}

	if (child.parent == parent) {

		positionX = child.x;

		positionY = child.y;

	} else {

		tempPosition[0] = child.x;

		tempPosition[1] = child.y;

		child.parent.localToWorld(tempPosition);

		parent.worldToLocal(tempPosition);

		positionX = tempPosition[0];

		positionY = tempPosition[1];

	}

	var childX = positionX * parent.worldScaleX, childY = positionY * parent.worldScaleY;

	var offset = Math.atan2(childY, childX);

	var len1 = Math.sqrt(childX * childX + childY * childY), len2 = child.data.length * child.worldScaleX;

	// Based on code by Ryan Juckett with permission: Copyright (c) 2008-2009 Ryan Juckett, http://www.ryanjuckett.com/

	var cosDenom = 2 * len1 * len2;

	if (cosDenom < 0.0001) {

		child.rotationIK = childRotation + (Math.atan2(targetY, targetX) * spine.radDeg - parentRotation - childRotation) * alpha;

		return;

	}

	var cos = (targetX * targetX + targetY * targetY - len1 * len1 - len2 * len2) / cosDenom;

	if (cos < -1)

		cos = -1;

	else if (cos > 1)

		cos = 1;

	var childAngle = Math.acos(cos) * bendDirection;

	var adjacent = len1 + len2 * cos, opposite = len2 * Math.sin(childAngle);

	var parentAngle = Math.atan2(targetY * adjacent - targetX * opposite, targetX * adjacent + targetY * opposite);

	var rotation = (parentAngle - offset) * spine.radDeg - parentRotation;

	if (rotation > 180)

		rotation -= 360;

	else if (rotation < -180) //

		rotation += 360;

	parent.rotationIK = parentRotation + rotation * alpha;

	rotation = (childAngle + offset) * spine.radDeg - childRotation;

	if (rotation > 180)

		rotation -= 360;

	else if (rotation < -180) //

		rotation += 360;

	child.rotationIK = childRotation + (rotation + parent.worldRotation - child.parent.worldRotation) * alpha;

};



spine.Skin = function (name) {

	this.name = name;

	this.attachments = {};

};

spine.Skin.prototype = {

	addAttachment: function (slotIndex, name, attachment) {

		this.attachments[slotIndex + ":" + name] = attachment;

	},

	getAttachment: function (slotIndex, name) {

		return this.attachments[slotIndex + ":" + name];

	},

	_attachAll: function (skeleton, oldSkin) {

		for (var key in oldSkin.attachments) {

			var colon = key.indexOf(":");

			var slotIndex = parseInt(key.substring(0, colon));

			var name = key.substring(colon + 1);

			var slot = skeleton.slots[slotIndex];

			if (slot.attachment && slot.attachment.name == name) {

				var attachment = this.getAttachment(slotIndex, name);

				if (attachment) slot.setAttachment(attachment);

			}

		}

	}

};



spine.Animation = function (name, timelines, duration) {

	this.name = name;

	this.timelines = timelines;

	this.duration = duration;

};

spine.Animation.prototype = {

	apply: function (skeleton, lastTime, time, loop, events) {

		if (loop && this.duration != 0) {

			time %= this.duration;

			lastTime %= this.duration;

		}

		var timelines = this.timelines;

		for (var i = 0, n = timelines.length; i < n; i++)

			timelines[i].apply(skeleton, lastTime, time, events, 1);

	},

	mix: function (skeleton, lastTime, time, loop, events, alpha) {

		if (loop && this.duration != 0) {

			time %= this.duration;

			lastTime %= this.duration;

		}

		var timelines = this.timelines;

		for (var i = 0, n = timelines.length; i < n; i++)

			timelines[i].apply(skeleton, lastTime, time, events, alpha);

	}

};

spine.Animation.binarySearch = function (values, target, step) {

	var low = 0;

	var high = Math.floor(values.length / step) - 2;

	if (!high) return step;

	var current = high >>> 1;

	while (true) {

		if (values[(current + 1) * step] <= target)

			low = current + 1;

		else

			high = current;

		if (low == high) return (low + 1) * step;

		current = (low + high) >>> 1;

	}

};

spine.Animation.binarySearch1 = function (values, target) {

	var low = 0;

	var high = values.length - 2;

	if (!high) return 1;

	var current = high >>> 1;

	while (true) {

		if (values[current + 1] <= target)

			low = current + 1;

		else

			high = current;

		if (low == high) return low + 1;

		current = (low + high) >>> 1;

	}

};

spine.Animation.linearSearch = function (values, target, step) {

	for (var i = 0, last = values.length - step; i <= last; i += step)

		if (values[i] > target) return i;

	return -1;

};



spine.Curves = function (frameCount) {

	this.curves = []; // type, x, y, ...

	//this.curves.length = (frameCount - 1) * 19/*BEZIER_SIZE*/;

};

spine.Curves.prototype = {

	setLinear: function (frameIndex) {

		this.curves[frameIndex * 19/*BEZIER_SIZE*/] = 0/*LINEAR*/;

	},

	setStepped: function (frameIndex) {

		this.curves[frameIndex * 19/*BEZIER_SIZE*/] = 1/*STEPPED*/;

	},

	/** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.

	 * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of

	 * the difference between the keyframe's values. */

	setCurve: function (frameIndex, cx1, cy1, cx2, cy2) {

		var subdiv1 = 1 / 10/*BEZIER_SEGMENTS*/, subdiv2 = subdiv1 * subdiv1, subdiv3 = subdiv2 * subdiv1;

		var pre1 = 3 * subdiv1, pre2 = 3 * subdiv2, pre4 = 6 * subdiv2, pre5 = 6 * subdiv3;

		var tmp1x = -cx1 * 2 + cx2, tmp1y = -cy1 * 2 + cy2, tmp2x = (cx1 - cx2) * 3 + 1, tmp2y = (cy1 - cy2) * 3 + 1;

		var dfx = cx1 * pre1 + tmp1x * pre2 + tmp2x * subdiv3, dfy = cy1 * pre1 + tmp1y * pre2 + tmp2y * subdiv3;

		var ddfx = tmp1x * pre4 + tmp2x * pre5, ddfy = tmp1y * pre4 + tmp2y * pre5;

		var dddfx = tmp2x * pre5, dddfy = tmp2y * pre5;



		var i = frameIndex * 19/*BEZIER_SIZE*/;

		var curves = this.curves;

		curves[i++] = 2/*BEZIER*/;

		

		var x = dfx, y = dfy;

		for (var n = i + 19/*BEZIER_SIZE*/ - 1; i < n; i += 2) {

			curves[i] = x;

			curves[i + 1] = y;

			dfx += ddfx;

			dfy += ddfy;

			ddfx += dddfx;

			ddfy += dddfy;

			x += dfx;

			y += dfy;

		}

	},

	getCurvePercent: function (frameIndex, percent) {

		percent = percent < 0 ? 0 : (percent > 1 ? 1 : percent);

		var curves = this.curves;

		var i = frameIndex * 19/*BEZIER_SIZE*/;

		var type = curves[i];

		if (type === 0/*LINEAR*/) return percent;

		if (type == 1/*STEPPED*/) return 0;

		i++;

		var x = 0;

		for (var start = i, n = i + 19/*BEZIER_SIZE*/ - 1; i < n; i += 2) {

			x = curves[i];

			if (x >= percent) {

				var prevX, prevY;

				if (i == start) {

					prevX = 0;

					prevY = 0;

				} else {

					prevX = curves[i - 2];

					prevY = curves[i - 1];

				}

				return prevY + (curves[i + 1] - prevY) * (percent - prevX) / (x - prevX);

			}

		}

		var y = curves[i - 1];

		return y + (1 - y) * (percent - x) / (1 - x); // Last point is 1,1.

	}

};



spine.RotateTimeline = function (frameCount) {

	this.curves = new spine.Curves(frameCount);

	this.frames = []; // time, angle, ...

	this.frames.length = frameCount * 2;

};

spine.RotateTimeline.prototype = {

	boneIndex: 0,

	getFrameCount: function () {

		return this.frames.length / 2;

	},

	setFrame: function (frameIndex, time, angle) {

		frameIndex *= 2;

		this.frames[frameIndex] = time;

		this.frames[frameIndex + 1] = angle;

	},

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		var frames = this.frames;

		if (time < frames[0]) return; // Time is before first frame.



		var bone = skeleton.bones[this.boneIndex];



		if (time >= frames[frames.length - 2]) { // Time is after last frame.

			var amount = bone.data.rotation + frames[frames.length - 1] - bone.rotation;

			while (amount > 180)

				amount -= 360;

			while (amount < -180)

				amount += 360;

			bone.rotation += amount * alpha;

			return;

		}



		// Interpolate between the previous frame and the current frame.

		var frameIndex = spine.Animation.binarySearch(frames, time, 2);

		var prevFrameValue = frames[frameIndex - 1];

		var frameTime = frames[frameIndex];

		var percent = 1 - (time - frameTime) / (frames[frameIndex - 2/*PREV_FRAME_TIME*/] - frameTime);

		percent = this.curves.getCurvePercent(frameIndex / 2 - 1, percent);



		var amount = frames[frameIndex + 1/*FRAME_VALUE*/] - prevFrameValue;

		while (amount > 180)

			amount -= 360;

		while (amount < -180)

			amount += 360;

		amount = bone.data.rotation + (prevFrameValue + amount * percent) - bone.rotation;

		while (amount > 180)

			amount -= 360;

		while (amount < -180)

			amount += 360;

		bone.rotation += amount * alpha;

	}

};



spine.TranslateTimeline = function (frameCount) {

	this.curves = new spine.Curves(frameCount);

	this.frames = []; // time, x, y, ...

	this.frames.length = frameCount * 3;

};

spine.TranslateTimeline.prototype = {

	boneIndex: 0,

	getFrameCount: function () {

		return this.frames.length / 3;

	},

	setFrame: function (frameIndex, time, x, y) {

		frameIndex *= 3;

		this.frames[frameIndex] = time;

		this.frames[frameIndex + 1] = x;

		this.frames[frameIndex + 2] = y;

	},

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		var frames = this.frames;

		if (time < frames[0]) return; // Time is before first frame.



		var bone = skeleton.bones[this.boneIndex];



		if (time >= frames[frames.length - 3]) { // Time is after last frame.

			bone.x += (bone.data.x + frames[frames.length - 2] - bone.x) * alpha;

			bone.y += (bone.data.y + frames[frames.length - 1] - bone.y) * alpha;

			return;

		}



		// Interpolate between the previous frame and the current frame.

		var frameIndex = spine.Animation.binarySearch(frames, time, 3);

		var prevFrameX = frames[frameIndex - 2];

		var prevFrameY = frames[frameIndex - 1];

		var frameTime = frames[frameIndex];

		var percent = 1 - (time - frameTime) / (frames[frameIndex + -3/*PREV_FRAME_TIME*/] - frameTime);

		percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);



		bone.x += (bone.data.x + prevFrameX + (frames[frameIndex + 1/*FRAME_X*/] - prevFrameX) * percent - bone.x) * alpha;

		bone.y += (bone.data.y + prevFrameY + (frames[frameIndex + 2/*FRAME_Y*/] - prevFrameY) * percent - bone.y) * alpha;

	}

};



spine.ScaleTimeline = function (frameCount) {

	this.curves = new spine.Curves(frameCount);

	this.frames = []; // time, x, y, ...

	this.frames.length = frameCount * 3;

};

spine.ScaleTimeline.prototype = {

	boneIndex: 0,

	getFrameCount: function () {

		return this.frames.length / 3;

	},

	setFrame: function (frameIndex, time, x, y) {

		frameIndex *= 3;

		this.frames[frameIndex] = time;

		this.frames[frameIndex + 1] = x;

		this.frames[frameIndex + 2] = y;

	},

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		var frames = this.frames;

		if (time < frames[0]) return; // Time is before first frame.



		var bone = skeleton.bones[this.boneIndex];



		if (time >= frames[frames.length - 3]) { // Time is after last frame.

			bone.scaleX += (bone.data.scaleX * frames[frames.length - 2] - bone.scaleX) * alpha;

			bone.scaleY += (bone.data.scaleY * frames[frames.length - 1] - bone.scaleY) * alpha;

			return;

		}



		// Interpolate between the previous frame and the current frame.

		var frameIndex = spine.Animation.binarySearch(frames, time, 3);

		var prevFrameX = frames[frameIndex - 2];

		var prevFrameY = frames[frameIndex - 1];

		var frameTime = frames[frameIndex];

		var percent = 1 - (time - frameTime) / (frames[frameIndex + -3/*PREV_FRAME_TIME*/] - frameTime);

		percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);



		bone.scaleX += (bone.data.scaleX * (prevFrameX + (frames[frameIndex + 1/*FRAME_X*/] - prevFrameX) * percent) - bone.scaleX) * alpha;

		bone.scaleY += (bone.data.scaleY * (prevFrameY + (frames[frameIndex + 2/*FRAME_Y*/] - prevFrameY) * percent) - bone.scaleY) * alpha;

	}

};



spine.ColorTimeline = function (frameCount) {

	this.curves = new spine.Curves(frameCount);

	this.frames = []; // time, r, g, b, a, ...

	this.frames.length = frameCount * 5;

};

spine.ColorTimeline.prototype = {

	slotIndex: 0,

	getFrameCount: function () {

		return this.frames.length / 5;

	},

	setFrame: function (frameIndex, time, r, g, b, a) {

		frameIndex *= 5;

		this.frames[frameIndex] = time;

		this.frames[frameIndex + 1] = r;

		this.frames[frameIndex + 2] = g;

		this.frames[frameIndex + 3] = b;

		this.frames[frameIndex + 4] = a;

	},

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		var frames = this.frames;

		if (time < frames[0]) return; // Time is before first frame.



		var r, g, b, a;

		if (time >= frames[frames.length - 5]) {

			// Time is after last frame.

			var i = frames.length - 1;

			r = frames[i - 3];

			g = frames[i - 2];

			b = frames[i - 1];

			a = frames[i];

		} else {

			// Interpolate between the previous frame and the current frame.

			var frameIndex = spine.Animation.binarySearch(frames, time, 5);

			var prevFrameR = frames[frameIndex - 4];

			var prevFrameG = frames[frameIndex - 3];

			var prevFrameB = frames[frameIndex - 2];

			var prevFrameA = frames[frameIndex - 1];

			var frameTime = frames[frameIndex];

			var percent = 1 - (time - frameTime) / (frames[frameIndex - 5/*PREV_FRAME_TIME*/] - frameTime);

			percent = this.curves.getCurvePercent(frameIndex / 5 - 1, percent);



			r = prevFrameR + (frames[frameIndex + 1/*FRAME_R*/] - prevFrameR) * percent;

			g = prevFrameG + (frames[frameIndex + 2/*FRAME_G*/] - prevFrameG) * percent;

			b = prevFrameB + (frames[frameIndex + 3/*FRAME_B*/] - prevFrameB) * percent;

			a = prevFrameA + (frames[frameIndex + 4/*FRAME_A*/] - prevFrameA) * percent;

		}

		var slot = skeleton.slots[this.slotIndex];

		if (alpha < 1) {

			slot.r += (r - slot.r) * alpha;

			slot.g += (g - slot.g) * alpha;

			slot.b += (b - slot.b) * alpha;

			slot.a += (a - slot.a) * alpha;

		} else {

			slot.r = r;

			slot.g = g;

			slot.b = b;

			slot.a = a;

		}

	}

};



spine.AttachmentTimeline = function (frameCount) {

	this.curves = new spine.Curves(frameCount);

	this.frames = []; // time, ...

	this.frames.length = frameCount;

	this.attachmentNames = [];

	this.attachmentNames.length = frameCount;

};

spine.AttachmentTimeline.prototype = {

	slotIndex: 0,

	getFrameCount: function () {

		return this.frames.length;

	},

	setFrame: function (frameIndex, time, attachmentName) {

		this.frames[frameIndex] = time;

		this.attachmentNames[frameIndex] = attachmentName;

	},

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		var frames = this.frames;

		if (time < frames[0]) {

			if (lastTime > time) this.apply(skeleton, lastTime, Number.MAX_VALUE, null, 0);

			return;

		} else if (lastTime > time) //

			lastTime = -1;



		var frameIndex = time >= frames[frames.length - 1] ? frames.length - 1 : spine.Animation.binarySearch1(frames, time) - 1;

		if (frames[frameIndex] < lastTime) return;



		var attachmentName = this.attachmentNames[frameIndex];

		skeleton.slots[this.slotIndex].setAttachment(

			!attachmentName ? null : skeleton.getAttachmentBySlotIndex(this.slotIndex, attachmentName));

	}

};



spine.EventTimeline = function (frameCount) {

	this.frames = []; // time, ...

	this.frames.length = frameCount;

	this.events = [];

	this.events.length = frameCount;

};

spine.EventTimeline.prototype = {

	getFrameCount: function () {

		return this.frames.length;

	},

	setFrame: function (frameIndex, time, event) {

		this.frames[frameIndex] = time;

		this.events[frameIndex] = event;

	},

	/** Fires events for frames > lastTime and <= time. */

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		if (!firedEvents) return;



		var frames = this.frames;

		var frameCount = frames.length;



		if (lastTime > time) { // Fire events after last time for looped animations.

			this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha);

			lastTime = -1;

		} else if (lastTime >= frames[frameCount - 1]) // Last time is after last frame.

			return;

		if (time < frames[0]) return; // Time is before first frame.



		var frameIndex;

		if (lastTime < frames[0])

			frameIndex = 0;

		else {

			frameIndex = spine.Animation.binarySearch1(frames, lastTime);

			var frame = frames[frameIndex];

			while (frameIndex > 0) { // Fire multiple events with the same frame.

				if (frames[frameIndex - 1] != frame) break;

				frameIndex--;

			}

		}

		var events = this.events;

		for (; frameIndex < frameCount && time >= frames[frameIndex]; frameIndex++)

			firedEvents.push(events[frameIndex]);

	}

};



spine.DrawOrderTimeline = function (frameCount) {

	this.frames = []; // time, ...

	this.frames.length = frameCount;

	this.drawOrders = [];

	this.drawOrders.length = frameCount;

};

spine.DrawOrderTimeline.prototype = {

	getFrameCount: function () {

		return this.frames.length;

	},

	setFrame: function (frameIndex, time, drawOrder) {

		this.frames[frameIndex] = time;

		this.drawOrders[frameIndex] = drawOrder;

	},

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		var frames = this.frames;

		if (time < frames[0]) return; // Time is before first frame.



		var frameIndex;

		if (time >= frames[frames.length - 1]) // Time is after last frame.

			frameIndex = frames.length - 1;

		else

			frameIndex = spine.Animation.binarySearch1(frames, time) - 1;



		var drawOrder = skeleton.drawOrder;

		var slots = skeleton.slots;

		var drawOrderToSetupIndex = this.drawOrders[frameIndex];

		if (!drawOrderToSetupIndex) {

			for (var i = 0, n = slots.length; i < n; i++)

				drawOrder[i] = slots[i];

		} else {

			for (var i = 0, n = drawOrderToSetupIndex.length; i < n; i++)

				drawOrder[i] = skeleton.slots[drawOrderToSetupIndex[i]];

		}



	}

};



spine.FfdTimeline = function (frameCount) {

	this.curves = new spine.Curves(frameCount);

	this.frames = [];

	this.frames.length = frameCount;

	this.frameVertices = [];

	this.frameVertices.length = frameCount;

};

spine.FfdTimeline.prototype = {

	slotIndex: 0,

	attachment: 0,

	getFrameCount: function () {

		return this.frames.length;

	},

	setFrame: function (frameIndex, time, vertices) {

		this.frames[frameIndex] = time;

		this.frameVertices[frameIndex] = vertices;

	},

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		var slot = skeleton.slots[this.slotIndex];

		if (slot.attachment != this.attachment) return;



		var frames = this.frames;

		if (time < frames[0]) return; // Time is before first frame.



		var frameVertices = this.frameVertices;

		var vertexCount = frameVertices[0].length;



		var vertices = slot.attachmentVertices;

		if (vertices.length != vertexCount) alpha = 1;

		vertices.length = vertexCount;



		if (time >= frames[frames.length - 1]) { // Time is after last frame.

			var lastVertices = frameVertices[frames.length - 1];

			if (alpha < 1) {

				for (var i = 0; i < vertexCount; i++)

					vertices[i] += (lastVertices[i] - vertices[i]) * alpha;

			} else {

				for (var i = 0; i < vertexCount; i++)

					vertices[i] = lastVertices[i];

			}

			return;

		}



		// Interpolate between the previous frame and the current frame.

		var frameIndex = spine.Animation.binarySearch1(frames, time);

		var frameTime = frames[frameIndex];

		var percent = 1 - (time - frameTime) / (frames[frameIndex - 1] - frameTime);

		percent = this.curves.getCurvePercent(frameIndex - 1, percent < 0 ? 0 : (percent > 1 ? 1 : percent));



		var prevVertices = frameVertices[frameIndex - 1];

		var nextVertices = frameVertices[frameIndex];



		if (alpha < 1) {

			for (var i = 0; i < vertexCount; i++) {

				var prev = prevVertices[i];

				vertices[i] += (prev + (nextVertices[i] - prev) * percent - vertices[i]) * alpha;

			}

		} else {

			for (var i = 0; i < vertexCount; i++) {

				var prev = prevVertices[i];

				vertices[i] = prev + (nextVertices[i] - prev) * percent;

			}

		}

	}

};



spine.IkConstraintTimeline = function (frameCount) {

	this.curves = new spine.Curves(frameCount);

	this.frames = []; // time, mix, bendDirection, ...

	this.frames.length = frameCount * 3;

};

spine.IkConstraintTimeline.prototype = {

	ikConstraintIndex: 0,

	getFrameCount: function () {

		return this.frames.length / 3;

	},

	setFrame: function (frameIndex, time, mix, bendDirection) {

		frameIndex *= 3;

		this.frames[frameIndex] = time;

		this.frames[frameIndex + 1] = mix;

		this.frames[frameIndex + 2] = bendDirection;

	},

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		var frames = this.frames;

		if (time < frames[0]) return; // Time is before first frame.



		var ikConstraint = skeleton.ikConstraints[this.ikConstraintIndex];



		if (time >= frames[frames.length - 3]) { // Time is after last frame.

			ikConstraint.mix += (frames[frames.length - 2] - ikConstraint.mix) * alpha;

			ikConstraint.bendDirection = frames[frames.length - 1];

			return;

		}



		// Interpolate between the previous frame and the current frame.

		var frameIndex = spine.Animation.binarySearch(frames, time, 3);

		var prevFrameMix = frames[frameIndex + -2/*PREV_FRAME_MIX*/];

		var frameTime = frames[frameIndex];

		var percent = 1 - (time - frameTime) / (frames[frameIndex + -3/*PREV_FRAME_TIME*/] - frameTime);

		percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);



		var mix = prevFrameMix + (frames[frameIndex + 1/*FRAME_MIX*/] - prevFrameMix) * percent;

		ikConstraint.mix += (mix - ikConstraint.mix) * alpha;

		ikConstraint.bendDirection = frames[frameIndex + -1/*PREV_FRAME_BEND_DIRECTION*/];

	}

};



spine.FlipXTimeline = function (frameCount) {

	this.curves = new spine.Curves(frameCount);

	this.frames = []; // time, flip, ...

	this.frames.length = frameCount * 2;

};

spine.FlipXTimeline.prototype = {

	boneIndex: 0,

	getFrameCount: function () {

		return this.frames.length / 2;

	},

	setFrame: function (frameIndex, time, flip) {

		frameIndex *= 2;

		this.frames[frameIndex] = time;

		this.frames[frameIndex + 1] = flip ? 1 : 0;

	},

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		var frames = this.frames;

		if (time < frames[0]) {

			if (lastTime > time) this.apply(skeleton, lastTime, Number.MAX_VALUE, null, 0);

			return;

		} else if (lastTime > time) //

			lastTime = -1;

		var frameIndex = (time >= frames[frames.length - 2] ? frames.length : spine.Animation.binarySearch(frames, time, 2)) - 2;

		if (frames[frameIndex] < lastTime) return;

		skeleton.bones[this.boneIndex].flipX = frames[frameIndex + 1] != 0;

	}

};



spine.FlipYTimeline = function (frameCount) {

	this.curves = new spine.Curves(frameCount);

	this.frames = []; // time, flip, ...

	this.frames.length = frameCount * 2;

};

spine.FlipYTimeline.prototype = {

	boneIndex: 0,

	getFrameCount: function () {

		return this.frames.length / 2;

	},

	setFrame: function (frameIndex, time, flip) {

		frameIndex *= 2;

		this.frames[frameIndex] = time;

		this.frames[frameIndex + 1] = flip ? 1 : 0;

	},

	apply: function (skeleton, lastTime, time, firedEvents, alpha) {

		var frames = this.frames;

		if (time < frames[0]) {

			if (lastTime > time) this.apply(skeleton, lastTime, Number.MAX_VALUE, null, 0);

			return;

		} else if (lastTime > time) //

			lastTime = -1;

		var frameIndex = (time >= frames[frames.length - 2] ? frames.length : spine.Animation.binarySearch(frames, time, 2)) - 2;

		if (frames[frameIndex] < lastTime) return;

		skeleton.bones[this.boneIndex].flipY = frames[frameIndex + 1] != 0;

	}

};



spine.SkeletonData = function () {

	this.bones = [];

	this.slots = [];

	this.skins = [];

	this.events = [];

	this.animations = [];

	this.ikConstraints = [];

};

spine.SkeletonData.prototype = {

	name: null,

	defaultSkin: null,

	width: 0, height: 0,

	version: null, hash: null,

	/** @return May be null. */

	findBone: function (boneName) {

		var bones = this.bones;

		for (var i = 0, n = bones.length; i < n; i++)

			if (bones[i].name == boneName) return bones[i];

		return null;

	},

	/** @return -1 if the bone was not found. */

	findBoneIndex: function (boneName) {

		var bones = this.bones;

		for (var i = 0, n = bones.length; i < n; i++)

			if (bones[i].name == boneName) return i;

		return -1;

	},

	/** @return May be null. */

	findSlot: function (slotName) {

		var slots = this.slots;

		for (var i = 0, n = slots.length; i < n; i++) {

			if (slots[i].name == slotName) return slot[i];

		}

		return null;

	},

	/** @return -1 if the bone was not found. */

	findSlotIndex: function (slotName) {

		var slots = this.slots;

		for (var i = 0, n = slots.length; i < n; i++)

			if (slots[i].name == slotName) return i;

		return -1;

	},

	/** @return May be null. */

	findSkin: function (skinName) {

		var skins = this.skins;

		for (var i = 0, n = skins.length; i < n; i++)

			if (skins[i].name == skinName) return skins[i];

		return null;

	},

	/** @return May be null. */

	findEvent: function (eventName) {

		var events = this.events;

		for (var i = 0, n = events.length; i < n; i++)

			if (events[i].name == eventName) return events[i];

		return null;

	},

	/** @return May be null. */

	findAnimation: function (animationName) {

		var animations = this.animations;

		for (var i = 0, n = animations.length; i < n; i++)

			if (animations[i].name == animationName) return animations[i];

		return null;

	},

	/** @return May be null. */

	findIkConstraint: function (ikConstraintName) {

		var ikConstraints = this.ikConstraints;

		for (var i = 0, n = ikConstraints.length; i < n; i++)

			if (ikConstraints[i].name == ikConstraintName) return ikConstraints[i];

		return null;

	}

};



spine.Skeleton = function (skeletonData) {

	this.data = skeletonData;



	this.bones = [];

	for (var i = 0, n = skeletonData.bones.length; i < n; i++) {

		var boneData = skeletonData.bones[i];

		var parent = !boneData.parent ? null : this.bones[skeletonData.bones.indexOf(boneData.parent)];

		this.bones.push(new spine.Bone(boneData, this, parent));

	}



	this.slots = [];

	this.drawOrder = [];

	for (var i = 0, n = skeletonData.slots.length; i < n; i++) {

		var slotData = skeletonData.slots[i];

		var bone = this.bones[skeletonData.bones.indexOf(slotData.boneData)];

		var slot = new spine.Slot(slotData, bone);

		this.slots.push(slot);

		this.drawOrder.push(slot);

	}

	

	this.ikConstraints = [];

	for (var i = 0, n = skeletonData.ikConstraints.length; i < n; i++)

		this.ikConstraints.push(new spine.IkConstraint(skeletonData.ikConstraints[i], this));



	this.boneCache = [];

	this.updateCache();

};

spine.Skeleton.prototype = {

	x: 0, y: 0,

	skin: null,

	r: 1, g: 1, b: 1, a: 1,

	time: 0,

	flipX: false, flipY: false,

	/** Caches information about bones and IK constraints. Must be called if bones or IK constraints are added or removed. */

	updateCache: function () {

		var ikConstraints = this.ikConstraints;

		var ikConstraintsCount = ikConstraints.length;



		var arrayCount = ikConstraintsCount + 1;

		var boneCache = this.boneCache;

		if (boneCache.length > arrayCount) boneCache.length = arrayCount;

		for (var i = 0, n = boneCache.length; i < n; i++)

			boneCache[i].length = 0;

		while (boneCache.length < arrayCount)

			boneCache[boneCache.length] = [];



		var nonIkBones = boneCache[0];

		var bones = this.bones;



		outer:

		for (var i = 0, n = bones.length; i < n; i++) {

			var bone = bones[i];

			var current = bone;

			do {

				for (var ii = 0; ii < ikConstraintsCount; ii++) {

					var ikConstraint = ikConstraints[ii];

					var parent = ikConstraint.bones[0];

					var child= ikConstraint.bones[ikConstraint.bones.length - 1];

					while (true) {

						if (current == child) {

							boneCache[ii].push(bone);

							boneCache[ii + 1].push(bone);

							continue outer;

						}

						if (child == parent) break;

						child = child.parent;

					}

				}

				current = current.parent;

			} while (current);

			nonIkBones[nonIkBones.length] = bone;

		}

	},

	/** Updates the world transform for each bone. */

	updateWorldTransform: function () {

		var bones = this.bones;

		for (var i = 0, n = bones.length; i < n; i++) {

			var bone = bones[i];

			bone.rotationIK = bone.rotation;

		}

		var i = 0, last = this.boneCache.length - 1;

		while (true) {

			var cacheBones = this.boneCache[i];

			for (var ii = 0, nn = cacheBones.length; ii < nn; ii++)

				cacheBones[ii].updateWorldTransform();

			if (i == last) break;

			this.ikConstraints[i].apply();

			i++;

		}

	},

	/** Sets the bones and slots to their setup pose values. */

	setToSetupPose: function () {

		this.setBonesToSetupPose();

		this.setSlotsToSetupPose();

	},

	setBonesToSetupPose: function () {

		var bones = this.bones;

		for (var i = 0, n = bones.length; i < n; i++)

			bones[i].setToSetupPose();



		var ikConstraints = this.ikConstraints;

		for (var i = 0, n = ikConstraints.length; i < n; i++) {

			var ikConstraint = ikConstraints[i];

			ikConstraint.bendDirection = ikConstraint.data.bendDirection;

			ikConstraint.mix = ikConstraint.data.mix;

		}

	},

	setSlotsToSetupPose: function () {

		var slots = this.slots;

		var drawOrder = this.drawOrder;

		for (var i = 0, n = slots.length; i < n; i++) {

			drawOrder[i] = slots[i];

			slots[i].setToSetupPose(i);

		}

	},

	/** @return May return null. */

	getRootBone: function () {

		return this.bones.length ? this.bones[0] : null;

	},

	/** @return May be null. */

	findBone: function (boneName) {

		var bones = this.bones;

		for (var i = 0, n = bones.length; i < n; i++)

			if (bones[i].data.name == boneName) return bones[i];

		return null;

	},

	/** @return -1 if the bone was not found. */

	findBoneIndex: function (boneName) {

		var bones = this.bones;

		for (var i = 0, n = bones.length; i < n; i++)

			if (bones[i].data.name == boneName) return i;

		return -1;

	},

	/** @return May be null. */

	findSlot: function (slotName) {

		var slots = this.slots;

		for (var i = 0, n = slots.length; i < n; i++)

			if (slots[i].data.name == slotName) return slots[i];

		return null;

	},

	/** @return -1 if the bone was not found. */

	findSlotIndex: function (slotName) {

		var slots = this.slots;

		for (var i = 0, n = slots.length; i < n; i++)

			if (slots[i].data.name == slotName) return i;

		return -1;

	},

	setSkinByName: function (skinName) {

		var skin = this.data.findSkin(skinName);

		if (!skin) throw "Skin not found: " + skinName;

		this.setSkin(skin);

	},

	/** Sets the skin used to look up attachments before looking in the {@link SkeletonData#getDefaultSkin() default skin}. 

	 * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was 

	 * no old skin, each slot's setup mode attachment is attached from the new skin.

	 * @param newSkin May be null. */

	setSkin: function (newSkin) {

		if (newSkin) {

			if (this.skin)

				newSkin._attachAll(this, this.skin);

			else {

				var slots = this.slots;

				for (var i = 0, n = slots.length; i < n; i++) {

					var slot = slots[i];

					var name = slot.data.attachmentName;

					if (name) {

						var attachment = newSkin.getAttachment(i, name);

						if (attachment) slot.setAttachment(attachment);

					}

				}

			}

		}

		this.skin = newSkin;

	},

	/** @return May be null. */

	getAttachmentBySlotName: function (slotName, attachmentName) {

		return this.getAttachmentBySlotIndex(this.data.findSlotIndex(slotName), attachmentName);

	},

	/** @return May be null. */

	getAttachmentBySlotIndex: function (slotIndex, attachmentName) {

		if (this.skin) {

			var attachment = this.skin.getAttachment(slotIndex, attachmentName);

			if (attachment) return attachment;

		}

		if (this.data.defaultSkin) return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);

		return null;

	},

	/** @param attachmentName May be null. */

	setAttachment: function (slotName, attachmentName) {

		var slots = this.slots;

		for (var i = 0, n = slots.length; i < n; i++) {

			var slot = slots[i];

			if (slot.data.name == slotName) {

				var attachment = null;

				if (attachmentName) {

					attachment = this.getAttachmentBySlotIndex(i, attachmentName);

					if (!attachment) throw "Attachment not found: " + attachmentName + ", for slot: " + slotName;

				}

				slot.setAttachment(attachment);

				return;

			}

		}

		throw "Slot not found: " + slotName;

	},

	/** @return May be null. */

	findIkConstraint: function (ikConstraintName) {

		var ikConstraints = this.ikConstraints;

		for (var i = 0, n = ikConstraints.length; i < n; i++)

			if (ikConstraints[i].data.name == ikConstraintName) return ikConstraints[i];

		return null;

	},

	update: function (delta) {

		this.time += delta;

	}

};



spine.EventData = function (name) {

	this.name = name;

};

spine.EventData.prototype = {

	intValue: 0,

	floatValue: 0,

	stringValue: null

};



spine.Event = function (data) {

	this.data = data;

};

spine.Event.prototype = {

	intValue: 0,

	floatValue: 0,

	stringValue: null

};



spine.AttachmentType = {

	region: 0,

	boundingbox: 1,

	mesh: 2,

	skinnedmesh: 3

};



spine.RegionAttachment = function (name) {

	this.name = name;

	this.offset = [];

	this.offset.length = 8;

	this.uvs = [];

	this.uvs.length = 8;

};

spine.RegionAttachment.prototype = {

	type: spine.AttachmentType.region,

	x: 0, y: 0,

	rotation: 0,

	scaleX: 1, scaleY: 1,

	width: 0, height: 0,

	r: 1, g: 1, b: 1, a: 1,

	path: null,

	rendererObject: null,

	regionOffsetX: 0, regionOffsetY: 0,

	regionWidth: 0, regionHeight: 0,

	regionOriginalWidth: 0, regionOriginalHeight: 0,

	setUVs: function (u, v, u2, v2, rotate) {

		var uvs = this.uvs;

		if (rotate) {

			uvs[2/*X2*/] = u;

			uvs[3/*Y2*/] = v2;

			uvs[4/*X3*/] = u;

			uvs[5/*Y3*/] = v;

			uvs[6/*X4*/] = u2;

			uvs[7/*Y4*/] = v;

			uvs[0/*X1*/] = u2;

			uvs[1/*Y1*/] = v2;

		} else {

			uvs[0/*X1*/] = u;

			uvs[1/*Y1*/] = v2;

			uvs[2/*X2*/] = u;

			uvs[3/*Y2*/] = v;

			uvs[4/*X3*/] = u2;

			uvs[5/*Y3*/] = v;

			uvs[6/*X4*/] = u2;

			uvs[7/*Y4*/] = v2;

		}

	},

	updateOffset: function () {

		var regionScaleX = this.width / this.regionOriginalWidth * this.scaleX;

		var regionScaleY = this.height / this.regionOriginalHeight * this.scaleY;

		var localX = -this.width / 2 * this.scaleX + this.regionOffsetX * regionScaleX;

		var localY = -this.height / 2 * this.scaleY + this.regionOffsetY * regionScaleY;

		var localX2 = localX + this.regionWidth * regionScaleX;

		var localY2 = localY + this.regionHeight * regionScaleY;

		var radians = this.rotation * spine.degRad;

		var cos = Math.cos(radians);

		var sin = Math.sin(radians);

		var localXCos = localX * cos + this.x;

		var localXSin = localX * sin;

		var localYCos = localY * cos + this.y;

		var localYSin = localY * sin;

		var localX2Cos = localX2 * cos + this.x;

		var localX2Sin = localX2 * sin;

		var localY2Cos = localY2 * cos + this.y;

		var localY2Sin = localY2 * sin;

		var offset = this.offset;

		offset[0/*X1*/] = localXCos - localYSin;

		offset[1/*Y1*/] = localYCos + localXSin;

		offset[2/*X2*/] = localXCos - localY2Sin;

		offset[3/*Y2*/] = localY2Cos + localXSin;

		offset[4/*X3*/] = localX2Cos - localY2Sin;

		offset[5/*Y3*/] = localY2Cos + localX2Sin;

		offset[6/*X4*/] = localX2Cos - localYSin;

		offset[7/*Y4*/] = localYCos + localX2Sin;

	},

	computeVertices: function (x, y, bone, vertices) {

		x += bone.worldX;

		y += bone.worldY;

		var m00 = bone.m00, m01 = bone.m01, m10 = bone.m10, m11 = bone.m11;

		var offset = this.offset;

		vertices[0/*X1*/] = offset[0/*X1*/] * m00 + offset[1/*Y1*/] * m01 + x;

		vertices[1/*Y1*/] = offset[0/*X1*/] * m10 + offset[1/*Y1*/] * m11 + y;

		vertices[2/*X2*/] = offset[2/*X2*/] * m00 + offset[3/*Y2*/] * m01 + x;

		vertices[3/*Y2*/] = offset[2/*X2*/] * m10 + offset[3/*Y2*/] * m11 + y;

		vertices[4/*X3*/] = offset[4/*X3*/] * m00 + offset[5/*X3*/] * m01 + x;

		vertices[5/*X3*/] = offset[4/*X3*/] * m10 + offset[5/*X3*/] * m11 + y;

		vertices[6/*X4*/] = offset[6/*X4*/] * m00 + offset[7/*Y4*/] * m01 + x;

		vertices[7/*Y4*/] = offset[6/*X4*/] * m10 + offset[7/*Y4*/] * m11 + y;

	}

};



spine.MeshAttachment = function (name) {

	this.name = name;

};

spine.MeshAttachment.prototype = {

	type: spine.AttachmentType.mesh,

	vertices: null,

	uvs: null,

	regionUVs: null,

	triangles: null,

	hullLength: 0,

	r: 1, g: 1, b: 1, a: 1,

	path: null,

	rendererObject: null,

	regionU: 0, regionV: 0, regionU2: 0, regionV2: 0, regionRotate: false,

	regionOffsetX: 0, regionOffsetY: 0,

	regionWidth: 0, regionHeight: 0,

	regionOriginalWidth: 0, regionOriginalHeight: 0,

	edges: null,

	width: 0, height: 0,

	updateUVs: function () {

		var width = this.regionU2 - this.regionU, height = this.regionV2 - this.regionV;

		var n = this.regionUVs.length;

		if (!this.uvs || this.uvs.length != n) {

            this.uvs = new spine.Float32Array(n);

		}

		if (this.regionRotate) {

			for (var i = 0; i < n; i += 2) {

                this.uvs[i] = this.regionU + this.regionUVs[i + 1] * width;

                this.uvs[i + 1] = this.regionV + height - this.regionUVs[i] * height;

			}

		} else {

			for (var i = 0; i < n; i += 2) {

                this.uvs[i] = this.regionU + this.regionUVs[i] * width;

                this.uvs[i + 1] = this.regionV + this.regionUVs[i + 1] * height;

			}

		}

	},

	computeWorldVertices: function (x, y, slot, worldVertices) {

		var bone = slot.bone;

		x += bone.worldX;

		y += bone.worldY;

		var m00 = bone.m00, m01 = bone.m01, m10 = bone.m10, m11 = bone.m11;

		var vertices = this.vertices;

		var verticesCount = vertices.length;

		if (slot.attachmentVertices.length == verticesCount) vertices = slot.attachmentVertices;

		for (var i = 0; i < verticesCount; i += 2) {

			var vx = vertices[i];

			var vy = vertices[i + 1];

			worldVertices[i] = vx * m00 + vy * m01 + x;

			worldVertices[i + 1] = vx * m10 + vy * m11 + y;

		}

	}

};



spine.SkinnedMeshAttachment = function (name) {

	this.name = name;

};

spine.SkinnedMeshAttachment.prototype = {

	type: spine.AttachmentType.skinnedmesh,

	bones: null,

	weights: null,

	uvs: null,

	regionUVs: null,

	triangles: null,

	hullLength: 0,

	r: 1, g: 1, b: 1, a: 1,

	path: null,

	rendererObject: null,

	regionU: 0, regionV: 0, regionU2: 0, regionV2: 0, regionRotate: false,

	regionOffsetX: 0, regionOffsetY: 0,

	regionWidth: 0, regionHeight: 0,

	regionOriginalWidth: 0, regionOriginalHeight: 0,

	edges: null,

	width: 0, height: 0,

	updateUVs: function (u, v, u2, v2, rotate) {

		var width = this.regionU2 - this.regionU, height = this.regionV2 - this.regionV;

		var n = this.regionUVs.length;

		if (!this.uvs || this.uvs.length != n) {

            this.uvs = new spine.Float32Array(n);

		}

		if (this.regionRotate) {

			for (var i = 0; i < n; i += 2) {

                this.uvs[i] = this.regionU + this.regionUVs[i + 1] * width;

                this.uvs[i + 1] = this.regionV + height - this.regionUVs[i] * height;

			}

		} else {

			for (var i = 0; i < n; i += 2) {

                this.uvs[i] = this.regionU + this.regionUVs[i] * width;

                this.uvs[i + 1] = this.regionV + this.regionUVs[i + 1] * height;

			}

		}

	},

	computeWorldVertices: function (x, y, slot, worldVertices) {

		var skeletonBones = slot.bone.skeleton.bones;

		var weights = this.weights;

		var bones = this.bones;



		var w = 0, v = 0, b = 0, f = 0, n = bones.length, nn;

		var wx, wy, bone, vx, vy, weight;

		if (!slot.attachmentVertices.length) {

			for (; v < n; w += 2) {

				wx = 0;

				wy = 0;

				nn = bones[v++] + v;

				for (; v < nn; v++, b += 3) {

					bone = skeletonBones[bones[v]];

					vx = weights[b];

					vy = weights[b + 1];

					weight = weights[b + 2];

					wx += (vx * bone.m00 + vy * bone.m01 + bone.worldX) * weight;

					wy += (vx * bone.m10 + vy * bone.m11 + bone.worldY) * weight;

				}

				worldVertices[w] = wx + x;

				worldVertices[w + 1] = wy + y;

			}

		} else {

			var ffd = slot.attachmentVertices;

			for (; v < n; w += 2) {

				wx = 0;

				wy = 0;

				nn = bones[v++] + v;

				for (; v < nn; v++, b += 3, f += 2) {

					bone = skeletonBones[bones[v]];

					vx = weights[b] + ffd[f];

					vy = weights[b + 1] + ffd[f + 1];

					weight = weights[b + 2];

					wx += (vx * bone.m00 + vy * bone.m01 + bone.worldX) * weight;

					wy += (vx * bone.m10 + vy * bone.m11 + bone.worldY) * weight;

				}

				worldVertices[w] = wx + x;

				worldVertices[w + 1] = wy + y;

			}

		}

	}

};



spine.BoundingBoxAttachment = function (name) {

	this.name = name;

	this.vertices = [];

};

spine.BoundingBoxAttachment.prototype = {

	type: spine.AttachmentType.boundingbox,

	computeWorldVertices: function (x, y, bone, worldVertices) {

		x += bone.worldX;

		y += bone.worldY;

		var m00 = bone.m00, m01 = bone.m01, m10 = bone.m10, m11 = bone.m11;

		var vertices = this.vertices;

		for (var i = 0, n = vertices.length; i < n; i += 2) {

			var px = vertices[i];

			var py = vertices[i + 1];

			worldVertices[i] = px * m00 + py * m01 + x;

			worldVertices[i + 1] = px * m10 + py * m11 + y;

		}

	}

};



spine.AnimationStateData = function (skeletonData) {

	this.skeletonData = skeletonData;

	this.animationToMixTime = {};

};

spine.AnimationStateData.prototype = {

	defaultMix: 0,

	setMixByName: function (fromName, toName, duration) {

		var from = this.skeletonData.findAnimation(fromName);

		if (!from) throw "Animation not found: " + fromName;

		var to = this.skeletonData.findAnimation(toName);

		if (!to) throw "Animation not found: " + toName;

		this.setMix(from, to, duration);

	},

	setMix: function (from, to, duration) {

		this.animationToMixTime[from.name + ":" + to.name] = duration;

	},

	getMix: function (from, to) {

		var key = from.name + ":" + to.name;

		return this.animationToMixTime.hasOwnProperty(key) ? this.animationToMixTime[key] : this.defaultMix;

	}

};



spine.TrackEntry = function () {};

spine.TrackEntry.prototype = {

	next: null, previous: null,

	animation: null,

	loop: false,

	delay: 0, time: 0, lastTime: -1, endTime: 0,

	timeScale: 1,

	mixTime: 0, mixDuration: 0, mix: 1,

	onStart: null, onEnd: null, onComplete: null, onEvent: null

};



spine.AnimationState = function (stateData) {

	this.data = stateData;

	this.tracks = [];

	this.events = [];

};

spine.AnimationState.prototype = {

	onStart: null,

	onEnd: null,

	onComplete: null,

	onEvent: null,

	timeScale: 1,

	update: function (delta) {

		delta *= this.timeScale;

		for (var i = 0; i < this.tracks.length; i++) {

			var current = this.tracks[i];

			if (!current) continue;



			current.time += delta * current.timeScale;

			if (current.previous) {

				var previousDelta = delta * current.previous.timeScale;

				current.previous.time += previousDelta;

				current.mixTime += previousDelta;

			}



			var next = current.next;

			if (next) {

				next.time = current.lastTime - next.delay;

				if (next.time >= 0) this.setCurrent(i, next);

			} else {

				// End non-looping animation when it reaches its end time and there is no next entry.

				if (!current.loop && current.lastTime >= current.endTime) this.clearTrack(i);

			}

		}

	},

	apply: function (skeleton) {

		for (var i = 0; i < this.tracks.length; i++) {

			var current = this.tracks[i];

			if (!current) continue;



			this.events.length = 0;



			var time = current.time;

			var lastTime = current.lastTime;

			var endTime = current.endTime;

			var loop = current.loop;

			if (!loop && time > endTime) time = endTime;



			var previous = current.previous;

			if (!previous) {

				if (current.mix == 1)

					current.animation.apply(skeleton, current.lastTime, time, loop, this.events);

				else

					current.animation.mix(skeleton, current.lastTime, time, loop, this.events, current.mix);

			} else {

				var previousTime = previous.time;

				if (!previous.loop && previousTime > previous.endTime) previousTime = previous.endTime;

				previous.animation.apply(skeleton, previousTime, previousTime, previous.loop, null);



				var alpha = current.mixTime / current.mixDuration * current.mix;

				if (alpha >= 1) {

					alpha = 1;

					current.previous = null;

				}

				current.animation.mix(skeleton, current.lastTime, time, loop, this.events, alpha);

			}



			for (var ii = 0, nn = this.events.length; ii < nn; ii++) {

				var event = this.events[ii];

				if (current.onEvent) current.onEvent(i, event);

				if (this.onEvent) this.onEvent(i, event);

			}



			// Check if completed the animation or a loop iteration.

			if (loop ? (lastTime % endTime > time % endTime) : (lastTime < endTime && time >= endTime)) {

				var count = Math.floor(time / endTime);

				if (current.onComplete) current.onComplete(i, count);

				if (this.onComplete) this.onComplete(i, count);

			}



			current.lastTime = current.time;

		}

	},

	clearTracks: function () {

		for (var i = 0, n = this.tracks.length; i < n; i++)

			this.clearTrack(i);

		this.tracks.length = 0; 

	},

	clearTrack: function (trackIndex) {

		if (trackIndex >= this.tracks.length) return;

		var current = this.tracks[trackIndex];

		if (!current) return;



		if (current.onEnd) current.onEnd(trackIndex);

		if (this.onEnd) this.onEnd(trackIndex);



		this.tracks[trackIndex] = null;

	},

	_expandToIndex: function (index) {

		if (index < this.tracks.length) return this.tracks[index];

		while (index >= this.tracks.length)

			this.tracks.push(null);

		return null;

	},

	setCurrent: function (index, entry) {

		var current = this._expandToIndex(index);

		if (current) {

			var previous = current.previous;

			current.previous = null;



			if (current.onEnd) current.onEnd(index);

			if (this.onEnd) this.onEnd(index);



			entry.mixDuration = this.data.getMix(current.animation, entry.animation);

			if (entry.mixDuration > 0) {

				entry.mixTime = 0;

				// If a mix is in progress, mix from the closest animation.

				if (previous && current.mixTime / current.mixDuration < 0.5)

					entry.previous = previous;

				else

					entry.previous = current;

			}

		}



		this.tracks[index] = entry;



		if (entry.onStart) entry.onStart(index);

		if (this.onStart) this.onStart(index);

	},

	setAnimationByName: function (trackIndex, animationName, loop) {

		var animation = this.data.skeletonData.findAnimation(animationName);

		if (!animation) throw "Animation not found: " + animationName;

		return this.setAnimation(trackIndex, animation, loop);

	},

	/** Set the current animation. Any queued animations are cleared. */

	setAnimation: function (trackIndex, animation, loop) {

		var entry = new spine.TrackEntry();

		entry.animation = animation;

		entry.loop = loop;

		entry.endTime = animation.duration;

		this.setCurrent(trackIndex, entry);

		return entry;

	},

	addAnimationByName: function (trackIndex, animationName, loop, delay) {

		var animation = this.data.skeletonData.findAnimation(animationName);

		if (!animation) throw "Animation not found: " + animationName;

		return this.addAnimation(trackIndex, animation, loop, delay);

	},

	/** Adds an animation to be played delay seconds after the current or last queued animation.

	 * @param delay May be <= 0 to use duration of previous animation minus any mix duration plus the negative delay. */

	addAnimation: function (trackIndex, animation, loop, delay) {

		var entry = new spine.TrackEntry();

		entry.animation = animation;

		entry.loop = loop;

		entry.endTime = animation.duration;



		var last = this._expandToIndex(trackIndex);

		if (last) {

			while (last.next)

				last = last.next;

			last.next = entry;

		} else

			this.tracks[trackIndex] = entry;



		if (delay <= 0) {

			if (last)

				delay += last.endTime - this.data.getMix(last.animation, animation);

			else

				delay = 0;

		}

		entry.delay = delay;



		return entry;

	},

	/** May be null. */

	getCurrent: function (trackIndex) {

		if (trackIndex >= this.tracks.length) return null;

		return this.tracks[trackIndex];

	}

};



spine.SkeletonJson = function (attachmentLoader) {

	this.attachmentLoader = attachmentLoader;

};

spine.SkeletonJson.prototype = {

	scale: 1,

	readSkeletonData: function (root, name) {

		var skeletonData = new spine.SkeletonData();

		skeletonData.name = name;



		// Skeleton.

		var skeletonMap = root["skeleton"];

		if (skeletonMap) {

			skeletonData.hash = skeletonMap["hash"];

			skeletonData.version = skeletonMap["spine"];

			skeletonData.width = skeletonMap["width"] || 0;

			skeletonData.height = skeletonMap["height"] || 0;

		}



		// Bones.

		var bones = root["bones"];

		for (var i = 0, n = bones.length; i < n; i++) {

			var boneMap = bones[i];

			var parent = null;

			if (boneMap["parent"]) {

				parent = skeletonData.findBone(boneMap["parent"]);

				if (!parent) throw "Parent bone not found: " + boneMap["parent"];

			}

			var boneData = new spine.BoneData(boneMap["name"], parent);

			boneData.length = (boneMap["length"] || 0) * this.scale;

			boneData.x = (boneMap["x"] || 0) * this.scale;

			boneData.y = (boneMap["y"] || 0) * this.scale;

			boneData.rotation = (boneMap["rotation"] || 0);

			boneData.scaleX = boneMap.hasOwnProperty("scaleX") ? boneMap["scaleX"] : 1;

			boneData.scaleY = boneMap.hasOwnProperty("scaleY") ? boneMap["scaleY"] : 1;

			boneData.inheritScale = boneMap.hasOwnProperty("inheritScale") ? boneMap["inheritScale"] : true;

			boneData.inheritRotation = boneMap.hasOwnProperty("inheritRotation") ? boneMap["inheritRotation"] : true;

			skeletonData.bones.push(boneData);

		}



		// IK constraints.

		var ik = root["ik"];

		if (ik) {

			for (var i = 0, n = ik.length; i < n; i++) {

				var ikMap = ik[i];

				var ikConstraintData = new spine.IkConstraintData(ikMap["name"]);



				var bones = ikMap["bones"];

				for (var ii = 0, nn = bones.length; ii < nn; ii++) {

					var bone = skeletonData.findBone(bones[ii]);

					if (!bone) throw "IK bone not found: " + bones[ii];

					ikConstraintData.bones.push(bone);

				}



				ikConstraintData.target = skeletonData.findBone(ikMap["target"]);

				if (!ikConstraintData.target) throw "Target bone not found: " + ikMap["target"];



				ikConstraintData.bendDirection = (!ikMap.hasOwnProperty("bendPositive") || ikMap["bendPositive"]) ? 1 : -1;

				ikConstraintData.mix = ikMap.hasOwnProperty("mix") ? ikMap["mix"] : 1;



				skeletonData.ikConstraints.push(ikConstraintData);

			}

		}



		// Slots.

		var slots = root["slots"];

		for (var i = 0, n = slots.length; i < n; i++) {

			var slotMap = slots[i];

			var boneData = skeletonData.findBone(slotMap["bone"]);

			if (!boneData) throw "Slot bone not found: " + slotMap["bone"];

			var slotData = new spine.SlotData(slotMap["name"], boneData);



			var color = slotMap["color"];

			if (color) {

				slotData.r = this.toColor(color, 0);

				slotData.g = this.toColor(color, 1);

				slotData.b = this.toColor(color, 2);

				slotData.a = this.toColor(color, 3);

			}



			slotData.attachmentName = slotMap["attachment"];

			slotData.blendMode = spine.BlendMode[slotMap["blend"] || "normal"];



			skeletonData.slots.push(slotData);

		}



		// Skins.

		var skins = root["skins"];

		for (var skinName in skins) {

			if (!skins.hasOwnProperty(skinName)) continue;

			var skinMap = skins[skinName];

			var skin = new spine.Skin(skinName);

			for (var slotName in skinMap) {

				if (!skinMap.hasOwnProperty(slotName)) continue;

				var slotIndex = skeletonData.findSlotIndex(slotName);

				var slotEntry = skinMap[slotName];

				for (var attachmentName in slotEntry) {

					if (!slotEntry.hasOwnProperty(attachmentName)) continue;

					var attachment = this.readAttachment(skin, attachmentName, slotEntry[attachmentName]);

					if (attachment) skin.addAttachment(slotIndex, attachmentName, attachment);

				}

			}

			skeletonData.skins.push(skin);

			if (skin.name == "default") skeletonData.defaultSkin = skin;

		}



		// Events.

		var events = root["events"];

		for (var eventName in events) {

			if (!events.hasOwnProperty(eventName)) continue;

			var eventMap = events[eventName];

			var eventData = new spine.EventData(eventName);

			eventData.intValue = eventMap["int"] || 0;

			eventData.floatValue = eventMap["float"] || 0;

			eventData.stringValue = eventMap["string"] || null;

			skeletonData.events.push(eventData);

		}



		// Animations.

		var animations = root["animations"];

		for (var animationName in animations) {

			if (!animations.hasOwnProperty(animationName)) continue;

			this.readAnimation(animationName, animations[animationName], skeletonData);

		}



		return skeletonData;

	},

	readAttachment: function (skin, name, map) {

		name = map["name"] || name;



		var type = spine.AttachmentType[map["type"] || "region"];

		var path = map["path"] || name;

		

		var scale = this.scale;

		if (type == spine.AttachmentType.region) {

			var region = this.attachmentLoader.newRegionAttachment(skin, name, path);

			if (!region) return null;

			region.path = path;

			region.x = (map["x"] || 0) * scale;

			region.y = (map["y"] || 0) * scale;

			region.scaleX = map.hasOwnProperty("scaleX") ? map["scaleX"] : 1;

			region.scaleY = map.hasOwnProperty("scaleY") ? map["scaleY"] : 1;

			region.rotation = map["rotation"] || 0;

			region.width = (map["width"] || 0) * scale;

			region.height = (map["height"] || 0) * scale;



			var color = map["color"];

			if (color) {

				region.r = this.toColor(color, 0);

				region.g = this.toColor(color, 1);

				region.b = this.toColor(color, 2);

				region.a = this.toColor(color, 3);

			}



			region.updateOffset();

			return region;

		} else if (type == spine.AttachmentType.mesh) {

			var mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);

			if (!mesh) return null;

			mesh.path = path; 

			mesh.vertices = this.getFloatArray(map, "vertices", scale);

			mesh.triangles = this.getIntArray(map, "triangles");

			mesh.regionUVs = this.getFloatArray(map, "uvs", 1);

			mesh.updateUVs();



			color = map["color"];

			if (color) {

				mesh.r = this.toColor(color, 0);

				mesh.g = this.toColor(color, 1);

				mesh.b = this.toColor(color, 2);

				mesh.a = this.toColor(color, 3);

			}



			mesh.hullLength = (map["hull"] || 0) * 2;

			if (map["edges"]) mesh.edges = this.getIntArray(map, "edges");

			mesh.width = (map["width"] || 0) * scale;

			mesh.height = (map["height"] || 0) * scale;

			return mesh;

		} else if (type == spine.AttachmentType.skinnedmesh) {

			var mesh = this.attachmentLoader.newSkinnedMeshAttachment(skin, name, path);

			if (!mesh) return null;

			mesh.path = path;



			var uvs = this.getFloatArray(map, "uvs", 1);

			var vertices = this.getFloatArray(map, "vertices", 1);

			var weights = [];

			var bones = [];

			for (var i = 0, n = vertices.length; i < n; ) {

				var boneCount = vertices[i++] | 0;

				bones[bones.length] = boneCount;

				for (var nn = i + boneCount * 4; i < nn; ) {

					bones[bones.length] = vertices[i];

					weights[weights.length] = vertices[i + 1] * scale;

					weights[weights.length] = vertices[i + 2] * scale;

					weights[weights.length] = vertices[i + 3];

					i += 4;

				}

			}

			mesh.bones = bones;

			mesh.weights = weights;

			mesh.triangles = this.getIntArray(map, "triangles");

			mesh.regionUVs = uvs;

			mesh.updateUVs();

			

			color = map["color"];

			if (color) {

				mesh.r = this.toColor(color, 0);

				mesh.g = this.toColor(color, 1);

				mesh.b = this.toColor(color, 2);

				mesh.a = this.toColor(color, 3);

			}

			

			mesh.hullLength = (map["hull"] || 0) * 2;

			if (map["edges"]) mesh.edges = this.getIntArray(map, "edges");

			mesh.width = (map["width"] || 0) * scale;

			mesh.height = (map["height"] || 0) * scale;

			return mesh;

		} else if (type == spine.AttachmentType.boundingbox) {

			var attachment = this.attachmentLoader.newBoundingBoxAttachment(skin, name);

			var vertices = map["vertices"];

			for (var i = 0, n = vertices.length; i < n; i++)

				attachment.vertices.push(vertices[i] * scale);

			return attachment;

		}

		throw "Unknown attachment type: " + type;

	},

	readAnimation: function (name, map, skeletonData) {

		var timelines = [];

		var duration = 0;



		var slots = map["slots"];

		for (var slotName in slots) {

			if (!slots.hasOwnProperty(slotName)) continue;

			var slotMap = slots[slotName];

			var slotIndex = skeletonData.findSlotIndex(slotName);



			for (var timelineName in slotMap) {

				if (!slotMap.hasOwnProperty(timelineName)) continue;

				var values = slotMap[timelineName];

				if (timelineName == "color") {

					var timeline = new spine.ColorTimeline(values.length);

					timeline.slotIndex = slotIndex;



					var frameIndex = 0;

					for (var i = 0, n = values.length; i < n; i++) {

						var valueMap = values[i];

						var color = valueMap["color"];

						var r = this.toColor(color, 0);

						var g = this.toColor(color, 1);

						var b = this.toColor(color, 2);

						var a = this.toColor(color, 3);

						timeline.setFrame(frameIndex, valueMap["time"], r, g, b, a);

						this.readCurve(timeline, frameIndex, valueMap);

						frameIndex++;

					}

					timelines.push(timeline);

					duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 5 - 5]);



				} else if (timelineName == "attachment") {

					var timeline = new spine.AttachmentTimeline(values.length);

					timeline.slotIndex = slotIndex;



					var frameIndex = 0;

					for (var i = 0, n = values.length; i < n; i++) {

						var valueMap = values[i];

						timeline.setFrame(frameIndex++, valueMap["time"], valueMap["name"]);

					}

					timelines.push(timeline);

					duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);



				} else

					throw "Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")";

			}

		}



		var bones = map["bones"];

		for (var boneName in bones) {

			if (!bones.hasOwnProperty(boneName)) continue;

			var boneIndex = skeletonData.findBoneIndex(boneName);

			if (boneIndex == -1) throw "Bone not found: " + boneName;

			var boneMap = bones[boneName];



			for (var timelineName in boneMap) {

				if (!boneMap.hasOwnProperty(timelineName)) continue;

				var values = boneMap[timelineName];

				if (timelineName == "rotate") {

					var timeline = new spine.RotateTimeline(values.length);

					timeline.boneIndex = boneIndex;



					var frameIndex = 0;

					for (var i = 0, n = values.length; i < n; i++) {

						var valueMap = values[i];

						timeline.setFrame(frameIndex, valueMap["time"], valueMap["angle"]);

						this.readCurve(timeline, frameIndex, valueMap);

						frameIndex++;

					}

					timelines.push(timeline);

					duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 2 - 2]);



				} else if (timelineName == "translate" || timelineName == "scale") {

					var timeline;

					var timelineScale = 1;

					if (timelineName == "scale")

						timeline = new spine.ScaleTimeline(values.length);

					else {

						timeline = new spine.TranslateTimeline(values.length);

						timelineScale = this.scale;

					}

					timeline.boneIndex = boneIndex;



					var frameIndex = 0;

					for (var i = 0, n = values.length; i < n; i++) {

						var valueMap = values[i];

						var x = (valueMap["x"] || 0) * timelineScale;

						var y = (valueMap["y"] || 0) * timelineScale;

						timeline.setFrame(frameIndex, valueMap["time"], x, y);

						this.readCurve(timeline, frameIndex, valueMap);

						frameIndex++;

					}

					timelines.push(timeline);

					duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 3 - 3]);



				} else if (timelineName == "flipX" || timelineName == "flipY") {

					var x = timelineName == "flipX";

					var timeline = x ? new spine.FlipXTimeline(values.length) : new spine.FlipYTimeline(values.length);

					timeline.boneIndex = boneIndex;



					var field = x ? "x" : "y";

					var frameIndex = 0;

					for (var i = 0, n = values.length; i < n; i++) {

						var valueMap = values[i];

						timeline.setFrame(frameIndex, valueMap["time"], valueMap[field] || false);

						frameIndex++;

					}

					timelines.push(timeline);

					duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 2 - 2]);

				} else

					throw "Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")";

			}

		}



		var ikMap = map["ik"];

		for (var ikConstraintName in ikMap) {

			if (!ikMap.hasOwnProperty(ikConstraintName)) continue;

			var ikConstraint = skeletonData.findIkConstraint(ikConstraintName);

			var values = ikMap[ikConstraintName];

			var timeline = new spine.IkConstraintTimeline(values.length);

			timeline.ikConstraintIndex = skeletonData.ikConstraints.indexOf(ikConstraint);

			var frameIndex = 0;

			for (var i = 0, n = values.length; i < n; i++) {

				var valueMap = values[i];

				var mix = valueMap.hasOwnProperty("mix") ? valueMap["mix"] : 1;

				var bendDirection = (!valueMap.hasOwnProperty("bendPositive") || valueMap["bendPositive"]) ? 1 : -1;

				timeline.setFrame(frameIndex, valueMap["time"], mix, bendDirection);

				this.readCurve(timeline, frameIndex, valueMap);

				frameIndex++;

			}

			timelines.push(timeline);

			duration = Math.max(duration, timeline.frames[timeline.frameCount * 3 - 3]);

		}



		var ffd = map["ffd"];

		for (var skinName in ffd) {

			var skin = skeletonData.findSkin(skinName);

			var slotMap = ffd[skinName];

			for (slotName in slotMap) {

				var slotIndex = skeletonData.findSlotIndex(slotName);

				var meshMap = slotMap[slotName];

				for (var meshName in meshMap) {

					var values = meshMap[meshName];

					var timeline = new spine.FfdTimeline(values.length);

					var attachment = skin.getAttachment(slotIndex, meshName);

					if (!attachment) throw "FFD attachment not found: " + meshName;

					timeline.slotIndex = slotIndex;

					timeline.attachment = attachment;

					

					var isMesh = attachment.type == spine.AttachmentType.mesh;

					var vertexCount;

					if (isMesh)

						vertexCount = attachment.vertices.length;

					else

						vertexCount = attachment.weights.length / 3 * 2;



					var frameIndex = 0;

					for (var i = 0, n = values.length; i < n; i++) {

						var valueMap = values[i];

						var vertices;

						if (!valueMap["vertices"]) {

							if (isMesh)

								vertices = attachment.vertices;

							else {

								vertices = [];

								vertices.length = vertexCount;

							}

						} else {

							var verticesValue = valueMap["vertices"];

							var vertices = [];

							vertices.length = vertexCount;

							var start = valueMap["offset"] || 0;

							var nn = verticesValue.length;

							if (this.scale == 1) {

								for (var ii = 0; ii < nn; ii++)

									vertices[ii + start] = verticesValue[ii];

							} else {

								for (var ii = 0; ii < nn; ii++)

									vertices[ii + start] = verticesValue[ii] * this.scale;

							}

							if (isMesh) {

								var meshVertices = attachment.vertices;

								for (var ii = 0, nn = vertices.length; ii < nn; ii++)

									vertices[ii] += meshVertices[ii];

							}

						}

						

						timeline.setFrame(frameIndex, valueMap["time"], vertices);

						this.readCurve(timeline, frameIndex, valueMap);

						frameIndex++;

					}

					timelines[timelines.length] = timeline;

					duration = Math.max(duration, timeline.frames[timeline.frameCount - 1]);

				}

			}

		}



		var drawOrderValues = map["drawOrder"];

		if (!drawOrderValues) drawOrderValues = map["draworder"];

		if (drawOrderValues) {

			var timeline = new spine.DrawOrderTimeline(drawOrderValues.length);

			var slotCount = skeletonData.slots.length;

			var frameIndex = 0;

			for (var i = 0, n = drawOrderValues.length; i < n; i++) {

				var drawOrderMap = drawOrderValues[i];

				var drawOrder = null;

				if (drawOrderMap["offsets"]) {

					drawOrder = [];

					drawOrder.length = slotCount;

					for (var ii = slotCount - 1; ii >= 0; ii--)

						drawOrder[ii] = -1;

					var offsets = drawOrderMap["offsets"];

					var unchanged = [];

					unchanged.length = slotCount - offsets.length;

					var originalIndex = 0, unchangedIndex = 0;

					for (var ii = 0, nn = offsets.length; ii < nn; ii++) {

						var offsetMap = offsets[ii];

						var slotIndex = skeletonData.findSlotIndex(offsetMap["slot"]);

						if (slotIndex == -1) throw "Slot not found: " + offsetMap["slot"];

						// Collect unchanged items.

						while (originalIndex != slotIndex)

							unchanged[unchangedIndex++] = originalIndex++;

						// Set changed items.

						drawOrder[originalIndex + offsetMap["offset"]] = originalIndex++;

					}

					// Collect remaining unchanged items.

					while (originalIndex < slotCount)

						unchanged[unchangedIndex++] = originalIndex++;

					// Fill in unchanged items.

					for (var ii = slotCount - 1; ii >= 0; ii--)

						if (drawOrder[ii] == -1) drawOrder[ii] = unchanged[--unchangedIndex];

				}

				timeline.setFrame(frameIndex++, drawOrderMap["time"], drawOrder);

			}

			timelines.push(timeline);

			duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);

		}



		var events = map["events"];

		if (events) {

			var timeline = new spine.EventTimeline(events.length);

			var frameIndex = 0;

			for (var i = 0, n = events.length; i < n; i++) {

				var eventMap = events[i];

				var eventData = skeletonData.findEvent(eventMap["name"]);

				if (!eventData) throw "Event not found: " + eventMap["name"];

				var event = new spine.Event(eventData);

				event.intValue = eventMap.hasOwnProperty("int") ? eventMap["int"] : eventData.intValue;

				event.floatValue = eventMap.hasOwnProperty("float") ? eventMap["float"] : eventData.floatValue;

				event.stringValue = eventMap.hasOwnProperty("string") ? eventMap["string"] : eventData.stringValue;

				timeline.setFrame(frameIndex++, eventMap["time"], event);

			}

			timelines.push(timeline);

			duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);

		}



		skeletonData.animations.push(new spine.Animation(name, timelines, duration));

	},

	readCurve: function (timeline, frameIndex, valueMap) {

		var curve = valueMap["curve"];

		if (!curve) 

			timeline.curves.setLinear(frameIndex);

		else if (curve == "stepped")

			timeline.curves.setStepped(frameIndex);

		else if (curve instanceof Array)

			timeline.curves.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);

	},

	toColor: function (hexString, colorIndex) {

		if (hexString.length != 8) throw "Color hexidecimal length must be 8, recieved: " + hexString;

		return parseInt(hexString.substring(colorIndex * 2, (colorIndex * 2) + 2), 16) / 255;

	},

	getFloatArray: function (map, name, scale) {

		var list = map[name];

		var values = new spine.Float32Array(list.length);

		var i = 0, n = list.length;

		if (scale == 1) {

			for (; i < n; i++)

				values[i] = list[i];

		} else {

			for (; i < n; i++)

				values[i] = list[i] * scale;

		}

		return values;

	},

	getIntArray: function (map, name) {

		var list = map[name];

		var values = new spine.Uint16Array(list.length);

		for (var i = 0, n = list.length; i < n; i++)

			values[i] = list[i] | 0;

		return values;

	}

};



spine.Atlas = function (atlasText, textureLoader) {

	this.textureLoader = textureLoader;

	this.pages = [];

	this.regions = [];



	var reader = new spine.AtlasReader(atlasText);

	var tuple = [];

	tuple.length = 4;

	var page = null;

	while (true) {

		var line = reader.readLine();

		if (line === null) break;

		line = reader.trim(line);

		if (!line.length)

			page = null;

		else if (!page) {

			page = new spine.AtlasPage();

			page.name = line;



			if (reader.readTuple(tuple) == 2) { // size is only optional for an atlas packed with an old TexturePacker.

				page.width = parseInt(tuple[0]);

				page.height = parseInt(tuple[1]);

				reader.readTuple(tuple);

			}

			page.format = spine.Atlas.Format[tuple[0]];



			reader.readTuple(tuple);

			page.minFilter = spine.Atlas.TextureFilter[tuple[0]];

			page.magFilter = spine.Atlas.TextureFilter[tuple[1]];



			var direction = reader.readValue();

			page.uWrap = spine.Atlas.TextureWrap.clampToEdge;

			page.vWrap = spine.Atlas.TextureWrap.clampToEdge;

			if (direction == "x")

				page.uWrap = spine.Atlas.TextureWrap.repeat;

			else if (direction == "y")

				page.vWrap = spine.Atlas.TextureWrap.repeat;

			else if (direction == "xy")

				page.uWrap = page.vWrap = spine.Atlas.TextureWrap.repeat;



			textureLoader.load(page, line, this);



			this.pages.push(page);



		} else {

			var region = new spine.AtlasRegion();

			region.name = line;

			region.page = page;



			region.rotate = reader.readValue() == "true";



			reader.readTuple(tuple);

			var x = parseInt(tuple[0]);

			var y = parseInt(tuple[1]);



			reader.readTuple(tuple);

			var width = parseInt(tuple[0]);

			var height = parseInt(tuple[1]);



			region.u = x / page.width;

			region.v = y / page.height;

			if (region.rotate) {

				region.u2 = (x + height) / page.width;

				region.v2 = (y + width) / page.height;

			} else {

				region.u2 = (x + width) / page.width;

				region.v2 = (y + height) / page.height;

			}

			region.x = x;

			region.y = y;

			region.width = Math.abs(width);

			region.height = Math.abs(height);



			if (reader.readTuple(tuple) == 4) { // split is optional

				region.splits = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];



				if (reader.readTuple(tuple) == 4) { // pad is optional, but only present with splits

					region.pads = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];



					reader.readTuple(tuple);

				}

			}



			region.originalWidth = parseInt(tuple[0]);

			region.originalHeight = parseInt(tuple[1]);



			reader.readTuple(tuple);

			region.offsetX = parseInt(tuple[0]);

			region.offsetY = parseInt(tuple[1]);



			region.index = parseInt(reader.readValue());



			this.regions.push(region);

		}

	}

};

spine.Atlas.prototype = {

	findRegion: function (name) {

		var regions = this.regions;

		for (var i = 0, n = regions.length; i < n; i++)

			if (regions[i].name == name) return regions[i];

		return null;

	},

	dispose: function () {

		var pages = this.pages;

		for (var i = 0, n = pages.length; i < n; i++)

			this.textureLoader.unload(pages[i].rendererObject);

	},

	updateUVs: function (page) {

		var regions = this.regions;

		for (var i = 0, n = regions.length; i < n; i++) {

			var region = regions[i];

			if (region.page != page) continue;

			region.u = region.x / page.width;

			region.v = region.y / page.height;

			if (region.rotate) {

				region.u2 = (region.x + region.height) / page.width;

				region.v2 = (region.y + region.width) / page.height;

			} else {

				region.u2 = (region.x + region.width) / page.width;

				region.v2 = (region.y + region.height) / page.height;

			}

		}

	}

};



spine.Atlas.Format = {

	alpha: 0,

	intensity: 1,

	luminanceAlpha: 2,

	rgb565: 3,

	rgba4444: 4,

	rgb888: 5,

	rgba8888: 6

};



spine.Atlas.TextureFilter = {

	nearest: 0,

	linear: 1,

	mipMap: 2,

	mipMapNearestNearest: 3,

	mipMapLinearNearest: 4,

	mipMapNearestLinear: 5,

	mipMapLinearLinear: 6

};



spine.Atlas.TextureWrap = {

	mirroredRepeat: 0,

	clampToEdge: 1,

	repeat: 2

};



spine.AtlasPage = function () {};

spine.AtlasPage.prototype = {

	name: null,

	format: null,

	minFilter: null,

	magFilter: null,

	uWrap: null,

	vWrap: null,

	rendererObject: null,

	width: 0,

	height: 0

};



spine.AtlasRegion = function () {};

spine.AtlasRegion.prototype = {

	page: null,

	name: null,

	x: 0, y: 0,

	width: 0, height: 0,

	u: 0, v: 0, u2: 0, v2: 0,

	offsetX: 0, offsetY: 0,

	originalWidth: 0, originalHeight: 0,

	index: 0,

	rotate: false,

	splits: null,

	pads: null

};



spine.AtlasReader = function (text) {

	this.lines = text.split(/\r\n|\r|\n/);

};

spine.AtlasReader.prototype = {

	index: 0,

	trim: function (value) {

		return value.replace(/^\s+|\s+$/g, "");

	},

	readLine: function () {

		if (this.index >= this.lines.length) return null;

		return this.lines[this.index++];

	},

	readValue: function () {

		var line = this.readLine();

		var colon = line.indexOf(":");

		if (colon == -1) throw "Invalid line: " + line;

		return this.trim(line.substring(colon + 1));

	},

	/** Returns the number of tuple values read (1, 2 or 4). */

	readTuple: function (tuple) {

		var line = this.readLine();

		var colon = line.indexOf(":");

		if (colon == -1) throw "Invalid line: " + line;

		var i = 0, lastMatch = colon + 1;

		for (; i < 3; i++) {

			var comma = line.indexOf(",", lastMatch);

			if (comma == -1) break;

			tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));

			lastMatch = comma + 1;

		}

		tuple[i] = this.trim(line.substring(lastMatch));

		return i + 1;

	}

};



spine.AtlasAttachmentLoader = function (atlas) {

	this.atlas = atlas;

};

spine.AtlasAttachmentLoader.prototype = {

	newRegionAttachment: function (skin, name, path) {

		var region = this.atlas.findRegion(path);

		if (!region) throw "Region not found in atlas: " + path + " (region attachment: " + name + ")";

		var attachment = new spine.RegionAttachment(name);

		attachment.rendererObject = region;

		attachment.setUVs(region.u, region.v, region.u2, region.v2, region.rotate);

		attachment.regionOffsetX = region.offsetX;

		attachment.regionOffsetY = region.offsetY;

		attachment.regionWidth = region.width;

		attachment.regionHeight = region.height;

		attachment.regionOriginalWidth = region.originalWidth;

		attachment.regionOriginalHeight = region.originalHeight;

		return attachment;

	},

	newMeshAttachment: function (skin, name, path) {

		var region = this.atlas.findRegion(path);

		if (!region) throw "Region not found in atlas: " + path + " (mesh attachment: " + name + ")";

		var attachment = new spine.MeshAttachment(name);

		attachment.rendererObject = region;

		attachment.regionU = region.u;

		attachment.regionV = region.v;

		attachment.regionU2 = region.u2;

		attachment.regionV2 = region.v2;

		attachment.regionRotate = region.rotate;

		attachment.regionOffsetX = region.offsetX;

		attachment.regionOffsetY = region.offsetY;

		attachment.regionWidth = region.width;

		attachment.regionHeight = region.height;

		attachment.regionOriginalWidth = region.originalWidth;

		attachment.regionOriginalHeight = region.originalHeight;

		return attachment;

	},

	newSkinnedMeshAttachment: function (skin, name, path) {

		var region = this.atlas.findRegion(path);

		if (!region) throw "Region not found in atlas: " + path + " (skinned mesh attachment: " + name + ")";

		var attachment = new spine.SkinnedMeshAttachment(name);

		attachment.rendererObject = region;

		attachment.regionU = region.u;

		attachment.regionV = region.v;

		attachment.regionU2 = region.u2;

		attachment.regionV2 = region.v2;

		attachment.regionRotate = region.rotate;

		attachment.regionOffsetX = region.offsetX;

		attachment.regionOffsetY = region.offsetY;

		attachment.regionWidth = region.width;

		attachment.regionHeight = region.height;

		attachment.regionOriginalWidth = region.originalWidth;

		attachment.regionOriginalHeight = region.originalHeight;

		return attachment;

	},

	newBoundingBoxAttachment: function (skin, name) {

		return new spine.BoundingBoxAttachment(name);

	}

};



spine.SkeletonBounds = function () {

	this.polygonPool = [];

	this.polygons = [];

	this.boundingBoxes = [];

};

spine.SkeletonBounds.prototype = {

	minX: 0, minY: 0, maxX: 0, maxY: 0,

	update: function (skeleton, updateAabb) {

		var slots = skeleton.slots;

		var slotCount = slots.length;

		var x = skeleton.x, y = skeleton.y;

		var boundingBoxes = this.boundingBoxes;

		var polygonPool = this.polygonPool;

		var polygons = this.polygons;



		boundingBoxes.length = 0;

		for (var i = 0, n = polygons.length; i < n; i++)

			polygonPool.push(polygons[i]);

		polygons.length = 0;



		for (var i = 0; i < slotCount; i++) {

			var slot = slots[i];

			var boundingBox = slot.attachment;

			if (boundingBox.type != spine.AttachmentType.boundingbox) continue;

			boundingBoxes.push(boundingBox);



			var poolCount = polygonPool.length, polygon;

			if (poolCount > 0) {

				polygon = polygonPool[poolCount - 1];

				polygonPool.splice(poolCount - 1, 1);

			} else

				polygon = [];

			polygons.push(polygon);



			polygon.length = boundingBox.vertices.length;

			boundingBox.computeWorldVertices(x, y, slot.bone, polygon);

		}



		if (updateAabb) this.aabbCompute();

	},

	aabbCompute: function () {

		var polygons = this.polygons;

		var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;

		for (var i = 0, n = polygons.length; i < n; i++) {

			var vertices = polygons[i];

			for (var ii = 0, nn = vertices.length; ii < nn; ii += 2) {

				var x = vertices[ii];

				var y = vertices[ii + 1];

				minX = Math.min(minX, x);

				minY = Math.min(minY, y);

				maxX = Math.max(maxX, x);

				maxY = Math.max(maxY, y);

			}

		}

		this.minX = minX;

		this.minY = minY;

		this.maxX = maxX;

		this.maxY = maxY;

	},

	/** Returns true if the axis aligned bounding box contains the point. */

	aabbContainsPoint: function (x, y) {

		return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;

	},

	/** Returns true if the axis aligned bounding box intersects the line segment. */

	aabbIntersectsSegment: function (x1, y1, x2, y2) {

		var minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;

		if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))

			return false;

		var m = (y2 - y1) / (x2 - x1);

		var y = m * (minX - x1) + y1;

		if (y > minY && y < maxY) return true;

		y = m * (maxX - x1) + y1;

		if (y > minY && y < maxY) return true;

		var x = (minY - y1) / m + x1;

		if (x > minX && x < maxX) return true;

		x = (maxY - y1) / m + x1;

		if (x > minX && x < maxX) return true;

		return false;

	},

	/** Returns true if the axis aligned bounding box intersects the axis aligned bounding box of the specified bounds. */

	aabbIntersectsSkeleton: function (bounds) {

		return this.minX < bounds.maxX && this.maxX > bounds.minX && this.minY < bounds.maxY && this.maxY > bounds.minY;

	},

	/** Returns the first bounding box attachment that contains the point, or null. When doing many checks, it is usually more

	 * efficient to only call this method if {@link #aabbContainsPoint(float, float)} returns true. */

	containsPoint: function (x, y) {

		var polygons = this.polygons;

		for (var i = 0, n = polygons.length; i < n; i++)

			if (this.polygonContainsPoint(polygons[i], x, y)) return this.boundingBoxes[i];

		return null;

	},

	/** Returns the first bounding box attachment that contains the line segment, or null. When doing many checks, it is usually

	 * more efficient to only call this method if {@link #aabbIntersectsSegment(float, float, float, float)} returns true. */

	intersectsSegment: function (x1, y1, x2, y2) {

		var polygons = this.polygons;

		for (var i = 0, n = polygons.length; i < n; i++)

			if (polygons[i].intersectsSegment(x1, y1, x2, y2)) return this.boundingBoxes[i];

		return null;

	},

	/** Returns true if the polygon contains the point. */

	polygonContainsPoint: function (polygon, x, y) {

		var nn = polygon.length;

		var prevIndex = nn - 2;

		var inside = false;

		for (var ii = 0; ii < nn; ii += 2) {

			var vertexY = polygon[ii + 1];

			var prevY = polygon[prevIndex + 1];

			if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {

				var vertexX = polygon[ii];

				if (vertexX + (y - vertexY) / (prevY - vertexY) * (polygon[prevIndex] - vertexX) < x) inside = !inside;

			}

			prevIndex = ii;

		}

		return inside;

	},

	/** Returns true if the polygon contains the line segment. */

	polygonIntersectsSegment: function (polygon, x1, y1, x2, y2) {

		var nn = polygon.length;

		var width12 = x1 - x2, height12 = y1 - y2;

		var det1 = x1 * y2 - y1 * x2;

		var x3 = polygon[nn - 2], y3 = polygon[nn - 1];

		for (var ii = 0; ii < nn; ii += 2) {

			var x4 = polygon[ii], y4 = polygon[ii + 1];

			var det2 = x3 * y4 - y3 * x4;

			var width34 = x3 - x4, height34 = y3 - y4;

			var det3 = width12 * height34 - height12 * width34;

			var x = (det1 * width34 - width12 * det2) / det3;

			if (((x >= x3 && x <= x4) || (x >= x4 && x <= x3)) && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1))) {

				var y = (det1 * height34 - height12 * det2) / det3;

				if (((y >= y3 && y <= y4) || (y >= y4 && y <= y3)) && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1))) return true;

			}

			x3 = x4;

			y3 = y4;

		}

		return false;

	},

	getPolygon: function (attachment) {

		var index = this.boundingBoxes.indexOf(attachment);

		return index == -1 ? null : this.polygons[index];

	},

	getWidth: function () {

		return this.maxX - this.minX;

	},

	getHeight: function () {

		return this.maxY - this.minY;

	}

};

var e,ba=document.getElementById("canvasBackground"),ca="game_solitaire theme_classic big gameui_difficulty endscreen_difficulty landscape coolmath final".split(" ");function f(a,b){var c=a.userAgent.match(b);return c&&1<c.length&&c[1]||""}
var m=new function(){this.userAgent=void 0;void 0===this.userAgent&&(this.userAgent=void 0!==navigator?navigator.userAgent:"");var a=f(this,/(ipod|iphone|ipad)/i).toLowerCase(),b=!/like android/i.test(this.userAgent)&&/android/i.test(this.userAgent),c=f(this,/version\/(\d+(\.\d+)?)/i),d=/tablet/i.test(this.userAgent),g=!d&&/[^-]mobi/i.test(this.userAgent);this.t={};this.Ga={};this.jd={};/opera|opr/i.test(this.userAgent)?(this.name="Opera",this.t.opera=!0,this.t.version=c||f(this,/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)):
/windows phone/i.test(this.userAgent)?(this.name="Windows Phone",this.Ga.Go=!0,this.t.kk=!0,this.t.version=f(this,/iemobile\/(\d+(\.\d+)?)/i)):/msie|trident/i.test(this.userAgent)?(this.name="Internet Explorer",this.t.kk=!0,this.t.version=f(this,/(?:msie |rv:)(\d+(\.\d+)?)/i)):/chrome|crios|crmo/i.test(this.userAgent)?(this.name="Chrome",this.t.chrome=!0,this.t.version=f(this,/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)):a?(this.name="iphone"==a?"iPhone":"ipad"==a?"iPad":"iPod",c&&(this.t.version=c)):
/sailfish/i.test(this.userAgent)?(this.name="Sailfish",this.t.Uz=!0,this.t.version=f(this,/sailfish\s?browser\/(\d+(\.\d+)?)/i)):/seamonkey\//i.test(this.userAgent)?(this.name="SeaMonkey",this.t.iA=!0,this.t.version=f(this,/seamonkey\/(\d+(\.\d+)?)/i)):/firefox|iceweasel/i.test(this.userAgent)?(this.name="Firefox",this.t.dq=!0,this.t.version=f(this,/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i),/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(this.userAgent)&&(this.Ga.xy=!0)):/silk/i.test(this.userAgent)?
(this.name="Amazon Silk",this.t.Vr=!0,this.t.version=f(this,/silk\/(\d+(\.\d+)?)/i)):b?(this.name="Android",this.t.Bg=!0,this.t.version=c):/phantom/i.test(this.userAgent)?(this.name="PhantomJS",this.t.Cz=!0,this.t.version=f(this,/phantomjs\/(\d+(\.\d+)?)/i)):/blackberry|\bbb\d+/i.test(this.userAgent)||/rim\stablet/i.test(this.userAgent)?(this.name="BlackBerry",this.t.qp=!0,this.t.version=c||f(this,/blackberry[\d]+\/(\d+(\.\d+)?)/i)):/(web|hpw)os/i.test(this.userAgent)?(this.name="WebOS",this.t.ft=
!0,this.t.version=c||f(this,/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i),/touchpad\//i.test(this.userAgent)&&(this.jd.sx=!0)):/bada/i.test(this.userAgent)?(this.name="Bada",this.t.pp=!0,this.t.version=f(this,/dolfin\/(\d+(\.\d+)?)/i)):/tizen/i.test(this.userAgent)?(this.name="Tizen",this.t.lx=!0,this.t.version=f(this,/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||c):/safari/i.test(this.userAgent)&&(this.name="Safari",this.t.Sn=!0,this.t.version=c);/(apple)?webkit/i.test(this.userAgent)?(this.name=this.name||"Webkit",
this.t.FA=!0,!this.t.version&&c&&(this.t.version=c)):!this.opera&&/gecko\//i.test(this.userAgent)&&(this.name=this.name||"Gecko",this.t.Cy=!0,this.t.version=this.t.version||f(this,/gecko\/(\d+(\.\d+)?)/i));b||this.Vr?this.Ga.Ix=!0:a&&(this.Ga.Sj=!0);c="";a?(c=f(this,/os (\d+([_\s]\d+)*) like mac os x/i),c=c.replace(/[_\s]/g,".")):b?c=f(this,/android[ \/-](\d+(\.\d+)*)/i):this.Go?c=f(this,/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):this.ft?c=f(this,/(?:web|hpw)os\/(\d+(\.\d+)*)/i):this.qp?c=f(this,/rim\stablet\sos\s(\d+(\.\d+)*)/i):
this.pp?c=f(this,/bada\/(\d+(\.\d+)*)/i):this.lx&&(c=f(this,/tizen[\/\s](\d+(\.\d+)*)/i));c&&(this.Ga.version=c);c=c.split(".")[0];if(d||"ipad"==a||b&&(3==c||4==c&&!g)||this.Vr)this.jd.oo=!0;else if(g||"iphone"==a||"ipod"==a||b||this.qp||this.ft||this.pp)this.jd.tn=!0;this.ie={ih:!1,th:!1,x:!1};this.kk&&10<=this.t.version||this.chrome&&20<=this.t.version||this.dq&&20<=this.t.version||this.Sn&&6<=this.t.version||this.opera&&10<=this.t.version||this.Sj&&this.Ga.version&&6<=this.Ga.version.split(".")[0]?
this.ie.ih=!0:this.kk&&10>this.t.version||this.chrome&&20>this.t.version||this.dq&&20>this.t.version||this.Sn&&6>this.t.version||this.opera&&10>this.t.version||this.Sj&&this.Ga.version&&6>this.Ga.version.split(".")[0]?this.ie.th=!0:this.ie.x=!0;try{this.t.Ud=this.t.version?parseFloat(this.t.version.match(/\d+(\.\d+)?/)[0],10):0}catch(h){this.t.Ud=0}try{this.Ga.Ud=this.Ga.version?parseFloat(this.Ga.version.match(/\d+(\.\d+)?/)[0],10):0}catch(k){this.Ga.Ud=0}};function p(a,b){this.x=a;this.y=b}e=p.prototype;
e.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};e.K=function(){return new p(this.x,this.y)};e.add=function(a){return new p(this.x+a.x,this.y+a.y)};function da(a,b){return new p(a.x-b.x,a.y-b.y)}e.scale=function(a){return new p(a*this.x,a*this.y)};e.rotate=function(a){var b=Math.sin(a*Math.PI/180);a=Math.cos(a*Math.PI/180);return new p(a*this.x+b*this.y,-b*this.x+a*this.y)};
e.normalize=function(){var a=Math.sqrt(this.x*this.x+this.y*this.y);return 0===a?new p(0,0):new p(this.x/a,this.y/a)};function ea(a){return(new p(a.y,-a.x)).normalize()}e.ob=function(a,b,c){var d=Math.min(8,this.length()/4),g=da(this,this.normalize().scale(2*d)),h=g.add(ea(this).scale(d)),d=g.add(ea(this).scale(-d)),k=w.context;k.strokeStyle=c;k.beginPath();k.moveTo(a,b);k.lineTo(a+g.x,b+g.y);k.lineTo(a+h.x,b+h.y);k.lineTo(a+this.x,b+this.y);k.lineTo(a+d.x,b+d.y);k.lineTo(a+g.x,b+g.y);k.stroke()};
function fa(a){this.ai=4294967296;this.ih=1664525;this.th=1013904223;this.state=void 0===a?Math.floor(Math.random()*(this.ai-1)):a}fa.prototype.K=function(){var a=new fa;a.ai=this.ai;a.ih=this.ih;a.th=this.th;a.state=this.state;return a};fa.prototype.random=function(a){var b=1;void 0!==a&&(b=a);this.state=(this.ih*this.state+this.th)%this.ai;return this.state/this.ai*b};new fa;
function ga(){this.Xd="";this.wl=[];this.hh=[];this.Je=[];this.Qf=[];this.kc=[];this.sa("start");this.sa("load");this.sa("game")}function ha(a){var b=ia;b.Xd=a;""!==b.Xd&&"/"!==b.Xd[b.Xd.length-1]&&(b.Xd+="/")}e=ga.prototype;e.sa=function(a){this.kc[a]||(this.hh[a]=0,this.Je[a]=0,this.Qf[a]=0,this.kc[a]=[],this.wl[a]=!1)};e.loaded=function(a){return this.kc[a]?this.Je[a]:0};e.sc=function(a){return this.kc[a]?this.Qf[a]:0};
e.complete=function(a){return this.kc[a]?this.Je[a]+this.Qf[a]===this.hh[a]:!0};function ja(a){var b=ia;return b.kc[a]?100*(b.Je[a]+b.Qf[a])/b.hh[a]:100}function ka(a){var b=ia;b.Je[a]+=1;b.complete(a)&&la("Load Complete",{Ra:a})}function ma(a){var b=ia;b.Qf[a]+=1;la("Load Failed",{Ra:a})}function na(a,b,c){var d=ia;d.kc[b]||d.sa(b);d.kc[b].push(a);d.hh[b]+=c}
e.rd=function(a){var b;if(!this.wl[a])if(this.wl[a]=!0,this.kc[a]&&0!==this.kc[a].length)for(b=0;b<this.kc[a].length;b+=1)this.kc[a][b].rd(a,this.Xd);else la("Load Complete",{Ra:a})};var ia=new ga;function pa(a){this.context=this.canvas=void 0;this.height=this.width=0;a&&this.hb(a)}pa.prototype.hb=function(a){this.canvas=a;this.context=a.getContext("2d");this.width=a.width;this.height=a.height};
pa.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height);this.context.beginPath();this.context.moveTo(0,0);this.context.lineTo(-1,-1);this.context.closePath();this.context.stroke()};
function qa(a,b,c,d,g,h){var k=w;k.context.save();!1===h?(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)):!0===h?(k.context.strokeStyle=g,k.context.strokeRect(a,b,c,d)):(void 0!==g&&(k.context.fillStyle=g,k.context.fillRect(a,b,c,d)),void 0!==h&&(k.context.strokeStyle=h,k.context.strokeRect(a,b,c,d)));k.context.restore()}
function ra(a,b,c,d){var g=w;g.context.save();g.context.beginPath();g.context.moveTo(a,b);g.context.lineTo(c,d);g.context.lineWidth=1;g.context.strokeStyle="green";g.context.stroke();g.context.restore()}
pa.prototype.bc=function(a,b,c,d,g,h,k){this.context.save();this.context.font=g;!1===h?(this.context.fillStyle=d,this.context.fillText(a,b,c)):!0===h?(this.context.strokeStyle=d,this.context.strokeText(a,b,c)):(void 0!==d&&(this.context.fillStyle=d,this.context.fillText(a,b,c)),void 0!==h&&(k&&(this.context.lineWidth=k),this.context.strokeStyle=h,this.context.strokeText(a,b,c)));this.context.restore()};pa.prototype.ba=function(a,b){this.context.font=b;return this.context.measureText(a).width};
var w=new pa(ba);function sa(a,b,c){this.name=a;this.J=b;this.Uu=c;this.mc=[];this.qm=[];na(this,this.Uu,this.J)}sa.prototype.rd=function(a,b){function c(){ma(a)}function d(){ka(a)}var g,h;for(g=0;g<this.mc.length;g+=1)h=this.qm[g],0!==h.toLowerCase().indexOf("http:")&&0!==h.toLowerCase().indexOf("https:")&&(h=b+h),this.mc[g].src=h,this.mc[g].addEventListener("load",d,!1),this.mc[g].addEventListener("error",c,!1)};
sa.prototype.complete=function(){var a;for(a=0;a<this.mc.length;a+=1)if(!this.mc[a].complete||0===this.mc[a].width)return!1;return!0};function ta(a,b,c){0<=b&&b<a.J&&(a.mc[b]=new Image,a.qm[b]=c)}sa.prototype.d=function(a,b){0<=a&&a<this.J&&(this.mc[a]=b,this.qm[a]="")};sa.prototype.na=function(a,b,c,d,g,h,k,l,n){this.mc[a]&&this.mc[a].complete&&(void 0===l&&(l=d),void 0===n&&(n=g),0>=d||0>=g||0!==Math.round(l)&&0!==Math.round(n)&&w.context.drawImage(this.mc[a],b,c,d,g,h,k,l,n))};
function x(a,b,c,d,g,h,k,l,n,q){this.name=a;this.Ce=b;this.J=c;this.width=d;this.height=g;this.yb=h;this.zb=k;this.xh=l;this.ag=n;this.pg=q;this.xe=[];this.ye=[];this.ze=[];this.Qd=[];this.Pd=[];this.Rd=[];this.Sd=[]}e=x.prototype;e.d=function(a,b,c,d,g,h,k,l){0<=a&&a<this.J&&(this.xe[a]=b,this.ye[a]=c,this.ze[a]=d,this.Qd[a]=g,this.Pd[a]=h,this.Rd[a]=k,this.Sd[a]=l)};e.complete=function(){return this.Ce.complete()};
e.q=function(a,b,c){a=(Math.round(a)%this.J+this.J)%this.J;this.Ce.na(this.xe[a],this.ye[a],this.ze[a],this.Qd[a],this.Pd[a],b-this.yb+this.Rd[a],c-this.zb+this.Sd[a])};e.cd=function(a,b,c,d){var g=w.context,h=g.globalAlpha;g.globalAlpha=d;a=(Math.round(a)%this.J+this.J)%this.J;this.Ce.na(this.xe[a],this.ye[a],this.ze[a],this.Qd[a],this.Pd[a],b-this.yb+this.Rd[a],c-this.zb+this.Sd[a]);g.globalAlpha=h};
e.la=function(a,b,c,d,g,h,k){var l=w.context;1E-4>Math.abs(d)||1E-4>Math.abs(g)||(a=(Math.round(a)%this.J+this.J)%this.J,l.save(),l.translate(b,c),l.rotate(-h*Math.PI/180),l.scale(d,g),l.globalAlpha=k,this.Ce.na(this.xe[a],this.ye[a],this.ze[a],this.Qd[a],this.Pd[a],this.Rd[a]-this.yb,this.Sd[a]-this.zb),l.restore())};
e.na=function(a,b,c,d,g,h,k,l){var n=w.context,q=n.globalAlpha,v,E,A,r;a=(Math.round(a)%this.J+this.J)%this.J;v=this.Rd[a];E=this.Sd[a];A=this.Qd[a];r=this.Pd[a];b-=v;c-=E;0>=b+d||0>=c+g||b>=A||c>=r||(0>b&&(d+=b,h-=b,b=0),0>c&&(g+=c,k-=c,c=0),b+d>A&&(d=A-b),c+g>r&&(g=r-c),n.globalAlpha=l,this.Ce.na(this.xe[a],this.ye[a]+b,this.ze[a]+c,d,g,h,k),n.globalAlpha=q)};
e.lm=function(a,b,c,d,g,h,k,l,n,q,v,E){var A,r,s,t,u,K,aa,S,W,oa;if(!(0>=h||0>=k))for(b=Math.round(b)%h,0<b&&(b-=h),c=Math.round(c)%k,0<c&&(c-=k),A=Math.ceil((q-b)/h),r=Math.ceil((v-c)/k),b+=l,c+=n,W=0;W<A;W+=1)for(oa=0;oa<r;oa+=1)u=d,K=g,aa=h,S=k,s=b+W*h,t=c+oa*k,s<l&&(u+=l-s,aa-=l-s,s=l),s+aa>=l+q&&(aa=l+q-s),t<n&&(K+=n-t,S-=n-t,t=n),t+S>=n+v&&(S=n+v-t),0<aa&&0<S&&this.na(a,u,K,aa,S,s,t,E)};e.nj=function(a,b,c,d,g,h,k,l,n,q){this.lm(a,0,0,b,c,d,g,h,k,l,n,q)};
e.mj=function(a,b,c,d,g,h,k,l,n,q){var v=w.context,E=v.globalAlpha,A,r,s,t,u,K;a=(Math.round(a)%this.J+this.J)%this.J;A=l/d;r=n/g;s=this.Rd[a];t=this.Sd[a];u=this.Qd[a];K=this.Pd[a];b-=s;c-=t;0>=b+d||0>=c+g||b>=u||c>=K||(0>b&&(d+=b,l+=A*b,h-=A*b,b=0),0>c&&(g+=c,n+=r*c,k-=r*c,c=0),b+d>u&&(l-=A*(d-u+b),d=u-b),c+g>K&&(n-=r*(g-K+c),g=K-c),v.globalAlpha=q,this.Ce.na(this.xe[a],this.ye[a]+b,this.ze[a]+c,d,g,h,k,l,n),v.globalAlpha=E)};
function ua(a,b,c){var d,g,h;for(d=0;d<a.J;d+=1)g=b+d%a.pg*a.width,h=c+a.height*Math.floor(d/a.pg),a.Ce.na(a.xe[d],a.ye[d],a.ze[d],a.Qd[d],a.Pd[d],g-a.yb+a.Rd[d],h-a.zb+a.Sd[d])}function y(a,b){this.canvas=document.createElement("canvas");this.context=this.canvas.getContext("2d");this.width=a;this.height=b;this.zb=this.yb=0;this.canvas.width=a;this.canvas.height=b;this.clear();this.lk=void 0}e=y.prototype;
e.K=function(){var a=new y(this.width,this.height);a.yb=this.yb;a.zb=this.zb;z(a);this.q(0,0);B(a);return a};function z(a){a.lk=w.canvas;w.hb(a.canvas)}function B(a){w.canvas===a.canvas&&void 0!==a.lk&&(w.hb(a.lk),a.lk=void 0)}e.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)};e.q=function(a,b){w.context.drawImage(this.canvas,a-this.yb,b-this.zb)};
e.cd=function(a,b,c){var d=w.context,g=d.globalAlpha;d.globalAlpha=c;w.context.drawImage(this.canvas,a-this.yb,b-this.zb);d.globalAlpha=g};e.la=function(a,b,c,d,g,h){var k=w.context;1E-4>Math.abs(c)||1E-4>Math.abs(d)||(k.save(),k.translate(a,b),k.rotate(-g*Math.PI/180),k.scale(c,d),k.globalAlpha=h,w.context.drawImage(this.canvas,-this.yb,-this.zb),k.restore())};
e.na=function(a,b,c,d,g,h,k){var l=w.context,n=l.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),l.globalAlpha=k,w.context.drawImage(this.canvas,a,b,c,d,g,h,c,d),l.globalAlpha=n)};
e.lm=function(a,b,c,d,g,h,k,l,n,q,v){var E,A,r,s,t,u,K,aa,S,W;if(!(0>=g||0>=h))for(c+g>this.width&&(g=this.width-c),d+h>this.height&&(h=this.height-d),a=Math.round(a)%g,0<a&&(a-=g),b=Math.round(b)%h,0<b&&(b-=h),E=Math.ceil((n-a)/g),A=Math.ceil((q-b)/h),a+=k,b+=l,S=0;S<E;S+=1)for(W=0;W<A;W+=1)t=c,u=d,K=g,aa=h,r=a+S*g,s=b+W*h,r<k&&(t+=k-r,K-=k-r,r=k),r+K>=k+n&&(K=k+n-r),s<l&&(u+=l-s,aa-=l-s,s=l),s+aa>=l+q&&(aa=l+q-s),0<K&&0<aa&&this.na(t,u,K,aa,r,s,v)};
e.nj=function(a,b,c,d,g,h,k,l,n){this.lm(0,0,a,b,c,d,g,h,k,l,n)};e.mj=function(a,b,c,d,g,h,k,l,n){var q=w.context,v=q.globalAlpha;0>=c||0>=d||(a+c>this.width&&(c=this.width-a),b+d>this.height&&(d=this.height-b),0!==Math.round(k)&&0!==Math.round(l)&&(q.globalAlpha=n,w.context.drawImage(this.canvas,a,b,c,d,g,h,k,l),q.globalAlpha=v))};
function va(a,b,c,d){this.L=a;this.Dx=b;this.ux=c;this.Hi=[{text:"MiHhX!@v&Qq",width:-1,font:"sans-serif"},{text:"MiHhX!@v&Qq",width:-1,font:"serif"},{text:"AaMm#@!Xx67",width:-1,font:"sans-serif"},{text:"AaMm#@!Xx67",width:-1,font:"serif"}];this.qs=!1;na(this,d,1)}function wa(a,b,c){w.context.save();w.context.font="250pt "+a+", "+b;a=w.context.measureText(c).width;w.context.restore();return a}
function ya(a){var b,c,d;for(b=0;b<a.Hi.length;b+=1)if(c=a.Hi[b],d=wa(a.L,c.font,c.text),c.width!==d){ka(a.Tu);document.body.removeChild(a.Vd);a.qs=!0;return}window.setTimeout(function(){ya(a)},33)}
va.prototype.rd=function(a,b){var c="@font-face {font-family: "+this.L+";src: url('"+b+this.Dx+"') format('woff'), url('"+b+this.ux+"') format('truetype');}",d=document.createElement("style");d.id=this.L+"_fontface";d.type="text/css";d.styleSheet?d.styleSheet.cssText=c:d.appendChild(document.createTextNode(c));document.getElementsByTagName("head")[0].appendChild(d);this.Vd=document.createElement("span");this.Vd.style.position="absolute";this.Vd.style.left="-9999px";this.Vd.style.top="-9999px";this.Vd.style.visibility=
"hidden";this.Vd.style.fontSize="250pt";this.Vd.id=this.L+"_loader";document.body.appendChild(this.Vd);for(c=0;c<this.Hi.length;c+=1)d=this.Hi[c],d.width=wa(d.font,d.font,d.text);this.Tu=a;ya(this)};va.prototype.complete=function(){return this.qs};
function za(a,b){this.L=a;this.Gh=b;this.fontWeight=this.fontStyle="";this.Mc="normal";this.fontSize=12;this.fill=!0;this.pb=1;this.tc=0;this.fillColor="black";this.Lc={f:void 0,jb:0,On:!0,Pn:!0};this.Qa={Bi:!0,J:3,gj:["red","white","blue"],size:.6,offset:0};this.fillStyle=void 0;this.stroke=!1;this.wb=1;this.Cg=0;this.strokeColor="black";this.strokeStyle=void 0;this.Cc=1;this.Od=!1;this.Ef="miter";this.R={i:!1,color:"rgba(10, 10, 10, 0.3)",offsetX:3,offsetY:3,blur:1};this.align="left";this.h="top";
this.Ja=this.fb=0}e=za.prototype;
e.K=function(){var a=new za(this.L,this.Gh);a.fontStyle=this.fontStyle;a.fontWeight=this.fontWeight;a.Mc=this.Mc;a.fontSize=this.fontSize;a.fill=this.fill;a.pb=this.pb;a.tc=this.tc;a.fillColor=this.fillColor;a.Lc={f:this.Lc.f,On:this.Lc.On,Pn:this.Lc.Pn};a.Qa={Bi:this.Qa.Bi,J:this.Qa.J,gj:this.Qa.gj.slice(0),size:this.Qa.size,offset:this.Qa.offset};a.fillStyle=this.fillStyle;a.stroke=this.stroke;a.wb=this.wb;a.Cg=this.Cg;a.strokeColor=this.strokeColor;a.strokeStyle=this.strokeStyle;a.Cc=this.Cc;a.Od=
this.Od;a.Ef=this.Ef;a.R={i:this.R.i,color:this.R.color,offsetX:this.R.offsetX,offsetY:this.R.offsetY,blur:this.R.blur};a.align=this.align;a.h=this.h;a.fb=this.fb;a.Ja=this.Ja;return a};
function C(a,b){void 0!==b.L&&(a.L=b.L);void 0!==b.Gh&&(a.Gh=b.Gh);void 0!==b.fontStyle&&(a.fontStyle=b.fontStyle);void 0!==b.fontWeight&&(a.fontWeight=b.fontWeight);void 0!==b.Mc&&(a.Mc=b.Mc);void 0!==b.fontSize&&(a.fontSize=b.fontSize);void 0!==b.fill&&(a.fill=b.fill);void 0!==b.pb&&(a.pb=b.pb);void 0!==b.fillColor&&(a.tc=0,a.fillColor=b.fillColor);void 0!==b.Lc&&(a.tc=1,a.Lc=b.Lc);void 0!==b.Qa&&(a.tc=2,a.Qa=b.Qa);void 0!==b.fillStyle&&(a.tc=3,a.fillStyle=b.fillStyle);void 0!==b.stroke&&(a.stroke=
b.stroke);void 0!==b.wb&&(a.wb=b.wb);void 0!==b.strokeColor&&(a.Cg=0,a.strokeColor=b.strokeColor);void 0!==b.strokeStyle&&(a.Cg=3,a.strokeStyle=b.strokeStyle);void 0!==b.Cc&&(a.Cc=b.Cc);void 0!==b.Od&&(a.Od=b.Od);void 0!==b.Ef&&(a.Ef=b.Ef);void 0!==b.R&&(a.R=b.R);void 0!==b.align&&(a.align=b.align);void 0!==b.h&&(a.h=b.h);void 0!==b.fb&&(a.fb=b.fb);void 0!==b.Ja&&(a.Ja=b.Ja)}function Aa(a){a.fontWeight="normal"}function D(a,b){a.fontSize=void 0===b?12:b}
e.setFillColor=function(a){this.tc=0;this.fillColor=void 0===a?"black":a};function Ba(a,b,c,d,g){a.tc=2;a.Qa.Bi=!0;a.Qa.J=b;a.Qa.gj=c.slice(0);a.Qa.size=void 0===d?.6:d;a.Qa.offset=void 0===g?0:g}function Ca(a,b){a.stroke=void 0===b?!1:b}e.setStrokeColor=function(a){this.Cg=0;this.strokeColor=void 0===a?"black":a};function Da(a,b){a.Cc=void 0===b?1:b}function Ea(a,b){a.Od=void 0===b?!1:b}function Fa(a){a.Ef="miter"}
function Ga(a,b,c){void 0===b?a.R.i=!0:a.R={i:!0,color:b,offsetX:0,offsetY:c,blur:2}}function Ha(a,b){a.align=void 0===b?"left":b}function Ia(a,b){a.h=void 0===b?"top":b}function Ja(a){return a.fontStyle+" "+a.fontWeight+" "+a.fontSize+"px "+a.L+", "+a.Gh}function Ka(a){var b=0,c;for(c=0;c<a.length;c+=1)b=Math.max(b,a[c].width);return b}function La(a,b){return a.fontSize*b.length+a.Ja*(b.length-1)}
function Ma(a,b,c){var d,g,h,k,l,n,q=[],v=w.context;v.font=Ja(a);switch(a.Mc){case "upper":b=b.toUpperCase();break;case "lower":b=b.toLowerCase()}if(void 0===c){n=b.split("\n");for(a=0;a<n.length;a+=1)q.push({text:n[a],width:v.measureText(n[a]).width});return q}n=b.split("\n");h=v.measureText(" ").width;for(a=0;a<n.length;a+=1){g=n[a].split(" ");d=g[0];l=v.measureText(g[0]).width;for(b=1;b<g.length;b+=1)k=v.measureText(g[b]).width,l+h+k<c?(d+=" "+g[b],l+=h+k):(q.push({text:d,width:l}),d=g[b],l=k);
q.push({text:d,width:l})}return q}e.ba=function(a,b){var c;w.context.save();c=Ka(Ma(this,a,b));w.context.restore();return c};e.U=function(a,b){var c;w.context.save();c=La(this,Ma(this,a,b));w.context.restore();return c};function Na(a,b,c,d,g,h){var k=a.fontSize;a.fontSize=b;b=h?Ma(a,c,d):Ma(a,c);d=Ka(b)<=d&&La(a,b)<=g;a.fontSize=k;return d}
function Oa(a,b,c,d,g){var h=0,k=32;void 0===g&&(g=!1);for(w.context.save();Na(a,h+k,b,c,d,g);)h+=k;for(;2<=k;)k/=2,Na(a,h+k,b,c,d,g)&&(h+=k);w.context.restore();return Math.max(4,h)}function Pa(a,b,c,d,g){var h=Math.max(.01,a.Qa.size),k=a.Qa.offset;a.Qa.Bi?(k=g/2+k*g,h=.5*h*g,b=w.context.createLinearGradient(b,c+k-h,b,c+k+h)):(k=d/2+k*d,h=.5*h*d,b=w.context.createLinearGradient(b+k-h,c,b+k+h,c));c=1/(a.Qa.J-1);for(d=0;d<a.Qa.J;d+=1)b.addColorStop(d*c,a.Qa.gj[d]);return b}
function Qa(a,b,c,d,g,h,k){var l,n;!a.fill&&a.R.i?(b.shadowColor=a.R.color,b.shadowOffsetX=a.R.offsetX,b.shadowOffsetY=a.R.offsetY,b.shadowBlur=a.R.blur):(b.shadowColor=void 0,b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=k*a.wb;switch(a.Cg){case 0:b.strokeStyle=a.strokeColor;break;case 3:b.strokeStyle=a.strokeStyle}b.lineWidth=a.Cc;b.lineJoin=a.Ef;for(k=0;k<c.length;k+=1){l=0;switch(a.align){case "right":l=h-c[k].width;break;case "center":l=(h-c[k].width)/2}n=a.fontSize*(k+1)+
a.Ja*k;b.strokeText(c[k].text,d+l,g+n)}}
function Ra(a,b,c,d,g,h,k){c=Ma(a,c,k);k=Ka(c);var l=La(a,c);b.textAlign="left";b.textBaseline="bottom";switch(a.align){case "right":d+=-k;break;case "center":d+=-k/2}switch(a.h){case "base":case "bottom":g+=-l+Math.round(a.fb*a.fontSize);break;case "middle":g+=-l/2+Math.round(a.fb*a.fontSize/2)}b.font=Ja(a);a.stroke&&a.Od&&Qa(a,b,c,d,g,k,h);if(a.fill){var n=d,q=g,v,E;a.R.i?(b.shadowColor=a.R.color,b.shadowOffsetX=a.R.offsetX,b.shadowOffsetY=a.R.offsetY,b.shadowBlur=a.R.blur):(b.shadowColor=void 0,
b.shadowOffsetX=0,b.shadowOffsetY=0,b.shadowBlur=0);b.globalAlpha=h*a.pb;switch(a.tc){case 0:b.fillStyle=a.fillColor;break;case 1:l=a.Lc.f;E=new y(l.width,l.height);var A=a.Lc.On,r=a.Lc.Pn;A&&r?v="repeat":A&&!r?v="repeat-x":!A&&r?v="repeat-y":A||r||(v="no-repeat");z(E);l.q(a.Lc.jb,0,0);B(E);v=w.context.createPattern(E.canvas,v);b.fillStyle=v;break;case 2:b.fillStyle=Pa(a,n,q,k,l);break;case 3:b.fillStyle=a.fillStyle;break;default:b.fillStyle=a.fillColor}for(v=0;v<c.length;v+=1){l=0;switch(a.align){case "right":l=
k-c[v].width;break;case "center":l=(k-c[v].width)/2}E=a.fontSize*(v+1)+a.Ja*v;2===a.tc&&a.Qa.Bi&&(b.fillStyle=Pa(a,n,q+E-a.fontSize,k,a.fontSize));b.fillText(c[v].text,n+l,q+E)}}a.stroke&&!a.Od&&Qa(a,b,c,d,g,k,h)}e.q=function(a,b,c,d){var g=w.context;this.fill&&1===this.tc?this.la(a,b,c,1,1,0,1,d):(g.save(),Ra(this,g,a,b,c,1,d),g.restore())};e.cd=function(a,b,c,d,g){var h=w.context;this.fill&&1===this.tc?this.la(a,b,c,1,1,0,d,g):(h.save(),Ra(this,h,a,b,c,d,g),h.restore())};
e.la=function(a,b,c,d,g,h,k,l){var n=w.context;n.save();n.translate(b,c);n.rotate(-h*Math.PI/180);n.scale(d,g);try{Ra(this,n,a,0,0,k,l)}catch(q){}n.restore()};
function Sa(){this.jv=10;this.Li=-1;this.qt="stop_lowest_prio";this.kp=this.Oa=this.ab=!1;var a,b=this,c="undefined"!==typeof AudioContext?AudioContext:"undefined"!==typeof webkitAudioContext?webkitAudioContext:void 0;if(c)this.ab=!0;else if("undefined"!==typeof Audio)try{"undefined"!==typeof(new Audio).canPlayType&&(this.Oa=!0)}catch(d){}this.kp=this.ab||this.Oa;this.Oa&&m.t.Bg&&(this.Li=1);if(this.kp)try{a=new Audio,this.Qo={ogg:!!a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),mp3:!!a.canPlayType("audio/mpeg;").replace(/^no$/,
""),opus:!!a.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),wav:!!a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),m4a:!!(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(a.canPlayType("audio/x-mp4;")||a.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!a.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")}}catch(g){this.Qo={ogg:!1,mp3:!0,opus:!1,wav:!1,m4a:!1,mp4:!1,weba:!1}}this.Tb=[];this.Ie={};this.Wa={};this.Ic={};this.vd=
[];this.ac=0;this.ab?(this.ud=new c,this.Ro="function"===typeof this.ud.createGain?function(){return b.ud.createGain()}:"function"===typeof this.ud.createGainNode?function(){return b.ud.createGainNode()}:function(){},this.He={},this.Ki=this.Ro(),void 0===this.Ki?(this.Oa=!0,this.Tg=Sa.prototype.vl):(this.Ki.connect(this.ud.destination),this.He.master=this.Ki,this.Tg=Sa.prototype.pt)):this.Tg=this.Oa?Sa.prototype.vl:function(){}}
function Ta(a){var b=F,c,d,g,h,k;for(c=0;c<b.Tb.length;c+=1)if((d=b.Tb[c])&&0===d.pm)if(d.paused)d.Vo&&(d.xl+=a,d.xl>=d.Vo&&b.li(d.id));else if(d.zl+=a,d.Pf&&d.zl>=d.es)d.Pf=!1,Ua(b,d,d.xd);else if(d.pd&&b.Oa&&b.ld(d.id)>=d.duration)if(d.ln)try{d.F.pause(),d.F.currentTime=d.xd/1E3,4===d.F.readyState?d.F.play():(g=function(){var a=d;return{ready:function(){a.F.play();a.F.removeEventListener("canplaythrough",g.ready,!1)}}}(),d.F.addEventListener("canplaythrough",g.ready,!1))}catch(l){}else d.F.pause(),
Va(d);for(c=b.vd.length-1;0<=c;c-=1)h=b.vd[c],b.Nq(h.id)||0!==h.pm||(h.p+=a,h.p>=h.duration?(Wa(F,h.id,h.si),void 0!==b.Ic[h.id]&&(b.Ic[h.id]=h.si),h.Lb&&h.Lb(),b.vd.splice(c,1)):(k=h.Ia(h.p,h.start,h.si-h.start,h.duration),Wa(F,h.id,k),void 0!==b.Ic[h.id]&&(b.Ic[h.id]=k)))}function Xa(a,b){a.Ie[b.Rb.r.name]?a.Ie[b.Rb.r.name].length<a.jv&&a.Ie[b.Rb.r.name].push(b.F):a.Ie[b.Rb.r.name]=[b.F]}
function Ya(a,b){var c,d,g;g=[];for(c=0;c<a.Tb.length;c+=1)(d=a.Tb[c])&&0<=d.wa.indexOf(b)&&g.push(d);return g}function Za(a,b){if(0<a.Li&&a.ac>=a.Li)switch(a.qt){case "cancel_new":return!1;case "stop_lowest_prio":var c,d,g;for(c=0;c<a.Tb.length;c+=1)(d=a.Tb[c])&&d.pd&&!d.paused&&(void 0===g||g.Gk<d.Gk)&&(g=d);if(g.Gk>b.dh){a.stop(g.id);break}return!1}return!0}
function $a(a,b){var c,d=1;for(c=0;c<b.wa.length;c+=1)void 0!==F.Wa[b.wa[c]]&&(d*=F.Wa[b.wa[c]]);c=a.Ro();c.gain.value=d;c.connect(a.Ki);a.He[b.id]=c;b.F.connect(c)}function ab(a,b){b.F.disconnect(0);a.He[b.id]&&(a.He[b.id].disconnect(0),delete a.He[b.id])}function bb(a,b){var c;if(b.r&&b.r.Jb){if(a.ab)return c=a.ud.createBufferSource(),c.buffer=b.r.Jb,c.loopStart=b.startOffset/1E3,c.loopEnd=(b.startOffset+b.duration)/1E3,c;if(a.Oa)return c=b.r.Jb.cloneNode(!0),c.volume=0,c}}
function cb(a,b){var c,d;if(a.ab)(c=bb(a,b))&&(d=new db(b,c));else if(a.Oa){c=a.Ie[b.r.name];if(!c)return;0<c.length?d=new db(b,c.pop()):(c=bb(a,b))&&(d=new db(b,c))}if(d){a.ab&&$a(a,d);for(c=0;c<a.Tb.length;c+=1)if(void 0===a.Tb[c])return a.Tb[c]=d;a.Tb.push(d)}return d}function eb(a){var b=F,c,d;for(c=0;c<a.length;c+=1)if(d=a[c].split(".").pop(),b.Qo[d])return a[c];return!1}e=Sa.prototype;
e.vl=function(a,b,c){function d(){var b;a.loaded=!0;ka(c);a.duration=Math.ceil(1E3*a.Jb.duration);a.Jb.removeEventListener("canplaythrough",d,!1);a.Jb.removeEventListener("error",g,!1);b=a.Jb.cloneNode(!0);F.Ie[a.name].push(b)}function g(){ma(c)}(b=eb(b))?(a.Jb=new Audio,a.Jb.src=b,a.Jb.autoplay=!1,a.Jb.Ez="auto",a.Jb.addEventListener("canplaythrough",d,!1),a.Jb.addEventListener("error",g,!1),a.Jb.load()):g()};
e.pt=function(a,b,c){var d=eb(b),g=new XMLHttpRequest;g.open("GET",d,!0);g.responseType="arraybuffer";g.onload=function(){F.ud.decodeAudioData(g.response,function(b){b&&(a.Jb=b,a.duration=1E3*b.duration,a.loaded=!0,ka(c))},function(){ma(c)})};g.onerror=function(){"undefined"!==typeof Audio&&(F.ab=!1,F.Oa=!0,F.Tg=Sa.prototype.vl,F.Tg(a,b,c))};try{g.send()}catch(h){}};
e.play=function(a,b,c,d){if(a instanceof fb){if(Za(this,a)){a=cb(this,a);if(!a)return-1;a.es=b||0;a.Pf=0<b;a.Xb=c||0;a.Ed=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};a.Pf||Ua(this,a,a.xd);return a.id}return-1}};
function Ua(a,b,c){var d;"number"!==typeof c&&(c=0);gb(a,b.id);0<b.Xb&&(d=hb(a,b.id),Wa(a,b.id,0),ib(a,b.id,d,b.Xb,b.Ed),b.Xb=0,b.Ed=void 0);if(a.ab){d=c-b.xd;b.st=1E3*a.ud.currentTime-d;b.F.onended=function(){Va(b)};try{b.F.start?b.F.start(0,c/1E3,(b.duration-d)/1E3):b.F.noteGrainOn&&b.F.noteGrainOn(0,c/1E3,(b.duration-d)/1E3),b.$c=!0,b.pd=!0,a.ac+=1,b.F.loop=b.ln}catch(g){}}else if(a.Oa){if(4!==b.F.readyState){var h=function(){return{ready:function(){b.F.currentTime=c/1E3;b.F.play();b.$c=!0;b.F.removeEventListener("canplaythrough",
h.ready,!1)}}}();b.F.addEventListener("canplaythrough",h.ready,!1)}else b.F.currentTime=c/1E3,b.F.play(),b.$c=!0;b.pd=!0;a.ac+=1}}
e.li=function(a,b,c,d){var g,h,k,l,n=Ya(this,a);for(g=0;g<n.length;g+=1)if(h=n[g],(h.paused||!h.pd)&&!d||!h.paused&&d){if(!d){for(g=this.vd.length-1;0<=g;g-=1)if(a=this.vd[g],a.id===h.id){l=a;b=0;c=void 0;break}h.paused=!1;h.Xb=b||0;h.Ed=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b};h.Rg&&(void 0===b&&(h.Xb=h.Rg.duration),void 0===c&&(h.Ed=h.Rg.Ia),k=h.Rg.gain,h.Rg=void 0)}this.ab&&(a=bb(this,h.Rb))&&(h.F=a,$a(this,h));void 0!==k&&Wa(F,h.id,k);Ua(this,h,h.xd+(h.Mi||0));void 0!==l&&
(Wa(F,h.id,l.Ia(l.p,l.start,l.si-l.start,l.duration)),ib(F,h.id,l.si,l.duration-l.p,l.Ia,l.Lb))}};
e.pause=function(a,b,c,d,g){var h,k,l=Ya(this,a);for(a=0;a<l.length;a+=1)if(h=l[a],!h.paused)if(h.Xb=c||0,0<h.Xb)h.Ed=d||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},h.Rg={gain:jb(h.id),duration:h.Xb,Ia:h.Ed},ib(F,h.id,0,h.Xb,h.Ed,function(){F.pause(h.id,b)});else if(k=this.ld(h.id),h.Mi=k,g||(h.paused=!0,h.xl=0,h.Vo=b,this.ac-=1),this.ab){h.F.onended=function(){};if(h.pd&&h.$c){try{h.F.stop?h.F.stop(0):h.F.noteOff&&h.F.noteOff(0)}catch(n){}h.$c=!1}ab(this,h)}else this.Oa&&h.F.pause()};
function Va(a){var b=F;b.Wa[a.id]&&delete b.Wa[a.id];a.paused||(b.ac-=1);b.ab?(a.$c=!1,a.pd=!1,ab(b,a)):b.Oa&&Xa(b,a);b.Tb[b.Tb.indexOf(a)]=void 0}
e.stop=function(a,b,c){var d,g=Ya(this,a);for(a=0;a<g.length;a+=1)if(d=g[a],d.Xb=b||0,0<d.Xb)d.Ed=c||function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},ib(F,d.id,0,d.Xb,d.Ed,function(){F.stop(d.id)});else{this.Wa[d.id]&&delete this.Wa[d.id];d.pd&&!d.paused&&(this.ac-=1);if(this.ab){if(d.pd&&!d.paused&&!d.Pf){if(d.$c){try{d.F.stop?d.F.stop(0):d.F.noteOff&&d.F.noteOff(0)}catch(h){}d.$c=!1}ab(this,d)}}else this.Oa&&(d.Pf||d.F.pause(),Xa(this,d));this.Tb[this.Tb.indexOf(d)]=void 0;d.pd=!1}};
function ib(a,b,c,d,g,h){var k;for(k=0;k<a.vd.length;k+=1)if(a.vd[k].id===b){a.vd.splice(k,1);break}a.vd.push({id:b,si:c,Ia:g||function(a,b,c,d){return a==d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b},duration:d,p:0,start:hb(a,b),Lb:h,pm:0})}function kb(a){var b=F,c;void 0===b.Ic[a]&&(c=void 0!==b.Wa[a]?b.Wa[a]:1,Wa(b,a,0),b.Ic[a]=c)}function lb(a){var b=F;void 0!==b.Ic[a]&&(Wa(b,a,b.Ic[a]),delete b.Ic[a])}
e.position=function(a,b){var c,d,g,h,k=Ya(this,a);if(!isNaN(b)&&0<=b)for(c=0;c<k.length;c++)if(d=k[c],b%=d.duration,this.ab)if(d.paused)d.Mi=b;else{d.F.onended=function(){};if(d.$c){try{d.F.stop?d.F.stop(0):d.F.noteOff&&d.F.noteOff(0)}catch(l){}d.$c=!1}ab(this,d);this.ac-=1;if(g=bb(this,d.Rb))d.F=g,$a(this,d),Ua(this,d,d.xd+b)}else this.Oa&&(4===d.F.readyState?d.F.currentTime=(d.xd+b)/1E3:(h=function(){var a=d,c=b;return{wq:function(){a.F.currentTime=(a.xd+c)/1E3;a.F.removeEventListener("canplaythrough",
h.wq,!1)}}}(),d.F.addEventListener("canplaythrough",h.wq,!1)))};e.Rn=function(a){F.position(a,0)};e.Pk=function(a,b){var c,d=Ya(this,a);for(c=0;c<d.length;c+=1)d[c].ln=b,this.ab&&(d[c].F.loop=b)};function hb(a,b){return void 0!==a.Wa[b]?a.Wa[b]:1}function jb(a){var b=F,c=1,d=Ya(b,a)[0];if(d)for(a=0;a<d.wa.length;a+=1)void 0!==b.Wa[d.wa[a]]&&(c*=b.Wa[d.wa[a]]);return Math.round(100*c)/100}
function Wa(a,b,c){var d,g,h=1,k=Ya(a,b);a.Wa[b]=c;a.Ic[b]&&delete a.Ic[b];for(c=0;c<k.length;c+=1)if(d=k[c],0<=d.wa.indexOf(b)){for(g=0;g<d.wa.length;g+=1)void 0!==a.Wa[d.wa[g]]&&(h*=a.Wa[d.wa[g]]);h=Math.round(100*h)/100;a.ab?a.He[d.id].gain.value=h:a.Oa&&(d.F.volume=h)}}function gb(a,b){var c,d,g,h=1,k=Ya(a,b);for(c=0;c<k.length;c+=1){d=k[c];for(g=0;g<d.wa.length;g+=1)void 0!==a.Wa[d.wa[g]]&&(h*=a.Wa[d.wa[g]]);h=Math.round(100*h)/100;a.ab?a.He[d.id].gain.value=h:a.Oa&&(d.F.volume=h)}}
e.ep=function(a,b){var c,d,g,h=Ya(this,a);for(c=0;c<h.length;c+=1)for(d=h[c],b=[].concat(b),g=0;g<b.length;g+=1)0>d.wa.indexOf(b[g])&&d.wa.push(b[g]);gb(this,a)};e.Nq=function(a){if(a=Ya(this,a)[0])return a.paused};e.ld=function(a){if(a=Ya(this,a)[0]){if(this.ab)return a.paused?a.Mi:(1E3*F.ud.currentTime-a.st)%a.duration;if(F.Oa)return Math.ceil(1E3*a.F.currentTime-a.xd)}};var F=new Sa;function mb(a,b,c,d){this.name=a;this.Jv=b;this.Nv=c;this.gc=d;this.loaded=!1;this.Jb=null;na(this,this.gc,1)}
mb.prototype.rd=function(a,b){var c,d;c=this.Jv;0!==c.toLowerCase().indexOf("http:")&&0!==c.toLowerCase().indexOf("https:")&&(c=b+c);d=this.Nv;0!==d.toLowerCase().indexOf("http:")&&0!==d.toLowerCase().indexOf("https:")&&(d=b+d);F.Ie[this.name]=[];F.Tg(this,[d,c],a)};mb.prototype.complete=function(){return this.loaded};
function fb(a,b,c,d,g,h,k){this.name=a;this.r=b;this.startOffset=c;this.duration=d;Wa(F,this.name,void 0!==g?g:1);this.dh=void 0!==h?h:10;this.wa=[];k&&(this.wa=this.wa.concat(k));0>this.wa.indexOf(this.name)&&this.wa.push(this.name)}fb.prototype.complete=function(){return this.r.complete()};fb.prototype.Gk=function(a){void 0!==a&&(this.dh=a);return this.dh};fb.prototype.ep=function(a){var b;a=[].concat(a);for(b=0;b<a.length;b+=1)0>this.wa.indexOf(a[b])&&this.wa.push(a[b])};
function db(a,b){this.Rb=a;this.xd=this.Rb.startOffset;this.F=b;this.duration=this.Rb.duration;this.tl()}db.prototype.tl=function(){this.id=Math.round(Date.now()*Math.random())+"";this.wa=["master",this.id].concat(this.Rb.wa);this.Gk=void 0!==this.Rb.dh?this.Rb.dh:10;this.paused=this.pd=this.ln=!1;this.zl=this.pm=0;this.$c=this.Pf=!1;this.es=this.Mi=0;var a,b=1;for(a=0;a<this.wa.length;a+=1)void 0!==F.Wa[this.wa[a]]&&(b*=F.Wa[this.wa[a]]);!F.ab&&F.Oa&&(this.F.volume=b)};
function nb(a){this.name=a;this.text="";this.sc=this.complete=!1}nb.prototype.Je=function(a){4===a.readyState&&(this.complete=!0,(this.sc=200!==a.status)?la("Get Failed",{name:this.name}):(this.text=a.responseText,la("Get Complete",{name:this.name})))};
function ob(a,b){var c=new XMLHttpRequest;a.complete=!1;c.open("POST",b);c.setRequestHeader("Content-Type","text/plain;charset=UTF-8");c.onreadystatechange=function(){4===c.readyState&&(a.complete=!0,a.sc=200!==c.status,a.sc?la("Post Failed",{name:a.name}):la("Post Complete",{name:a.name}))};c.send(a.text)}function pb(a,b){var c=new XMLHttpRequest;c.open("GET",b,!1);try{c.send()}catch(d){return!1}a.complete=!0;a.sc=200!==c.status;if(a.sc)return!1;a.text=c.responseText;return!0}
function qb(a){a&&(this.Kd=a);this.clear();this.$g=this.Sf=this.Hc=this.Zg=this.Yg=this.bh=this.Vg=this.ah=this.wd=this.Xg=this.Wg=0;rb(this,this);sb(this,this);tb(this,this);this.Wd=[];this.Ng=[];this.fh=[];this.H=0;this.Wo=!1;this.Vj=this.startTime=Date.now();this.Df=this.ge=0;this.kv=200;this.gc="";window.Ei(window.No)}qb.prototype.clear=function(){this.C=[];this.gh=!1;this.Ib=[];this.sl=!1};
function rb(a,b){window.addEventListener("click",function(a){var d,g,h;if(void 0!==b.Kd&&!(0<b.H)&&(d=b.Kd,g=d.getBoundingClientRect(),h=d.width/g.width*(a.clientX-g.left),d=d.height/g.height*(a.clientY-g.top),a.preventDefault(),b.Of.x=h,b.Of.y=d,b.Pg.push({x:b.Of.x,y:b.Of.y}),0<b.Zg))for(a=b.C.length-1;0<=a&&!((h=b.C[a])&&h.i&&0>=h.H&&h.Rm&&(h=h.Rm(b.Of.x,b.Of.y),!0===h));a-=1);},!1);ub(a)}function ub(a){a.Of={x:0,y:0};a.Pg=[]}
function sb(a,b){window.addEventListener("mousedown",function(a){0<b.H||(a.preventDefault(),window.focus(),b.Uo>=Date.now()-1E3||(vb(b,0,a.clientX,a.clientY),wb(b,0)))},!1);window.addEventListener("mouseup",function(a){0<b.H||(a.preventDefault(),b.Ji>=Date.now()-1E3||(vb(b,0,a.clientX,a.clientY),xb(b,0)))},!1);window.addEventListener("mousemove",function(a){0<b.H||(a.preventDefault(),vb(b,0,a.clientX,a.clientY))},!1);window.addEventListener("touchstart",function(a){var d=a.changedTouches;b.Uo=Date.now();
if(!(0<b.H))for(a.preventDefault(),window.focus(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),wb(b,d[a].identifier)},!1);window.addEventListener("touchend",function(a){var d=a.changedTouches;b.Ji=Date.now();if(!(0<b.H))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),xb(b,d[a].identifier)},!1);window.addEventListener("touchmove",function(a){var d=a.changedTouches;if(!(0<b.H))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,
d[a].clientX,d[a].clientY)},!1);window.addEventListener("touchleave",function(a){var d=a.changedTouches;b.Ji=Date.now();if(!(0<b.H))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),xb(b,d[a].identifier)},!1);window.addEventListener("touchcancel",function(a){var d=a.changedTouches;b.Ji=Date.now();if(!(0<b.H))for(a.preventDefault(),a=0;a<d.length;a+=1)vb(b,d[a].identifier,d[a].clientX,d[a].clientY),xb(b,d[a].identifier)},!1);window.addEventListener("mousewheel",
function(a){zb(b,a)},!1);window.addEventListener("DOMMouseScroll",function(a){zb(b,a)},!1);Ab(a);a.Uo=0;a.Ji=0}function Ab(a){var b;a.ka=[];for(b=0;16>b;b+=1)a.ka[b]={id:-1,cb:!1,x:0,y:0};a.Le=[]}function Bb(a,b){var c=-1,d;for(d=0;16>d;d+=1)if(a.ka[d].id===b){c=d;break}if(-1===c)for(d=0;16>d;d+=1)if(!a.ka[d].cb){c=d;a.ka[d].id=b;break}return c}
function vb(a,b,c,d){var g,h;void 0!==a.Kd&&(b=Bb(a,b),-1!==b&&(g=a.Kd,h=g.getBoundingClientRect(),a.ka[b].x=g.width/h.width*(c-h.left),a.ka[b].y=g.height/h.height*(d-h.top)))}function wb(a,b){var c=Bb(a,b),d,g;if(-1!==c&&!a.ka[c].cb&&(a.Le.push({$e:c,x:a.ka[c].x,y:a.ka[c].y,cb:!0}),a.ka[c].cb=!0,0<a.Hc))for(d=a.C.length-1;0<=d&&!((g=a.C[d])&&g.i&&0>=g.H&&g.ig&&(g=g.ig(c,a.ka[c].x,a.ka[c].y),!0===g));d-=1);}
function xb(a,b){var c=Bb(a,b),d,g;if(-1!==c&&a.ka[c].cb&&(a.Le.push({$e:c,x:a.ka[c].x,y:a.ka[c].y,cb:!1}),a.ka[c].cb=!1,0<a.Hc))for(d=a.C.length-1;0<=d&&!((g=a.C[d])&&g.i&&0>=g.H&&g.jg&&(g=g.jg(c,a.ka[c].x,a.ka[c].y),!0===g));d-=1);}
function zb(a,b){var c;if(!(0<a.H)){b.preventDefault();window.focus();c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail));var d,g;a.Le.push({$e:0,x:a.ka[0].x,y:a.ka[0].y,wheelDelta:c});if(0<a.Hc)for(d=a.C.length-1;0<=d&&!((g=a.C[d])&&g.i&&0>=g.H&&g.Um&&(g=g.Um(c,a.ka[0].x,a.ka[0].y),!0===g));d-=1);}}function Cb(a){return G.ka[a].x}
function tb(a,b){window.addEventListener("keydown",function(a){0<b.H||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Db(b,a.keyCode))},!1);window.addEventListener("keyup",function(a){0<b.H||(-1<[32,37,38,39,40].indexOf(a.keyCode)&&a.preventDefault(),Eb(b,a.keyCode))},!1);Fb(a)}function Fb(a){var b;a.Sg=[];for(b=0;256>b;b+=1)a.Sg[b]=!1;a.Rf=[]}
function Db(a,b){var c,d;if(!a.Sg[b]&&(a.Rf.push({key:b,cb:!0}),a.Sg[b]=!0,0<a.Sf))for(c=0;c<a.C.length&&!((d=a.C[c])&&d.i&&0>=d.H&&d.Sm&&(d=d.Sm(b),!0===d));c+=1);}function Eb(a,b){var c,d;if(a.Sg[b]&&(a.Rf.push({key:b,cb:!1}),a.Sg[b]=!1,0<a.Sf))for(c=0;c<a.C.length&&!((d=a.C[c])&&d.i&&0>=d.H&&d.Tm&&(d=d.Tm(b),!0===d));c+=1);}function Gb(){var a=G,b;for(b=0;b<a.Wd.length;b+=1)a.Wd[b].paused+=1}
function la(a,b){var c,d=G,g,h;void 0===c&&(c=null);d.fh.push({id:a,vt:b,Hg:c});if(0<d.$g)for(g=0;g<d.C.length&&(!((h=d.C[g])&&h.i&&0>=h.H&&h.Vm)||null!==c&&c!==h||(h=h.Vm(a,b),!0!==h));g+=1);}
function Ib(a,b){var c=a.Ib[b];c.visible&&(void 0!==c.canvas&&c.canvas!==w.canvas&&w.hb(c.canvas),!1!==w.canvas.$||!0===c.uc)&&(0===c.To&&(0>=c.H&&(c.jb+=c.ut*a.Df/1E3),1===c.ml&&1===c.nl&&0===c.La?1===c.alpha?c.f.q(c.jb,c.x,c.y):c.f.cd(c.jb,c.x,c.y,c.alpha):c.f.la(c.jb,c.x,c.y,c.ml,c.nl,c.La,c.alpha)),1===c.To&&(1===c.ml&&1===c.nl&&0===c.La?1===c.alpha?c.font.q(c.text,c.x,c.y):c.font.cd(c.text,c.x,c.y,c.alpha):c.font.la(c.text,c.x,c.y,c.ml,c.nl,c.La,c.alpha)))}
function Jb(a,b){var c=a.C[b];if(c.visible&&(void 0!==c.canvas&&c.canvas!==w.canvas&&w.hb(c.canvas),(!1!==w.canvas.$||!0===c.uc)&&c.Xa))return c.Xa()}function Kb(a){for(var b=0,c=0;b<a.C.length||c<a.Ib.length;)if(c===a.Ib.length){if(!0===Jb(a,b))break;b+=1}else if(b===a.C.length)Ib(a,c),c+=1;else if(a.Ib[c].ua>a.C[b].ua||a.Ib[c].ua===a.C[b].ua&&a.Ib[c].depth>a.C[b].depth)Ib(a,c),c+=1;else{if(!0===Jb(a,b))break;b+=1}}qb.prototype.pause=function(a){this.H+=1;void 0===a&&(a=!1);this.Wo=a};
qb.prototype.li=function(){0!==this.H&&(this.Vj=Date.now(),this.H-=1)};qb.prototype.Nq=function(){return 0<this.H};window.pl=0;window.ol=0;window.Oo=0;window.ht=0;window.Po=0;window.jt=60;window.kt=0;window.it=!1;
window.No=function(){window.pl=Date.now();window.ht=window.pl-window.ol;var a=G,b;if(0<a.H)a.Wo&&(Lb(a),Kb(a));else{b=Date.now();"number"!==typeof b&&(b=a.Vj);a.Df=Math.min(a.kv,b-a.Vj);a.ge+=a.Df;""===a.gc&&(a.gc="start",ia.rd(a.gc));"start"===a.gc&&ia.complete(a.gc)&&(a.gc="load",ia.rd(a.gc));"load"===a.gc&&ia.complete(a.gc)&&(a.gc="game",ia.rd(a.gc));"undefined"!==typeof F&&Ta(a.Df);var c,d;if(0<a.Wg)for(c=0;c<a.C.length&&!((d=a.C[c])&&d.ra&&d.i&&0>=d.H&&!0===d.ra(a.Df));c+=1);var g,h;if(0!==a.Pg.length){if(0<
a.Xg)for(d=a.C.length-1;0<=d;d-=1)if((g=a.C[d])&&g.i&&0>=g.H&&g.Pm)for(c=0;c<a.Pg.length;c+=1)h=a.Pg[c],!0!==h.vc&&(h.vc=g.Pm(h.x,h.y));a.Pg=[]}if(0!==a.Le.length){if(0<a.wd)for(d=a.C.length-1;0<=d;d-=1)if((g=a.C[d])&&g.i&&0>=g.H&&(g.rb||g.Cb||g.Mj))for(c=0;c<a.Le.length;c+=1)h=a.Le[c],!0!==h.vc&&(void 0!==h.wheelDelta&&g.Mj?h.vc=g.Mj(h.wheelDelta,h.x,h.y):h.cb&&g.rb?h.vc=g.rb(h.$e,h.x,h.y):void 0!==h.cb&&!h.cb&&g.Cb&&(h.vc=g.Cb(h.$e,h.x,h.y)));a.Le=[]}if(0!==a.Rf.length){if(0<a.ah)for(d=0;d<a.C.length;d+=
1)if((g=a.C[d])&&g.i&&0>=g.H&&(g.Lj||g.kg))for(c=0;c<a.Rf.length;c+=1)h=a.Rf[c],!0!==h.vc&&(h.cb&&g.Lj?h.vc=void 0:!h.cb&&g.kg&&(h.vc=g.kg(h.key)));a.Rf=[]}c=a.Df;for(d=a.Ng.length=0;d<a.Wd.length;d+=1)g=a.Wd[d],void 0!==g.id&&0===g.paused&&(0<g.Eg||0<g.Qn)&&(g.Eg-=c,0>=g.Eg&&(a.Ng.push({id:g.id,Hg:g.Hg}),0<g.Qn?(g.Qn-=1,g.Eg+=g.time):g.Eg=0));if(0<a.Vg&&0<a.Ng.length)for(c=0;c<a.C.length;c+=1)if((d=a.C[c])&&d.Om&&d.i)for(g=0;g<a.Ng.length;g+=1)h=a.Ng[g],!0===h.vc||null!==h.Hg&&h.Hg!==d||(h.vc=d.Om(h.id));
if(0<a.bh&&0<a.fh.length)for(c=0;c<a.C.length;c+=1)if((g=a.C[c])&&g.Oc&&g.i&&0>=g.H)for(d=0;d<a.fh.length;d+=1)h=a.fh[d],!0===h.vc||null!==h.Hg&&h.Hg!==g||(h.vc=g.Oc(h.id,h.vt));a.fh.length=0;if(0<a.Yg)for(c=0;c<a.C.length&&!((d=a.C[c])&&d.nd&&d.i&&0>=d.H&&!0===d.nd(a.Df));c+=1);Lb(a);Kb(a);a.Vj=b}window.ol=Date.now();window.Oo=window.ol-window.pl;window.Po=Math.max(window.kt,1E3/window.jt-window.Oo);window.Ei(window.No)};window.Ei=function(a){window.setTimeout(a,window.Po)};
window.it||(window.Ei=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||window.Ei);
function Lb(a){function b(a,b){return a.ua===b.ua?b.depth-a.depth:a.ua>b.ua?-1:1}var c,d;for(c=d=0;c<a.C.length;c+=1)a.C[c]&&(a.C[c].ql&&(a.C[c].ql=!1,a.C[c].i=!0),a.C[d]=a.C[c],d+=1);a.C.length=d;a.gh&&a.C.sort(b);a.gh=!1;for(c=d=0;c<a.Ib.length;c+=1)a.Ib[c]&&(a.Ib[d]=a.Ib[c],d+=1);a.Ib.length=d;a.sl&&a.Ib.sort(b);a.sl=!1}
function H(a,b){var c=G;void 0===a.group&&(a.group=0);void 0===a.visible&&(a.visible=!0);void 0===a.i&&(a.i=!0);void 0===a.depth&&(a.depth=0);void 0===a.ua&&(a.ua=0);void 0===a.H&&(a.H=0);void 0===a.Ke&&(a.Ke=[]);a.ql=!1;void 0!==b&&!1===b&&(a.ql=!0,a.i=!1);c.C.push(a);c.gh=!0;a.ra&&(c.Wg+=1);a.Pm&&(c.Xg+=1);if(a.rb||a.Cb)c.wd+=1;a.Mj&&(c.wd+=1);if(a.Lj||a.kg)c.ah+=1;a.Om&&(c.Vg+=1);a.Oc&&(c.bh+=1);a.nd&&(c.Yg+=1);a.Rm&&(c.Zg+=1);if(a.ig||a.jg)c.Hc+=1;a.Um&&(c.Hc+=1);if(a.Sm||a.Tm)c.Sf+=1;a.Vm&&(c.$g+=
1);a.dc&&a.dc()}function Mb(a,b){var c=G;a.depth!==b&&(c.gh=!0);a.depth=b}function Nb(a,b){var c;b=[].concat(b);void 0===a.Ke&&(a.Ke=[]);for(c=b.length-1;0<=c;c-=1)0>a.Ke.indexOf(b[c])&&a.Ke.push(b[c])}
function Ob(a,b){var c=[],d,g;if(void 0===b||"all"===b||"master"===b)for(d=0;d<a.C.length;d+=1)g=a.C[d],void 0!==g&&c.push(g);else if("function"===typeof b)for(d=0;d<a.C.length;d+=1)g=a.C[d],void 0!==g&&b(g)&&c.push(g);else for(d=0;d<a.C.length;d+=1)g=a.C[d],void 0!==g&&0<=g.Ke.indexOf(b)&&c.push(g);return c}function Pb(a){var b=Ob(G,a);for(a=0;a<b.length;a+=1){var c=b[a];c.H+=1}}function Qb(a){var b=Ob(G,a);for(a=0;a<b.length;a+=1){var c=b[a];c.H=Math.max(0,c.H-1)}}
function I(a,b){var c=a.C.indexOf(b);if(!(0>c)){a.C[c].Zb&&a.C[c].Zb();var d=a.C[c];d.ra&&(a.Wg-=1);d.Pm&&(a.Xg-=1);if(d.rb||d.Cb)a.wd-=1;d.Mj&&(a.wd-=1);if(d.Lj||d.kg)a.ah-=1;d.Om&&(a.Vg-=1);d.Oc&&(a.bh-=1);d.nd&&(a.Yg-=1);d.Rm&&(a.Zg-=1);if(d.ig||d.jg)a.Hc-=1;d.Um&&(a.Hc-=1);if(d.Sm||d.Tm)a.Sf-=1;d.Vm&&(a.$g-=1);a.C[c]=void 0}}
qb.prototype.d=function(a,b,c,d,g,h,k){void 0===k&&(k=0);this.Ib.push({To:0,f:a,jb:b,ut:c,visible:!0,x:d,y:g,ml:1,nl:1,La:0,alpha:1,depth:h,ua:k,H:0,Ke:[]});this.sl=!0;return this.Ib[this.Ib.length-1]};var G=new qb(ba);
function Rb(a,b){var c;this.kind=a;this.w=null;switch(this.kind){case 0:this.w={x:[b.x],y:[b.y]};this.Aa=b.x;this.Ma=b.y;this.Sa=b.x;this.mb=b.y;break;case 2:this.w={x:[b.x,b.x+b.kb-1,b.x+b.kb-1,b.x,b.x],y:[b.y,b.y,b.y+b.qb-1,b.y+b.qb-1,b.y]};this.Aa=b.x;this.Ma=b.y;this.Sa=b.x+b.kb-1;this.mb=b.y+b.qb-1;break;case 3:this.w={x:[],y:[]};this.Aa=b.x-b.Jk;this.Ma=b.y-b.Jk;this.Sa=b.x+b.Jk;this.mb=b.y+b.Jk;break;case 1:this.w={x:[b.Jo,b.Ko],y:[b.Lo,b.Mo]};this.Aa=Math.min(b.Jo,b.Ko);this.Ma=Math.min(b.Lo,
b.Mo);this.Sa=Math.max(b.Jo,b.Ko);this.mb=Math.max(b.Lo,b.Mo);break;case 4:this.w={x:[],y:[]};this.Aa=b.x[0];this.Ma=b.y[0];this.Sa=b.x[0];this.mb=b.y[0];for(c=0;c<b.x.length;c+=1)this.w.x.push(b.x[c]),this.w.y.push(b.y[c]),this.Aa=Math.min(this.Aa,b.x[c]),this.Ma=Math.min(this.Ma,b.y[c]),this.Sa=Math.max(this.Sa,b.x[c]),this.mb=Math.max(this.mb,b.y[c]);this.w.x.push(b.x[0]);this.w.y.push(b.y[0]);break;default:this.Ma=this.Aa=0,this.mb=this.Sa=-1}}
function Sb(a,b,c,d){return new Rb(2,{x:a,y:b,kb:c,qb:d})}function Tb(a){var b=1E6,c=-1E6,d=1E6,g=-1E6,h,k,l,n,q;for(h=0;h<a.J;h+=1)k=a.Rd[h]-a.yb,l=k+a.Qd[h]-1,n=a.Sd[h]-a.zb,q=n+a.Pd[h]-1,k<b&&(b=k),l>c&&(c=l),n<d&&(d=n),q>g&&(g=q);return new Rb(2,{x:b,y:d,kb:c-b+1,qb:g-d+1})}e=Rb.prototype;
e.K=function(){var a=new Rb(-1,{}),b;a.kind=this.kind;a.Aa=this.Aa;a.Sa=this.Sa;a.Ma=this.Ma;a.mb=this.mb;a.w={x:[],y:[]};for(b=0;b<this.w.x.length;b+=1)a.w.x[b]=this.w.x[b];for(b=0;b<this.w.y.length;b+=1)a.w.y[b]=this.w.y[b];return a};e.translate=function(a,b){var c=this.K(),d;c.Aa+=a;c.Sa+=a;c.Ma+=b;c.mb+=b;for(d=0;d<c.w.x.length;d+=1)c.w.x[d]+=a;for(d=0;d<c.w.y.length;d+=1)c.w.y[d]+=b;return c};
e.scale=function(a){var b=this.K(),c;b.Aa*=a;b.Sa*=a;b.Ma*=a;b.mb*=a;for(c=0;c<b.w.x.length;c+=1)b.w.x[c]*=a;for(c=0;c<b.w.y.length;c+=1)b.w.y[c]*=a;return b};
e.rotate=function(a){var b,c,d,g;switch(this.kind){case 0:return b=new p(this.w.x[0],this.w.y[0]),b=b.rotate(a),new Rb(0,{x:b.x,y:b.y});case 1:return b=new p(this.w.x[0],this.w.y[0]),b=b.rotate(a),c=new p(this.w.x[1],this.w.y[1]),c=c.rotate(a),new Rb(1,{Jo:b.x,Lo:b.y,Ko:c.x,Mo:c.y});case 3:return b=(this.Sa-this.Aa)/2,c=new p(this.Aa+b,this.Ma+b),c=c.rotate(a),new Rb(3,{x:c.x,y:c.y,Jk:b});default:c=[];d=[];for(g=0;g<this.w.x.length-1;g+=1)b=new p(this.w.x[g],this.w.y[g]),b=b.rotate(a),c.push(b.x),
d.push(b.y);return new Rb(4,{x:c,y:d})}};
function Ub(a,b,c,d,g){var h,k,l,n,q;if(d<b+a.Aa||d>b+a.Sa||g<c+a.Ma||g>c+a.mb)return!1;switch(a.kind){case 0:case 2:return!0;case 3:return l=(a.Sa-a.Aa)/2,d-=b+a.Aa+l,g-=c+a.Ma+l,d*d+g*g<=l*l;case 1:return l=b+a.w.x[0],n=c+a.w.y[0],b+=a.w.x[1],a=c+a.w.y[1],d===l?g===n:d===b?g===a:1>Math.abs(n+(d-l)*(a-n)/(b-l)-g);case 4:n=new p(0,0);q=new p(0,0);l=[];for(k=0;k<a.w.x.length-1;k+=1)n.x=a.w.x[k],n.y=a.w.y[k],q.x=a.w.x[k+1],q.y=a.w.y[k+1],l.push(ea(da(n,q)));for(n=0;n<l.length;n+=1){q=new p(d,g);k=l[n];
q=q.x*k.x+q.y*k.y;h=a;var v=b,E=c,A=l[n],r=new p(0,0),s=void 0,t=1E9;k=-1E10;for(var u=void 0,u=0;u<h.w.x.length;u+=1)r.x=v+h.w.x[u],r.y=E+h.w.y[u],s=r.x*A.x+r.y*A.y,t=Math.min(t,s),k=Math.max(k,s);h=t;if(q<h||k<q)return!1}return!0;default:return!1}}
e.ob=function(a,b,c){var d=w.context;d.fillStyle=c;d.strokeStyle=c;switch(this.kind){case 0:d.fillRect(a+this.Aa-1,b+this.Ma-1,3,3);break;case 2:d.fillRect(a+this.Aa,b+this.Ma,this.Sa-this.Aa+1,this.mb-this.Ma+1);break;case 3:c=(this.Sa-this.Aa)/2;d.beginPath();d.arc(a+this.Aa+c,b+this.Ma+c,c,0,2*Math.PI,!1);d.closePath();d.fill();break;case 1:d.beginPath();d.moveTo(a+this.w.x[0],b+this.w.y[0]);d.lineTo(a+this.w.x[1],b+this.w.y[1]);d.stroke();break;case 4:d.beginPath();d.moveTo(a+this.w.x[0],b+this.w.y[0]);
for(c=1;c<this.w.x.length-1;c+=1)d.lineTo(a+this.w.x[c],b+this.w.y[c]);d.closePath();d.fill()}};function Vb(){this.depth=1E7;this.visible=!1;this.i=!0;this.group="Engine";this.da=[];this.Ug=this.H=this.eh=!1;this.Yd=1;this.lc=-1;this.ja=-1E6}e=Vb.prototype;e.K=function(){var a=new Vb,b;for(b=0;b<this.da.length;b+=1)a.da.push({Ra:this.da[b].Ra,action:this.da[b].action});a.Ug=this.Ug;return a};
e.sa=function(a,b){var c,d;if(0===this.da.length||this.da[this.da.length-1].Ra<=a)this.da.push({Ra:a,action:b});else{for(c=0;this.da[c].Ra<=a;)c+=1;for(d=this.da.length;d>c;d-=1)this.da[d]=this.da[d-1];this.da[c]={Ra:a,action:b}}this.ja=-1E6};e.start=function(){this.eh=!0;this.H=!1;this.lc=0>this.Yd&&0<this.da.length?this.da[this.da.length-1].Ra+1:-1;this.ja=-1E6;I(G,this);H(this)};
e.Rn=function(){if(0>this.Yd&&0<this.da.length){var a=this.da[this.da.length-1].Ra;this.lc=0>this.Yd?a+1:a-1}else this.lc=0>this.Yd?1:-1;this.ja=-1E6};e.stop=function(){this.eh=!1;I(G,this)};e.Md=function(){return this.eh};e.pause=function(){this.H=!0;I(G,this)};e.li=function(){this.H=!1;I(G,this);H(this)};e.paused=function(){return this.eh&&this.H};e.Pk=function(a){this.Ug=a};
e.ra=function(a){if(this.eh&&!this.H&&0!==this.Yd)if(0<this.Yd){0>this.ja&&(this.ja=0);for(;this.ja<this.da.length&&this.da[this.ja].Ra<=this.lc;)this.ja+=1;for(this.lc+=this.Yd*a;0<=this.ja&&this.ja<this.da.length&&this.da[this.ja].Ra<=this.lc;)this.da[this.ja].action(this.da[this.ja].Ra,this),this.ja+=1;this.ja>=this.da.length&&(this.Ug?this.Rn():this.stop())}else{0>this.ja&&(this.ja=this.da.length-1);for(;0<=this.ja&&this.da[this.ja].Ra>=this.lc;)this.ja-=1;for(this.lc+=this.Yd*a;0<=this.ja&&this.da[this.ja].Ra>=
this.lc;)this.da[this.ja].action(this.da[this.ja].Ra,this),this.ja-=1;0>this.ja&&0>=this.lc&&(this.Ug?this.Rn():this.stop())}};function Wb(){this.depth=1E7;this.visible=!1;this.i=!0;this.group="Engine";this.Hb=[];this.Ge=[];this.clear();this.Bw=!1;H(this)}e=Wb.prototype;e.ra=function(){var a,b,c,d,g;if(this.Bw)for(a=0;16>a;a+=1)G.ka[a].cb&&(b=Cb(a),c=G.ka[a].y,d=this.Ge[a],g=this.Hb[d],!(0<=d&&g&&g.selected)||g&&Ub(g.xc,0,0,b,c)||(Eb(G,g.keyCode),g.selected=!1,this.Ge[a]=-1),this.rb(a,b,c))};
e.rb=function(a,b,c){var d;if(!(0<=this.Ge[a]))for(d=0;d<this.Hb.length;d+=1){var g;if(g=this.Hb[d])g=(g=this.Hb[d])?Ub(g.xc,0,0,b,c):!1;if(g&&!this.Hb[d].selected){Db(G,this.Hb[d].keyCode);this.Hb[d].selected=!0;this.Ge[a]=d;break}}};e.Cb=function(a){var b=this.Ge[a];0<=b&&this.Hb[b]&&this.Hb[b].selected&&(Eb(G,this.Hb[b].keyCode),this.Hb[b].selected=!1);this.Ge[a]=-1};function Xb(a,b,c,d,g,h,k){c=Sb(c,d,g,h);a.Hb.push({keyCode:k,xc:c,id:b,selected:!1})}
e.clear=function(){var a;for(a=this.Hb.length=0;16>a;a+=1)this.Ge[a]=-1};e.ob=function(a,b,c){var d,g,h,k;for(d=0;d<this.Hb.length;d+=1)if(g=this.Hb[d])g.selected?g.xc.ob(0,0,b):g.xc.ob(0,0,a),h=(g.xc.Aa+g.xc.Sa)/2,k=(g.xc.Ma+g.xc.mb)/2,w.bc("id: "+g.id,h-20,k-10,c,"16px Arial"),w.bc("key: "+g.keyCode,h-20,k+10,c,"16px Arial")};new fa;function Yb(a,b){return b}function J(a,b,c,d){return b+a/d*c}function Zb(a,b,c,d,g){void 0===g&&(g=3);return b+c*Math.pow(a/d,g)}
function $b(a,b,c,d){return Zb(a,b,c,d,2)}function ac(a,b,c,d){return b+c*Zb(d-a,1,-1,d,2)}function bc(a,b,c,d){return Zb(a,b,c,d,3)}function L(a,b,c,d){return b+c*Zb(d-a,1,-1,d,3)}function cc(a,b,c,d){return b+c*(a<d/2?Zb(a,0,.5,d/2,3):Zb(d-a,1,-.5,d/2,3))}function dc(a,b,c,d,g){var h;void 0===g&&(g=8);h=Math.pow(2,-g);return b+(Math.pow(2,g*a/d-g)-h)/(1-h)*c}
function ec(a,b,c,d,g){a=d-a;var h=3;void 0===h&&(h=3);void 0===g&&(g=8);h=Math.sin(2*(1-a/d)*Math.PI*h+Math.PI/2);h*=dc(a,0,1,d,g);return b+c*(1+-1*h)}function fc(a,b,c,d,g){void 0===g&&(g=1.70158);return b+c*((1+g)*Math.pow(a/d,3)-g*Math.pow(a/d,2))}function gc(a,b,c,d,g){return b+c*fc(d-a,1,-1,d,g)}
function hc(a){switch(1){case 0:return function(b,c,d,g,h,k,l){return 0>b?c:b>g?c+d:a(b,c,d,g,h,k,l)};case 1:return function(b,c,d,g,h,k,l){return a(b-Math.floor(b/g)*g,c,d,g,h,k,l)};case 2:return function(b,c,d,g,h,k,l){b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,0,1,g,h,k,l);return c+d*b};case 3:return function(b,c,d,g,h,k,l){h=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);0!==Math.floor(b/g)%2&&(h=1-h);return c+d*h};case 4:return function(b,c,d,g,h,k,l){var n=Math.floor(b/
g);b=a(b-Math.floor(b/g)*g,0,1,g,h,k,l);return c+d*(n+b)};case 5:return function(b,c,d,g,h,k,l){var n=Math.floor(b/g);b=0===Math.floor(b/g)%2?a(b-Math.floor(b/g)*g,0,1,g,h,k,l):a(g-b+Math.floor(b/g)*g,1,-1,g,h,k,l);return c+d*(n+b)};default:return function(b,c,d,g,h,k,l){return a(b,c,d,g,h,k,l)}}}
function ic(a,b,c){var d,g=0,h=1,k=[0],l=[0];for(void 0===b&&(b=[]);b.length<a.length;)b.push(!1);for(void 0===c&&(c=[]);c.length<a.length;)c.push(1/a.length);for(d=0;d<a.length;d+=1)g+=c[d];for(d=0;d<a.length;d+=1)c[d]/=g;for(d=0;d<a.length;d+=1)l.push(l[d]+c[d]),g=a[d]===Yb?0:b[d]?-1:1,k.push(k[d]+g),h=Math.max(h,k[d+1]);return function(d,g,v,E,A,r,s){var t,u;t=a.length-1;for(u=0;u<a.length;u+=1)if(d/E<=l[u+1]){t=u;break}d=a[t](d/E-l[t],0,1,c[t],A,r,s);b[t]&&(d=-d);return g+(k[t]+d)*v/h}}
var M=window.TG_InitSettings||{};M.size=void 0!==M.size?M.size:"big";M.Zs=M.usesFullScreen;M.Tn="big"===M.size?1:.5;M.bf=20;M.cf=10;M.jq=0;M.Fj=-10;M.gg=-20;M.Yb=-30;M.Gd=-40;
function N(a,b){var c;if("number"===typeof a){a:switch(b){case "floor":c=Math.floor(M.Tn*a);break a;case "round":c=Math.round(M.Tn*a);break a;default:c=M.Tn*a}return c}if("[object Array]"===Object.prototype.toString.call(a)){for(c=0;c<a.length;c++)a[c]=N(a[c],b);return a}if("object"===typeof a){for(c in a)a.hasOwnProperty(c)&&(a[c]=N(a[c],b));return a}}function O(a){return"big"===M.size?void 0!==a.big?a.big:a:void 0!==a.small?a.small:a}
window.throbber=new function(a,b,c){this.name=a;this.fileName=b;this.info=c}("throbber","media/throbber.png");var jc=new sa("StartTexture",2,"start");window.StartTexture=jc;ta(jc,0,"media/StartTexture0.png");ta(jc,1,"media/StartTexture1.png");var kc=new sa("StartScreenTexture",1,"load");window.StartScreenTexture=kc;ta(kc,0,"media/StartScreenTexture0.png");var lc=new sa("LevelMapScreenTexture",1,"load");window.LevelMapScreenTexture=lc;ta(lc,0,"media/LevelMapScreenTexture0.png");
var mc=new sa("LevelEndTexture",2,"load");window.LevelEndTexture=mc;ta(mc,0,"media/LevelEndTexture0.png");ta(mc,1,"media/LevelEndTexture1.png");var P=new sa("MenuTexture",2,"load");window.MenuTexture=P;ta(P,0,"media/MenuTexture0.png");ta(P,1,"media/MenuTexture1.png");var nc=new sa("GameTexture",2,"load");window.GameTexture=nc;ta(nc,0,"media/GameTexture0.png");ta(nc,1,"media/GameTexture1.png");var oc=new sa("GameStaticTexture",1,"load");window.GameStaticTexture=oc;ta(oc,0,"media/GameStaticTexture0.png");
var pc=new x("s_loadingbar_background",kc,1,42,32,0,0,42,32,1);window.s_loadingbar_background=pc;pc.d(0,0,937,1,42,32,0,0);var qc=new x("s_loadingbar_fill",kc,1,20,12,0,0,20,12,1);window.s_loadingbar_fill=qc;qc.d(0,0,985,1,20,12,0,0);var rc=new x("s_level_0",lc,1,125,140,0,0,125,140,1);window.s_level_0=rc;rc.d(0,0,129,1,125,140,0,0);var sc=new x("s_level_1",lc,1,125,140,0,0,125,140,1);window.s_level_1=sc;sc.d(0,0,257,1,125,140,0,0);var tc=new x("s_level_2",lc,1,125,140,0,0,125,140,1);
window.s_level_2=tc;tc.d(0,0,1,1,125,140,0,0);var uc=new x("s_level_3",lc,1,125,140,0,0,125,140,1);window.s_level_3=uc;uc.d(0,0,385,1,125,140,0,0);var vc=new x("s_level_lock",lc,1,48,70,0,0,48,70,1);window.s_level_lock=vc;vc.d(0,0,777,113,48,69,0,1);var wc=new x("s_level_stars",lc,1,126,46,0,0,126,46,1);window.s_level_stars=wc;wc.d(0,0,513,1,126,45,0,1);var xc=new x("s_level2_0",lc,1,84,87,0,0,84,87,1);window.s_level2_0=xc;xc.d(0,0,897,97,84,87,0,0);
var yc=new x("s_level2_1",lc,1,84,87,0,0,84,87,1);window.s_level2_1=yc;yc.d(0,0,897,1,84,87,0,0);var zc=new x("s_level2_2",lc,1,84,87,0,0,84,87,1);window.s_level2_2=zc;zc.d(0,0,601,113,84,87,0,0);var Ac=new x("s_level2_3",lc,1,84,87,0,0,84,87,1);window.s_level2_3=Ac;Ac.d(0,0,513,49,84,87,0,0);var Bc=new x("s_level2_arrow_right",lc,2,60,108,0,0,60,216,1);window.s_level2_arrow_right=Bc;Bc.d(0,0,833,1,60,108,0,0);Bc.d(1,0,641,1,60,108,0,0);var Cc=new x("s_level2_arrow_left",lc,2,60,108,0,0,60,216,1);
window.s_level2_arrow_left=Cc;Cc.d(0,0,705,1,60,108,0,0);Cc.d(1,0,769,1,60,108,0,0);var Dc=new x("s_level2_lock",lc,1,84,87,0,0,84,87,1);window.s_level2_lock=Dc;Dc.d(0,0,689,113,84,87,0,0);var Ec=new x("s_pop_medal",mc,8,378,378,189,189,3024,378,8);window.s_pop_medal=Ec;Ec.d(0,0,601,1,349,241,3,69);Ec.d(1,0,601,529,346,267,5,54);Ec.d(2,0,601,249,348,276,20,56);Ec.d(3,1,1,1,342,288,26,50);Ec.d(4,1,689,1,319,292,22,46);Ec.d(5,1,1,297,337,304,14,41);Ec.d(6,0,1,641,343,305,12,41);
Ec.d(7,1,345,1,341,304,13,41);var Fc=new x("s_medal_shadow",mc,1,195,208,0,0,195,208,1);window.s_medal_shadow=Fc;Fc.d(0,1,745,513,189,204,3,1);var Gc=new x("s_medal_shine",mc,6,195,208,0,0,1170,208,6);window.s_medal_shine=Gc;Gc.d(0,1,545,513,193,207,1,1);Gc.d(1,1,345,313,193,207,1,1);Gc.d(2,0,353,641,193,207,1,1);Gc.d(3,1,689,297,193,207,1,1);Gc.d(4,0,553,801,193,207,1,1);Gc.d(5,0,753,801,193,207,1,1);var Hc=new x("s_icon_toggle_hard",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_hard=Hc;
Hc.d(0,0,953,193,67,67,0,0);var Ic=new x("s_icon_toggle_medium",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_medium=Ic;Ic.d(0,0,953,337,67,67,0,0);var Jc=new x("s_icon_toggle_easy",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_easy=Jc;Jc.d(0,0,953,265,67,67,0,0);var Kc=new x("s_flagIcon_us",P,1,48,48,0,0,48,48,1);window.s_flagIcon_us=Kc;Kc.d(0,0,337,745,48,36,0,6);var Lc=new x("s_flagIcon_gb",P,1,48,48,0,0,48,48,1);window.s_flagIcon_gb=Lc;Lc.d(0,0,929,705,48,36,0,6);
var Mc=new x("s_flagIcon_nl",P,1,48,48,0,0,48,48,1);window.s_flagIcon_nl=Mc;Mc.d(0,0,833,673,48,36,0,6);var Nc=new x("s_flagIcon_tr",P,1,48,48,0,0,48,48,1);window.s_flagIcon_tr=Nc;Nc.d(0,0,929,745,48,36,0,6);var Oc=new x("s_flagIcon_de",P,1,48,48,0,0,48,48,1);window.s_flagIcon_de=Oc;Oc.d(0,0,337,785,48,36,0,6);var Pc=new x("s_flagIcon_fr",P,1,48,48,0,0,48,48,1);window.s_flagIcon_fr=Pc;Pc.d(0,0,505,809,48,36,0,6);var Qc=new x("s_flagIcon_br",P,1,48,48,0,0,48,48,1);window.s_flagIcon_br=Qc;
Qc.d(0,0,449,809,48,36,0,6);var Rc=new x("s_flagIcon_es",P,1,48,48,0,0,48,48,1);window.s_flagIcon_es=Rc;Rc.d(0,0,561,809,48,36,0,6);var Sc=new x("s_flagIcon_jp",P,1,48,48,0,0,48,48,1);window.s_flagIcon_jp=Sc;Sc.d(0,0,393,785,48,36,0,6);var Tc=new x("s_flagIcon_ru",P,1,48,48,0,0,48,48,1);window.s_flagIcon_ru=Tc;Tc.d(0,0,937,665,48,36,0,6);var Uc=new x("s_flagIcon_ar",P,1,48,48,0,0,48,48,1);window.s_flagIcon_ar=Uc;Uc.d(0,0,929,785,48,36,0,6);var Vc=new x("s_flagIcon_kr",P,1,48,48,0,0,48,48,1);
window.s_flagIcon_kr=Vc;Vc.d(0,0,393,745,48,36,0,6);var Wc=new x("s_tutorialButton_close",P,1,66,65,0,0,66,65,1);window.s_tutorialButton_close=Wc;Wc.d(0,0,937,553,65,65,0,0);var Xc=new x("s_tutorialButton_next",P,1,66,65,0,0,66,65,1);window.s_tutorialButton_next=Xc;Xc.d(0,0,937,481,66,65,0,0);var Yc=new x("s_tutorialButton_previous",P,1,66,65,0,0,66,65,1);window.s_tutorialButton_previous=Yc;Yc.d(0,0,953,409,66,65,0,0);var Zc=new x("s_logo_tinglygames",P,1,240,240,0,0,240,240,1);
window.s_logo_tinglygames=Zc;Zc.d(0,0,601,177,240,240,0,0);var $c=new x("s_logo_coolgames",P,1,240,240,0,0,240,240,1);window.s_logo_coolgames=$c;$c.d(0,0,601,1,240,167,0,36);var bd=new x("s_logo_tinglygames_start",kc,1,156,54,0,0,156,54,1);window.s_logo_tinglygames_start=bd;bd.d(0,0,625,1,156,53,0,0);var cd=new x("s_logo_coolgames_start",kc,1,300,104,0,0,300,104,1);window.s_logo_coolgames_start=cd;cd.d(0,0,785,1,150,104,75,0);var dd=new x("s_coolmath_logo",jc,1,500,500,0,0,500,500,1);
window.s_coolmath_logo=dd;dd.d(0,1,1,329,500,500,0,0);var ed=new x("s_ui_cup_highscore",nc,1,32,28,0,0,32,28,1);window.s_ui_cup_highscore=ed;ed.d(0,0,985,497,32,28,0,0);var gd=new x("s_ui_cup_score",nc,1,28,24,0,0,28,24,1);window.s_ui_cup_score=gd;gd.d(0,0,985,529,28,24,0,0);var hd=new x("s_ui_divider",oc,1,94,2,0,0,94,2,1);window.s_ui_divider=hd;hd.d(0,0,817,281,94,2,0,0);var id=new x("s_ui_background_blank",oc,1,140,580,0,0,140,580,1);window.s_ui_background_blank=id;id.d(0,0,601,1,140,580,0,0);
var jd=new x("s_ui_highscore",oc,1,26,36,13,12,26,36,1);window.s_ui_highscore=jd;jd.d(0,0,993,41,26,36,0,0);var kd=new x("s_ui_timeleft",oc,1,20,26,0,0,20,26,1);window.s_ui_timeleft=kd;kd.d(0,0,993,81,20,26,0,0);var ld=new x("s_ui_smiley_hard",nc,1,22,22,11,11,22,22,1);window.s_ui_smiley_hard=ld;ld.d(0,0,1001,49,22,22,0,0);var md=new x("s_ui_smiley_medium",nc,1,22,22,11,11,22,22,1);window.s_ui_smiley_medium=md;md.d(0,0,1001,25,22,22,0,0);var nd=new x("s_ui_smiley_easy",nc,1,22,22,11,11,22,22,1);
window.s_ui_smiley_easy=nd;nd.d(0,0,1001,1,22,22,0,0);var od=new x("s_ui_crown",nc,1,24,20,12,10,24,20,1);window.s_ui_crown=od;od.d(0,0,985,593,24,20,0,0);var pd=new x("s_ui_heart",nc,1,28,24,14,12,28,24,1);window.s_ui_heart=pd;pd.d(0,0,985,561,26,23,1,1);var Q=new x("s_cards",nc,52,84,110,42,55,84,5720,1);window.s_cards=Q;Q.d(0,0,905,913,74,102,5,5);Q.d(1,1,585,1,74,102,5,5);Q.d(2,1,665,1,74,102,5,5);Q.d(3,1,745,1,74,102,5,5);Q.d(4,1,825,1,74,102,5,5);Q.d(5,0,825,913,74,102,5,5);
Q.d(6,0,745,913,74,102,5,5);Q.d(7,1,585,105,74,102,5,5);Q.d(8,0,665,809,74,102,5,5);Q.d(9,0,745,809,74,102,5,5);Q.d(10,0,825,809,74,102,5,5);Q.d(11,0,905,809,74,102,5,5);Q.d(12,0,585,849,74,102,5,5);Q.d(13,1,905,1,74,102,5,5);Q.d(14,1,665,105,74,102,5,5);Q.d(15,1,745,313,74,102,5,5);Q.d(16,1,905,313,74,102,5,5);Q.d(17,1,905,209,74,102,5,5);Q.d(18,1,665,313,74,102,5,5);Q.d(19,1,825,209,74,102,5,5);Q.d(20,1,585,313,74,102,5,5);Q.d(21,1,745,209,74,102,5,5);Q.d(22,1,665,209,74,102,5,5);
Q.d(23,1,825,313,74,102,5,5);Q.d(24,1,745,105,74,102,5,5);Q.d(25,1,825,105,74,102,5,5);Q.d(26,1,905,105,74,102,5,5);Q.d(27,1,585,209,74,102,5,5);Q.d(28,0,665,913,74,102,5,5);Q.d(29,0,745,601,74,102,5,5);Q.d(30,0,849,393,74,102,5,5);Q.d(31,0,585,433,74,102,5,5);Q.d(32,0,745,497,74,102,5,5);Q.d(33,0,929,289,74,102,5,5);Q.d(34,0,769,393,74,102,5,5);Q.d(35,0,689,393,74,102,5,5);Q.d(36,0,769,289,74,102,5,5);Q.d(37,0,849,289,74,102,5,5);Q.d(38,0,689,289,74,102,5,5);Q.d(39,0,929,393,74,102,5,5);
Q.d(40,0,825,497,74,102,5,5);Q.d(41,0,585,537,74,102,5,5);Q.d(42,0,585,641,74,102,5,5);Q.d(43,0,745,705,74,102,5,5);Q.d(44,0,905,705,74,102,5,5);Q.d(45,0,665,705,74,102,5,5);Q.d(46,0,905,601,74,102,5,5);Q.d(47,0,665,497,74,102,5,5);Q.d(48,0,905,497,74,102,5,5);Q.d(49,0,665,601,74,102,5,5);Q.d(50,0,825,601,74,102,5,5);Q.d(51,0,825,705,74,102,5,5);var qd=new x("s_card_shadow",nc,1,84,110,42,55,84,110,1);window.s_card_shadow=qd;qd.d(0,1,209,329,72,100,6,5);
var rd=new x("s_card_position_stock",nc,1,84,110,42,55,84,110,1);window.s_card_position_stock=rd;rd.d(0,1,289,329,72,100,6,5);var sd=new x("s_card_position_waste",nc,1,84,110,42,55,84,110,1);window.s_card_position_waste=sd;sd.d(0,1,529,417,72,100,6,5);var td=new x("s_card_position_pile",nc,1,84,110,42,55,84,110,1);window.s_card_position_pile=td;td.d(0,1,449,329,72,100,6,5);var ud=new x("s_card_position_foundation",nc,1,84,110,42,55,84,110,1);window.s_card_position_foundation=ud;
ud.d(0,1,369,329,72,100,6,5);var vd=new x("s_card_dust",nc,9,120,160,60,80,1080,160,9);window.s_card_dust=vd;vd.d(0,0,689,145,110,136,5,12);vd.d(1,0,801,145,110,136,5,12);vd.d(2,0,913,145,110,136,5,12);vd.d(3,0,585,289,100,136,10,12);vd.d(4,0,585,1,102,138,9,11);vd.d(5,0,689,1,102,138,9,11);vd.d(6,0,793,1,102,138,9,11);vd.d(7,0,897,1,102,138,9,11);vd.d(8,0,585,145,102,138,9,11);var wd=new x("s_btn_small_undo",oc,2,100,92,0,0,200,92,2);window.s_btn_small_undo=wd;wd.d(0,0,921,185,100,92,0,0);
wd.d(1,0,817,185,100,92,0,0);var xd=new x("s_tutorial_01",oc,1,350,190,0,0,350,190,1);window.s_tutorial_01=xd;xd.d(0,0,345,585,317,141,17,12);var yd=new x("s_tutorial_02",oc,1,350,190,0,0,350,190,1);window.s_tutorial_02=yd;yd.d(0,0,745,1,241,178,55,6);var zd=new x("s_tutorial_03",oc,1,350,190,0,0,350,190,1);window.s_tutorial_03=zd;zd.d(0,0,745,185,67,180,156,5);var Ad=new x("s_tutorial_04",oc,1,350,190,0,0,350,190,1);window.s_tutorial_04=Ad;Ad.d(0,0,1,529,341,186,4,1);
var Bd=new x("s_tutorial_05",oc,1,350,190,0,0,350,190,1);window.s_tutorial_05=Bd;Bd.d(0,0,665,585,286,187,38,2);var Cd=new x("s_icon_toggle_sfx_on",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_on=Cd;Cd.d(0,0,521,649,49,31,7,17);var Dd=new x("s_icon_toggle_sfx_off",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_sfx_off=Dd;Dd.d(0,0,937,625,53,31,7,17);var Ed=new x("s_icon_toggle_music_on",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_on=Ed;Ed.d(0,0,985,705,38,41,13,16);
var Fd=new x("s_icon_toggle_music_off",P,1,67,67,0,0,67,67,1);window.s_icon_toggle_music_off=Fd;Fd.d(0,0,465,649,51,41,8,16);var Gd=new x("s_btn_small_exit",P,2,100,92,0,0,200,92,2);window.s_btn_small_exit=Gd;Gd.d(0,0,849,289,100,92,0,0);Gd.d(1,0,849,193,100,92,0,0);var Hd=new x("s_btn_small_pause",nc,2,100,92,0,0,200,92,2);window.s_btn_small_pause=Hd;Hd.d(0,1,1,329,100,92,0,0);Hd.d(1,1,105,329,100,92,0,0);var Id=new x("s_btn_small_options",P,2,100,92,0,0,200,92,2);window.s_btn_small_options=Id;
Id.d(0,0,849,385,100,92,0,0);Id.d(1,0,833,481,100,92,0,0);var Jd=new x("s_btn_small_retry",mc,2,100,92,0,0,200,92,2);window.s_btn_small_retry=Jd;Jd.d(0,1,889,297,100,92,0,0);Jd.d(1,1,545,313,100,92,0,0);var Kd=new x("s_btn_standard",P,2,96,92,0,0,192,92,2);window.s_btn_standard=Kd;Kd.d(0,0,233,745,96,92,0,0);Kd.d(1,0,833,577,96,92,0,0);var Ld=new x("s_btn_toggle",P,2,162,92,0,0,324,92,2);window.s_btn_toggle=Ld;Ld.d(0,0,849,1,162,92,0,0);Ld.d(1,0,849,97,162,92,0,0);
var Md=new x("s_icon_toggle_fxoff",P,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxoff=Md;Md.d(0,0,1,745,227,92,0,0);Md.d(1,0,601,617,227,92,0,0);var Nd=new x("s_icon_toggle_fxon",P,2,227,92,0,0,454,92,2);window.s_icon_toggle_fxon=Nd;Nd.d(0,0,233,649,227,92,0,0);Nd.d(1,0,697,713,227,92,0,0);var Od=new x("s_icon_toggle_musicoff",P,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicoff=Od;Od.d(0,0,465,713,227,92,0,0);Od.d(1,0,1,649,227,92,0,0);
var Pd=new x("s_icon_toggle_musicon",P,2,227,92,0,0,454,92,2);window.s_icon_toggle_musicon=Pd;Pd.d(0,0,601,425,227,92,0,0);Pd.d(1,0,601,521,227,92,0,0);var Qd=new x("s_btn_big_start",mc,2,154,152,0,0,308,152,2);window.s_btn_big_start=Qd;Qd.d(0,1,161,609,154,152,0,0);Qd.d(1,1,1,609,154,152,0,0);var Rd=new x("s_btn_big_restart",mc,2,154,152,0,0,308,152,2);window.s_btn_big_restart=Rd;Rd.d(0,0,353,857,154,152,0,0);Rd.d(1,1,345,529,154,152,0,0);
var Sd=new x("s_overlay_assignment",oc,1,592,520,0,0,592,520,1);window.s_overlay_assignment=Sd;Sd.d(0,0,1,1,591,519,1,1);var Td=new x("s_tutorial",P,1,522,562,0,0,522,562,1);window.s_tutorial=Td;Td.d(0,1,1,1,522,562,0,0);var Ud=new x("s_screen_start",jc,4,576,320,0,0,1152,640,2);window.s_screen_start=Ud;Ud.d(0,0,1,657,576,320,0,0);Ud.d(1,0,1,1,576,320,0,0);Ud.d(2,0,1,329,576,320,0,0);Ud.d(3,1,1,1,576,320,0,0);var Vd=new x("s_overlay_options",P,1,598,640,0,0,598,640,1);window.s_overlay_options=Vd;
Vd.d(0,0,1,1,598,640,0,0);var Wd=new x("s_btn_bigtext",kc,2,137,104,0,0,274,104,2);window.s_btn_bigtext=Wd;Wd.d(0,0,769,113,137,104,0,0);Wd.d(1,0,625,57,137,104,0,0);var Xd=new x("s_overlay_difficulty",mc,1,592,636,0,0,592,636,1);window.s_overlay_difficulty=Xd;Xd.d(0,0,1,1,591,635,1,1);var Yd=new x("s_background",nc,4,576,320,0,0,1152,640,2);window.s_background=Yd;Yd.d(0,0,1,329,576,320,0,0);Yd.d(1,1,1,1,576,320,0,0);Yd.d(2,0,1,657,576,320,0,0);Yd.d(3,0,1,1,576,320,0,0);
var Zd=new x("s_logo",kc,1,620,250,0,0,620,250,1);window.s_logo=Zd;Zd.d(0,0,1,1,619,250,1,0);var $d=new x("s_card_back",nc,1,84,110,42,55,84,110,1);window.s_card_back=$d;$d.d(0,0,585,745,74,102,5,5);var ae=new x("s_ui_solitaire_threecarddraw",oc,1,56,44,0,0,56,44,1);window.s_ui_solitaire_threecarddraw=ae;ae.d(0,0,913,281,56,43,0,1);var be=new x("s_ui_solitaire_freeplacement",oc,1,56,44,0,0,56,44,1);window.s_ui_solitaire_freeplacement=be;be.d(0,0,817,289,47,37,3,4);
var ce=new x("s_ui_solitaire_onecarddraw",oc,1,56,44,0,0,56,44,1);window.s_ui_solitaire_onecarddraw=ce;ce.d(0,0,993,1,26,37,15,4);var de=new va("f_default","fonts/f_default.woff","fonts/f_default.ttf","fonts");window.f_defaultLoader=de;var R=new za("f_default","Arial");window.f_default=R;D(R,12);R.fill=!0;R.setFillColor("Black");R.pb=1;Ca(R,!1);R.setStrokeColor("Black");Da(R,1);Fa(R);R.wb=1;Ea(R,!1);Ha(R,"left");Ia(R,"top");R.fb=0;R.Ja=0;
var ee=new va("ff_opensans_extrabold","fonts/ff_opensans_extrabold.woff","fonts/ff_opensans_extrabold.ttf","fonts");window.ff_opensans_extraboldLoader=ee;var fe=new va("ff_dimbo_regular","fonts/ff_dimbo_regular.woff","fonts/ff_dimbo_regular.ttf","fonts");window.ff_dimbo_regularLoader=fe;var ge=new va("ff_opensans_bold","fonts/ff_opensans_bold.woff","fonts/ff_opensans_bold.ttf","fonts");window.ff_opensans_boldLoader=ge;
var he=new va("ff_opensans_bolditalic","fonts/ff_opensans_bolditalic.woff","fonts/ff_opensans_bolditalic.ttf","fonts");window.ff_opensans_bolditalicLoader=he;var ie=new za("ff_opensans_bold","Arial");window.f_game_ui_tiny=ie;D(ie,11);ie.fill=!0;ie.setFillColor("#799EC5");ie.pb=1;Ca(ie,!1);ie.setStrokeColor("White");Da(ie,1);Fa(ie);ie.wb=1;Ea(ie,!1);Ha(ie,"center");Ia(ie,"middle");ie.fb=0;ie.Ja=0;var T=new za("ff_opensans_bold","Arial");window.f_game_ui=T;D(T,23);T.fill=!0;T.setFillColor("#799EC5");
T.pb=1;Ca(T,!1);T.setStrokeColor("Black");Da(T,1);Fa(T);T.wb=1;Ea(T,!1);Ha(T,"center");Ia(T,"middle");T.fb=0;T.Ja=0;var je=new za("ff_opensans_bolditalic","Arial");window.f_game_ui_large=je;D(je,52);je.fill=!0;je.setFillColor("#172348");je.pb=1;Ca(je,!1);je.setStrokeColor("Black");Da(je,1);Fa(je);je.wb=1;Ea(je,!1);Ha(je,"center");Ia(je,"middle");je.fb=0;je.Ja=0;var ke=new va("floaterFontFace","fonts/floaterFontFace.woff","fonts/floaterFontFace.ttf","fonts");window.floaterFontFaceLoader=ke;
var le=new va("floaterNumberFontFace","fonts/floaterNumberFontFace.woff","fonts/floaterNumberFontFace.ttf","fonts");window.floaterNumberFontFaceLoader=le;var me=new za("floaterFontFace","Arial");window.floaterFontText1=me;D(me,24);Aa(me);me.fill=!0;me.setFillColor("#FFDE00");me.pb=1;Ca(me,!0);me.setStrokeColor("#6F1F00");Da(me,4);Fa(me);me.wb=1;Ea(me,!0);Ga(me,"rgba(57,0,0,0.46)",4);Ha(me,"left");Ia(me,"top");me.fb=0;me.Ja=0;var ne=new za("floaterFontFace","Arial");window.floaterFontText2=ne;
D(ne,28);Aa(ne);ne.fill=!0;Ba(ne,2,["#FFF600","#00DB48","blue"],.65,.02);ne.pb=1;Ca(ne,!0);ne.setStrokeColor("#073400");Da(ne,4);Fa(ne);ne.wb=1;Ea(ne,!0);Ga(ne,"rgba(0,57,43,0.47)",4);Ha(ne,"left");Ia(ne,"top");ne.fb=0;ne.Ja=0;var oe=new za("floaterFontFace","Arial");window.floaterFontText3=oe;D(oe,30);Aa(oe);oe.fill=!0;Ba(oe,3,["#FFF600","#FF8236","#FF0096"],.71,-.1);oe.pb=1;Ca(oe,!0);oe.setStrokeColor("#4F0027");Da(oe,4);Fa(oe);oe.wb=1;Ea(oe,!0);Ga(oe,"rgba(41,0,0,0.48)",5);Ha(oe,"left");
Ia(oe,"top");oe.fb=0;oe.Ja=0;var pe=new za("floaterFontFace","Arial");window.floaterFontText4=pe;D(pe,34);Aa(pe);pe.fill=!0;Ba(pe,3,["#00FCFF","#893DFB","#FF00E4"],.72,-.04);pe.pb=1;Ca(pe,!0);pe.setStrokeColor("#001637");Da(pe,4);Fa(pe);pe.wb=1;Ea(pe,!0);Ga(pe,"rgba(0,35,75,0.49)",6);Ha(pe,"left");Ia(pe,"top");pe.fb=0;pe.Ja=0;var qe=new za("floaterNumberFontFace","Arial");window.floaterFontNumberPositive=qe;D(qe,30);qe.fill=!0;qe.setFillColor("White");qe.pb=1;Ca(qe,!0);qe.setStrokeColor("#00106F");
Da(qe,2);Fa(qe);qe.wb=1;Ea(qe,!1);Ga(qe,"rgba(0,4,57,0.51)",4);Ha(qe,"left");Ia(qe,"top");qe.fb=0;qe.Ja=0;var re=new za("floaterNumberFontFace","Arial");window.floaterFontNumberNegative=re;D(re,30);Aa(re);re.fill=!0;re.setFillColor("#FF1E00");re.pb=1;Ca(re,!0);re.setStrokeColor("#3F0000");Da(re,2);Fa(re);re.wb=1;Ea(re,!1);Ga(re,"rgba(57,0,0,0.49)",4);Ha(re,"left");Ia(re,"top");re.fb=0;re.Ja=0;var se=new va("f_themeDefault","fonts/f_themeDefault.woff","fonts/f_themeDefault.ttf","fonts");
window.f_themeDefaultLoader=se;var U=new za("f_themeDefault","Arial");window.f_themeDefault=U;D(U,12);U.fill=!0;U.setFillColor("Black");U.pb=1;Ca(U,!1);U.setStrokeColor("White");Da(U,5);Fa(U);U.wb=1;Ea(U,!0);Ha(U,"left");Ia(U,"top");U.fb=0;U.Ja=0;var te=new mb("audioSprite","audio/audioSprite.mp3","audio/audioSprite.ogg","audio");window.audioSprite=te;var ue=new fb("a_shuffle_deck",te,0,1164,1,10,["game"]);window.a_shuffle_deck=ue;var ve=new fb("a_move_card",te,3E3,108,1,10,["game"]);
window.a_move_card=ve;var we=new fb("a_flip_card",te,5E3,359,1,10,["game"]);window.a_flip_card=we;var xe=new fb("a_place_error",te,7E3,241,1,10,["game"]);window.a_place_error=xe;var ye=new fb("a_card_placed",te,9E3,99,1,10,["game"]);window.a_card_placed=ye;var ze=new fb("a_foundation_placed",te,11E3,755,1,10,["game"]);window.a_foundation_placed=ze;var Ae=new fb("a_levelStart",te,13E3,1002,1,10,["sfx"]);window.a_levelStart=Ae;var Be=new fb("a_levelComplete",te,16E3,1002,1,10,["sfx"]);
window.a_levelComplete=Be;var Ce=new fb("a_mouseDown",te,19E3,471,1,10,["sfx"]);window.a_mouseDown=Ce;var De=new fb("a_levelend_star_01",te,21E3,1161,1,10,["sfx"]);window.a_levelend_star_01=De;var Ee=new fb("a_levelend_star_02",te,24E3,1070,1,10,["sfx"]);window.a_levelend_star_02=Ee;var Fe=new fb("a_levelend_star_03",te,27E3,1039,1,10,["sfx"]);window.a_levelend_star_03=Fe;var Ge=new fb("a_levelend_fail",te,3E4,1572,1,10,["sfx"]);window.a_levelend_fail=Ge;
var He=new fb("a_levelend_score_counter",te,33E3,54,1,10,["sfx"]);window.a_levelend_score_counter=He;var Ie=new fb("a_levelend_score_end",te,35E3,888,1,10,["sfx"]);window.a_levelend_score_end=Ie;var Je=new fb("a_medal",te,37E3,1225,1,10,["sfx"]);window.a_medal=Je;var V=V||{};V["nl-nl"]=V["nl-nl"]||{};V["nl-nl"].loadingScreenLoading="Laden...";V["nl-nl"].startScreenPlay="SPELEN";V["nl-nl"].levelMapScreenTotalScore="Totale score";V["nl-nl"].levelEndScreenTitle_level="Level <VALUE>";
V["nl-nl"].levelEndScreenTitle_difficulty="Goed Gedaan!";V["nl-nl"].levelEndScreenTitle_endless="Level <VALUE>";V["nl-nl"].levelEndScreenTotalScore="Totale score";V["nl-nl"].levelEndScreenSubTitle_levelFailed="Level niet gehaald";V["nl-nl"].levelEndScreenTimeLeft="Tijd over";V["nl-nl"].levelEndScreenTimeBonus="Tijdbonus";V["nl-nl"].levelEndScreenHighScore="High score";V["nl-nl"].optionsStartScreen="Hoofdmenu";V["nl-nl"].optionsQuit="Stop";V["nl-nl"].optionsResume="Terug naar spel";
V["nl-nl"].optionsTutorial="Speluitleg";V["nl-nl"].optionsHighScore="High scores";V["nl-nl"].optionsMoreGames="Meer Spellen";V["nl-nl"].optionsDifficulty_easy="Makkelijk";V["nl-nl"].optionsDifficulty_medium="Gemiddeld";V["nl-nl"].optionsDifficulty_hard="Moeilijk";V["nl-nl"].optionsMusic_on="Aan";V["nl-nl"].optionsMusic_off="Uit";V["nl-nl"].optionsSFX_on="Aan";V["nl-nl"].optionsSFX_off="Uit";V["nl-nl"]["optionsLang_en-us"]="Engels (US)";V["nl-nl"]["optionsLang_en-gb"]="Engels (GB)";
V["nl-nl"]["optionsLang_nl-nl"]="Nederlands";V["nl-nl"].gameEndScreenTitle="Gefeliciteerd!\nJe hebt gewonnen.";V["nl-nl"].gameEndScreenBtnText="Ga verder";V["nl-nl"].optionsTitle="Instellingen";V["nl-nl"].optionsQuitConfirmationText="Pas op!\n\nAls je nu stopt verlies je alle voortgang in dit level. Weet je zeker dat je wilt stoppen?";V["nl-nl"].optionsQuitConfirmBtn_No="Nee";V["nl-nl"].optionsQuitConfirmBtn_Yes="Ja, ik weet het zeker";V["nl-nl"].levelMapScreenTitle="Kies een level";
V["nl-nl"].optionsRestartConfirmationText="Pas op!\n\nAls je nu herstart verlies je alle voortgang in dit level. Weet je zeker dat je wilt herstarten?";V["nl-nl"].optionsRestart="Herstart";V["nl-nl"].optionsSFXBig_on="Geluid aan";V["nl-nl"].optionsSFXBig_off="Geluid uit";V["nl-nl"].optionsAbout_title="Over ons";V["nl-nl"].optionsAbout_text="CoolGames\nwww.coolgames.com\nCopyright \u00a9 2016";V["nl-nl"].optionsAbout_backBtn="Terug";V["nl-nl"].optionsAbout_version="versie:";
V["nl-nl"].optionsAbout="Over ons";V["nl-nl"].levelEndScreenMedal="VERBETERD!";V["nl-nl"].startScreenQuestionaire="Wat vind jij?";V["nl-nl"].levelMapScreenWorld_0="Kies een level";V["nl-nl"].startScreenByTinglyGames="door: CoolGames";V["nl-nl"]["optionsLang_de-de"]="Duits";V["nl-nl"]["optionsLang_tr-tr"]="Turks";V["nl-nl"].optionsAbout_header="Ontwikkeld door:";V["nl-nl"].levelEndScreenViewHighscoreBtn="Scores bekijken";V["nl-nl"].levelEndScreenSubmitHighscoreBtn="Score verzenden";
V["nl-nl"].challengeStartScreenTitle_challengee_friend="Je bent uitgedaagd door:";V["nl-nl"].challengeStartTextScore="Punten van <NAME>:";V["nl-nl"].challengeStartTextTime="Tijd van <NAME>:";V["nl-nl"].challengeStartScreenToWin="Te winnen aantal Fairplay munten:";V["nl-nl"].challengeEndScreenWinnings="Je hebt <AMOUNT> Fairplay munten gewonnen!";V["nl-nl"].challengeEndScreenOutcomeMessage_WON="Je hebt de uitdaging gewonnen!";V["nl-nl"].challengeEndScreenOutcomeMessage_LOST="Je hebt de uitdaging verloren.";
V["nl-nl"].challengeEndScreenOutcomeMessage_TIED="Jullie hebben gelijk gespeeld.";V["nl-nl"].challengeCancelConfirmText="Je staat op het punt de uitdaging te annuleren. Je inzet wordt teruggestort minus de uitdagingskosten. Weet je zeker dat je de uitdaging wilt annuleren? ";V["nl-nl"].challengeCancelConfirmBtn_yes="Ja";V["nl-nl"].challengeCancelConfirmBtn_no="Nee";V["nl-nl"].challengeEndScreensBtn_submit="Verstuur uitdaging";V["nl-nl"].challengeEndScreenBtn_cancel="Annuleer uitdaging";
V["nl-nl"].challengeEndScreenName_you="Jij";V["nl-nl"].challengeEndScreenChallengeSend_error="Er is een fout opgetreden bij het versturen van de uitdaging. Probeer het later nog een keer.";V["nl-nl"].challengeEndScreenChallengeSend_success="Je uitdaging is verstuurd!";V["nl-nl"].challengeCancelMessage_error="Er is een fout opgetreden bij het annuleren van de uitdaging. Probeer het later nog een keer.";V["nl-nl"].challengeCancelMessage_success="De uitdaging is geannuleerd.";
V["nl-nl"].challengeEndScreenScoreSend_error="Er is een fout opgetreden tijdens de communicatie met de server. Probeer het later nog een keer.";V["nl-nl"].challengeStartScreenTitle_challengee_stranger="Jouw tegenstander:";V["nl-nl"].challengeStartScreenTitle_challenger_friend="Jouw tegenstander:";V["nl-nl"].challengeStartScreenTitle_challenger_stranger="Je zet een uitdaging voor:";V["nl-nl"].challengeStartTextTime_challenger="Speel het spel en zet een tijd neer.";
V["nl-nl"].challengeStartTextScore_challenger="Speel het spel en zet een score neer.";V["nl-nl"].challengeForfeitConfirmText="Je staat op het punt de uitdaging op te geven. Weet je zeker dat je dit wilt doen?";V["nl-nl"].challengeForfeitConfirmBtn_yes="Ja";V["nl-nl"].challengeForfeitConfirmBtn_no="Nee";V["nl-nl"].challengeForfeitMessage_success="Je hebt de uitdaging opgegeven.";V["nl-nl"].challengeForfeitMessage_error="Er is een fout opgetreden tijdens het opgeven van de uitdaging. Probeer het later nog een keer.";
V["nl-nl"].optionsChallengeForfeit="Geef op";V["nl-nl"].optionsChallengeCancel="Stop";V["nl-nl"].challengeLoadingError_notValid="Sorry, deze uitdaging kan niet meer gespeeld worden.";V["nl-nl"].challengeLoadingError_notStarted="Kan de server niet bereiken. Probeer het later nog een keer.";V["nl-nl"].levelEndScreenHighScore_time="Beste tijd:";V["nl-nl"].levelEndScreenTotalScore_time="Totale tijd:";V["nl-nl"]["optionsLang_fr-fr"]="Frans";V["nl-nl"]["optionsLang_ko-kr"]="Koreaans";
V["nl-nl"]["optionsLang_ar-eg"]="Arabisch";V["nl-nl"]["optionsLang_es-es"]="Spaans";V["nl-nl"]["optionsLang_pt-br"]="Braziliaans-Portugees";V["nl-nl"]["optionsLang_ru-ru"]="Russisch";V["nl-nl"].optionsExit="Stoppen";V["nl-nl"].levelEndScreenTotalScore_number="Totale score:";V["nl-nl"].levelEndScreenHighScore_number="Topscore:";V["nl-nl"].challengeEndScreenChallengeSend_submessage="<NAME> heeft 72 uur om de uitdaging aan te nemen of te weigeren. Als <NAME> je uitdaging weigert of niet accepteert binnen 72 uur worden je inzet en uitdagingskosten teruggestort.";
V["nl-nl"].challengeEndScreenChallengeSend_submessage_stranger="Als niemand binnen 72 uur je uitdaging accepteert, worden je inzet en uitdagingskosten teruggestort.";V["nl-nl"].challengeForfeitMessage_winnings="<NAME> heeft <AMOUNT> Fairplay munten gewonnen!";V["nl-nl"].optionsAbout_header_publisher="Published by:";V["nl-nl"]["optionsLang_jp-jp"]="Japans";V["en-us"]=V["en-us"]||{};V["en-us"].loadingScreenLoading="Loading...";V["en-us"].startScreenPlay="PLAY";V["en-us"].levelMapScreenTotalScore="Total score";
V["en-us"].levelEndScreenTitle_level="Level <VALUE>";V["en-us"].levelEndScreenTitle_difficulty="Well done!";V["en-us"].levelEndScreenTitle_endless="Stage <VALUE>";V["en-us"].levelEndScreenTotalScore="Total score";V["en-us"].levelEndScreenSubTitle_levelFailed="Level failed";V["en-us"].levelEndScreenTimeLeft="Time remaining";V["en-us"].levelEndScreenTimeBonus="Time bonus";V["en-us"].levelEndScreenHighScore="High score";V["en-us"].optionsStartScreen="Main menu";V["en-us"].optionsQuit="Quit";
V["en-us"].optionsResume="Resume";V["en-us"].optionsTutorial="How to play";V["en-us"].optionsHighScore="High scores";V["en-us"].optionsMoreGames="More Games";V["en-us"].optionsDifficulty_easy="Easy";V["en-us"].optionsDifficulty_medium="Medium";V["en-us"].optionsDifficulty_hard="Difficult";V["en-us"].optionsMusic_on="On";V["en-us"].optionsMusic_off="Off";V["en-us"].optionsSFX_on="On";V["en-us"].optionsSFX_off="Off";V["en-us"]["optionsLang_en-us"]="English (US)";V["en-us"]["optionsLang_en-gb"]="English (GB)";
V["en-us"]["optionsLang_nl-nl"]="Dutch";V["en-us"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";V["en-us"].gameEndScreenBtnText="Continue";V["en-us"].optionsTitle="Settings";V["en-us"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";V["en-us"].optionsQuitConfirmBtn_No="No";V["en-us"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";V["en-us"].levelMapScreenTitle="Select a level";
V["en-us"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";V["en-us"].optionsRestart="Restart";V["en-us"].optionsSFXBig_on="Sound on";V["en-us"].optionsSFXBig_off="Sound off";V["en-us"].optionsAbout_title="About";V["en-us"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2016";V["en-us"].optionsAbout_backBtn="Back";V["en-us"].optionsAbout_version="version:";V["en-us"].optionsAbout="About";
V["en-us"].levelEndScreenMedal="IMPROVED!";V["en-us"].startScreenQuestionaire="What do you think?";V["en-us"].levelMapScreenWorld_0="Select a level";V["en-us"].startScreenByTinglyGames="by: CoolGames";V["en-us"]["optionsLang_de-de"]="German";V["en-us"]["optionsLang_tr-tr"]="Turkish";V["en-us"].optionsAbout_header="Developed by:";V["en-us"].levelEndScreenViewHighscoreBtn="View scores";V["en-us"].levelEndScreenSubmitHighscoreBtn="Submit score";
V["en-us"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["en-us"].challengeStartTextScore="<NAME>'s score:";V["en-us"].challengeStartTextTime="<NAME>'s time:";V["en-us"].challengeStartScreenToWin="Amount to win:";V["en-us"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["en-us"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["en-us"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";
V["en-us"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["en-us"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";V["en-us"].challengeCancelConfirmBtn_yes="Yes";V["en-us"].challengeCancelConfirmBtn_no="No";V["en-us"].challengeEndScreensBtn_submit="Submit challenge";V["en-us"].challengeEndScreenBtn_cancel="Cancel challenge";V["en-us"].challengeEndScreenName_you="You";
V["en-us"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["en-us"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";V["en-us"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["en-us"].challengeCancelMessage_success="Your challenge has been cancelled.";V["en-us"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";
V["en-us"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["en-us"].challengeStartScreenTitle_challenger_friend="You are challenging:";V["en-us"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["en-us"].challengeStartTextTime_challenger="Play the game and set a time.";V["en-us"].challengeStartTextScore_challenger="Play the game and set a score.";V["en-us"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";
V["en-us"].challengeForfeitConfirmBtn_yes="Yes";V["en-us"].challengeForfeitConfirmBtn_no="No";V["en-us"].challengeForfeitMessage_success="You have forfeited the challenge.";V["en-us"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["en-us"].optionsChallengeForfeit="Forfeit";V["en-us"].optionsChallengeCancel="Quit";V["en-us"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";
V["en-us"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["en-us"].levelEndScreenHighScore_time="Best time:";V["en-us"].levelEndScreenTotalScore_time="Total time:";V["en-us"]["optionsLang_fr-fr"]="French";V["en-us"]["optionsLang_ko-kr"]="Korean";V["en-us"]["optionsLang_ar-eg"]="Arabic";V["en-us"]["optionsLang_es-es"]="Spanish";V["en-us"]["optionsLang_pt-br"]="Brazilian-Portuguese";V["en-us"]["optionsLang_ru-ru"]="Russian";V["en-us"].optionsExit="Exit";
V["en-us"].levelEndScreenTotalScore_number="Total score:";V["en-us"].levelEndScreenHighScore_number="High score:";V["en-us"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";V["en-us"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
V["en-us"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["en-us"].optionsAbout_header_publisher="Published by:";V["en-us"]["optionsLang_jp-jp"]="Japanese";V["en-gb"]=V["en-gb"]||{};V["en-gb"].loadingScreenLoading="Loading...";V["en-gb"].startScreenPlay="PLAY";V["en-gb"].levelMapScreenTotalScore="Total score";V["en-gb"].levelEndScreenTitle_level="Level <VALUE>";V["en-gb"].levelEndScreenTitle_difficulty="Well done!";V["en-gb"].levelEndScreenTitle_endless="Stage <VALUE>";
V["en-gb"].levelEndScreenTotalScore="Total score";V["en-gb"].levelEndScreenSubTitle_levelFailed="Level failed";V["en-gb"].levelEndScreenTimeLeft="Time remaining";V["en-gb"].levelEndScreenTimeBonus="Time bonus";V["en-gb"].levelEndScreenHighScore="High score";V["en-gb"].optionsStartScreen="Main menu";V["en-gb"].optionsQuit="Quit";V["en-gb"].optionsResume="Resume";V["en-gb"].optionsTutorial="How to play";V["en-gb"].optionsHighScore="High scores";V["en-gb"].optionsMoreGames="More Games";
V["en-gb"].optionsDifficulty_easy="Easy";V["en-gb"].optionsDifficulty_medium="Medium";V["en-gb"].optionsDifficulty_hard="Difficult";V["en-gb"].optionsMusic_on="On";V["en-gb"].optionsMusic_off="Off";V["en-gb"].optionsSFX_on="On";V["en-gb"].optionsSFX_off="Off";V["en-gb"]["optionsLang_en-us"]="English (US)";V["en-gb"]["optionsLang_en-gb"]="English (GB)";V["en-gb"]["optionsLang_nl-nl"]="Dutch";V["en-gb"].gameEndScreenTitle="Congratulations!\nYou have completed the game.";
V["en-gb"].gameEndScreenBtnText="Continue";V["en-gb"].optionsTitle="Settings";V["en-gb"].optionsQuitConfirmationText="Attention!\n\nIf you quit now you will lose all progress made during this level. Are you sure you want to quit?";V["en-gb"].optionsQuitConfirmBtn_No="No";V["en-gb"].optionsQuitConfirmBtn_Yes="Yes, I'm sure";V["en-gb"].levelMapScreenTitle="Select a level";V["en-gb"].optionsRestartConfirmationText="Attention!\n\nIf you restart now you will lose all progress made during this level. Are you sure you want to restart?";
V["en-gb"].optionsRestart="Restart";V["en-gb"].optionsSFXBig_on="Sound on";V["en-gb"].optionsSFXBig_off="Sound off";V["en-gb"].optionsAbout_title="About";V["en-gb"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2016";V["en-gb"].optionsAbout_backBtn="Back";V["en-gb"].optionsAbout_version="version:";V["en-gb"].optionsAbout="About";V["en-gb"].levelEndScreenMedal="IMPROVED!";V["en-gb"].startScreenQuestionaire="What do you think?";V["en-gb"].levelMapScreenWorld_0="Select a level";
V["en-gb"].startScreenByTinglyGames="by: CoolGames";V["en-gb"]["optionsLang_de-de"]="German";V["en-gb"]["optionsLang_tr-tr"]="Turkish";V["en-gb"].optionsAbout_header="Developed by:";V["en-gb"].levelEndScreenViewHighscoreBtn="View scores";V["en-gb"].levelEndScreenSubmitHighscoreBtn="Submit score";V["en-gb"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["en-gb"].challengeStartTextScore="<NAME>'s score:";V["en-gb"].challengeStartTextTime="<NAME>'s time:";
V["en-gb"].challengeStartScreenToWin="Amount to win:";V["en-gb"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["en-gb"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["en-gb"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["en-gb"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["en-gb"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["en-gb"].challengeCancelConfirmBtn_yes="Yes";V["en-gb"].challengeCancelConfirmBtn_no="No";V["en-gb"].challengeEndScreensBtn_submit="Submit challenge";V["en-gb"].challengeEndScreenBtn_cancel="Cancel challenge";V["en-gb"].challengeEndScreenName_you="You";V["en-gb"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["en-gb"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
V["en-gb"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["en-gb"].challengeCancelMessage_success="Your challenge has been cancelled.";V["en-gb"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["en-gb"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["en-gb"].challengeStartScreenTitle_challenger_friend="You are challenging:";
V["en-gb"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["en-gb"].challengeStartTextTime_challenger="Play the game and set a time.";V["en-gb"].challengeStartTextScore_challenger="Play the game and set a score.";V["en-gb"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you wish to proceed?";V["en-gb"].challengeForfeitConfirmBtn_yes="Yes";V["en-gb"].challengeForfeitConfirmBtn_no="No";V["en-gb"].challengeForfeitMessage_success="You have forfeited the challenge.";
V["en-gb"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["en-gb"].optionsChallengeForfeit="Forfeit";V["en-gb"].optionsChallengeCancel="Quit";V["en-gb"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["en-gb"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["en-gb"].levelEndScreenHighScore_time="Best time:";V["en-gb"].levelEndScreenTotalScore_time="Total time:";
V["en-gb"]["optionsLang_fr-fr"]="French";V["en-gb"]["optionsLang_ko-kr"]="Korean";V["en-gb"]["optionsLang_ar-eg"]="Arabic";V["en-gb"]["optionsLang_es-es"]="Spanish";V["en-gb"]["optionsLang_pt-br"]="Brazilian-Portuguese";V["en-gb"]["optionsLang_ru-ru"]="Russian";V["en-gb"].optionsExit="Exit";V["en-gb"].levelEndScreenTotalScore_number="Total score:";V["en-gb"].levelEndScreenHighScore_number="High score:";V["en-gb"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["en-gb"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["en-gb"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["en-gb"].optionsAbout_header_publisher="Published by:";V["en-gb"]["optionsLang_jp-jp"]="Japanese";V["de-de"]=V["de-de"]||{};V["de-de"].loadingScreenLoading="Laden ...";V["de-de"].startScreenPlay="SPIELEN";
V["de-de"].levelMapScreenTotalScore="Gesamtpunkte";V["de-de"].levelEndScreenTitle_level="Level <VALUE>";V["de-de"].levelEndScreenTitle_difficulty="Sehr gut!";V["de-de"].levelEndScreenTitle_endless="Stufe <VALUE>";V["de-de"].levelEndScreenTotalScore="Gesamtpunkte";V["de-de"].levelEndScreenSubTitle_levelFailed="Level nicht geschafft";V["de-de"].levelEndScreenTimeLeft="Restzeit";V["de-de"].levelEndScreenTimeBonus="Zeitbonus";V["de-de"].levelEndScreenHighScore="Highscore";
V["de-de"].optionsStartScreen="Hauptmen\u00fc";V["de-de"].optionsQuit="Beenden";V["de-de"].optionsResume="Weiterspielen";V["de-de"].optionsTutorial="So wird gespielt";V["de-de"].optionsHighScore="Highscores";V["de-de"].optionsMoreGames="Weitere Spiele";V["de-de"].optionsDifficulty_easy="Einfach";V["de-de"].optionsDifficulty_medium="Mittel";V["de-de"].optionsDifficulty_hard="Schwer";V["de-de"].optionsMusic_on="EIN";V["de-de"].optionsMusic_off="AUS";V["de-de"].optionsSFX_on="EIN";
V["de-de"].optionsSFX_off="AUS";V["de-de"]["optionsLang_en-us"]="Englisch (US)";V["de-de"]["optionsLang_en-gb"]="Englisch (GB)";V["de-de"]["optionsLang_nl-nl"]="Holl\u00e4ndisch";V["de-de"].gameEndScreenTitle="Gl\u00fcckwunsch!\nDu hast das Spiel abgeschlossen.";V["de-de"].gameEndScreenBtnText="Weiter";V["de-de"].optionsTitle="Einstellungen";V["de-de"].optionsQuitConfirmationText="Achtung!\n\nWenn du jetzt aufh\u00f6rst, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich aufh\u00f6ren?";
V["de-de"].optionsQuitConfirmBtn_No="NEIN";V["de-de"].optionsQuitConfirmBtn_Yes="Ja, ich bin mir sicher";V["de-de"].levelMapScreenTitle="W\u00e4hle ein Level";V["de-de"].optionsRestartConfirmationText="Achtung!\n\nWenn du jetzt neu startest, verlierst du alle in diesem Level gemachten Fortschritte. Willst du wirklich neu starten?";V["de-de"].optionsRestart="Neustart";V["de-de"].optionsSFXBig_on="Sound EIN";V["de-de"].optionsSFXBig_off="Sound AUS";V["de-de"].optionsAbout_title="\u00dcber";
V["de-de"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2016";V["de-de"].optionsAbout_backBtn="Zur\u00fcck";V["de-de"].optionsAbout_version="Version:";V["de-de"].optionsAbout="\u00dcber";V["de-de"].levelEndScreenMedal="VERBESSERT!";V["de-de"].startScreenQuestionaire="Deine Meinung z\u00e4hlt!";V["de-de"].levelMapScreenWorld_0="W\u00e4hle ein Level";V["de-de"].startScreenByTinglyGames="von: CoolGames";V["de-de"]["optionsLang_de-de"]="Deutsch";V["de-de"]["optionsLang_tr-tr"]="T\u00fcrkisch";
V["de-de"].optionsAbout_header="Entwickelt von:";V["de-de"].levelEndScreenViewHighscoreBtn="Punktzahlen ansehen";V["de-de"].levelEndScreenSubmitHighscoreBtn="Punktzahl senden";V["de-de"].challengeStartScreenTitle_challengee_friend="Dein Gegner:";V["de-de"].challengeStartTextScore="Punktzahl von <NAME>:";V["de-de"].challengeStartTextTime="Zeit von <NAME>:";V["de-de"].challengeStartScreenToWin="Einsatz:";V["de-de"].challengeEndScreenWinnings="Du hast <AMOUNT> Fairm\u00fcnzen gewonnen!";
V["de-de"].challengeEndScreenOutcomeMessage_WON="Du hast die Partie gewonnen!";V["de-de"].challengeEndScreenOutcomeMessage_LOST="Leider hat Dein Gegner die Partie gewonnen.";V["de-de"].challengeEndScreenOutcomeMessage_TIED="Gleichstand!";V["de-de"].challengeCancelConfirmText="Willst Du Deine Wette wirklich zur\u00fcckziehen? Dein Wetteinsatz wird Dir zur\u00fcckgegeben minus die Einsatzgeb\u00fchr.";V["de-de"].challengeCancelConfirmBtn_yes="Ja";V["de-de"].challengeCancelConfirmBtn_no="Nein";
V["de-de"].challengeEndScreensBtn_submit="Herausfordern";V["de-de"].challengeEndScreenBtn_cancel="Zur\u00fcckziehen";V["de-de"].challengeEndScreenName_you="Du";V["de-de"].challengeEndScreenChallengeSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";V["de-de"].challengeEndScreenChallengeSend_success="Herausforderung verschickt!";V["de-de"].challengeCancelMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
V["de-de"].challengeCancelMessage_success="Du hast die Wette erfolgreich zur\u00fcckgezogen.";V["de-de"].challengeEndScreenScoreSend_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";V["de-de"].challengeStartScreenTitle_challengee_stranger="Dein Gegner wird:";V["de-de"].challengeStartScreenTitle_challenger_friend="Du hast den folgenden Spieler herausgefordert:";V["de-de"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
V["de-de"].challengeStartTextTime_challenger="Spiel um die niedrigste Zeit!";V["de-de"].challengeStartTextScore_challenger="Spiel um die hochste Punktzahl!";V["de-de"].challengeForfeitConfirmText="Willst du Die Partie wirklich aufgeben?";V["de-de"].challengeForfeitConfirmBtn_yes="Ja";V["de-de"].challengeForfeitConfirmBtn_no="Nein";V["de-de"].challengeForfeitMessage_success="You have forfeited the challenge.";V["de-de"].challengeForfeitMessage_error="Leider ist ein Fehler aufgetreten. Probiere es bitte nochmal sp\u00e4ter.";
V["de-de"].optionsChallengeForfeit="Aufgeben";V["de-de"].optionsChallengeCancel="Zur\u00fcckziehen";V["de-de"].challengeLoadingError_notValid="Leider ist diese Partie nicht mehr aktuel.";V["de-de"].challengeLoadingError_notStarted="Leider ist ein Fehler\u00a0aufgetreten. Es konnte keiner Verbindung zum Server hergestellt werden. Versuche es bitte nochmal sp\u00e4ter.";V["de-de"].levelEndScreenHighScore_time="Bestzeit:";V["de-de"].levelEndScreenTotalScore_time="Gesamtzeit:";
V["de-de"]["optionsLang_fr-fr"]="Franz\u00f6sisch";V["de-de"]["optionsLang_ko-kr"]="Koreanisch";V["de-de"]["optionsLang_ar-eg"]="Arabisch";V["de-de"]["optionsLang_es-es"]="Spanisch";V["de-de"]["optionsLang_pt-br"]="Portugiesisch (Brasilien)";V["de-de"]["optionsLang_ru-ru"]="Russisch";V["de-de"].optionsExit="Verlassen";V["de-de"].levelEndScreenTotalScore_number="Gesamtpunktzahl:";V["de-de"].levelEndScreenHighScore_number="Highscore:";V["de-de"].challengeEndScreenChallengeSend_submessage="<NAME> hat 72 Stunden um die Wette anzunehmen oder abzulehnen. Sollte <NAME> nicht reagieren oder ablehnen werden Dir Dein Wetteinsatz und die Geb\u00fchr zur\u00fcckerstattet.";
V["de-de"].challengeEndScreenChallengeSend_submessage_stranger="Als niemanden Deine Herausforderung innerhalb von 72 Stunden annimmt, werden Dir Deinen Wetteinsatz Einsatzgeb\u00fchr zur\u00fcckerstattet.";V["de-de"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["de-de"].optionsAbout_header_publisher="Published by:";V["de-de"]["optionsLang_jp-jp"]="Japanese";V["fr-fr"]=V["fr-fr"]||{};V["fr-fr"].loadingScreenLoading="Chargement...";V["fr-fr"].startScreenPlay="JOUER";
V["fr-fr"].levelMapScreenTotalScore="Score total";V["fr-fr"].levelEndScreenTitle_level="Niveau <VALUE>";V["fr-fr"].levelEndScreenTitle_difficulty="Bien jou\u00e9 !";V["fr-fr"].levelEndScreenTitle_endless="Sc\u00e8ne <VALUE>";V["fr-fr"].levelEndScreenTotalScore="Score total";V["fr-fr"].levelEndScreenSubTitle_levelFailed="\u00c9chec du niveau";V["fr-fr"].levelEndScreenTimeLeft="Temps restant";V["fr-fr"].levelEndScreenTimeBonus="Bonus de temps";V["fr-fr"].levelEndScreenHighScore="Meilleur score";
V["fr-fr"].optionsStartScreen="Menu principal";V["fr-fr"].optionsQuit="Quitter";V["fr-fr"].optionsResume="Reprendre";V["fr-fr"].optionsTutorial="Comment jouer";V["fr-fr"].optionsHighScore="Meilleurs scores";V["fr-fr"].optionsMoreGames="Plus de jeux";V["fr-fr"].optionsDifficulty_easy="Facile";V["fr-fr"].optionsDifficulty_medium="Moyen";V["fr-fr"].optionsDifficulty_hard="Difficile";V["fr-fr"].optionsMusic_on="Avec";V["fr-fr"].optionsMusic_off="Sans";V["fr-fr"].optionsSFX_on="Avec";
V["fr-fr"].optionsSFX_off="Sans";V["fr-fr"]["optionsLang_en-us"]="Anglais (US)";V["fr-fr"]["optionsLang_en-gb"]="Anglais (UK)";V["fr-fr"]["optionsLang_nl-nl"]="N\u00e9erlandais";V["fr-fr"].gameEndScreenTitle="F\u00e9licitations !\nVous avez termin\u00e9 le jeu.";V["fr-fr"].gameEndScreenBtnText="Continuer";V["fr-fr"].optionsTitle="Param\u00e8tres";V["fr-fr"].optionsQuitConfirmationText="Attention !\n\nEn quittant maintenant, vous perdrez votre progression pour le niveau en cours. Quitter quand m\u00eame ?";
V["fr-fr"].optionsQuitConfirmBtn_No="Non";V["fr-fr"].optionsQuitConfirmBtn_Yes="Oui";V["fr-fr"].levelMapScreenTitle="Choisir un niveau";V["fr-fr"].optionsRestartConfirmationText="Attention !\n\nEn recommen\u00e7ant maintenant, vous perdrez votre progression pour le niveau en cours. Recommencer quand m\u00eame ?";V["fr-fr"].optionsRestart="Recommencer";V["fr-fr"].optionsSFXBig_on="Avec son";V["fr-fr"].optionsSFXBig_off="Sans son";V["fr-fr"].optionsAbout_title="\u00c0 propos";
V["fr-fr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2016";V["fr-fr"].optionsAbout_backBtn="Retour";V["fr-fr"].optionsAbout_version="Version :";V["fr-fr"].optionsAbout="\u00c0 propos";V["fr-fr"].levelEndScreenMedal="RECORD BATTU !";V["fr-fr"].startScreenQuestionaire="Un avis sur le jeu ?";V["fr-fr"].levelMapScreenWorld_0="Choisir un niveau";V["fr-fr"].startScreenByTinglyGames="Un jeu CoolGames";V["fr-fr"]["optionsLang_de-de"]="Allemand";V["fr-fr"]["optionsLang_tr-tr"]="Turc";
V["fr-fr"].optionsAbout_header="D\u00e9velopp\u00e9 par :";V["fr-fr"].levelEndScreenViewHighscoreBtn="Voir les scores";V["fr-fr"].levelEndScreenSubmitHighscoreBtn="Publier un score";V["fr-fr"].challengeStartScreenTitle_challengee_friend="Votre adversaire\u00a0:";V["fr-fr"].challengeStartTextScore="Son score :";V["fr-fr"].challengeStartTextTime="Son temps\u00a0:";V["fr-fr"].challengeStartScreenToWin="\u00c0 gagner\u00a0:";V["fr-fr"].challengeEndScreenWinnings="Vous avez gagn\u00e9 <AMOUNT> fairpoints.";
V["fr-fr"].challengeEndScreenOutcomeMessage_WON="Vainqueur\u00a0!";V["fr-fr"].challengeEndScreenOutcomeMessage_LOST="Zut\u00a0!";V["fr-fr"].challengeEndScreenOutcomeMessage_TIED="Ex-aequo\u00a0!";V["fr-fr"].challengeCancelConfirmText="Si vous annulez, on vous remboursera le montant du pari moins les frais de pari. Voulez-vous continuer\u00a0? ";V["fr-fr"].challengeCancelConfirmBtn_yes="Oui";V["fr-fr"].challengeCancelConfirmBtn_no="Non";V["fr-fr"].challengeEndScreensBtn_submit="Lancer le d\u00e9fi";
V["fr-fr"].challengeEndScreenBtn_cancel="Annuler le d\u00e9fi";V["fr-fr"].challengeEndScreenName_you="Moi";V["fr-fr"].challengeEndScreenChallengeSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";V["fr-fr"].challengeEndScreenChallengeSend_success="D\u00e9fi lanc\u00e9.";V["fr-fr"].challengeCancelMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";V["fr-fr"].challengeCancelMessage_success="D\u00e9fi annul\u00e9.";
V["fr-fr"].challengeEndScreenScoreSend_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";V["fr-fr"].challengeStartScreenTitle_challengee_stranger="Votre adversaire\u00a0:";V["fr-fr"].challengeStartScreenTitle_challenger_friend="Votre adversaire\u00a0:";V["fr-fr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["fr-fr"].challengeStartTextTime_challenger="Finissez le plus vite possible !";V["fr-fr"].challengeStartTextScore_challenger="Essayez d\u2019atteindre le plus haut score !";
V["fr-fr"].challengeForfeitConfirmText="Voulez-vous vraiment abandonner la partie ?";V["fr-fr"].challengeForfeitConfirmBtn_yes="Oui";V["fr-fr"].challengeForfeitConfirmBtn_no="Non";V["fr-fr"].challengeForfeitMessage_success="Vous avez abandonn\u00e9.";V["fr-fr"].challengeForfeitMessage_error="Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";V["fr-fr"].optionsChallengeForfeit="Abandonner";V["fr-fr"].optionsChallengeCancel="Annuler";V["fr-fr"].challengeLoadingError_notValid="D\u00e9sol\u00e9, cette partie n'existe plus.";
V["fr-fr"].challengeLoadingError_notStarted="Une erreur de connexion est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.";V["fr-fr"].levelEndScreenHighScore_time="Meilleur temps :";V["fr-fr"].levelEndScreenTotalScore_time="Temps total :";V["fr-fr"]["optionsLang_fr-fr"]="Fran\u00e7ais";V["fr-fr"]["optionsLang_ko-kr"]="Cor\u00e9en";V["fr-fr"]["optionsLang_ar-eg"]="Arabe";V["fr-fr"]["optionsLang_es-es"]="Espagnol";V["fr-fr"]["optionsLang_pt-br"]="Portugais - Br\u00e9silien";
V["fr-fr"]["optionsLang_ru-ru"]="Russe";V["fr-fr"].optionsExit="Quitter";V["fr-fr"].levelEndScreenTotalScore_number="Score total :";V["fr-fr"].levelEndScreenHighScore_number="Meilleur score :";V["fr-fr"].challengeEndScreenChallengeSend_submessage="<NAME> a 72 heures pour accepter votre d\u00e9fi. Si <NAME> refuse ou n\u2019accepte pas dans ce d\u00e9lai vous serez rembours\u00e9 le montant de votre pari et les frais de pari.";V["fr-fr"].challengeEndScreenChallengeSend_submessage_stranger="Si personne n\u2019accepte votre pari d\u2019ici 72 heures, on vous remboursera le montant du pari y compris les frais.";
V["fr-fr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["fr-fr"].optionsAbout_header_publisher="Published by:";V["fr-fr"]["optionsLang_jp-jp"]="Japanese";V["pt-br"]=V["pt-br"]||{};V["pt-br"].loadingScreenLoading="Carregando...";V["pt-br"].startScreenPlay="JOGAR";V["pt-br"].levelMapScreenTotalScore="Pontua\u00e7\u00e3o";V["pt-br"].levelEndScreenTitle_level="N\u00edvel <VALUE>";V["pt-br"].levelEndScreenTitle_difficulty="Muito bem!";
V["pt-br"].levelEndScreenTitle_endless="Fase <VALUE>";V["pt-br"].levelEndScreenTotalScore="Pontua\u00e7\u00e3o";V["pt-br"].levelEndScreenSubTitle_levelFailed="Tente novamente";V["pt-br"].levelEndScreenTimeLeft="Tempo restante";V["pt-br"].levelEndScreenTimeBonus="B\u00f4nus de tempo";V["pt-br"].levelEndScreenHighScore="Recorde";V["pt-br"].optionsStartScreen="Menu principal";V["pt-br"].optionsQuit="Sair";V["pt-br"].optionsResume="Continuar";V["pt-br"].optionsTutorial="Como jogar";
V["pt-br"].optionsHighScore="Recordes";V["pt-br"].optionsMoreGames="Mais jogos";V["pt-br"].optionsDifficulty_easy="F\u00e1cil";V["pt-br"].optionsDifficulty_medium="M\u00e9dio";V["pt-br"].optionsDifficulty_hard="Dif\u00edcil";V["pt-br"].optionsMusic_on="Sim";V["pt-br"].optionsMusic_off="N\u00e3o";V["pt-br"].optionsSFX_on="Sim";V["pt-br"].optionsSFX_off="N\u00e3o";V["pt-br"]["optionsLang_en-us"]="Ingl\u00eas (EUA)";V["pt-br"]["optionsLang_en-gb"]="Ingl\u00eas (GB)";V["pt-br"]["optionsLang_nl-nl"]="Holand\u00eas";
V["pt-br"].gameEndScreenTitle="Parab\u00e9ns!\nVoc\u00ea concluiu o jogo.";V["pt-br"].gameEndScreenBtnText="Continuar";V["pt-br"].optionsTitle="Configura\u00e7\u00f5es";V["pt-br"].optionsQuitConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea sair agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo sair?";V["pt-br"].optionsQuitConfirmBtn_No="N\u00e3o";V["pt-br"].optionsQuitConfirmBtn_Yes="Sim, tenho certeza.";V["pt-br"].levelMapScreenTitle="Selecione um n\u00edvel";
V["pt-br"].optionsRestartConfirmationText="Aten\u00e7\u00e3o!\n\nSe voc\u00ea reiniciar agora, perder\u00e1 todo progresso realizado neste n\u00edvel. Deseja mesmo reiniciar?";V["pt-br"].optionsRestart="Reiniciar";V["pt-br"].optionsSFXBig_on="Com som";V["pt-br"].optionsSFXBig_off="Sem som";V["pt-br"].optionsAbout_title="Sobre";V["pt-br"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2016";V["pt-br"].optionsAbout_backBtn="Voltar";V["pt-br"].optionsAbout_version="vers\u00e3o:";
V["pt-br"].optionsAbout="Sobre";V["pt-br"].levelEndScreenMedal="MELHOROU!";V["pt-br"].startScreenQuestionaire="O que voc\u00ea achou?";V["pt-br"].levelMapScreenWorld_0="Selecione um n\u00edvel";V["pt-br"].startScreenByTinglyGames="da: CoolGames";V["pt-br"]["optionsLang_de-de"]="Alem\u00e3o";V["pt-br"]["optionsLang_tr-tr"]="Turco";V["pt-br"].optionsAbout_header="Desenvolvido por:";V["pt-br"].levelEndScreenViewHighscoreBtn="Ver pontua\u00e7\u00f5es";V["pt-br"].levelEndScreenSubmitHighscoreBtn="Enviar recorde";
V["pt-br"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["pt-br"].challengeStartTextScore="<NAME>'s score:";V["pt-br"].challengeStartTextTime="<NAME>'s time:";V["pt-br"].challengeStartScreenToWin="Amount to win:";V["pt-br"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["pt-br"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["pt-br"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";
V["pt-br"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["pt-br"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";V["pt-br"].challengeCancelConfirmBtn_yes="Yes";V["pt-br"].challengeCancelConfirmBtn_no="No";V["pt-br"].challengeEndScreensBtn_submit="Submit challenge";V["pt-br"].challengeEndScreenBtn_cancel="Cancel challenge";V["pt-br"].challengeEndScreenName_you="You";
V["pt-br"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["pt-br"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";V["pt-br"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["pt-br"].challengeCancelMessage_success="Your challenge has been cancelled.";V["pt-br"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";
V["pt-br"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["pt-br"].challengeStartScreenTitle_challenger_friend="You are challenging:";V["pt-br"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["pt-br"].challengeStartTextTime_challenger="Play the game and set a time.";V["pt-br"].challengeStartTextScore_challenger="Play the game and set a score.";V["pt-br"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";
V["pt-br"].challengeForfeitConfirmBtn_yes="Yes";V["pt-br"].challengeForfeitConfirmBtn_no="No";V["pt-br"].challengeForfeitMessage_success="You have forfeited the challenge.";V["pt-br"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["pt-br"].optionsChallengeForfeit="Desistir";V["pt-br"].optionsChallengeCancel="Sair do Jogo";V["pt-br"].challengeLoadingError_notValid="Desculpe, este desafio n\u00e3o \u00e9 mais v\u00e1lido.";
V["pt-br"].challengeLoadingError_notStarted="Imposs\u00edvel conectar ao servidor. Por favor, tente novamente mais tarde.";V["pt-br"].levelEndScreenHighScore_time="Tempo recorde:";V["pt-br"].levelEndScreenTotalScore_time="Tempo total:";V["pt-br"]["optionsLang_fr-fr"]="Franc\u00eas";V["pt-br"]["optionsLang_ko-kr"]="Coreano";V["pt-br"]["optionsLang_ar-eg"]="\u00c1rabe";V["pt-br"]["optionsLang_es-es"]="Espanhol";V["pt-br"]["optionsLang_pt-br"]="Portugu\u00eas do Brasil";
V["pt-br"]["optionsLang_ru-ru"]="Russo";V["pt-br"].optionsExit="Sa\u00edda";V["pt-br"].levelEndScreenTotalScore_number="Pontua\u00e7\u00e3o total:";V["pt-br"].levelEndScreenHighScore_number="Pontua\u00e7\u00e3o m\u00e1xima:";V["pt-br"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["pt-br"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["pt-br"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["pt-br"].optionsAbout_header_publisher="Published by:";V["pt-br"]["optionsLang_jp-jp"]="Japanese";V["es-es"]=V["es-es"]||{};V["es-es"].loadingScreenLoading="Cargando...";V["es-es"].startScreenPlay="JUGAR";
V["es-es"].levelMapScreenTotalScore="Punt. total";V["es-es"].levelEndScreenTitle_level="Nivel <VALUE>";V["es-es"].levelEndScreenTitle_difficulty="\u00a1Muy bien!";V["es-es"].levelEndScreenTitle_endless="Fase <VALUE>";V["es-es"].levelEndScreenTotalScore="Punt. total";V["es-es"].levelEndScreenSubTitle_levelFailed="Nivel fallido";V["es-es"].levelEndScreenTimeLeft="Tiempo restante";V["es-es"].levelEndScreenTimeBonus="Bonif. tiempo";V["es-es"].levelEndScreenHighScore="R\u00e9cord";
V["es-es"].optionsStartScreen="Men\u00fa principal";V["es-es"].optionsQuit="Salir";V["es-es"].optionsResume="Seguir";V["es-es"].optionsTutorial="C\u00f3mo jugar";V["es-es"].optionsHighScore="R\u00e9cords";V["es-es"].optionsMoreGames="M\u00e1s juegos";V["es-es"].optionsDifficulty_easy="F\u00e1cil";V["es-es"].optionsDifficulty_medium="Normal";V["es-es"].optionsDifficulty_hard="Dif\u00edcil";V["es-es"].optionsMusic_on="S\u00ed";V["es-es"].optionsMusic_off="No";V["es-es"].optionsSFX_on="S\u00ed";
V["es-es"].optionsSFX_off="No";V["es-es"]["optionsLang_en-us"]="Ingl\u00e9s (EE.UU.)";V["es-es"]["optionsLang_en-gb"]="Ingl\u00e9s (GB)";V["es-es"]["optionsLang_nl-nl"]="Neerland\u00e9s";V["es-es"].gameEndScreenTitle="\u00a1Enhorabuena!\nHas terminado el juego.";V["es-es"].gameEndScreenBtnText="Continuar";V["es-es"].optionsTitle="Ajustes";V["es-es"].optionsQuitConfirmationText="\u00a1Aviso!\n\nSi sales ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres salir?";
V["es-es"].optionsQuitConfirmBtn_No="No";V["es-es"].optionsQuitConfirmBtn_Yes="S\u00ed, seguro";V["es-es"].levelMapScreenTitle="Elige un nivel";V["es-es"].optionsRestartConfirmationText="\u00a1Aviso!\n\nSi reinicias ahora, perder\u00e1s el progreso que hayas realizado en el nivel. \u00bfSeguro que quieres reiniciar?";V["es-es"].optionsRestart="Reiniciar";V["es-es"].optionsSFXBig_on="Sonido s\u00ed";V["es-es"].optionsSFXBig_off="Sonido no";V["es-es"].optionsAbout_title="Acerca de";
V["es-es"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2016";V["es-es"].optionsAbout_backBtn="Atr\u00e1s";V["es-es"].optionsAbout_version="versi\u00f3n:";V["es-es"].optionsAbout="Acerca de";V["es-es"].levelEndScreenMedal="\u00a1SUPERADO!";V["es-es"].startScreenQuestionaire="\u00bfQu\u00e9 te parece?";V["es-es"].levelMapScreenWorld_0="Elige un nivel";V["es-es"].startScreenByTinglyGames="de: CoolGames";V["es-es"]["optionsLang_de-de"]="Alem\u00e1n";V["es-es"]["optionsLang_tr-tr"]="Turco";
V["es-es"].optionsAbout_header="Desarrollado por:";V["es-es"].levelEndScreenViewHighscoreBtn="Ver puntuaciones";V["es-es"].levelEndScreenSubmitHighscoreBtn="Enviar puntuaci\u00f3n";V["es-es"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["es-es"].challengeStartTextScore="<NAME>'s score:";V["es-es"].challengeStartTextTime="<NAME>'s time:";V["es-es"].challengeStartScreenToWin="Amount to win:";V["es-es"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";
V["es-es"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["es-es"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["es-es"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["es-es"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";V["es-es"].challengeCancelConfirmBtn_yes="Yes";V["es-es"].challengeCancelConfirmBtn_no="No";
V["es-es"].challengeEndScreensBtn_submit="Submit challenge";V["es-es"].challengeEndScreenBtn_cancel="Cancel challenge";V["es-es"].challengeEndScreenName_you="You";V["es-es"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["es-es"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";V["es-es"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
V["es-es"].challengeCancelMessage_success="Your challenge has been cancelled.";V["es-es"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["es-es"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["es-es"].challengeStartScreenTitle_challenger_friend="You are challenging:";V["es-es"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
V["es-es"].challengeStartTextTime_challenger="Play the game and set a time.";V["es-es"].challengeStartTextScore_challenger="Play the game and set a score.";V["es-es"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["es-es"].challengeForfeitConfirmBtn_yes="Yes";V["es-es"].challengeForfeitConfirmBtn_no="No";V["es-es"].challengeForfeitMessage_success="You have forfeited the challenge.";V["es-es"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
V["es-es"].optionsChallengeForfeit="Rendirse";V["es-es"].optionsChallengeCancel="Abandonar";V["es-es"].challengeLoadingError_notValid="Lo sentimos, este reto ya no es v\u00e1lido.";V["es-es"].challengeLoadingError_notStarted="Imposible conectar con el servidor. Int\u00e9ntalo m\u00e1s tarde.";V["es-es"].levelEndScreenHighScore_time="Mejor tiempo:";V["es-es"].levelEndScreenTotalScore_time="Tiempo total:";V["es-es"]["optionsLang_fr-fr"]="Franc\u00e9s";V["es-es"]["optionsLang_ko-kr"]="Coreano";
V["es-es"]["optionsLang_ar-eg"]="\u00c1rabe";V["es-es"]["optionsLang_es-es"]="Espa\u00f1ol";V["es-es"]["optionsLang_pt-br"]="Portugu\u00e9s brasile\u00f1o";V["es-es"]["optionsLang_ru-ru"]="Ruso";V["es-es"].optionsExit="Salir";V["es-es"].levelEndScreenTotalScore_number="Puntos totales:";V["es-es"].levelEndScreenHighScore_number="Mejor puntuaci\u00f3n:";V["es-es"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["es-es"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["es-es"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["es-es"].optionsAbout_header_publisher="Published by:";V["es-es"]["optionsLang_jp-jp"]="Japanese";V["tr-tr"]=V["tr-tr"]||{};V["tr-tr"].loadingScreenLoading="Y\u00fckleniyor...";V["tr-tr"].startScreenPlay="OYNA";
V["tr-tr"].levelMapScreenTotalScore="Toplam skor";V["tr-tr"].levelEndScreenTitle_level="Seviye <VALUE>";V["tr-tr"].levelEndScreenTitle_difficulty="Bravo!";V["tr-tr"].levelEndScreenTitle_endless="Seviye <VALUE>";V["tr-tr"].levelEndScreenTotalScore="Toplam skor";V["tr-tr"].levelEndScreenSubTitle_levelFailed="Seviye ba\u015far\u0131s\u0131z";V["tr-tr"].levelEndScreenTimeLeft="Kalan S\u00fcre";V["tr-tr"].levelEndScreenTimeBonus="S\u00fcre Bonusu";V["tr-tr"].levelEndScreenHighScore="Y\u00fcksek skor";
V["tr-tr"].optionsStartScreen="Ana men\u00fc";V["tr-tr"].optionsQuit="\u00c7\u0131k";V["tr-tr"].optionsResume="Devam et";V["tr-tr"].optionsTutorial="Nas\u0131l oynan\u0131r";V["tr-tr"].optionsHighScore="Y\u00fcksek skorlar";V["tr-tr"].optionsMoreGames="Daha Fazla Oyun";V["tr-tr"].optionsDifficulty_easy="Kolay";V["tr-tr"].optionsDifficulty_medium="Orta";V["tr-tr"].optionsDifficulty_hard="Zorluk";V["tr-tr"].optionsMusic_on="A\u00e7\u0131k";V["tr-tr"].optionsMusic_off="Kapal\u0131";
V["tr-tr"].optionsSFX_on="A\u00e7\u0131k";V["tr-tr"].optionsSFX_off="Kapal\u0131";V["tr-tr"]["optionsLang_en-us"]="\u0130ngilizce (US)";V["tr-tr"]["optionsLang_en-gb"]="\u0130ngilizce (GB)";V["tr-tr"]["optionsLang_nl-nl"]="Hollandaca";V["tr-tr"].gameEndScreenTitle="Tebrikler!\nOyunu tamamlad\u0131n.";V["tr-tr"].gameEndScreenBtnText="Devam";V["tr-tr"].optionsTitle="Ayarlar";V["tr-tr"].optionsQuitConfirmationText="Dikkat!\n\u015eimdi \u00e7\u0131karsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. \u00c7\u0131kmak istedi\u011finizden emin misiniz?";
V["tr-tr"].optionsQuitConfirmBtn_No="Hay\u0131r";V["tr-tr"].optionsQuitConfirmBtn_Yes="Evet, eminim";V["tr-tr"].levelMapScreenTitle="Bir seviye se\u00e7";V["tr-tr"].optionsRestartConfirmationText="Dikkat!\n\u015eimdi tekrar ba\u015flarsan bu seviyede yap\u0131lan t\u00fcm ilerleme kaybedilecek. Ba\u015ftan ba\u015flamak istedi\u011finden emin misin?";V["tr-tr"].optionsRestart="Tekrar ba\u015flat";V["tr-tr"].optionsSFXBig_on="Ses a\u00e7\u0131k";V["tr-tr"].optionsSFXBig_off="Ses kapal\u0131";
V["tr-tr"].optionsAbout_title="Hakk\u0131nda";V["tr-tr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2016";V["tr-tr"].optionsAbout_backBtn="Geri";V["tr-tr"].optionsAbout_version="s\u00fcr\u00fcm:";V["tr-tr"].optionsAbout="Hakk\u0131nda";V["tr-tr"].levelEndScreenMedal="\u0130Y\u0130LE\u015eT\u0130!";V["tr-tr"].startScreenQuestionaire="Ne dersin?";V["tr-tr"].levelMapScreenWorld_0="Bir seviye se\u00e7";V["tr-tr"].startScreenByTinglyGames="taraf\u0131ndan: CoolGames";
V["tr-tr"]["optionsLang_de-de"]="Almanca";V["tr-tr"]["optionsLang_tr-tr"]="T\u00fcrk\u00e7e";V["tr-tr"].optionsAbout_header="Haz\u0131rlayan:";V["tr-tr"].levelEndScreenViewHighscoreBtn="Puanlar\u0131 g\u00f6ster:";V["tr-tr"].levelEndScreenSubmitHighscoreBtn="Puan g\u00f6nder";V["tr-tr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["tr-tr"].challengeStartTextScore="<NAME>'s score:";V["tr-tr"].challengeStartTextTime="<NAME>'s time:";
V["tr-tr"].challengeStartScreenToWin="Amount to win:";V["tr-tr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["tr-tr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["tr-tr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["tr-tr"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["tr-tr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["tr-tr"].challengeCancelConfirmBtn_yes="Yes";V["tr-tr"].challengeCancelConfirmBtn_no="No";V["tr-tr"].challengeEndScreensBtn_submit="Submit challenge";V["tr-tr"].challengeEndScreenBtn_cancel="Cancel challenge";V["tr-tr"].challengeEndScreenName_you="You";V["tr-tr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["tr-tr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
V["tr-tr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["tr-tr"].challengeCancelMessage_success="Your challenge has been cancelled.";V["tr-tr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["tr-tr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["tr-tr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
V["tr-tr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["tr-tr"].challengeStartTextTime_challenger="Play the game and set a time.";V["tr-tr"].challengeStartTextScore_challenger="Play the game and set a score.";V["tr-tr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["tr-tr"].challengeForfeitConfirmBtn_yes="Yes";V["tr-tr"].challengeForfeitConfirmBtn_no="No";V["tr-tr"].challengeForfeitMessage_success="You have forfeited the challenge.";
V["tr-tr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["tr-tr"].optionsChallengeForfeit="Vazge\u00e7";V["tr-tr"].optionsChallengeCancel="\u00c7\u0131k\u0131\u015f";V["tr-tr"].challengeLoadingError_notValid="\u00dczg\u00fcn\u00fcz, bu zorluk art\u0131k ge\u00e7erli de\u011fil.";V["tr-tr"].challengeLoadingError_notStarted="Sunucuya ba\u011flan\u0131lam\u0131yor. L\u00fctfen daha sonra tekrar deneyin.";
V["tr-tr"].levelEndScreenHighScore_time="En \u0130yi Zaman:";V["tr-tr"].levelEndScreenTotalScore_time="Toplam Zaman:";V["tr-tr"]["optionsLang_fr-fr"]="Frans\u0131zca";V["tr-tr"]["optionsLang_ko-kr"]="Korece";V["tr-tr"]["optionsLang_ar-eg"]="Arap\u00e7a";V["tr-tr"]["optionsLang_es-es"]="\u0130spanyolca";V["tr-tr"]["optionsLang_pt-br"]="Brezilya Portekizcesi";V["tr-tr"]["optionsLang_ru-ru"]="Rus\u00e7a";V["tr-tr"].optionsExit="\u00c7\u0131k\u0131\u015f";V["tr-tr"].levelEndScreenTotalScore_number="Toplam Puan:";
V["tr-tr"].levelEndScreenHighScore_number="Y\u00fcksek Puan:";V["tr-tr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";V["tr-tr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
V["tr-tr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["tr-tr"].optionsAbout_header_publisher="Published by:";V["tr-tr"]["optionsLang_jp-jp"]="Japanese";V["ru-ru"]=V["ru-ru"]||{};V["ru-ru"].loadingScreenLoading="\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...";V["ru-ru"].startScreenPlay="\u0418\u0413\u0420\u0410\u0422\u042c";V["ru-ru"].levelMapScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";V["ru-ru"].levelEndScreenTitle_level="\u0423\u0440\u043e\u0432\u0435\u043d\u044c <VALUE>";
V["ru-ru"].levelEndScreenTitle_difficulty="\u0425\u043e\u0440\u043e\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442!";V["ru-ru"].levelEndScreenTitle_endless="\u042d\u0442\u0430\u043f <VALUE>";V["ru-ru"].levelEndScreenTotalScore="\u041e\u0431\u0449\u0438\u0439 \u0441\u0447\u0435\u0442";V["ru-ru"].levelEndScreenSubTitle_levelFailed="\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u043f\u0440\u043e\u0439\u0434\u0435\u043d";V["ru-ru"].levelEndScreenTimeLeft="\u041e\u0441\u0442\u0430\u0432\u0448\u0435\u0435\u0441\u044f \u0432\u0440\u0435\u043c\u044f";
V["ru-ru"].levelEndScreenTimeBonus="\u0414\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f";V["ru-ru"].levelEndScreenHighScore="\u0420\u0435\u043a\u043e\u0440\u0434";V["ru-ru"].optionsStartScreen="\u0413\u043b\u0430\u0432\u043d\u043e\u0435 \u043c\u0435\u043d\u044e";V["ru-ru"].optionsQuit="\u0412\u044b\u0439\u0442\u0438";V["ru-ru"].optionsResume="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";V["ru-ru"].optionsTutorial="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";
V["ru-ru"].optionsHighScore="\u0420\u0435\u043a\u043e\u0440\u0434\u044b";V["ru-ru"].optionsMoreGames="\u0411\u043e\u043b\u044c\u0448\u0435 \u0438\u0433\u0440";V["ru-ru"].optionsDifficulty_easy="\u041b\u0435\u0433\u043a\u0438\u0439";V["ru-ru"].optionsDifficulty_medium="\u0421\u0440\u0435\u0434\u043d\u0438\u0439";V["ru-ru"].optionsDifficulty_hard="\u0421\u043b\u043e\u0436\u043d\u044b\u0439";V["ru-ru"].optionsMusic_on="\u0412\u043a\u043b.";V["ru-ru"].optionsMusic_off="\u0412\u044b\u043a\u043b.";
V["ru-ru"].optionsSFX_on="\u0412\u043a\u043b.";V["ru-ru"].optionsSFX_off="\u0412\u044b\u043a\u043b.";V["ru-ru"]["optionsLang_en-us"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0421\u0428\u0410)";V["ru-ru"]["optionsLang_en-gb"]="\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439 (\u0412\u0411)";V["ru-ru"]["optionsLang_nl-nl"]="\u041d\u0438\u0434\u0435\u0440\u043b\u0430\u043d\u0434\u0441\u043a\u0438\u0439";V["ru-ru"].gameEndScreenTitle="\u041f\u043e\u0437\u0434\u0440\u0430\u0432\u043b\u044f\u0435\u043c!\n\u0412\u044b \u043f\u0440\u043e\u0448\u043b\u0438 \u0438\u0433\u0440\u0443.";
V["ru-ru"].gameEndScreenBtnText="\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c";V["ru-ru"].optionsTitle="\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438";V["ru-ru"].optionsQuitConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0432\u044b\u0439\u0434\u0435\u0442\u0435 \u0441\u0435\u0439\u0447\u0430\u0441, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0432\u044b\u0439\u0442\u0438?";
V["ru-ru"].optionsQuitConfirmBtn_No="\u041d\u0435\u0442";V["ru-ru"].optionsQuitConfirmBtn_Yes="\u0414\u0430, \u0432\u044b\u0439\u0442\u0438";V["ru-ru"].levelMapScreenTitle="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";V["ru-ru"].optionsRestartConfirmationText="\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!\n\n\u0415\u0441\u043b\u0438 \u0432\u044b \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0430\u0447\u043d\u0435\u0442\u0435 \u0438\u0433\u0440\u0443 \u0437\u0430\u043d\u043e\u0432\u043e, \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0441\u0447\u0438\u0442\u0430\u043d. \u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u043d\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e?";
V["ru-ru"].optionsRestart="\u0417\u0430\u043d\u043e\u0432\u043e";V["ru-ru"].optionsSFXBig_on="\u0417\u0432\u0443\u043a \u0432\u043a\u043b.";V["ru-ru"].optionsSFXBig_off="\u0417\u0432\u0443\u043a \u0432\u044b\u043a\u043b.";V["ru-ru"].optionsAbout_title="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";V["ru-ru"].optionsAbout_text="\u00a9 CoolGames\nwww.coolgames.com\n2016";V["ru-ru"].optionsAbout_backBtn="\u041d\u0430\u0437\u0430\u0434";V["ru-ru"].optionsAbout_version="\u0412\u0435\u0440\u0441\u0438\u044f:";
V["ru-ru"].optionsAbout="\u041e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435";V["ru-ru"].levelEndScreenMedal="\u041d\u041e\u0412\u042b\u0419 \u0420\u0415\u041a\u041e\u0420\u0414!";V["ru-ru"].startScreenQuestionaire="\u041a\u0430\u043a \u0432\u0430\u043c \u0438\u0433\u0440\u0430?";V["ru-ru"].levelMapScreenWorld_0="\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0440\u043e\u0432\u0435\u043d\u044c";V["ru-ru"].startScreenByTinglyGames="\u0420\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0438: CoolGames";
V["ru-ru"]["optionsLang_de-de"]="\u041d\u0435\u043c\u0435\u0446\u043a\u0438\u0439";V["ru-ru"]["optionsLang_tr-tr"]="\u0422\u0443\u0440\u0435\u0446\u043a\u0438\u0439";V["ru-ru"].optionsAbout_header="Developed by:";V["ru-ru"].levelEndScreenViewHighscoreBtn="View scores";V["ru-ru"].levelEndScreenSubmitHighscoreBtn="Submit score";V["ru-ru"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["ru-ru"].challengeStartTextScore="<NAME>'s score:";
V["ru-ru"].challengeStartTextTime="<NAME>'s time:";V["ru-ru"].challengeStartScreenToWin="Amount to win:";V["ru-ru"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["ru-ru"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["ru-ru"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["ru-ru"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["ru-ru"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["ru-ru"].challengeCancelConfirmBtn_yes="Yes";V["ru-ru"].challengeCancelConfirmBtn_no="No";V["ru-ru"].challengeEndScreensBtn_submit="Submit challenge";V["ru-ru"].challengeEndScreenBtn_cancel="Cancel challenge";V["ru-ru"].challengeEndScreenName_you="You";V["ru-ru"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["ru-ru"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
V["ru-ru"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["ru-ru"].challengeCancelMessage_success="Your challenge has been cancelled.";V["ru-ru"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["ru-ru"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["ru-ru"].challengeStartScreenTitle_challenger_friend="You are challenging:";
V["ru-ru"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["ru-ru"].challengeStartTextTime_challenger="Play the game and set a time.";V["ru-ru"].challengeStartTextScore_challenger="Play the game and set a score.";V["ru-ru"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["ru-ru"].challengeForfeitConfirmBtn_yes="Yes";V["ru-ru"].challengeForfeitConfirmBtn_no="No";V["ru-ru"].challengeForfeitMessage_success="You have forfeited the challenge.";
V["ru-ru"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["ru-ru"].optionsChallengeForfeit="Forfeit";V["ru-ru"].optionsChallengeCancel="Quit";V["ru-ru"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["ru-ru"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["ru-ru"].levelEndScreenHighScore_time="Best time:";V["ru-ru"].levelEndScreenTotalScore_time="Total time:";
V["ru-ru"]["optionsLang_fr-fr"]="\u0424\u0440\u0430\u043d\u0446\u0443\u0437\u0441\u043a\u0438\u0439";V["ru-ru"]["optionsLang_ko-kr"]="\u041a\u043e\u0440\u0435\u0439\u0441\u043a\u0438\u0439";V["ru-ru"]["optionsLang_ar-eg"]="\u0410\u0440\u0430\u0431\u0441\u043a\u0438\u0439";V["ru-ru"]["optionsLang_es-es"]="\u0418\u0441\u043f\u0430\u043d\u0441\u043a\u0438\u0439";V["ru-ru"]["optionsLang_pt-br"]="\u0411\u0440\u0430\u0437\u0438\u043b\u044c\u0441\u043a\u0438\u0439 \u043f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u044c\u0441\u043a\u0438\u0439";
V["ru-ru"]["optionsLang_ru-ru"]="\u0420\u0443\u0441\u0441\u043a\u0438\u0439";V["ru-ru"].optionsExit="Exit";V["ru-ru"].levelEndScreenTotalScore_number="Total score:";V["ru-ru"].levelEndScreenHighScore_number="High score:";V["ru-ru"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["ru-ru"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["ru-ru"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["ru-ru"].optionsAbout_header_publisher="Published by:";V["ru-ru"]["optionsLang_jp-jp"]="Japanese";V["ar-eg"]=V["ar-eg"]||{};V["ar-eg"].loadingScreenLoading="\u064a\u062a\u0645 \u0627\u0644\u0622\u0646 \u0627\u0644\u062a\u062d\u0645\u064a\u0644...";
V["ar-eg"].startScreenPlay="\u062a\u0634\u063a\u064a\u0644";V["ar-eg"].levelMapScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";V["ar-eg"].levelEndScreenTitle_level="\u0627\u0644\u0645\u0633\u062a\u0648\u0649 <VALUE>";V["ar-eg"].levelEndScreenTitle_difficulty="\u0623\u062d\u0633\u0646\u062a!";V["ar-eg"].levelEndScreenTitle_endless="\u0627\u0644\u0645\u0631\u062d\u0644\u0629 <VALUE>";V["ar-eg"].levelEndScreenTotalScore="\u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629";
V["ar-eg"].levelEndScreenSubTitle_levelFailed="\u0644\u0642\u062f \u0641\u0634\u0644\u062a \u0641\u064a \u0627\u062c\u062a\u064a\u0627\u0632 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649";V["ar-eg"].levelEndScreenTimeLeft="\u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062a\u0628\u0642\u064a";V["ar-eg"].levelEndScreenTimeBonus="\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0648\u0642\u062a";V["ar-eg"].levelEndScreenHighScore="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";
V["ar-eg"].optionsStartScreen="\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629";V["ar-eg"].optionsQuit="\u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629";V["ar-eg"].optionsResume="\u0627\u0633\u062a\u0626\u0646\u0627\u0641";V["ar-eg"].optionsTutorial="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";V["ar-eg"].optionsHighScore="\u0623\u0639\u0644\u0649 \u0627\u0644\u0646\u062a\u0627\u0626\u062c";
V["ar-eg"].optionsMoreGames="\u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0623\u0644\u0639\u0627\u0628";V["ar-eg"].optionsDifficulty_easy="\u0633\u0647\u0644";V["ar-eg"].optionsDifficulty_medium="\u0645\u062a\u0648\u0633\u0637";V["ar-eg"].optionsDifficulty_hard="\u0635\u0639\u0628";V["ar-eg"].optionsMusic_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";V["ar-eg"].optionsMusic_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649";
V["ar-eg"].optionsSFX_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";V["ar-eg"].optionsSFX_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0645\u0624\u062b\u0631\u0627\u062a \u0627\u0644\u0635\u0648\u062a\u064a\u0629";V["ar-eg"]["optionsLang_en-us"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";
V["ar-eg"]["optionsLang_en-gb"]="\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629)";V["ar-eg"]["optionsLang_nl-nl"]="\u0627\u0644\u0647\u0648\u0644\u0646\u062f\u064a\u0629";V["ar-eg"].gameEndScreenTitle="\u062a\u0647\u0627\u0646\u064a\u0646\u0627!\n\u0644\u0642\u062f \u0623\u0643\u0645\u0644\u062a \u0627\u0644\u0644\u0639\u0628\u0629.";V["ar-eg"].gameEndScreenBtnText="\u0645\u062a\u0627\u0628\u0639\u0629";
V["ar-eg"].optionsTitle="\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a";V["ar-eg"].optionsQuitConfirmationText="\u0627\u0646\u062a\u0628\u0647!n\n\u0625\u0630\u0627 \u062e\u0631\u062c\u062a \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0627\u0644\u062e\u0631\u0648\u062c \u0645\u0646 \u0627\u0644\u0644\u0639\u0628\u0629\u061f";
V["ar-eg"].optionsQuitConfirmBtn_No="\u0644\u0627";V["ar-eg"].optionsQuitConfirmBtn_Yes="\u0646\u0639\u0645\u060c \u0645\u062a\u0623\u0643\u062f";V["ar-eg"].levelMapScreenTitle="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";V["ar-eg"].optionsRestartConfirmationText="\u0627\u0646\u062a\u0628\u0647!\n\n\u0625\u0630\u0627 \u0642\u0645\u062a \u0628\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0622\u0646\u060c \u0641\u0633\u062a\u0641\u0642\u062f \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645 \u0627\u0644\u0630\u064a \u0623\u062d\u0631\u0632\u062a\u0647 \u062e\u0644\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0648\u0649. \u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u061f";
V["ar-eg"].optionsRestart="\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644";V["ar-eg"].optionsSFXBig_on="\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0635\u0648\u062a";V["ar-eg"].optionsSFXBig_off="\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062a";V["ar-eg"].optionsAbout_title="\u062d\u0648\u0644";V["ar-eg"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2016";V["ar-eg"].optionsAbout_backBtn="\u0627\u0644\u0633\u0627\u0628\u0642";
V["ar-eg"].optionsAbout_version="\u0627\u0644\u0625\u0635\u062f\u0627\u0631:";V["ar-eg"].optionsAbout="\u062d\u0648\u0644";V["ar-eg"].levelEndScreenMedal="\u0644\u0642\u062f \u062a\u062d\u0633\u0651\u0646\u062a!";V["ar-eg"].startScreenQuestionaire="\u0645\u0627 \u0631\u0623\u064a\u0643\u061f";V["ar-eg"].levelMapScreenWorld_0="\u062a\u062d\u062f\u064a\u062f \u0645\u0633\u062a\u0648\u0649";V["ar-eg"].startScreenByTinglyGames="\u0628\u0648\u0627\u0633\u0637\u0629: CoolGames";
V["ar-eg"]["optionsLang_de-de"]="\u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064a\u0629";V["ar-eg"]["optionsLang_tr-tr"]="\u0627\u0644\u062a\u0631\u0643\u064a\u0629";V["ar-eg"].optionsAbout_header="Developed by:";V["ar-eg"].levelEndScreenViewHighscoreBtn="View scores";V["ar-eg"].levelEndScreenSubmitHighscoreBtn="Submit score";V["ar-eg"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["ar-eg"].challengeStartTextScore="<NAME>'s score:";
V["ar-eg"].challengeStartTextTime="<NAME>'s time:";V["ar-eg"].challengeStartScreenToWin="Amount to win:";V["ar-eg"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["ar-eg"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["ar-eg"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["ar-eg"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["ar-eg"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["ar-eg"].challengeCancelConfirmBtn_yes="Yes";V["ar-eg"].challengeCancelConfirmBtn_no="No";V["ar-eg"].challengeEndScreensBtn_submit="Submit challenge";V["ar-eg"].challengeEndScreenBtn_cancel="Cancel challenge";V["ar-eg"].challengeEndScreenName_you="You";V["ar-eg"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["ar-eg"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
V["ar-eg"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["ar-eg"].challengeCancelMessage_success="Your challenge has been cancelled.";V["ar-eg"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["ar-eg"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["ar-eg"].challengeStartScreenTitle_challenger_friend="You are challenging:";
V["ar-eg"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["ar-eg"].challengeStartTextTime_challenger="Play the game and set a time.";V["ar-eg"].challengeStartTextScore_challenger="Play the game and set a score.";V["ar-eg"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["ar-eg"].challengeForfeitConfirmBtn_yes="Yes";V["ar-eg"].challengeForfeitConfirmBtn_no="No";V["ar-eg"].challengeForfeitMessage_success="You have forfeited the challenge.";
V["ar-eg"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["ar-eg"].optionsChallengeForfeit="Forfeit";V["ar-eg"].optionsChallengeCancel="Quit";V["ar-eg"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["ar-eg"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["ar-eg"].levelEndScreenHighScore_time="Best time:";V["ar-eg"].levelEndScreenTotalScore_time="Total time:";
V["ar-eg"]["optionsLang_fr-fr"]="\u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629";V["ar-eg"]["optionsLang_ko-kr"]="\u0627\u0644\u0643\u0648\u0631\u064a\u0629";V["ar-eg"]["optionsLang_ar-eg"]="\u0627\u0644\u0639\u0631\u0628\u064a\u0629";V["ar-eg"]["optionsLang_es-es"]="\u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064a\u0629";V["ar-eg"]["optionsLang_pt-br"]="\u0627\u0644\u0628\u0631\u0627\u0632\u064a\u0644\u064a\u0629 - \u0627\u0644\u0628\u0631\u062a\u063a\u0627\u0644\u064a\u0629";
V["ar-eg"]["optionsLang_ru-ru"]="\u0627\u0644\u0631\u0648\u0633\u064a\u0629";V["ar-eg"].optionsExit="Exit";V["ar-eg"].levelEndScreenTotalScore_number="Total score:";V["ar-eg"].levelEndScreenHighScore_number="High score:";V["ar-eg"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["ar-eg"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["ar-eg"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["ar-eg"].optionsAbout_header_publisher="Published by:";V["ar-eg"]["optionsLang_jp-jp"]="Japanese";V["ko-kr"]=V["ko-kr"]||{};V["ko-kr"].loadingScreenLoading="\ubd88\ub7ec\uc624\uae30 \uc911...";V["ko-kr"].startScreenPlay="PLAY";
V["ko-kr"].levelMapScreenTotalScore="\ucd1d \uc810\uc218";V["ko-kr"].levelEndScreenTitle_level="\ub808\ubca8 <VALUE>";V["ko-kr"].levelEndScreenTitle_difficulty="\uc798 \ud588\uc5b4\uc694!";V["ko-kr"].levelEndScreenTitle_endless="\uc2a4\ud14c\uc774\uc9c0 <VALUE>";V["ko-kr"].levelEndScreenTotalScore="\ucd1d \uc810\uc218";V["ko-kr"].levelEndScreenSubTitle_levelFailed="\ub808\ubca8 \uc2e4\ud328";V["ko-kr"].levelEndScreenTimeLeft="\ub0a8\uc740 \uc2dc\uac04";V["ko-kr"].levelEndScreenTimeBonus="\uc2dc\uac04 \ubcf4\ub108\uc2a4";
V["ko-kr"].levelEndScreenHighScore="\ucd5c\uace0 \uc810\uc218";V["ko-kr"].optionsStartScreen="\uba54\uc778 \uba54\ub274";V["ko-kr"].optionsQuit="\uc885\ub8cc";V["ko-kr"].optionsResume="\uacc4\uc18d";V["ko-kr"].optionsTutorial="\uac8c\uc784 \ubc29\ubc95";V["ko-kr"].optionsHighScore="\ucd5c\uace0 \uc810\uc218";V["ko-kr"].optionsMoreGames="\ub354 \ub9ce\uc740 \uac8c\uc784";V["ko-kr"].optionsDifficulty_easy="\uac04\ub2e8";V["ko-kr"].optionsDifficulty_medium="\uc911";
V["ko-kr"].optionsDifficulty_hard="\uc0c1";V["ko-kr"].optionsMusic_on="\ucf1c\uae30";V["ko-kr"].optionsMusic_off="\ub044\uae30";V["ko-kr"].optionsSFX_on="\ucf1c\uae30";V["ko-kr"].optionsSFX_off="\ub044\uae30";V["ko-kr"]["optionsLang_en-us"]="\uc601\uc5b4(US)";V["ko-kr"]["optionsLang_en-gb"]="\uc601\uc5b4(GB)";V["ko-kr"]["optionsLang_nl-nl"]="\ub124\ub35c\ub780\ub4dc\uc5b4";V["ko-kr"].gameEndScreenTitle="\ucd95\ud558\ud569\ub2c8\ub2e4!\n\uac8c\uc784\uc744 \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4.";
V["ko-kr"].gameEndScreenBtnText="\uacc4\uc18d";V["ko-kr"].optionsTitle="\uc124\uc815";V["ko-kr"].optionsQuitConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \uc885\ub8cc\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \uc885\ub8cc\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";V["ko-kr"].optionsQuitConfirmBtn_No="\uc544\ub2c8\uc624";V["ko-kr"].optionsQuitConfirmBtn_Yes="\ub124, \ud655\uc2e4\ud569\ub2c8\ub2e4";
V["ko-kr"].levelMapScreenTitle="\ub808\ubca8 \uc120\ud0dd";V["ko-kr"].optionsRestartConfirmationText="\uc8fc\uc758!\n\n\uc9c0\uae08 \ub2e4\uc2dc \uc2dc\uc791\ud558\uba74 \uc774 \ub808\ubca8\uc758 \ubaa8\ub4e0 \uc9c4\ud589 \ub0b4\uc6a9\uc744 \uc783\uac8c\ub429\ub2c8\ub2e4. \uc815\ub9d0 \ub2e4\uc2dc \uc2dc\uc791\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?";V["ko-kr"].optionsRestart="\ub2e4\uc2dc \uc2dc\uc791";V["ko-kr"].optionsSFXBig_on="\uc74c\ud5a5 \ucf1c\uae30";V["ko-kr"].optionsSFXBig_off="\uc74c\ud5a5 \ub044\uae30";
V["ko-kr"].optionsAbout_title="\uad00\ub828 \uc815\ubcf4";V["ko-kr"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2016";V["ko-kr"].optionsAbout_backBtn="\ub4a4\ub85c";V["ko-kr"].optionsAbout_version="\ubc84\uc804:";V["ko-kr"].optionsAbout="\uad00\ub828 \uc815\ubcf4";V["ko-kr"].levelEndScreenMedal="\ud5a5\uc0c1\ud588\uad70\uc694!";V["ko-kr"].startScreenQuestionaire="\uc5b4\ub5bb\uac8c \uc0dd\uac01\ud558\uc138\uc694?";V["ko-kr"].levelMapScreenWorld_0="\ub808\ubca8 \uc120\ud0dd";
V["ko-kr"].startScreenByTinglyGames="\uc81c\uc791: CoolGames";V["ko-kr"]["optionsLang_de-de"]="\ub3c5\uc77c\uc5b4";V["ko-kr"]["optionsLang_tr-tr"]="\ud130\ud0a4\uc5b4";V["ko-kr"].optionsAbout_header="Developed by:";V["ko-kr"].levelEndScreenViewHighscoreBtn="View scores";V["ko-kr"].levelEndScreenSubmitHighscoreBtn="Submit score";V["ko-kr"].challengeStartScreenTitle_challengee_friend="You have been challenged by:";V["ko-kr"].challengeStartTextScore="<NAME>'s score:";
V["ko-kr"].challengeStartTextTime="<NAME>'s time:";V["ko-kr"].challengeStartScreenToWin="Amount to win:";V["ko-kr"].challengeEndScreenWinnings="You have won <AMOUNT> fairpoints";V["ko-kr"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["ko-kr"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["ko-kr"].challengeEndScreenOutcomeMessage_TIED="You tied.";V["ko-kr"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["ko-kr"].challengeCancelConfirmBtn_yes="Yes";V["ko-kr"].challengeCancelConfirmBtn_no="No";V["ko-kr"].challengeEndScreensBtn_submit="Submit challenge";V["ko-kr"].challengeEndScreenBtn_cancel="Cancel challenge";V["ko-kr"].challengeEndScreenName_you="You";V["ko-kr"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["ko-kr"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";
V["ko-kr"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";V["ko-kr"].challengeCancelMessage_success="Your challenge has been cancelled.";V["ko-kr"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["ko-kr"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["ko-kr"].challengeStartScreenTitle_challenger_friend="You are challenging:";
V["ko-kr"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";V["ko-kr"].challengeStartTextTime_challenger="Play the game and set a time.";V["ko-kr"].challengeStartTextScore_challenger="Play the game and set a score.";V["ko-kr"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["ko-kr"].challengeForfeitConfirmBtn_yes="Yes";V["ko-kr"].challengeForfeitConfirmBtn_no="No";V["ko-kr"].challengeForfeitMessage_success="You have forfeited the challenge.";
V["ko-kr"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";V["ko-kr"].optionsChallengeForfeit="Forfeit";V["ko-kr"].optionsChallengeCancel="Quit";V["ko-kr"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["ko-kr"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["ko-kr"].levelEndScreenHighScore_time="Best time:";V["ko-kr"].levelEndScreenTotalScore_time="Total time:";
V["ko-kr"]["optionsLang_fr-fr"]="\ud504\ub791\uc2a4\uc5b4";V["ko-kr"]["optionsLang_ko-kr"]="\ud55c\uad6d\uc5b4";V["ko-kr"]["optionsLang_ar-eg"]="\uc544\ub77c\ube44\uc544\uc5b4";V["ko-kr"]["optionsLang_es-es"]="\uc2a4\ud398\uc778\uc5b4";V["ko-kr"]["optionsLang_pt-br"]="\ud3ec\ub974\ud22c\uac08\uc5b4(\ube0c\ub77c\uc9c8)";V["ko-kr"]["optionsLang_ru-ru"]="\ub7ec\uc2dc\uc544\uc5b4";V["ko-kr"].optionsExit="Exit";V["ko-kr"].levelEndScreenTotalScore_number="Total score:";
V["ko-kr"].levelEndScreenHighScore_number="High score:";V["ko-kr"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";V["ko-kr"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";
V["ko-kr"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["ko-kr"].optionsAbout_header_publisher="Published by:";V["ko-kr"]["optionsLang_jp-jp"]="Japanese";V["jp-jp"]=V["jp-jp"]||{};V["jp-jp"].loadingScreenLoading="\u30ed\u30fc\u30c9\u4e2d\u2026";V["jp-jp"].startScreenPlay="\u30d7\u30ec\u30a4";V["jp-jp"].levelMapScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";V["jp-jp"].levelEndScreenTitle_level="\u30ec\u30d9\u30eb <VALUE>";
V["jp-jp"].levelEndScreenTitle_difficulty="\u3084\u3063\u305f\u306d\uff01";V["jp-jp"].levelEndScreenTitle_endless="\u30b9\u30c6\u30fc\u30b8 <VALUE>";V["jp-jp"].levelEndScreenTotalScore="\u30c8\u30fc\u30bf\u30eb\u30b9\u30b3\u30a2";V["jp-jp"].levelEndScreenSubTitle_levelFailed="\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc";V["jp-jp"].levelEndScreenTimeLeft="\u6b8b\u308a\u6642\u9593";V["jp-jp"].levelEndScreenTimeBonus="\u30bf\u30a4\u30e0\u30dc\u30fc\u30ca\u30b9";V["jp-jp"].levelEndScreenHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";
V["jp-jp"].optionsStartScreen="\u30e1\u30a4\u30f3\u30e1\u30cb\u30e5\u30fc";V["jp-jp"].optionsQuit="\u3084\u3081\u308b";V["jp-jp"].optionsResume="\u518d\u958b";V["jp-jp"].optionsTutorial="\u3042\u305d\u3073\u65b9";V["jp-jp"].optionsHighScore="\u30cf\u30a4\u30b9\u30b3\u30a2";V["jp-jp"].optionsMoreGames="\u4ed6\u306e\u30b2\u30fc\u30e0";V["jp-jp"].optionsDifficulty_easy="\u521d\u7d1a";V["jp-jp"].optionsDifficulty_medium="\u4e2d\u7d1a";V["jp-jp"].optionsDifficulty_hard="\u4e0a\u7d1a";
V["jp-jp"].optionsMusic_on="\u30aa\u30f3";V["jp-jp"].optionsMusic_off="\u30aa\u30d5";V["jp-jp"].optionsSFX_on="\u30aa\u30f3";V["jp-jp"].optionsSFX_off="\u30aa\u30d5";V["jp-jp"]["optionsLang_en-us"]="\u82f1\u8a9e\uff08\u7c73\u56fd\uff09";V["jp-jp"]["optionsLang_en-gb"]="\u82f1\u8a9e\uff08\u82f1\u56fd\uff09";V["jp-jp"]["optionsLang_nl-nl"]="\u30aa\u30e9\u30f3\u30c0\u8a9e";V["jp-jp"].gameEndScreenTitle="\u304a\u3081\u3067\u3068\u3046\uff01\n\u3059\u3079\u3066\u306e\u30ec\u30d9\u30eb\u3092\u30af\u30ea\u30a2\u3057\u307e\u3057\u305f\u3002";
V["jp-jp"].gameEndScreenBtnText="\u7d9a\u3051\u308b";V["jp-jp"].optionsTitle="\u8a2d\u5b9a";V["jp-jp"].optionsQuitConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u3084\u3081\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";V["jp-jp"].optionsQuitConfirmBtn_No="\u3044\u3044\u3048\u3001\u7d9a\u3051\u307e\u3059\u3002";V["jp-jp"].optionsQuitConfirmBtn_Yes="\u306f\u3044\u3001\u3084\u3081\u307e\u3059\u3002";
V["jp-jp"].levelMapScreenTitle="\u30ec\u30d9\u30eb\u9078\u629e";V["jp-jp"].optionsRestartConfirmationText="\u6ce8\u610f\uff01\n\n\u3053\u3053\u3067\u518d\u30b9\u30bf\u30fc\u30c8\u3059\u308b\u3068\n\u8a18\u9332\u304c\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u304c\n\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f";V["jp-jp"].optionsRestart="\u518d\u30b9\u30bf\u30fc\u30c8";V["jp-jp"].optionsSFXBig_on="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30f3";V["jp-jp"].optionsSFXBig_off="\u30b5\u30a6\u30f3\u30c9 \u30aa\u30d5";
V["jp-jp"].optionsAbout_title="About";V["jp-jp"].optionsAbout_text="CoolGames\nwww.coolgames.com\n\u00a9 2016";V["jp-jp"].optionsAbout_backBtn="\u3082\u3069\u308b";V["jp-jp"].optionsAbout_version="version";V["jp-jp"].optionsAbout="About";V["jp-jp"].levelEndScreenMedal="\u8a18\u9332\u66f4\u65b0\uff01";V["jp-jp"].startScreenQuestionaire="\u3053\u306e\u30b2\u30fc\u30e0\u3078\u306e\u611f\u60f3";V["jp-jp"].levelMapScreenWorld_0="\u30ec\u30d9\u30eb\u9078\u629e";V["jp-jp"].startScreenByTinglyGames="by: CoolGames";
V["jp-jp"]["optionsLang_de-de"]="\u30c9\u30a4\u30c4\u8a9e";V["jp-jp"]["optionsLang_tr-tr"]="\u30c8\u30eb\u30b3\u8a9e";V["jp-jp"].optionsAbout_header="Developed by";V["jp-jp"].levelEndScreenViewHighscoreBtn="\u30b9\u30b3\u30a2\u3092\u307f\u308b";V["jp-jp"].levelEndScreenSubmitHighscoreBtn="\u30b9\u30b3\u30a2\u9001\u4fe1";V["jp-jp"].challengeStartScreenTitle_challengee_friend="\u304b\u3089\u6311\u6226\u3092\u53d7\u3051\u307e\u3057\u305f";V["jp-jp"].challengeStartTextScore="<NAME>\u306e\u30b9\u30b3\u30a2";
V["jp-jp"].challengeStartTextTime="<NAME>\u306e\u6642\u9593";V["jp-jp"].challengeStartScreenToWin="\u30dd\u30a4\u30f3\u30c8\u6570";V["jp-jp"].challengeEndScreenWinnings="<AMOUNT>\u30dd\u30a4\u30f3\u30c8\u7372\u5f97";V["jp-jp"].challengeEndScreenOutcomeMessage_WON="You have won the challenge!";V["jp-jp"].challengeEndScreenOutcomeMessage_LOST="You have lost the challenge.";V["jp-jp"].challengeEndScreenOutcomeMessage_TIED="\u540c\u70b9";V["jp-jp"].challengeCancelConfirmText="You are about to cancel the challenge. Your wager will be returned minus the challenge fee. Are you sure you want to cancel the challenge?";
V["jp-jp"].challengeCancelConfirmBtn_yes="Yes";V["jp-jp"].challengeCancelConfirmBtn_no="No";V["jp-jp"].challengeEndScreensBtn_submit="\u3042";V["jp-jp"].challengeEndScreenBtn_cancel="Cancel challenge";V["jp-jp"].challengeEndScreenName_you="You";V["jp-jp"].challengeEndScreenChallengeSend_error="An error occured while submitting the challenge. Please try again later.";V["jp-jp"].challengeEndScreenChallengeSend_success="Your challenge has been sent!";V["jp-jp"].challengeCancelMessage_error="An error occured while cancelling your challenge. Please try again later.";
V["jp-jp"].challengeCancelMessage_success="Your challenge has been cancelled.";V["jp-jp"].challengeEndScreenScoreSend_error="An error occured while communicating with the server. Please try again later.";V["jp-jp"].challengeStartScreenTitle_challengee_stranger="You have been matched with:";V["jp-jp"].challengeStartScreenTitle_challenger_friend="You are challenging:";V["jp-jp"].challengeStartScreenTitle_challenger_stranger="You are setting a score for:";
V["jp-jp"].challengeStartTextTime_challenger="Play the game and set a time.";V["jp-jp"].challengeStartTextScore_challenger="Play the game and set a score.";V["jp-jp"].challengeForfeitConfirmText="You are about to forfeit the challenge. Are you sure you want to proceed?";V["jp-jp"].challengeForfeitConfirmBtn_yes="Yes";V["jp-jp"].challengeForfeitConfirmBtn_no="No";V["jp-jp"].challengeForfeitMessage_success="You have forfeited the challenge.";V["jp-jp"].challengeForfeitMessage_error="An error occured while forfeiting the challenge. Please try again later.";
V["jp-jp"].optionsChallengeForfeit="Forfeit";V["jp-jp"].optionsChallengeCancel="Quit";V["jp-jp"].challengeLoadingError_notValid="Sorry, this challenge is no longer valid.";V["jp-jp"].challengeLoadingError_notStarted="Unable to connect to the server. Please try again later.";V["jp-jp"].levelEndScreenHighScore_time="Best time:";V["jp-jp"].levelEndScreenTotalScore_time="Total time:";V["jp-jp"]["optionsLang_fr-fr"]="French";V["jp-jp"]["optionsLang_ko-kr"]="Korean";V["jp-jp"]["optionsLang_ar-eg"]="Arabic";
V["jp-jp"]["optionsLang_es-es"]="Spanish";V["jp-jp"]["optionsLang_pt-br"]="Brazilian-Portuguese";V["jp-jp"]["optionsLang_ru-ru"]="Russian";V["jp-jp"].optionsExit="Exit";V["jp-jp"].levelEndScreenTotalScore_number="Total score:";V["jp-jp"].levelEndScreenHighScore_number="High score:";V["jp-jp"].challengeEndScreenChallengeSend_submessage="<NAME> has 72 hours to accept or decline your challenge. If <NAME> declines or doesn\u2019t accept within 72 hours your wager and challenge fee will be reimbursed.";
V["jp-jp"].challengeEndScreenChallengeSend_submessage_stranger="If no one accepts your challenge within 72 hours, the amount of your wager and the challenge fee will be returned to you.";V["jp-jp"].challengeForfeitMessage_winnings="<NAME> has won <AMOUNT> fairpoints!";V["jp-jp"].optionsAbout_header_publisher="Published by:";V["jp-jp"]["optionsLang_jp-jp"]="\u65e5\u672c\u8a9e";V=V||{};V["nl-nl"]=V["nl-nl"]||{};V["nl-nl"].game_ui_SCORE="SCORE";V["nl-nl"].game_ui_STAGE="LEVEL";
V["nl-nl"].game_ui_LIVES="LEVENS";V["nl-nl"].game_ui_TIME="TIJD";V["nl-nl"].game_ui_HIGHSCORE="HIGH SCORE";V["nl-nl"].game_ui_LEVEL="LEVEL";V["nl-nl"].game_ui_time_left="Resterende tijd";V["nl-nl"].game_ui_TIME_TO_BEAT="DOELTIJD";V["nl-nl"].game_ui_SCORE_TO_BEAT="DOELSCORE";V["nl-nl"].game_ui_HIGHSCORE_break="HIGH\nSCORE";V["en-us"]=V["en-us"]||{};V["en-us"].game_ui_SCORE="SCORE";V["en-us"].game_ui_STAGE="STAGE";V["en-us"].game_ui_LIVES="LIVES";V["en-us"].game_ui_TIME="TIME";
V["en-us"].game_ui_HIGHSCORE="HIGH SCORE";V["en-us"].game_ui_LEVEL="LEVEL";V["en-us"].game_ui_time_left="Time left";V["en-us"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["en-us"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";V["en-us"].game_ui_HIGHSCORE_break="HIGH\nSCORE";V["en-gb"]=V["en-gb"]||{};V["en-gb"].game_ui_SCORE="SCORE";V["en-gb"].game_ui_STAGE="STAGE";V["en-gb"].game_ui_LIVES="LIVES";V["en-gb"].game_ui_TIME="TIME";V["en-gb"].game_ui_HIGHSCORE="HIGH SCORE";V["en-gb"].game_ui_LEVEL="LEVEL";
V["en-gb"].game_ui_time_left="Time left";V["en-gb"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["en-gb"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";V["en-gb"].game_ui_HIGHSCORE_break="HIGH\nSCORE";V["de-de"]=V["de-de"]||{};V["de-de"].game_ui_SCORE="PUNKTE";V["de-de"].game_ui_STAGE="STUFE";V["de-de"].game_ui_LIVES="LEBEN";V["de-de"].game_ui_TIME="ZEIT";V["de-de"].game_ui_HIGHSCORE="HIGHSCORE";V["de-de"].game_ui_LEVEL="LEVEL";V["de-de"].game_ui_time_left="Restzeit";V["de-de"].game_ui_TIME_TO_BEAT="ZEITVORGABE";
V["de-de"].game_ui_SCORE_TO_BEAT="Zu schlagende Punktzahl";V["de-de"].game_ui_HIGHSCORE_break="HIGHSCORE";V["fr-fr"]=V["fr-fr"]||{};V["fr-fr"].game_ui_SCORE="SCORE";V["fr-fr"].game_ui_STAGE="SC\u00c8NE";V["fr-fr"].game_ui_LIVES="VIES";V["fr-fr"].game_ui_TIME="TEMPS";V["fr-fr"].game_ui_HIGHSCORE="MEILLEUR SCORE";V["fr-fr"].game_ui_LEVEL="NIVEAU";V["fr-fr"].game_ui_time_left="Temps restant";V["fr-fr"].game_ui_TIME_TO_BEAT="TEMPS \u00c0 BATTRE";V["fr-fr"].game_ui_SCORE_TO_BEAT="SCORE \u00c0 BATTRE";
V["fr-fr"].game_ui_HIGHSCORE_break="MEILLEUR\nSCORE";V["pt-br"]=V["pt-br"]||{};V["pt-br"].game_ui_SCORE="PONTOS";V["pt-br"].game_ui_STAGE="FASE";V["pt-br"].game_ui_LIVES="VIDAS";V["pt-br"].game_ui_TIME="TEMPO";V["pt-br"].game_ui_HIGHSCORE="RECORDE";V["pt-br"].game_ui_LEVEL="N\u00cdVEL";V["pt-br"].game_ui_time_left="Tempo restante";V["pt-br"].game_ui_TIME_TO_BEAT="HORA DE ARRASAR";V["pt-br"].game_ui_SCORE_TO_BEAT="RECORDE A SER SUPERADO";V["pt-br"].game_ui_HIGHSCORE_break="RECORDE";
V["es-es"]=V["es-es"]||{};V["es-es"].game_ui_SCORE="PUNTOS";V["es-es"].game_ui_STAGE="FASE";V["es-es"].game_ui_LIVES="VIDAS";V["es-es"].game_ui_TIME="TIEMPO";V["es-es"].game_ui_HIGHSCORE="R\u00c9CORD";V["es-es"].game_ui_LEVEL="NIVEL";V["es-es"].game_ui_time_left="Tiempo restante";V["es-es"].game_ui_TIME_TO_BEAT="TIEMPO OBJETIVO";V["es-es"].game_ui_SCORE_TO_BEAT="PUNTUACI\u00d3N OBJETIVO";V["es-es"].game_ui_HIGHSCORE_break="R\u00c9CORD";V["tr-tr"]=V["tr-tr"]||{};V["tr-tr"].game_ui_SCORE="SKOR";
V["tr-tr"].game_ui_STAGE="B\u00d6L\u00dcM";V["tr-tr"].game_ui_LIVES="HAYATLAR";V["tr-tr"].game_ui_TIME="S\u00dcRE";V["tr-tr"].game_ui_HIGHSCORE="Y\u00dcKSEK SKOR";V["tr-tr"].game_ui_LEVEL="SEV\u0130YE";V["tr-tr"].game_ui_time_left="Kalan zaman";V["tr-tr"].game_ui_TIME_TO_BEAT="B\u0130T\u0130RME ZAMANI";V["tr-tr"].game_ui_SCORE_TO_BEAT="B\u0130T\u0130RME PUANI";V["tr-tr"].game_ui_HIGHSCORE_break="Y\u00dcKSEK\nSKOR";V["ru-ru"]=V["ru-ru"]||{};V["ru-ru"].game_ui_SCORE="\u0420\u0415\u0417\u0423\u041b\u042c\u0422\u0410\u0422";
V["ru-ru"].game_ui_STAGE="\u042d\u0422\u0410\u041f";V["ru-ru"].game_ui_LIVES="\u0416\u0418\u0417\u041d\u0418";V["ru-ru"].game_ui_TIME="\u0412\u0420\u0415\u041c\u042f";V["ru-ru"].game_ui_HIGHSCORE="\u0420\u0415\u041a\u041e\u0420\u0414";V["ru-ru"].game_ui_LEVEL="\u0423\u0420\u041e\u0412\u0415\u041d\u042c";V["ru-ru"].game_ui_time_left="Time left";V["ru-ru"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["ru-ru"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";V["ru-ru"].game_ui_HIGHSCORE_break="\u0420\u0415\u041a\u041e\u0420\u0414";
V["ar-eg"]=V["ar-eg"]||{};V["ar-eg"].game_ui_SCORE="\u0627\u0644\u0646\u062a\u064a\u062c\u0629";V["ar-eg"].game_ui_STAGE="\u0645\u0631\u062d\u0644\u0629";V["ar-eg"].game_ui_LIVES="\u0639\u062f\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a";V["ar-eg"].game_ui_TIME="\u0627\u0644\u0648\u0642\u062a";V["ar-eg"].game_ui_HIGHSCORE="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";V["ar-eg"].game_ui_LEVEL="\u0645\u0633\u062a\u0648\u0649";V["ar-eg"].game_ui_time_left="Time left";
V["ar-eg"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["ar-eg"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";V["ar-eg"].game_ui_HIGHSCORE_break="\u0623\u0639\u0644\u0649 \u0646\u062a\u064a\u062c\u0629";V["ko-kr"]=V["ko-kr"]||{};V["ko-kr"].game_ui_SCORE="\uc810\uc218";V["ko-kr"].game_ui_STAGE="\uc2a4\ud14c\uc774\uc9c0";V["ko-kr"].game_ui_LIVES="\uae30\ud68c";V["ko-kr"].game_ui_TIME="\uc2dc\uac04";V["ko-kr"].game_ui_HIGHSCORE="\ucd5c\uace0 \uc810\uc218";V["ko-kr"].game_ui_LEVEL="\ub808\ubca8";
V["ko-kr"].game_ui_time_left="Time left";V["ko-kr"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["ko-kr"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";V["ko-kr"].game_ui_HIGHSCORE_break="\ucd5c\uace0 \uc810\uc218";V["jp-jp"]=V["jp-jp"]||{};V["jp-jp"].game_ui_SCORE="\u30b9\u30b3\u30a2";V["jp-jp"].game_ui_STAGE="\u30b9\u30c6\u30fc\u30b8";V["jp-jp"].game_ui_LIVES="\u30e9\u30a4\u30d5";V["jp-jp"].game_ui_TIME="\u6642\u9593";V["jp-jp"].game_ui_HIGHSCORE="\u30cf\u30a4\u30b9\u30b3\u30a2";V["jp-jp"].game_ui_LEVEL="\u30ec\u30d9\u30eb";
V["jp-jp"].game_ui_time_left="\u6b8b\u308a\u6642\u9593";V["jp-jp"].game_ui_TIME_TO_BEAT="TIME TO BEAT";V["jp-jp"].game_ui_SCORE_TO_BEAT="SCORE TO BEAT";V["jp-jp"].game_ui_HIGHSCORE_break="HIGH\nSCORE";var Ke={};
function Me(){Ke={Jd:{je:"en-us",Si:"en-us en-gb nl-nl de-de fr-fr pt-br es-es tr-tr ru-ru ar-eg ko-kr jp-jp".split(" ")},zd:{qc:N(1040),Jp:N(960),Mb:N(640),cg:N(640),Xe:N(0),fk:N(-80),We:0,minHeight:N(780),Yl:{id:"canvasBackground",depth:50},Jc:{id:"canvasGame",depth:100,top:N(200,"round"),left:N(40,"round"),width:N(560,"round"),height:N(560,"round")},oc:{id:"canvasGameUI",depth:150,top:0,left:0,height:N(120,"round")},Se:{id:"canvasMain",depth:200}},Zl:{qc:N(640),Jp:N(640),Mb:N(1152),cg:N(1152),
Xe:N(0),fk:N(0),We:0,minHeight:N(640),minWidth:N(850),Yl:{id:"canvasBackground",depth:50},Jc:{id:"canvasGame",depth:100,top:N(40,"round"),left:N(296,"round"),width:N(560,"round"),height:N(560,"round")},oc:{id:"canvasGameUI",depth:150,top:0,left:N(151),width:N(140)},Se:{id:"canvasMain",depth:200}},Kb:{bigPlay:{type:"text",r:Wd,oa:N(38),$a:N(99),font:{align:"center",h:"middle",fontSize:O({big:46,small:30}),fillColor:"#01198a",R:{i:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}},Dc:2,Ec:N(30),fontSize:O({big:46,
small:30})},difficulty_toggle:{type:"toggleText",r:Ld,oa:N(106),$a:N(40),font:{align:"center",h:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",R:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},S:[{id:"0",r:Jc,N:"optionsDifficulty_easy"},{id:"1",r:Ic,N:"optionsDifficulty_medium"},{id:"2",r:Hc,N:"optionsDifficulty_hard"}],Fg:N(30),Gg:N(12),Ff:N(10),Dc:2,Ec:N(30),fontSize:O({big:40,small:20})},music_toggle:{type:"toggle",r:Ld,oa:N(106),$a:N(40),font:{align:"center",h:"middle",fontSize:O({big:40,
small:20}),fillColor:"#018a17",R:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},S:[{id:"on",r:Pd,N:"optionsMusic_on"},{id:"off",r:Od,N:"optionsMusic_off"}],Fg:N(30),Gg:N(12),Ff:0,Dc:2,Ec:N(30)},sfx_toggle:{type:"toggle",r:Ld,oa:N(106),$a:N(40),font:{align:"center",h:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",R:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},S:[{id:"on",r:Nd,N:"optionsSFX_on"},{id:"off",r:Md,N:"optionsSFX_off"}],Fg:N(30),Gg:N(12),Ff:0,Dc:2,Ec:N(30)},music_big_toggle:{type:"toggleText",
r:Ld,oa:N(106),$a:N(40),font:{align:"center",h:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",R:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},S:[{id:"on",r:"undefined"!==typeof Ed?Ed:void 0,N:"optionsMusic_on"},{id:"off",r:"undefined"!==typeof Fd?Fd:void 0,N:"optionsMusic_off"}],Fg:N(28,"round"),Gg:N(10),Ff:N(10),Dc:2,Ec:N(30),fontSize:O({big:40,small:20})},sfx_big_toggle:{type:"toggleText",r:Ld,oa:N(106),$a:N(40),font:{align:"center",h:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",
R:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},S:[{id:"on",r:"undefined"!==typeof Cd?Cd:void 0,N:"optionsSFXBig_on"},{id:"off",r:"undefined"!==typeof Dd?Dd:void 0,N:"optionsSFXBig_off"}],Fg:N(33,"round"),Gg:N(12),Ff:N(10),Dc:2,Ec:N(30),fontSize:O({big:40,small:20})},language_toggle:{type:"toggleText",r:Ld,oa:N(106),$a:N(40),font:{align:"center",h:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",R:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},S:[{id:"en-us",r:Kc,N:"optionsLang_en-us"},
{id:"en-gb",r:Lc,N:"optionsLang_en-gb"},{id:"nl-nl",r:Mc,N:"optionsLang_nl-nl"},{id:"de-de",r:Oc,N:"optionsLang_de-de"},{id:"fr-fr",r:Pc,N:"optionsLang_fr-fr"},{id:"pt-br",r:Qc,N:"optionsLang_pt-br"},{id:"es-es",r:Rc,N:"optionsLang_es-es"},{id:"ru-ru",r:Tc,N:"optionsLang_ru-ru"},{id:"ar-eg",r:Uc,N:"optionsLang_ar-eg"},{id:"ko-kr",r:Vc,N:"optionsLang_ko-kr"},{id:"tr-tr",r:Nc,N:"optionsLang_tr-tr"},{id:"jp-jp",r:Sc,N:"optionsLang_jp-jp"}],Fg:N(40),Gg:N(20),Ff:N(10),Dc:2,Ec:N(30),fontSize:O({big:40,
small:20})},default_text:{type:"text",r:Kd,oa:N(40),$a:N(40),font:{align:"center",h:"middle",fontSize:O({big:40,small:20}),fillColor:"#018a17",R:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}},Dc:2,Ec:N(30),fontSize:O({big:40,small:20})},default_image:{type:"image",r:Kd,oa:N(40),$a:N(40),Ec:N(6)},options:{type:"image",r:Id}},Xl:{bigPlay:{type:"text",r:Wd,oa:N(40),$a:N(76),font:{align:"center",h:"middle",fontSize:O({big:40,small:20}),fillColor:"#01198a",R:{i:!0,color:"#7bfdff",offsetX:0,offsetY:2,
blur:0}},Dc:2,Ec:N(30),fontSize:O({big:40,small:20})}},aj:{green:{font:{align:"center",h:"middle",fillColor:"#018a17",R:{i:!0,color:"#d2ff7b",offsetX:0,offsetY:2,blur:0}}},blue:{font:{align:"center",h:"middle",fillColor:"#01198a",R:{i:!0,color:"#7bfdff",offsetX:0,offsetY:2,blur:0}}},bluegreen:{font:{align:"center",h:"middle",fillColor:"#004f89",R:{i:!0,color:"#7bffca",offsetX:0,offsetY:2,blur:0}}},orange:{font:{align:"center",h:"middle",fillColor:"#9a1900",R:{i:!0,color:"#ffb986",offsetX:0,offsetY:2,
blur:0}}},orangeyellow:{font:{align:"center",h:"middle",fillColor:"#8d2501",R:{i:!0,color:"#ffbe60",offsetX:0,offsetY:2,blur:0}}},pink:{font:{align:"center",h:"middle",fillColor:"#c6258f",R:{i:!0,color:"#ffbde9",offsetX:0,offsetY:2,blur:0}}},white:{font:{align:"center",h:"middle",fillColor:"#ffffff"}},pastel_pink:{font:{align:"center",h:"middle",fillColor:"#83574f"}},whiteWithRedBorder:{font:{align:"center",h:"middle",fillColor:"#ffffff",R:{i:!0,color:"#4c0200",offsetX:0,offsetY:2,blur:0}}},whiteWithBlueBorder:{font:{align:"center",
h:"middle",fillColor:"#ffffff",R:{i:!0,color:"#002534",offsetX:0,offsetY:2,blur:0}}}},buttons:{default_color:"green"},za:{jx:20},wc:{backgroundImage:"undefined"!==typeof Ud?Ud:void 0,Bv:0,Ct:500,$j:5E3,lv:5E3,Yn:-1,gx:12,fx:100,Td:N(78),qo:{align:"center"},al:N(560),lg:N(400),mg:{align:"center"},of:N(680),me:N(16),dn:N(18),Xh:N(8),hr:N(8),ir:N(9),jr:N(9),ti:{align:"center",fillColor:"#3B0057",fontSize:N(24)},As:{align:"center"},Bs:N(620),$k:N(500),Yh:"center",qf:N(500),$h:N(60),tb:{align:"center"},
hc:{align:"bottom",offset:N(20)},jn:N(806),gn:500,bv:N(20)},fn:{Yh:"right",al:N(280),of:N(430),qf:N(340),tb:{align:"right",offset:N(32)},hc:N(560),jn:N(560)},fo:{Vl:N(860),backgroundImage:void 0!==typeof Ud?Ud:void 0,ku:700,xr:1800,xv:700,Xv:2600,hg:void 0!==typeof Ud?Zd:void 0,Nc:700,Nh:{align:"center"},Cj:{align:"center"},Oh:void 0!==typeof Zd?-Zd.height:0,Mh:{align:"top",offset:N(20)},Fm:1,lq:1,Gm:1,mq:1,Em:1,kq:1,ou:J,pu:gc,mu:J,nu:J,lu:J,Wv:{align:"center"},Dk:N(656),ii:N(300),Bk:700,Vv:700,
Mp:N(368),lj:N(796),Dh:N(440),Lp:700,qn:N(36),ek:N(750),wv:500,Yh:"center",qf:N(500),$h:N(60),tb:{align:"center"},hc:{align:"bottom",offset:N(20)},jn:N(806),gn:500,bv:N(20)},ho:{Vl:N(0),Dk:N(456),ii:N(320),Mp:{align:"center"},lj:N(346),Dh:N(460),qn:{align:"left",offset:N(32)},ek:N(528),Yh:"right",qf:N(340),tb:{align:"right",offset:N(32)},hc:N(560),jn:N(560)},lf:{Pv:{align:"center",offset:N(-230)},zn:{align:"top",offset:N(576)},Ov:"options",Fc:{h:"bottom"},Kf:{align:"center"},Xc:{align:"top",offset:N(35,
"round")},td:N(232),De:N(98),Fx:{align:"center",offset:N(-206)},Io:{align:"top",offset:N(30)},Ex:{align:"center",offset:N(206)},Ho:{align:"top",offset:N(30)},type:"grid",Lv:3,uz:3,Mv:5,vz:4,Op:!0,Yt:!0,Nm:N(78),qq:{align:"top",offset:N(140)},sq:{align:"top",offset:N(140)},rq:N(20),wu:N(18),xu:N(18),Pu:{Km:{fontSize:O({big:60,small:30}),fillColor:"#3F4F5E",align:"center",h:"middle",R:{i:!0,color:"#D0D8EA",offsetX:0,offsetY:N(6),blur:0}}},Qu:{Km:{fontSize:O({big:32,small:16}),fillColor:"#3F4F5E",align:"center",
h:"middle",R:{i:!0,color:"#D0D8EA",offsetX:0,offsetY:N(2),blur:0}}},dr:N(438),er:N(438),Vq:{align:"center"},Wq:{align:"center"},lr:{align:"center"},mr:{align:"center",offset:N(-22)},Zq:{align:"center"},$q:{align:"center",offset:N(-10)},Iw:{align:"center",offset:N(216)},cs:{align:"top",offset:N(574)},bs:{fontSize:O({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},ds:N(10),Gn:{fontSize:O({big:24,small:12}),fillColor:"#3F4F5E",align:"center"},Hr:{align:"center"},Ir:{align:"top",offset:N(588)},
$v:N(160),Zv:N(40),backgroundImage:"undefined"!==typeof s_screen_levelselect?s_screen_levelselect:void 0,bx:N(10),cx:200,ax:N(200),Ty:N(600),Gv:800,Fv:500},Xq:{Io:{align:"top",offset:N(20)},Ho:{align:"top",offset:N(20)},Xc:{align:"top",offset:N(25,"round")},Nm:N(234),qq:{align:"top",offset:N(110)},sq:{align:"top",offset:N(110)},cs:{align:"top",offset:N(536)},Ir:{align:"top",offset:N(550)},zn:{align:"top",offset:N(538)}},Wj:{yc:"undefined"!==typeof Sd?Sd:void 0,Cr:{align:"center"},rk:"undefined"!==
typeof Sd?-Sd.height:void 0,ei:[{type:"y",qa:0,duration:800,end:{align:"center",offset:N(-142)},Ia:gc,Rb:Ae}],qk:[{type:"y",qa:0,duration:600,end:"undefined"!==typeof Sd?-Sd.height:void 0,Ia:fc,$i:!0}],gp:{align:"center",h:"middle"},hp:{align:"center"},ip:0,oh:N(500),Kl:N(80),xq:{align:"center",h:"middle"},zq:{align:"center"},Aq:0,Nj:N(560),yq:N(80),Fr:3500},cn:{ei:[{type:"y",qa:0,duration:800,end:{align:"center"},Ia:gc,Rb:Ae}]},by:{yc:"undefined"!==typeof s_overlay_challenge_start?s_overlay_challenge_start:
void 0,Cr:{align:"center"},rk:N(56),tk:0,uk:0,Fc:{align:"center",h:"top"},td:N(500),De:N(100),Kf:{align:"center"},Xc:N(90),dz:{align:"center",h:"middle"},iz:N(500),hz:N(80),mz:{align:"center"},nz:N(250),Wz:{align:"center",h:"top"},Yz:N(500),Xz:N(40),Zz:{align:"center"},$z:N(348),Vz:{align:"center",h:"top"},bA:N(500),aA:N(50),dA:{align:"center"},eA:N(388),KA:{align:"center",h:"top"},MA:N(500),LA:N(40),PA:{align:"center"},QA:N(442),NA:0,OA:0,JA:{align:"center",h:"top"},SA:N(500),RA:N(50),TA:{align:"center"},
UA:N(482),IA:N(10),GA:0,HA:0,nh:800,Hl:gc,Il:600,Jl:fc,Fr:3500},ay:{Jx:500,nh:800,rz:1500,sz:500,cA:2500,hA:500,fA:3200,gA:800,Zy:4200,$y:300,Tx:4500,zz:{align:"center"},Az:N(-800),xz:{align:"center"},yz:N(52),tk:0,uk:0,tj:.8,Zp:"#000000",rn:{align:"center",h:"middle"},az:N(360),Wy:N(120),Xy:N(4),Yy:N(4),bz:{align:"center"},cz:N(340),tA:{align:"center"},uA:N(600),sA:N(500),rA:N(120),qA:{align:"center",h:"middle"},VA:{align:"center",h:"middle"},ZA:N(360),WA:N(60),XA:N(4),YA:N(4),$A:{align:"center"},
aB:N(480),zA:N(460),vA:{align:"center"},wA:N(400),Ux:{align:"center"},Vx:N(500),pz:{align:"center",h:"middle"},qz:N(75,"round"),oz:N(48),tz:N(120),lz:N(214,"round"),ez:N(40),fz:N(4),gz:N(4),jz:0,kz:0,ry:{align:"center",h:"middle"},uy:N(220),ty:N(180),sy:N(80),py:N(4),qy:N(4)},fa:{sk:{Ch:"undefined"!==typeof Xd?Xd:void 0,cu:"undefined"!==typeof s_overlay_endless?s_overlay_endless:void 0,Ru:"undefined"!==typeof s_overlay_level_win?s_overlay_level_win:void 0,Ou:"undefined"!==typeof s_overlay_level_fail?
s_overlay_level_fail:void 0},ex:500,nh:800,Hl:gc,Il:800,Jl:bc,Db:{align:"center"},Eb:0,Fc:{align:"center",h:"middle",fontSize:O({big:26,small:13})},Kf:{align:"center"},Xc:N(58),td:N(500),De:N(100),ns:{align:"center",h:"middle",fontSize:O({big:56,small:28})},Xw:{align:"center"},Yw:N(236),mm:{align:"center",h:"top",fontSize:O({big:24,small:12})},Sp:{align:"center"},nm:N(144),Eh:{align:"center",h:"top",fontSize:O({big:56,small:28})},rj:{align:"center"},Fh:N(176),qj:N(200),pj:N(60),qi:{align:"center",
h:"top",fontSize:O({big:24,small:12})},ve:{align:"center"},Cf:N(286),js:N(0),eq:!1,Uc:N(14),Vk:N(10),Bf:{align:"center",h:"top",fontSize:O({big:24,small:12})},yg:N(10),zg:N(4),Ag:N(200),pA:N(50),At:{align:"center",offset:N(12)},lp:N(549),iu:{align:"center",offset:N(162)},fq:N(489),wh:{align:"center",offset:N(250)},$f:N(10),Zf:N(90),Ve:N(90),Zn:{align:"center",offset:N(-177,"round")},$n:N(120),ao:{align:"center"},bo:N(96),co:{align:"center",offset:N(179,"round")},eo:N(120),nA:200,Ew:500,Zr:800,as:0,
Hw:0,Gw:300,Fw:200,$r:300,tj:.8,Xb:800,Zp:"#000000",on:N(508),dk:N(394),or:N(96),pr:N(74),bk:3,ng:400,mv:2500,Vy:0,pv:N(100),qr:1.5,uv:{align:"center"},vv:N(76),ck:N(180),tv:N(36),rr:{align:"center",h:"middle",fontSize:O({big:22,small:12}),L:"ff_opensans_extrabold",fillColor:"#1d347f",R:{i:!0,color:"#68cbfa",offsetY:N(2)}},nr:500,nv:500,ov:N(-30),rv:500,qv:0,sv:4E3,dl:600,rx:1500,tp:500,Wf:750,Eu:{align:"center"},Fu:N(290),Eq:N(350),Dv:1E3,type:{level:{Wi:"level",Ac:!0,vg:!0,ui:"title_level",we:"totalScore",
Ti:"retry",xj:"next"},failed:{Wi:"failed",Ac:!1,vg:!1,ui:"title_level",os:"subtitle_failed",Ti:"exit",xj:"retry"},endless:{Wi:"endless",Ac:!1,vg:!0,ui:"title_endless",om:"totalScore",we:"highScore",Ti:"exit",xj:"retry"},difficulty:{Wi:"difficulty",Ac:!1,vg:!0,ui:"title_difficulty",om:"timeLeft",we:["totalScore","timeBonus"],Ti:"exit",xj:"retry"}}},Uq:{$f:N(0),Xc:N(30),nm:N(114),Fh:N(146),Cf:N(266),lp:N(488),fq:N(428),on:{align:"center",offset:N(220)},dk:N(260)},Uh:{backgroundImage:"undefined"!==typeof Yd?
Yd:void 0},options:{backgroundImage:Vd,Db:{align:"center"},Eb:0,Fc:{},Kf:{align:"center"},Xc:N(58),td:N(500),De:N(100),cj:N(460,"round"),bj:{align:"center"},sh:{align:"center",offset:N(36)},bd:N(10,"round"),wh:N(510),$f:N(10),Zf:N(130),Ve:N(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","moreGames","about"],levelMapScreen:["startScreen",["music","sfx"],"language","moreGames","about"],inGame:["resume","tutorial",["music","sfx"],"moreGames","quit"]},ci:800,di:gc,ok:600,pk:bc,Gp:{align:"center"},
dm:N(260),hj:N(460),cm:N(300),Ep:{align:"center"},bm:N(460),Dp:{align:"center"},am:N(560,"round"),yh:N(460,"round"),Ik:{},Yc:"undefined"!==typeof Td?Td:void 0,fl:{align:"center"},Ee:N(84,"round"),hl:{align:"center",h:"top"},il:N(480),yo:N(46),Ts:{align:"center"},zo:N(110,"round"),Qs:{align:"center"},wo:N(160,"round"),Ss:{align:"center"},xo:N(446,"round"),gl:{h:"middle",align:"center",fontSize:O({big:36,small:18})},Jg:N(480),Rs:N(160),Ps:{align:"center",offset:N(-80,"round")},vo:N(556,"round"),Os:{align:"center",
offset:N(80,"round")},uo:N(556,"round"),Xo:{align:"center",h:"top",fillColor:"#3C0058",fontSize:O({big:26,small:13}),Ja:N(6)},Zo:N(480),Yo:N(50),$o:{align:"center"},Bl:N(106,"round"),ap:{align:"center",h:"top",fillColor:"#3C0058",fontSize:O({big:26,small:13}),Ja:N(6)},Pi:N(480),kh:N(110),Dl:{align:"center"},lh:N(396,"round"),Cl:{align:"center"},Oi:N(140),Al:{align:"center"},Ni:N(500),jh:N(480),El:{align:"center",h:"top",fillColor:"#808080",fontSize:O({big:12,small:8})},dp:{align:"center"},Fl:N(610),
cp:N(440),bp:N(20),Tf:N(200),Qi:N(200),ct:N(80),dt:N(140),bt:N(10)},Qv:{Xc:N(12),sh:{align:"center",offset:N(16)},dm:N(200),cm:N(300),bm:N(400),am:N(500,"round"),Ee:N(60,"round"),zo:N(80,"round"),wo:N(134,"round"),xo:N(410,"round"),vo:N(500,"round"),uo:N(500,"round"),Bl:N(86,"round"),Oi:N(126),lh:N(392,"round"),Ni:N(490),Fl:N(590)},yr:{backgroundImage:"undefined"!==typeof s_overlay_challenge_options?s_overlay_challenge_options:Vd,Db:{align:"center"},Eb:N(120),Fc:{},Kf:{align:"center"},Xc:N(200),cj:N(460,
"round"),bj:{align:"center"},sh:{align:"center",offset:N(140)},bd:N(10,"round"),wh:N(510),$f:N(10),Zf:N(130),Ve:N(90),buttons:{startScreen:["tutorial",["music","sfx"],"language","about"],inGame_challengee:["resume","tutorial",["music","sfx"],"forfeitChallenge"],inGame_challenger:["resume","tutorial",["music","sfx"],"cancelChallenge"]},ci:800,di:gc,ok:600,pk:bc,Ik:{},Oz:{align:"center"},Pz:N(360),Nz:N(460),Mz:N(300),Iz:"default_text",Jz:{align:"center"},Kz:N(630),Fz:"default_text",Gz:{align:"center"},
Hz:N(730,"round"),Lz:N(460,"round"),Fp:{},Gp:{align:"center"},dm:N(200),hj:N(460),cm:N(250),Ep:{align:"center"},bm:N(520),Dp:{align:"center"},am:N(620,"round"),yh:N(460,"round"),rn:{},zv:{align:"center"},Av:N(200),sn:N(460),yv:N(300),Yc:"undefined"!==typeof Td?Td:void 0,fl:{align:"center"},Ee:N(0,"round"),hl:{align:"center",h:"top"},il:N(480),yo:N(50),Ts:{align:"center"},zo:N(20,"round"),Qs:{align:"center"},wo:N(70,"round"),Ss:{align:"center"},xo:N(356,"round"),gl:{h:"middle",align:"center",fontSize:O({big:36,
small:18})},Jg:N(480),Rs:N(150),Ps:N(224,"round"),vo:N(636,"round"),Os:N(350,"round"),uo:N(636,"round"),Xo:{align:"center",h:"top",fillColor:"#3C0058",fontSize:O({big:26,small:13}),Ja:N(6)},Zo:N(480),Yo:N(50),$o:{align:"center"},Bl:N(26,"round"),ap:{align:"center",h:"top",fillColor:"#3C0058",fontSize:O({big:26,small:13}),Ja:N(6)},Pi:N(480),kh:N(110),Dl:{align:"center"},lh:N(316,"round"),Cl:{align:"center"},Oi:N(60),Al:{align:"center"},Ni:N(420),jh:N(480),El:{align:"center",h:"top",fillColor:"#808080",
fontSize:O({big:12,small:8})},dp:{align:"center"},Fl:N(530),cp:N(440),bp:N(20),Tf:N(200),Qi:N(200),ct:N(80),dt:N(100),bt:N(10)},gm:{backgroundImage:"undefined"!==typeof s_overlay_dialog?s_overlay_dialog:Vd,Db:{align:"center"},Eb:N(120),cj:N(460,"round"),bj:{align:"center"},sh:{align:"bottom",offset:N(20)},bd:N(10,"round"),wh:N(510),$f:N(10),Zf:N(130),Ve:N(90),ci:800,di:gc,ok:600,pk:bc,Lr:{},hw:{align:"center"},iw:{align:"center",offset:N(40)},Jn:N(460),In:N(300),ms:{},fw:{align:"center"},gw:{align:"center",
offset:N(160)},ew:N(460),dw:N(200)},Aj:{backgroundImage:"undefined"!==typeof s_screen_end?s_screen_end:void 0,As:{align:"center"},Bs:N(152),$k:N(560),dx:N(560),font:{align:"center",h:"middle",fontSize:O({big:52,small:26}),fillColor:"#FFFFFF"},Jt:{align:"center"},wp:N(600),vp:N(460),up:"default_text"},Am:{wp:N(520)}}}
var Ne={bw:"coolmath",tx:!1,ni:{$u:!1,im:"37d007a56d816107ce5b52c10342db37 a148ee16bf50a87a3441ab01d892bd30 d3be8d51902c506af88504926f2cd036 7974c30f88003a48e16e1f3c1a1f1444 f244898f801ef0cacb05c1aea9a6ea21 a2cdd22b638b907753cc9b09ae74047d 86b07e66612f96ac67db91a7ca1d9bfe".split(" ")},Jd:{je:"en-us",Si:["en-us"]},wc:{Yn:3E3}},Oe=null;
function Pe(){Oe={debug:{Zt:!1,$t:!1,Rw:!1},wm:{offset:N(-4,"round"),sf:N(278,"round"),tf:N(52,"round")},dg:{iq:"Solitaire",kd:"difficulty",tr:["resume","tutorial","sfx_big","restart","quit"]},Nu:{wx:N(877,"round"),xx:N(877,"round"),yx:N(28,"round"),zx:N(28,"round")},$b:{uj:N(0,"round"),vj:N(20,"round"),offset:N(-4,"round"),sf:N(38,"round"),tf:N(170,"round")},Sb:{sf:N(38,"round"),tf:N(52,"round")},ia:{uj:N(20,"round"),vj:N(0,"round"),sf:N(118,"round"),tf:N(52,"round")},$l:{au:500,shadowOffsetX:N(4,
"round"),shadowOffsetY:N(4,"round")},od:{Hp:N(198,"round"),Ip:N(52,"round"),Uv:350,Dn:300,Vw:500,Ww:50},eb:{wt:150,xt:200,Zx:!0,zp:400,hm:!0,oy:100,Wt:500,jm:400,lw:50,Mn:500,mx:50,nx:300,ox:180,px:-50,qx:500},Ry:3,cr:[{name:"EASY",Hd:{Hh:1,ko:!0,En:!1},P:{je:500,Zm:9E5,so:1E3,Cn:0,nk:30,move:0,jk:10,un:-50,hk:25,rm:0,Ln:-200,Jm:0,Ul:1E3,Sl:10,Ao:-50}},{name:"MEDIUM",Hd:{Hh:1,ko:!0,En:!0},P:{je:1E3,Zm:9E5,so:1E3,Cn:0,nk:60,move:0,jk:20,un:-100,hk:50,rm:0,Ln:-400,Jm:0,Ul:1E3,Sl:20,Ao:-50}},{name:"HARD",
Hd:{Hh:3,ko:!0,En:!0},P:{je:1500,Zm:9E5,so:1E3,Cn:0,nk:90,move:0,jk:30,un:-150,hk:75,rm:0,Ln:-600,Jm:0,Ul:1E3,Sl:30,Ao:-50}}]}}V=V||{};V["nl-nl"]=V["nl-nl"]||{};V["nl-nl"].TutorialText_0="Je kan kaarten van de ene rij naar een andere rij verplaatsen.";V["nl-nl"].TutorialTitle_0="Speluitleg";V["nl-nl"].levelStartText="Speel alle kaarten van het veld weg.";V["nl-nl"].levelStartHeader="Doel";V["nl-nl"].TutorialText_1="Je mag alleen afwisselende kleuren op elkaar leggen. Zwart op rood op zwart...";
V["nl-nl"].TutorialText_2="En je mag alleen aflopende kaarten op elkaar leggen.";V["nl-nl"].TutorialText_3="Rechtsboven mag je azen wegleggen.";V["nl-nl"].TutorialText_4="Op de stapels bovenaan mag je alleen oplopende kaarten van dezelfde kleur leggen.";V["nl-nl"].TutorialTitle_1="Zwart op rood";V["nl-nl"].TutorialTitle_2="Aflopend";V["nl-nl"].TutorialTitle_3="Azen";V["nl-nl"].TutorialTitle_4="Stapels bovenaan";V["nl-nl"].TutorialTitle_5="Winnen";V["nl-nl"].optionsDifficulty_hard="3 kaarten delen";
V["nl-nl"].optionsDifficulty_medium="1 kaart delen";V["nl-nl"].optionsDifficulty_easy="Vrije plaatsing";V["en-us"]=V["en-us"]||{};V["en-us"].TutorialText_0="You can move cards from one stack to another.";V["en-us"].TutorialTitle_0="How to play";V["en-us"].levelStartText="Clear the field of all cards.";V["en-us"].levelStartHeader="Goal";V["en-us"].TutorialText_1="You are only allowed to stack cards that alternate in color. Black on red on black...";V["en-us"].TutorialText_2="And you can only place descending cards on top of each other.";
V["en-us"].TutorialText_3="At the top you can place aces.";V["en-us"].TutorialText_4="In the top stacks you are allowed to place ascending cards of the same suite.";V["en-us"].TutorialTitle_1="Black on red";V["en-us"].TutorialTitle_2="Descending";V["en-us"].TutorialTitle_3="Aces";V["en-us"].TutorialTitle_4="Top stack";V["en-us"].TutorialTitle_5="Winning";V["en-us"].optionsDifficulty_hard="3 card draw";V["en-us"].optionsDifficulty_medium="1 card draw";V["en-us"].optionsDifficulty_easy="Free placement";
V["en-gb"]=V["en-gb"]||{};V["en-gb"].TutorialText_0="You can move cards from one stack to another.";V["en-gb"].TutorialTitle_0="How to play";V["en-gb"].levelStartText="Clear the field of all cards.";V["en-gb"].levelStartHeader="Goal";V["en-gb"].TutorialText_1="You are only allowed to stack cards that alternate in color. Black on red on black...";V["en-gb"].TutorialText_2="And you can only place descending cards on top of each other.";V["en-gb"].TutorialText_3="At the top you can place aces.";
V["en-gb"].TutorialText_4="In the top stacks you are allowed to place ascending cards of the same suite.";V["en-gb"].TutorialTitle_1="Black on red";V["en-gb"].TutorialTitle_2="Descending";V["en-gb"].TutorialTitle_3="Aces";V["en-gb"].TutorialTitle_4="Top stack";V["en-gb"].TutorialTitle_5="Winning";V["en-gb"].optionsDifficulty_hard="3 card draw";V["en-gb"].optionsDifficulty_medium="1 card draw";V["en-gb"].optionsDifficulty_easy="Free placement";V["de-de"]=V["de-de"]||{};V["de-de"].TutorialText_0="Du kannst die Karten von einem Stapel auf einen anderen umlegen.";
V["de-de"].TutorialTitle_0="So wird gespielt";V["de-de"].levelStartText="Entferne alle Karten vom Spielfeld.";V["de-de"].levelStartHeader="Ziel";V["de-de"].TutorialText_1="Du darfst Karten nur in abwechselnder Farbfolge ablegen. Schwarz auf Rot auf Schwarz ...";V["de-de"].TutorialText_2="Und du kannst Karten nur in absteigender Reihenfolge aufeinander legen.";V["de-de"].TutorialText_3="Ganz oben legst du die Asse ab.";V["de-de"].TutorialText_4="Auf die oberen Stapel darfst du Karten derselben Farbe in aufsteigender Reihenfolge legen.";
V["de-de"].TutorialTitle_1="Schwarz auf Rot";V["de-de"].TutorialTitle_2="Absteigend";V["de-de"].TutorialTitle_3="Asse";V["de-de"].TutorialTitle_4="Oberster Stapel";V["de-de"].TutorialTitle_5="Gewinnen";V["de-de"].optionsDifficulty_hard="3 Karten ziehen";V["de-de"].optionsDifficulty_medium="1 Karte ziehen";V["de-de"].optionsDifficulty_easy="Freie Platzierung";V["fr-fr"]=V["fr-fr"]||{};V["fr-fr"].TutorialText_0="Vous pouvez d\u00e9placer les cartes d'une pile \u00e0 une autre.";
V["fr-fr"].TutorialTitle_0="Comment jouer";V["fr-fr"].levelStartText="Faites dispara\u00eetre toutes les cartes.";V["fr-fr"].levelStartHeader="Objectif";V["fr-fr"].TutorialText_1="Vous ne pouvez empiler une carte que sur la couleur oppos\u00e9e. Rouge sur noir sur rouge, etc.";V["fr-fr"].TutorialText_2="Et vous ne pouvez mettre qu'une carte de valeur inf\u00e9rieure sur une autre.";V["fr-fr"].TutorialText_3="Au sommet de la pile, vous pouvez mettre un as.";V["fr-fr"].TutorialText_4="Sur les quatre piles situ\u00e9es en haut \u00e0 droite, vous pouvez placer les cartes de m\u00eame couleur, de l'as vers le roi.";
V["fr-fr"].TutorialTitle_1="Noir sur rouge";V["fr-fr"].TutorialTitle_2="Du roi vers l'as";V["fr-fr"].TutorialTitle_3="As";V["fr-fr"].TutorialTitle_4="Pile du haut";V["fr-fr"].TutorialTitle_5="Victoire";V["fr-fr"].optionsDifficulty_hard="Pioche de 3 cartes";V["fr-fr"].optionsDifficulty_medium="Pioche d'1 carte";V["fr-fr"].optionsDifficulty_easy="Placement libre";V["pt-br"]=V["pt-br"]||{};V["pt-br"].TutorialText_0="Voc\u00ea pode mover as cartas de uma pilha para outra.";
V["pt-br"].TutorialTitle_0="Como jogar";V["pt-br"].levelStartText="Tire todas as cartas da mesa.";V["pt-br"].levelStartHeader="Objetivo";V["pt-br"].TutorialText_1="Voc\u00ea s\u00f3 pode empilhar as cartas em cores alternadas. Pretas, vermelhas, pretas...";V["pt-br"].TutorialText_2="E voc\u00ea s\u00f3 pode posicion\u00e1-las em cima uma das outras em ordem decrescente.";V["pt-br"].TutorialText_3="No topo, s\u00e3o os ases.";V["pt-br"].TutorialText_4="Nas pilhas de cima, voc\u00ea pode colocar cartas do mesmo naipe, em ordem crescente.";
V["pt-br"].TutorialTitle_1="Pretas sobre vermelhas";V["pt-br"].TutorialTitle_2="Decrescente";V["pt-br"].TutorialTitle_3="Ases";V["pt-br"].TutorialTitle_4="Pilha de cima";V["pt-br"].TutorialTitle_5="Vencer";V["pt-br"].optionsDifficulty_hard="Tirar 3 cartas";V["pt-br"].optionsDifficulty_medium="Tirar 1 carta";V["pt-br"].optionsDifficulty_easy="Posi\u00e7\u00f5es livres";V["es-es"]=V["es-es"]||{};V["es-es"].TutorialText_0="Puedes mover cartas de una pila a otra.";V["es-es"].TutorialTitle_0="C\u00f3mo jugar";
V["es-es"].levelStartText="Quitar todas las cartas";V["es-es"].levelStartHeader="Objetivo";V["es-es"].TutorialText_1="Solo puedes colocar cartas de colores alternos. Negro en rojo en negro...";V["es-es"].TutorialText_2="Solo puedes colocar cartas de valores descendentes encima de otras.";V["es-es"].TutorialText_3="Puedes colocar los ases arriba. ";V["es-es"].TutorialText_4="En las pilas superiores, solo puedes colocar cartas de valor ascendente del mismo palo.";V["es-es"].TutorialTitle_1="Negro sobre rojo";
V["es-es"].TutorialTitle_2="Descendente";V["es-es"].TutorialTitle_3="Ases";V["es-es"].TutorialTitle_4="Pilas superiores";V["es-es"].TutorialTitle_5="Ganar";V["es-es"].optionsDifficulty_hard="Sacar 3 cartas";V["es-es"].optionsDifficulty_medium="Sacar 1 carta";V["es-es"].optionsDifficulty_easy="Despliegue libre";V["tr-tr"]=V["tr-tr"]||{};V["tr-tr"].TutorialText_0="Kartlar\u0131 bir desteden di\u011ferine koyabilirsin.";V["tr-tr"].TutorialTitle_0="Nas\u0131l oynan\u0131r";V["tr-tr"].levelStartText="Alandan t\u00fcm kartlar\u0131 sil.";
V["tr-tr"].levelStartHeader="Hedef";V["tr-tr"].TutorialText_1="Sadece alternatif renklere sahip kartlar\u0131 desteye koyabilirsin. Siyah k\u0131rm\u0131z\u0131da, k\u0131rm\u0131z\u0131 siyahta...";V["tr-tr"].TutorialText_2="Ve sadece azalan kartlar\u0131 birbirinin \u00fcst\u00fcne koyabilirsin.";V["tr-tr"].TutorialText_3="En tepede as kullanabilirsin.";V["tr-tr"].TutorialText_4="\u00dcst destelerde ayn\u0131 tak\u0131mdan artan kartlar\u0131 koyabilirsin.";V["tr-tr"].TutorialTitle_1="K\u0131rm\u0131z\u0131 \u00fcst\u00fcnde siyah";
V["tr-tr"].TutorialTitle_2="Azalan";V["tr-tr"].TutorialTitle_3="Aslar";V["tr-tr"].TutorialTitle_4="\u00dcst deste";V["tr-tr"].TutorialTitle_5="Kazan\u0131yor";V["tr-tr"].optionsDifficulty_hard="3 kart \u00e7ekme";V["tr-tr"].optionsDifficulty_medium="1 kart \u00e7ekme";V["tr-tr"].optionsDifficulty_easy="Bedava yerle\u015ftirme";V["ru-ru"]=V["ru-ru"]||{};V["ru-ru"].TutorialText_0="\u041a\u0430\u0440\u0442\u044b \u043c\u043e\u0436\u043d\u043e \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0430\u0442\u044c \u0438\u0437 \u043e\u0434\u043d\u043e\u0439 \u0441\u0442\u043e\u043f\u043a\u0438 \u0432 \u0434\u0440\u0443\u0433\u0443\u044e.";
V["ru-ru"].TutorialTitle_0="\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c";V["ru-ru"].levelStartText="\u0423\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0441\u0435 \u043a\u0430\u0440\u0442\u044b \u0441 \u043f\u043e\u043b\u044f.";V["ru-ru"].levelStartHeader="\u0426\u0435\u043b\u044c";V["ru-ru"].TutorialText_1="\u041a\u0430\u0440\u0442\u044b \u0441\u043a\u043b\u0430\u0434\u044b\u0432\u0430\u044e\u0442\u0441\u044f \u0432 \u0441\u0442\u043e\u043f\u043a\u0438 \u043f\u043e \u043f\u0440\u0438\u043d\u0446\u0438\u043f\u0443 \u0447\u0435\u0440\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f \u0446\u0432\u0435\u0442\u043e\u0432. \u0427\u0435\u0440\u043d\u0430\u044f \u043c\u0430\u0441\u0442\u044c, \u043f\u043e\u0442\u043e\u043c \u043a\u0440\u0430\u0441\u043d\u0430\u044f, \u043f\u043e\u0442\u043e\u043c \u0447\u0435\u0440\u043d\u0430\u044f \u0438 \u0442.\u0434.";
V["ru-ru"].TutorialText_2="\u041a\u0430\u0440\u0442\u044b \u043f\u043e\u043c\u0435\u0449\u0430\u044e\u0442\u0441\u044f \u0432 \u0441\u0442\u043e\u043f\u043a\u0438 \u0432 \u043f\u043e\u0440\u044f\u0434\u043a\u0435 \u0443\u0431\u044b\u0432\u0430\u043d\u0438\u044f.";V["ru-ru"].TutorialText_3="\u0421\u0432\u0435\u0440\u0445\u0443 \u0440\u0430\u0441\u043f\u043e\u043b\u0430\u0433\u0430\u044e\u0442\u0441\u044f \u0442\u0443\u0437\u044b.";V["ru-ru"].TutorialText_4="\u0412 \u0432\u0435\u0440\u0445\u043d\u0438\u0445 \u0441\u0442\u043e\u043f\u043a\u0430\u0445 \u043c\u043e\u0436\u043d\u043e \u0440\u0430\u0441\u043f\u043e\u043b\u0430\u0433\u0430\u0442\u044c \u043a\u0430\u0440\u0442\u044b \u043e\u0434\u043d\u043e\u0439 \u043c\u0430\u0441\u0442\u0438 \u043f\u043e \u0432\u043e\u0437\u0440\u0430\u0441\u0442\u0430\u043d\u0438\u044e.";
V["ru-ru"].TutorialTitle_1="\u0427\u0435\u0440\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435 \u0446\u0432\u0435\u0442\u043e\u0432";V["ru-ru"].TutorialTitle_2="\u0423\u0431\u044b\u0432\u0430\u043d\u0438\u0435";V["ru-ru"].TutorialTitle_3="\u0422\u0443\u0437\u044b";V["ru-ru"].TutorialTitle_4="\u0412\u0435\u0440\u0445\u043d\u044f\u044f \u0441\u0442\u043e\u043f\u043a\u0430";V["ru-ru"].TutorialTitle_5="\u041f\u043e\u0431\u0435\u0434\u0430";V["ru-ru"].optionsDifficulty_hard="3 \u043a\u0430\u0440\u0442\u044b \u0437\u0430 \u0440\u0430\u0437";
V["ru-ru"].optionsDifficulty_medium="1 \u043a\u0430\u0440\u0442\u0430 \u0437\u0430 \u0440\u0430\u0437";V["ru-ru"].optionsDifficulty_easy="\u0421\u0432\u043e\u0431\u043e\u0434\u043d\u043e\u0435 \u0440\u0430\u0441\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435";V["ar-eg"]=V["ar-eg"]||{};V["ar-eg"].TutorialText_0="\u064a\u0645\u0643\u0646\u0643 \u0646\u0642\u0644 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a \u0645\u0646 \u0631\u0632\u0645\u0629 \u0648\u0627\u062d\u062f\u0629 \u0625\u0644\u0649 \u0623\u062e\u0631\u0649.";
V["ar-eg"].TutorialTitle_0="\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0644\u0639\u0628";V["ar-eg"].levelStartText="\u0642\u0645 \u0628\u0625\u062e\u0644\u0627\u0621 \u0627\u0644\u062d\u0642\u0644 \u0645\u0646 \u062c\u0645\u064a\u0639 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a";V["ar-eg"].levelStartHeader="\u0627\u0644\u0647\u062f\u0641";V["ar-eg"].TutorialText_1="\u064a\u064f\u0633\u0645\u062d \u0644\u0643 \u0641\u0642\u0637 \u0628\u062a\u0643\u062f\u064a\u0633 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u062a\u0646\u0627\u0648\u0628 \u0641\u064a \u0627\u0644\u0644\u0648\u0646. \u0623\u0633\u0648\u062f \u0639\u0644\u0649 \u0623\u062d\u0645\u0631 \u0639\u0644\u0649 \u0623\u0633\u0648\u062f...";
V["ar-eg"].TutorialText_2="\u0648\u064a\u0645\u0643\u0646\u0643 \u0641\u0642\u0637 \u0648\u0636\u0639 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a \u0628\u0639\u0636\u0647\u0627 \u0641\u0648\u0642 \u0628\u0639\u0636 \u0628\u062a\u0631\u062a\u064a\u0628 \u062a\u0646\u0627\u0632\u0644\u064a.";V["ar-eg"].TutorialText_3="\u0641\u064a \u0627\u0644\u062c\u0632\u0621 \u0627\u0644\u0639\u0644\u0648\u064a \u064a\u0645\u0643\u0646\u0643 \u0648\u0636\u0639 \u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u0622\u0635.";
V["ar-eg"].TutorialText_4="\u0641\u064a \u0631\u064f\u0632\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u0639\u0644\u0648\u064a\u0629\u060c \u064a\u064f\u0633\u0645\u062d \u0644\u0643 \u0628\u0648\u0636\u0639 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a \u0645\u0646 \u0646\u0641\u0633 \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 \u0628\u062a\u0631\u062a\u064a\u0628 \u062a\u0646\u0627\u0632\u0644\u064a.";V["ar-eg"].TutorialTitle_1="\u0623\u0633\u0648\u062f \u0639\u0644\u0649 \u0623\u062d\u0645\u0631";
V["ar-eg"].TutorialTitle_2="\u0627\u0644\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a";V["ar-eg"].TutorialTitle_3="\u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u0622\u0635";V["ar-eg"].TutorialTitle_4="\u0631\u064f\u0632\u0645\u0629 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u0639\u0644\u0648\u064a\u0629";V["ar-eg"].TutorialTitle_5="\u0627\u0644\u0641\u0648\u0632";V["ar-eg"].optionsDifficulty_hard="\u0635\u0639\u0628 (\u064a\u062a\u0645 \u0633\u062d\u0628 \u062b\u0644\u0627\u062b \u0628\u0637\u0627\u0642\u0627\u062a)";
V["ar-eg"].optionsDifficulty_medium="\u0645\u062a\u0648\u0633\u0637 (\u064a\u062a\u0645 \u0633\u062d\u0628 \u0628\u0637\u0627\u0642\u0629 \u0648\u0627\u062d\u062f\u0629)";V["ar-eg"].optionsDifficulty_easy="\u0633\u0647\u0644";V["ko-kr"]=V["ko-kr"]||{};V["ko-kr"].TutorialText_0="\ud558\ub098\uc758 \uc2a4\ud0dd\uc5d0\uc11c \ub2e4\ub978 \uc2a4\ud0dd\uc73c\ub85c \uce74\ub4dc\ub97c \uc774\ub3d9\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";V["ko-kr"].TutorialTitle_0="\uac8c\uc784 \ubc29\ubc95";
V["ko-kr"].levelStartText="\ubaa8\ub4e0 \uce74\ub4dc\uc640 \ud544\ub4dc\ub97c \uc815\ub9ac\ud569\ub2c8\ub2e4.";V["ko-kr"].levelStartHeader="\ubaa9\ud45c";V["ko-kr"].TutorialText_1="\ub2e4\ub978 \uc0c9\uae54\uc758 \uce74\ub4dc\ub9cc\uc744 \uc313\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \uac80\uc740 \uc0c9 \uc704\uc5d0 \ube68\uac04\uc0c9 \uc704\uc5d0 \uac80\uc740 \uc0c9...";V["ko-kr"].TutorialText_2="\uac01 \uc0c1\ub2e8\uc758 \ub0b4\ub9bc\ucc28\uc21c \uce74\ub4dc\ub9cc \ubc30\uce58\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";
V["ko-kr"].TutorialText_3="\ucd5c\uc0c1\ub2e8\uc5d0\ub294 \uc5d0\uc774\uc2a4\ub97c \ubc30\uce58\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";V["ko-kr"].TutorialText_4="\ucd5c\uc0c1\ub2e8 \uc2a4\ud0dd\uc5d0\uc11c\ub294 \uac19\uc740 \ubaa8\uc591\uc758 \uce74\ub4dc\ub97c \uc624\ub984\ucc28\uc21c\uc73c\ub85c \ubc30\uce58\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";V["ko-kr"].TutorialTitle_1="\ube68\uac15 \uc704 \uac80\uc815";V["ko-kr"].TutorialTitle_2="\ub0b4\ub9bc\ucc28\uc21c";V["ko-kr"].TutorialTitle_3="\uc5d0\uc774\uc2a4";
V["ko-kr"].TutorialTitle_4="\uc0c1\ub2e8 \uc2a4\ud0dd";V["ko-kr"].TutorialTitle_5="\uc2b9\ub9ac";V["ko-kr"].optionsDifficulty_hard="\uce74\ub4dc 3\uac1c \ubf51\uae30";V["ko-kr"].optionsDifficulty_medium="\uce74\ub4dc 1\uac1c \ubf51\uae30";V["ko-kr"].optionsDifficulty_easy="\uc790\uc720 \ubc30\uce58";var Qe=Qe||{};Qe.Lh={Bj:"c28fe7f656634d823ab6483d02ecf09c",Ok:"4360442cc2162463fdc6a8d8cf329e32184e353b"};Qe.qe=!1;var Re={};
function Se(){Re={j:{nq:"TinglySolitaire"},buttons:{default_color:"green",bigPlay:"blue"},Qb:{Ql:.2},lf:{Ox:[{r:"undefined"!==typeof s_screen_levelselect?s_screen_levelselect:void 0,x:0,y:0}],Fc:{L:U.L,align:"center",h:"middle",fillColor:"#004f5d",fontSize:O({big:36,small:18})},bs:{L:U.L,fontSize:O({big:34,small:18}),fillColor:"#004f5d",align:"center"},Gn:{L:U.L,fontSize:O({big:34,small:18}),fillColor:"#004f5d",align:"center"}},Wj:{rk:-Sd.height,gp:{L:U.L,align:"center",h:"top",fontSize:O({big:38,
small:19}),fillColor:"#001d5c"},hp:{align:"center"},ip:N(412,"round"),oh:N(500),Kl:N(80),xq:{L:U.L,fontSize:O({big:46,small:23}),fillColor:"#000000",align:"center",h:"middle"},zq:{align:"center"},Aq:N(370,"round")},fa:{Db:{align:"center"},Eb:N(2),rk:"undefined"!==typeof s_overlay_endless?-s_overlay_endless.height:"undefined"!==typeof Xd?-Xd.height:"undefined"!==typeof s_overlay_level_win?-s_overlay_level_win.height:0,ei:[{type:"y",qa:0,duration:800,end:N(14),Ia:gc,$i:!0}],qk:[{type:"y",qa:0,duration:600,
end:"undefined"!==typeof s_overlay_endless?-s_overlay_endless.height:"undefined"!==typeof Xd?-Xd.height:"undefined"!==typeof s_overlay_level_win?-s_overlay_level_win.height:0,Ia:bc,$i:!0}],Fc:{L:U.L,align:"center",h:"top",fontSize:O({big:44,small:22}),fillColor:"#001d5c"},AA:!0,mm:{L:U.L,align:"center",h:"top",fillColor:"#586386",fontSize:O({big:36,small:18})},Eh:{L:U.L,align:"center",h:"top",fillColor:"#001d5c",fontSize:O({big:76,small:38})},qi:{L:U.L,h:"bottom",fillColor:"#586386",fontSize:O({big:34,
small:18})},Uc:N(4),Bf:{L:U.L,h:"bottom",fillColor:"#001d5c",fontSize:O({big:30,small:15})},ns:{L:U.L,align:"center",h:"middle",fontSize:O({big:72,small:36}),fillColor:"#01513d"}},options:{ci:800,di:gc,ok:600,pk:bc,Ik:{align:"center",h:"middle",fontSize:O({big:30,small:15}),fillColor:"#001d5c"},Fc:{L:U.L,align:"center",h:"top",fontSize:O({big:40,small:20}),fillColor:"#001d5c"},gl:{h:"middle",align:"center",fontSize:O({big:26,small:13}),fillColor:"#004f5d"},hl:{align:"center",h:"top",fontSize:O({big:36,
small:18}),fillColor:"#004f5d"}},Aj:{font:{L:U.L,align:"center",h:"middle",fontSize:O({big:72,small:36}),fillColor:"#037564",stroke:!0,Cc:N(5,"round"),strokeColor:"#ffffff",Od:!0}}}}var Te={};function Ue(){Te={BA:{alpha:1}}}M.s=M.s||{};M.s.Kj=function(){Ve()};M.s.Ny=function(){};M.s.Xu=function(){};M.s.Qm=function(){Ve()};M.s.Hy=function(){};M.s.Gy=function(){};M.s.My=function(){};M.s.Ky=function(){};M.s.Iu=function(){};M.s.Iy=function(){};M.s.Jy=function(){};M.s.zu=function(){Ve()};M.s.Au=function(){Ve()};
M.s.Ph=function(){Ve()};M.s.yu=function(){Ve()};M.s.tu=function(a){void 0===M.e.fi&&(M.e.fi=new We(!0));Xe(a)};M.s.Us=function(){var a=M.e.Bc;void 0===M.e.fi&&(M.e.fi=new We(!0));Ye(a)};M.s.Pc=function(a){window.open(a)};M.s.Ij=function(){return[{f:cd,url:M.v.Gq}]};M.s.Ly=function(){};M.yd=M.yd||{};M.yd.Kj=function(){M.e.Ci=!1};M.yd.Xu=function(){};M.yd.Qm=function(){M.e.Ci=!1};M.yd.Ph=function(){M.e.Ci=!1};function Ze(a,b){for(var c in a.prototype)b.prototype[c]=a.prototype[c]}
function $e(a,b,c,d){this.cl=this.eg=a;this.Ot=b;this.duration=1;this.Cp=d;this.ee=c;this.dj=null;this.Ig=0}function af(a,b){a.Ig+=b;a.Ig>a.duration&&a.dj&&(a.dj(),a.dj=null)}$e.prototype.V=function(){if(this.Ig>=this.duration)return this.ee(this.duration,this.eg,this.cl-this.eg,this.duration);var a=this.ee(this.Ig,this.eg,this.cl-this.eg,this.duration);this.Cp&&(a=this.Cp(a));return a};function bf(a,b){a.eg=a.V();a.cl=b;a.duration=a.Ot;a.dj=void 0;a.Ig=0}
M.du=void 0!==M.environment?M.environment:"development";M.Hx=void 0!==M.ga?M.ga:M.du;"undefined"!==typeof M.mediaUrl?ha(M.mediaUrl):ha(M.size);M.zt="backButton";M.kf="languageSet";M.te="resizeEvent";M.version={builder:"1.8.3.0","build-time":"10:22:43","build-date":"08-09-2016",audio:F.ab?"web audio api":F.Oa?"html5 audio":"no audio"};
M.Sx=new function(){this.ie=this.hv=3;m.t.Bg&&(this.ie=3>m.Ga.Ud?1:4.4>m.Ga.Ud?2:3);m.Ga.Sj&&(this.ie=7>m.Ga.Ud?2:3);m.Ga.Go&&(this.ie=8>m.Ga.Ud?2:3);M.version.browser_name=m.name;M.version.browser_version=m.t.version;M.version.os_version=m.Ga.version;M.version.browser_grade=this.ie};M.a={};"function"===typeof Me&&Me();"function"===typeof Pe&&Pe();"function"===typeof Se&&Se();"function"===typeof Ue&&Ue();M.a.u="undefined"!==typeof Ke?Ke:{};M.a.j="undefined"!==typeof Oe?Oe:{};
M.a.O="undefined"!==typeof Re?Re:{};M.a.yy="undefined"!==typeof Te?Te:{};M.qg=window.publisherSettings;M.v="undefined"!==typeof game_configuration?game_configuration:{};"undefined"!==typeof Ne&&(M.v=Ne);if("undefined"!==typeof Qe)for(var cf in Qe)M.v[cf]=Qe[cf];
(function(){var a,b,c,d,g;M.l={};M.l.So="undefined"!==typeof V?V:{};M.l.Ab=void 0!==M.v.Jd&&void 0!==M.v.Jd.Si?M.v.Jd.Si:M.a.u.Jd.Si;if(M.v.Zw)for(b=M.l.Ab.length-1;0<=b;b--)0>M.v.Zw.indexOf(M.l.Ab[b])&&M.l.Ab.splice(b,1);try{if(d=function(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}(),d.lang)for(c=d.lang.toLowerCase().split("+"),b=M.l.Ab.length-1;0<=b;b--)0>c.indexOf(M.l.Ab[b])&&M.l.Ab.splice(b,1)}catch(h){}0===
M.l.Ab.length&&M.l.Ab.push("en-us");c=navigator.languages?navigator.languages:[navigator.language||navigator.userLanguage];for(b=0;b<c.length;b++)if("string"===typeof c[b]){g=c[b].toLowerCase();for(d=0;d<M.l.Ab.length;d++)if(0<=M.l.Ab[d].search(g)){a=M.l.Ab[d];break}if(void 0!==a)break}void 0===a&&(a=void 0!==M.v.Jd&&void 0!==M.v.Jd.je?M.v.Jd.je:M.a.u.Jd.je);M.l.ul=0<=M.l.Ab.indexOf(a)?a:M.l.Ab[0];M.l.Ii=M.l.So[M.l.ul];if(void 0!==M.a.u.Kb.language_toggle&&void 0!==M.a.u.Kb.language_toggle.S){a=M.a.u.Kb.language_toggle.S;
c=[];for(b=0;b<a.length;b++)0<=M.l.Ab.indexOf(a[b].id)&&c.push(a[b]);M.a.u.Kb.language_toggle.S=c}M.l.M=function(a,b){var c,d,g,h;if(void 0!==M.l.Ii&&void 0!==M.l.Ii[a]){c=M.l.Ii[a];if(d=c.match(/#touch{.*}\s*{.*}/g))for(h=0;h<d.length;h++)g=(g=m.jd.oo||m.jd.tn)?d[h].match(/{[^}]*}/g)[1]:d[h].match(/{[^}]*}/g)[0],g=g.substring(1,g.length-1),c=c.replace(d[h],g);return c}return b};M.l.Rr=function(a){M.l.ul=a;M.l.Ii=M.l.So[a];la(M.kf,a)};M.l.Mm=function(){return M.l.ul};M.l.ru=function(){return M.l.Ab};
M.l.Mu=function(a){return 0<=M.l.Ab.indexOf(a)}})();M.Ut={Ga:"",Sv:"",Tv:"",Tt:""};M.b={};M.b.createEvent=function(a,b){var c,d,g,h;d=b.detail||{};g=b.bubbles||!1;h=b.cancelable||!1;if("function"===typeof CustomEvent)c=new CustomEvent(a,{detail:d,bubbles:g,cancelable:h});else try{c=document.createEvent("CustomEvent"),c.initCustomEvent(a,g,h,d)}catch(k){c=document.createEvent("Event"),c.initEvent(a,g,h),c.data=d}return c};
M.b.ix=function(a){var b=Math.floor(a%6E4/1E3);return(0>a?"-":"")+Math.floor(a/6E4)+(10>b?":0":":")+b};M.b.Vh=function(a){function b(){}b.prototype=X.prototype;a.prototype=new b};M.b.tw=function(a,b,c,d,g,h){var k=!1,l=document.getElementById(a);l||(k=!0,l=document.createElement("canvas"),l.id=a);l.style.zIndex=b;l.style.top=c+"px";l.style.left=d+"px";l.width=g;l.height=h;k&&((a=document.getElementById("viewport"))?a.appendChild(l):document.body.appendChild(l));M.zd.push(l);return l};
(function(){var a,b,c,d,g,h,k;M.Rq=0;M.Sq=0;M.Nk=!1;M.Bx=m.t.Bg&&m.t.Ud&&4<=m.t.Ud;M.Di=!1;M.Zs=m.jd.oo||m.jd.tn;M.orientation=0<=ca.indexOf("landscape")?"landscape":"portrait";k="landscape"===M.orientation?M.a.u.Zl:M.a.u.zd;h="landscape"===M.orientation?M.a.j.Zl:M.a.j.zd;if(void 0!==h){if(void 0!==h.Jc)for(a in h.Jc)k.Jc[a]=h.Jc[a];if(void 0!==h.oc)for(a in h.oc)k.oc[a]=h.oc[a]}b=function(){var a,b,c,d;if(M.Bx&&!M.Di){M.Di=!0;if(a=document.getElementsByTagName("canvas"))for(b=0;b<a.length;b++)if(c=
a[b],!c.getContext||!c.getContext("2d")){M.Di=!1;return}b=document.createEvent("Event");b.Bz=[!1];b.initEvent("gameSetPause",!1,!1);window.dispatchEvent(b);d=[];for(b=0;b<a.length;b++){c=a[b];var g=c.getContext("2d");try{var h=g.getImageData(0,0,c.width,c.height);d.push(h)}catch(k){}g.clearRect(0,0,c.width,c.height);c.style.visibility="hidden"}setTimeout(function(){for(var b=0;b<a.length;b++)a[b].style.visibility="visible"},1);setTimeout(function(){for(var b=0;b<a.length;b++){var c=a[b].getContext("2d");
try{c.putImageData(d[b],0,0)}catch(g){}}b=document.createEvent("Event");b.initEvent("gameResume",!1,!1);window.dispatchEvent(b);M.Di=!1},100)}};c=function(){var a,c,d,g,h,A,r,s,t;"landscape"===M.orientation?(a=[window.innerWidth,window.innerHeight],c=[k.cg,k.qc],d=k.minWidth):(a=[window.innerHeight,window.innerWidth],c=[k.qc,k.Mb],d=k.minHeight);g=c[0]/c[1];h=a[0]/a[1];A=d/c[1];h<g?(h=h<A?Math.floor(a[0]/A):a[1],g=a[0]):(h=a[1],g=Math.floor(a[1]*g));r=h/c[1];!M.Zs&&1<r&&(g=Math.min(a[0],c[0]),h=Math.min(a[1],
c[1]),r=1);a="landscape"===M.orientation?g:h;c="landscape"===M.orientation?h:g;t=s=0;window.innerHeight<Math.floor(k.qc*r)&&(s=Math.max(k.fk,window.innerHeight-Math.floor(k.qc*r)));window.innerWidth<Math.floor(k.Mb*r)&&(t=Math.floor(Math.max(k.cg-k.Mb,(window.innerWidth-Math.floor(k.Mb*r))/r)),window.innerWidth<Math.floor(k.Mb*r)+t*r&&(t+=Math.floor(Math.max((d-k.cg)/2,(window.innerWidth-(k.Mb*r+t*r))/2/r))));M.np=k.qc-k.Jp;M.Dt=k.Mb-k.cg;M.ca=s;M.Xx=t;M.Wx=Math.min(M.Dt,-1*M.Yx);M.he=(k.oc.top||
k.Xe)-M.ca;M.W={top:-1*s,left:-1*t,height:Math.min(k.qc,Math.round(Math.min(c,window.innerHeight)/r)),width:Math.min(k.Mb,Math.round(Math.min(a,window.innerWidth)/r))};M.Tz="landscape"===M.orientation?{top:0,left:Math.floor((k.cg-k.minWidth)/2),width:k.minWidth,height:k.minHeight}:{top:Math.abs(k.fk),left:k.We,width:k.Mb,height:k.minHeight};d=Math.min(window.innerHeight,c);a=Math.min(window.innerWidth,a);"landscape"===M.orientation?document.getElementById("viewport").setAttribute("style","position:fixed; overflow:hidden; z-index: 0; width:"+
a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px; top:50%; margin-top:"+-d/2+"px"):document.getElementById("viewport").setAttribute("style","position:absolute; overflow:hidden; z-index: 0; width:"+a+"px; left:50%; margin-left:"+-a/2+"px; height: "+d+"px");d=function(a,b,c,d){var g,h,l,n;g=void 0!==b.top?b.top:k.Xe;h=void 0!==b.left?b.left:k.We;l=void 0!==b.width?b.width:k.Mb;n=void 0!==b.height?b.height:k.qc;a.ly=Math.floor(r*g);a.ky=Math.floor(r*h);a.my=Math.floor(r*l);a.jy=Math.floor(r*
n);!1!==c&&(g+=s);!1!==d&&(h+=t);a.setAttribute("style","position:absolute; left:"+Math.floor(r*h)+"px; top:"+Math.floor(r*g)+"px; width:"+Math.floor(r*l)+"px; height:"+Math.floor(r*n)+"px; z-index: "+b.depth)};d(M.Ol,k.Yl);d(M.zm,k.Jc);d(M.Im,k.oc,!1,!0);d(M.Kd,k.Se);b();setTimeout(b,5E3);setTimeout(b,1E4);setTimeout(b,2E4);la(M.te)};a=function(){if(M.Rq===window.innerHeight&&M.Sq===window.innerWidth||M.Nk)return!1;document.documentElement.style["min-height"]=5E3;d=window.innerHeight;g=40;M.Nk=window.setInterval(function(){document.documentElement.style.minHeight=
"";document.documentElement.style["min-height"]="";window.scrollTo(0,m.t.Bg?1:0);g--;if((m.t.Bg?0:window.innerHeight>d)||0>g)M.Sq=window.innerWidth,M.Rq=window.innerHeight,clearInterval(M.Nk),M.Nk=!1,document.documentElement.style["min-height"]=window.innerHeight+"px",document.getElementById("viewport").style.height=window.innerHeight+"px",c()},10)};M.df=k.Jc.left||k.We;M.ef=k.Jc.top||k.Xe;M.qu=k.Jc.width||k.Mb;M.ju=k.Jc.height||k.qc;M.ff=k.oc.left||k.We;M.he=k.oc.top||k.Xe;M.Ay=k.oc.width||k.Mb;
M.zy=k.oc.height||k.qc;M.dv=k.Se.left||k.We;M.ev=k.Se.top||k.Xe;M.fv=k.Se.width||k.Mb;M.cv=k.Se.height||k.qc;h=function(a){return M.b.tw(a.id,a.depth,void 0!==a.top?a.top:k.Xe,void 0!==a.left?a.left:k.We,void 0!==a.width?a.width:k.Mb,void 0!==a.height?a.height:k.qc)};M.zd=[];M.Ol=h(k.Yl);M.zm=h(k.Jc);M.Im=h(k.oc);M.Kd=h(k.Se);c();document.body.addEventListener("touchmove",function(a){a.preventDefault()},!0);document.body.addEventListener("touchstart",a,!0);window.addEventListener("resize",a,!0);window.setInterval(a,
200);M.fc={};M.fc[M.cf]=M.Ol;M.fc[M.jq]=M.zm;M.fc[M.Fj]=M.Im;M.fc[M.gg]=M.Kd;M.fc[M.bf]=M.Ol;M.fc[M.Yb]=M.Kd;M.fc[M.Gd]=M.Kd})();
M.b.tt=function(){var a,b;if(b=document.getElementById("viewport"))a=document.createElement("img"),a.className="banner",a.src=ia.Xd+"/media/banner_game_640x100.png",a.style.position="absolute",a.style.bottom="0px",a.style.width="100%",a.style.zIndex=300,b.appendChild(a),M.Gt=!0,M.qh=!0,b=function(a){M.Gt&&M.qh&&(M.s.Pc("http://www.tinglygames.com/html5-games/"),a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},a.addEventListener("mouseup",b,!0),a.addEventListener("touchend",
b,!0),a.addEventListener("mousedown",function(a){M.qh&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0),a.addEventListener("touchstart",function(a){M.qh&&(a.preventDefault(),a.stopPropagation?a.stopPropagation():a.cancelBubble=!0)},!0)};M.b.lA=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="inline";M.qh=!0}};
M.b.Fy=function(){var a,b=document.getElementsByClassName("banner");if(b){for(a=0;a<b.length;a++)b[a].style.display="none";M.qh=!1}};M.b.Lm=function(a){return a===M.zm?{x:M.df,y:M.ef}:a===M.Im?{x:M.ff,y:M.he}:{x:M.dv,y:M.ev}};M.b.gf=function(a){return M.fc[a]};M.b.hb=function(a){return M.fc[a]?(w.canvas!==M.fc[a]&&w.hb(M.fc[a]),!0):!1};M.b.Ua=function(a,b){if(M.fc[b]){var c=G;a.ua!==b&&(c.gh=!0);a.ua=b;a.canvas=M.fc[b]}};
M.b.g=function(a,b,c,d){var g;b=b||0;c=c||0;d=d||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return Math.round(b/2-(c/2-d))+g;case "left":case "top":return g-d;case "right":case "bottom":return b-c-g-d;default:return g+0}return 0};
M.b.ma=function(a,b,c,d){var g;b=b||0;c=c||0;if("number"===typeof a)return a;if("object"===typeof a)switch(g=a.offset||0,a.align){case "center":return"center"===d||"middle"===d?Math.round(b/2)+g:"left"===d||"top"===d?Math.round(b/2-c/2)+g:Math.round(b/2+c/2)-g;case "left":case "top":return"center"===d||"middle"===d?Math.round(c/2)+g:"left"===d||"top"===d?g:c+g;case "right":case "bottom":return"center"===d||"middle"===d?b-Math.round(c/2)-g:"left"===d||"top"===d?b-Math.round(c/2)-g:b-g;default:return g+
0}return 0};M.b.ey=function(a,b,c,d){switch(d){case "center":case "middle":return Math.round(b/2)+a;case "left":case "top":return a;case "right":case "bottom":return c+a}return 0};M.Vb=M.Vb||{};M.Vb.vw=!1;M.Vb.Lq=function(a){a instanceof Array&&(this.Bj=a[0],this.Ok=a[1],this.Ht="http://api.gameanalytics.com/1/"+this.Bj,this.Mq=!0)};
M.Vb.yl=function(a,b){var c,d=JSON.stringify(b),g=df(d+this.Ok),h=this.Ht+"/"+a;try{c=new XMLHttpRequest,c.open("POST",h,!0),this.vw&&(c.onreadystatechange=function(){4===c.readyState&&(200===c.status?(console.log("GOOD! statusText: "+c.statusText),console.log(b)):console.log("ERROR ajax call error: "+c.statusText+", url: "+h))}),c.setRequestHeader("Content-Type","text/plain"),c.setRequestHeader("Authorization",g),c.send(d)}catch(k){}};
M.Vb.rl=function(){return{user_id:this.Eo,session_id:this.rw,build:this.Kt}};
M.Vb.Ow=function(){var a;a=ef();var b=M.v.bw,c=ff(),d=gf("userId","");""===d&&(d=ef(),hf("userId",d));var g={Eo:d},d=M.Ut;this.rw=a;g&&"object"===typeof g&&(this.Eo=g.Eo);this.Kt=c;this.i=!0;this.Mq&&(a=this.rl(),a.device=d.Tt,a.platform=d.Ga,a.os_major=d.Sv,a.os_minor=d.Tv,a.install_publisher=b,a.install_site=window.location!==window.parent.location?document.referrer:document.location.href,this.yl("user",a));this.Na("start","session")};M.Vb.wy=function(){this.i=!1;this.Na("end","session")};
M.Vb.Na=function(a,b,c){if(this.i&&this.Mq){var d="";b&&(d=b instanceof Array?b.toString().replace(",",":"):d+b);b=this.rl();b.event_id=d+":"+a;b.value=c;this.yl("design",b)}};M.Vb.Sz=function(a,b,c){this.Na(a,b,c)};M.Vb.Mr=function(a,b){var c=this.rl();c.message=a;c.severity=b;this.yl("error",c)};function jf(){this.ua=this.depth=0;this.visible=!1;this.i=!0;this.a=M.a.u.za;this.aw=this.a.jx;H(this);Nb(this,"system")}
function ef(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0;return("x"===a?b:b&3|8).toString(16)})}e=jf.prototype;e.start=function(a){M.Vb.Lq(a);M.Vb.Ow()};e.Na=function(a,b,c){M.Vb.Na(a,b,c)};function kf(a,b,c,d){var g,h;for(g=0;g<a.Y.length;g++)void 0!==a.Y[g]&&a.Y[g].tag===b&&(h=a.Y[g],a.Na(void 0!==c?c:h.Wp,void 0!==d?d:h.Dr,h.p),h.i=!1)}
function lf(){var a=M.za,b=M.e.If,c;for(c=0;c<a.Y.length;c++)void 0!==a.Y[c]&&a.Y[c].tag===b&&(a.Y[c].paused+=1)}e.Mr=function(a,b){M.Vb.Mr(a,b)};e.dc=function(){this.Y=[]};e.ra=function(a){var b,c=0;for(b=0;b<this.Y.length;b++)this.Y[b].i&&(0===this.Y[b].paused&&(this.Y[b].p+=a),c=b);c<this.Y.length-1&&(a=this.Y.length-Math.max(this.aw,c+1),0<a&&this.Y.splice(this.Y.length-a,a))};
function We(a,b,c){this.kr=a||!1;this.host=b||"http://localhost:8080";this.qw=c||this.host+"/services/storage/gamestate";this.rs="undefined"!==typeof window.localStorage;this.$m=this.Co=!1;var d=this;window.parent!==window&&(m.t.Sn||m.Ga.Sj)&&(window.addEventListener("message",function(a){a=a.data;var b=a.command;"init"===b?d.Co="ok"===a.result:"getItem"===b&&d.Gj&&("ok"===a.result?d.Gj(a.value):d.Gj(a.defaultValue))},!1),this.Gj=null,window.parent.postMessage({command:"init"},"*"));this.bi=[];window.setTimeout(function(){d.$m=
!0;for(var a=0;a<d.bi.length;++a)d.bi[a]();d.bi=[]},2E3)}function mf(){return"string"===typeof M.v.ks&&""!==M.v.ks?M.v.ks:void 0!==M.a.j.dg&&void 0!==M.a.j.dg.iq?M.a.j.dg.iq:"0"}function Xe(a){var b=M.e.fi;"function"===typeof a&&(b.$m?nf(b,a):b.bi.push(function(){nf(b,a)}))}function Ye(a){var b=M.e.fi;b.$m?of(b,a):b.bi.push(function(){of(b,a)})}
function of(a,b){var c=null,d=mf();try{c=JSON.stringify({lastChanged:new Date,gameState:JSON.stringify(b)})}catch(g){}if(a.Co)window.parent.postMessage({command:"setItem",key:"TG_"+d,value:c},"*");else{if(a.rs)try{window.localStorage.setItem(d,c)}catch(h){}a.kr||(c=new nb("gameState_"+d),c.text=void 0===JSON?"":JSON.stringify(b),ob(c,a.qw+"/my_ip/"+d))}}
function nf(a,b){var c=null,d=null,g=mf();if(a.Co)a.Gj=function(a){var d;try{c=JSON.parse(a),d=JSON.parse(c.gameState)}catch(g){d=null}b(d)},window.parent.postMessage({command:"getItem",key:"TG_"+g},"*");else{if(a.rs)try{(c=window.localStorage.getItem(g))&&(c=JSON.parse(c))}catch(h){b(null);return}if(!a.kr){var k=new nb("gameState_"+g),d=null;pb(k,We.Qz+"/my_ip/"+g)&&(d=void 0===JSON?{}:JSON.parse(k.text))}try{if(c){if(d&&Date.parse(d.lastChanged)>Date.parse(c.lastChanged)){b(JSON.parse(d.gameState));
return}b(JSON.parse(c.gameState));return}if(d){b(JSON.parse(d.gameState));return}}catch(l){b(null);return}b(null)}}
function pf(a,b,c){console&&console.log&&console.log("Hosted on: "+(window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname));this.depth=1E3;this.uc=this.visible=!1!==c;this.i=!0;M.b.Ua(this,M.Yb);var d;this.a=M.a.u.wc;if("landscape"===M.orientation&&M.a.u.fn)for(d in M.a.u.fn)this.a[d]=M.a.u.fn[d];for(d in M.a.O.wc)this.a[d]=M.a.O.wc[d];if(M.v.wc)for(d in M.v.wc)this.a[d]=M.v.wc[d];this.Lb=a;this.yp=b;this.Np=!1;this.ph=0;this.Pl=!1;this.Vi=0;this.Ui=
this.a.Ct;this.Kn=!0;this.Zu=.6/Math.log(this.a.$j+1);this.et=void 0!==M.v.Yu?M.v.Yu:this.a.Bv;this.iv=this.et+this.a.lv;H(this)}e=pf.prototype;e.Wn=function(a){var b;M.b.hb(M.bf);qa(0,0,this.canvas.width,this.canvas.height,"white",!1);b=R.K();(M.v.wc&&M.v.wc.ti||this.a.ti)&&C(b,M.v.wc&&M.v.wc.ti?M.v.wc.ti:this.a.ti);a=M.l.M(a,"<"+a.toUpperCase()+">");b.q(a,this.canvas.width/2,this.canvas.height/2,this.a.$k);this.error=!0;this.visible=this.uc=!1;this.canvas.$=!0};
e.Ld=function(){this.ha&&(this.tb=M.b.g(this.a.tb,M.W.width,this.ha.width)+M.W.left,this.hc=M.b.g(this.a.hc,M.W.height,this.ha.height)+M.W.top)};
e.em=function(){var a,b,c,d,g,h;if("function"===typeof M.s.Ij&&(h=this.a.qf,(this.va=M.s.Ij())&&0<this.va.length)){this.ha?this.ha.clear():this.ha=new y(this.a.qf,this.a.$h);z(this.ha);h/=this.va.length;for(c=0;c<this.va.length;c++)try{g=this.va[c].f,d=Math.min(1,Math.min((h-20)/g.width,this.a.$h/g.height)),a="center"===this.a.Yh?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.ha.height-g.height*d,g instanceof x?g.la(0,a,b,d,d,0,1):w.context.drawImage(g,a,b,g.width*d,g.height*
d)}catch(k){}B(this.ha);this.Zj=0;this.hn=!0;this.Zh=0;this.pf=Sb(0,0,this.ha.width,this.ha.height);this.Ld()}};
e.Ca=function(){var a,b,c,d;this.Kn?w.clear():M.b.hb(M.bf);if(this.a.backgroundImage)if(d=this.a.backgroundImage,a=Math.abs(M.ca),1<d.J){c=(w.canvas.height-a)/d.ag;b=-(d.xh*c-w.canvas.width)/2;c=w.context;var g=c.globalAlpha,h,k,l;c.globalAlpha=this.ph;for(h=0;h<d.J;h+=1)k=b+h%d.pg*d.width,l=a+d.height*Math.floor(h/d.pg),d.Ce.na(d.xe[h],d.ye[h],d.ze[h],d.Qd[h],d.Pd[h],k-d.yb+d.Rd[h],l-d.zb+d.Sd[h]);c.globalAlpha=g}else c=(this.canvas.height-a)/d.height,b=-Math.floor((d.width*c-this.canvas.width)/
2),d instanceof x?d.la(0,b,a,c,c,0,this.ph):d instanceof y&&d.la(b,a,c,c,0,this.ph);d=this.a.me+this.a.dn+this.a.lg;b=pc.height;a=pc.width-(this.a.me+this.a.dn);this.mg=M.b.g(this.a.mg,w.canvas.width,d);this.of=M.b.g(this.a.of,w.canvas.height,b);pc.na(0,0,0,this.a.me,b,this.mg,this.of,1);pc.nj(0,this.a.me,0,a,b,this.mg+this.a.me,this.of,this.a.lg,b,1);pc.na(0,this.a.me+a,0,this.a.dn,b,this.mg+this.a.me+this.a.lg,this.of,1)};
function qf(a){a.Kn&&(a.Pl=!0);a.visible&&(a.Ca(),a.em(),"function"===typeof M.s.Hj&&(a.Nd=M.s.Hj(),a.Nd instanceof y&&(a.xg=!0,a.Xr=Math.floor((a.canvas.width-a.Nd.width)/2),a.Yr=Math.floor((a.canvas.height-a.Nd.height)/2))));M.e.Yj&&ia.rd("audio");M.e.Xj&&ia.rd("audio_music");ia.rd("fonts")}
e.dc=function(){var a,b=!1;if(void 0!==M.v.ni)if(!1===M.v.ni.$u)b=!0;else{if(void 0!==M.v.ni.im)for(a=0;a<M.v.ni.im.length;a++){var c;a:{c=M.v.ni.im[a];var d=void 0,g=void 0,h=d=void 0,g=void 0,g=window.location.origin?window.location.origin:window.location.protocol+"//"+window.location.hostname;if(0===g.indexOf("file://")&&c===df("file://"))c=!0;else{g=g.split(".");d=g.shift().split("://");d[0]+="://";g=d.concat(g);h="";for(d=g.length-1;0<=d;d--)if(h=g[d]+(0<d&&d<g.length-1?".":"")+h,df(h)===c){c=
!0;break a}c=!1}}if(c){b=!0;break}}}else b=!0;b&&"number"===typeof M.v.hx&&(new Date).getTime()>M.v.hx&&(b=!1);b?(this.Yf=[],this.error=!1,this.Ds=this.vm=this.Ri=this.p=0,this.ready=this.xg=!1,this.Vu=void 0!==this.a.ir?this.a.ir:this.a.me-this.a.Xh,this.Wu=void 0!==this.a.jr?this.a.jr:Math.floor((pc.height-qc.height)/2),this.en=qc.width-(this.a.Xh+this.a.hr),this.um=this.vr=this.jp=!1,(this.pi=ia.complete("start"))&&qf(this),this.gr=ia.complete("load"),this.visible&&(this.Es=document.getElementById("throbber_image"),
this.Td=this.a.Td,this.qo=M.b.g(this.a.qo,this.canvas.width,this.Td),this.al=M.b.g(this.a.al,this.canvas.height,this.Td))):G.pause()};
e.ra=function(a){this.p+=a;"function"===typeof M.s.Hj&&void 0===this.Nd&&(this.Nd=M.s.Hj(),this.Nd instanceof y&&(this.xg=!0,this.Xr=Math.floor((this.canvas.width-this.Nd.width)/2),this.Yr=Math.floor((this.canvas.height-this.Nd.height)/2)));this.xg&&0<=this.a.Yn&&this.p>=this.a.Yn&&(this.xg=!1);this.Pl&&(this.Vi+=a,this.Vi>=this.Ui?(this.Pl=!1,this.ph=1):this.ph=bc(this.Vi,0,1,this.Ui));this.pi&&(this.Ri+=a,this.vm+=a);this.Ds=Math.round(this.p/this.a.fx%(this.a.gx-1));this.hn&&(this.Zj=0+this.Zh/
this.a.gn*1,this.Zh+=a,this.Zh>=this.a.gn&&(this.hn=!1,this.Zj=1));"function"===typeof this.yp&&this.yp(Math.round((ja("load")+ja("audio")+ja("audio_music"))/2));!this.ready&&this.gr&&(this.um||this.vm>=this.a.$j)&&(!M.e.Yj||this.jp||F.Oa&&this.Ri>=this.a.$j)&&(!M.e.Xj||this.vr||F.Oa&&this.Ri>=this.a.$j)&&(this.ready=!0);if(a=!this.Np&&!this.error&&this.ready&&this.p>=this.et)a=M.e,a=(a.Kc&&a.Bb&&!a.Bb.Ku()?!1:!0)||this.p>=this.iv;a&&(this.Np=!0,this.Lb())};
e.ig=function(a,b,c){!this.xg&&this.pf&&Ub(this.pf,this.tb,this.hc,b,c)&&(this.Ya=Math.floor((b-this.tb)/(this.ha.width/this.va.length)))};e.jg=function(a,b,c){void 0!==this.Ya&&(this.va[this.Ya].url||this.va[this.Ya].action)&&Ub(this.pf,this.tb,this.hc,b,c)&&(b-=this.tb,b>=this.ha.width/this.va.length*this.Ya&&b<this.ha.width/this.va.length*(this.Ya+1)&&(this.va[this.Ya].url?M.s.Pc(this.va[this.Ya].url):this.va[this.Ya].action()));this.Ya=void 0};
e.Oc=function(a,b){"Load Complete"===a&&"start"===b.Ra?(this.pi=!0,qf(this)):"Load Complete"===a&&"load"===b.Ra?this.gr=!0:"Load Complete"===a&&"audio"===b.Ra?this.jp=!0:"Load Complete"===a&&"audio_music"===b.Ra?this.vr=!0:"Load Complete"===a&&"fonts"===b.Ra&&(this.um=!0);a===M.te&&this.Ld()};
e.Xa=function(){if(!this.error){this.Kn&&this.pi?this.Ca():w.clear();try{this.Es&&w.context.drawImage(this.Es,this.Td*this.Ds,0,this.Td,this.Td,this.qo,this.al,this.Td,this.Td)}catch(a){}if(this.pi){var b=0,c=this.mg+this.Vu,d=this.of+this.Wu,g=qc.height;qc.na(0,b,0,this.a.Xh,g,c,d,1);b+=this.a.Xh;c+=this.a.Xh;this.ready?(qc.nj(0,b,0,this.en,g,c,d,this.a.lg,g,1),b+=this.en,c+=this.a.lg,qc.na(0,b,0,this.a.hr,g,c,d,1)):qc.nj(0,b,0,this.en,g,c,d,Math.floor(Math.min((ja("load")+ja("audio"))/500+this.Zu*
Math.log(this.p+1),1)*this.a.lg),g,1);this.ha&&this.ha.cd(this.tb,this.hc,this.Zj)}this.xg&&this.Nd.q(this.Xr,this.Yr)}};
function rf(){var a,b;b=this;this.depth=100;this.i=this.visible=!0;M.b.Ua(this,M.Yb);this.a=M.a.u.fo;if("landscape"===M.orientation&&M.a.u.ho)for(a in M.a.u.ho)this.a[a]=M.a.u.ho[a];this.Kb=M.a.u.Kb;if("landscape"===M.orientation&&M.a.u.Xl)for(a in M.a.u.Xl)this.Kb[a]=M.a.u.Xl[a];for(a in M.a.O.fo)this.a[a]=M.a.O.fo[a];this.Yf=[];a=sf(M.e);this.Ap=void 0!==a&&null!==a;this.Ha=new Vb;this.Ha.sa(this.a.ku,function(){b.fs.call(b)});this.Ha.sa(this.a.xr,function(){b.hs.call(b)});this.Ha.sa(M.m.Rk&&!this.Ap?
this.a.Xv:this.a.xr,function(){b.is.call(b)});this.Ha.sa(this.a.xv,function(){b.gs.call(b)});H(this,!1)}e=rf.prototype;e.fs=function(){this.Dj=!0;this.a.hg&&(this.Nh=M.b.g(this.a.Nh,this.canvas.width,Zd.width),this.Cj=M.b.g(this.a.Cj,this.canvas.width,Zd.width),this.Oh=M.b.g(this.a.Oh,this.canvas.height,Zd.height),this.Mh=M.b.g(this.a.Mh,this.canvas.height,Zd.height),this.Hm=this.Nh,this.Ej=this.Oh,this.Cm=this.a.Fm,this.Dm=this.a.Gm,this.Bm=this.a.Em,this.cc=0,this.Ld())};
e.hs=function(a){function b(a,b,c,d){return ec(a,b,c,d,15)}var c,d;M.m.Rk&&!this.Ap&&(c=M.b.g(this.a.Mp,this.canvas.width,this.a.Dh,Math.floor(this.a.Dh/2)),d=M.b.g(this.a.lj,this.canvas.height,Ld.height,Math.floor(Ld.height/2)),c=new tf("difficulty_toggle",c,d,this.depth-20,uf()+"",this.a.Dh,{T:function(a){vf(parseInt(a,10));return!0},Pb:!0}),c.Qc=Math.floor(this.a.Dh/2),c.Rc=Math.floor(Ld.height/2),!1!==a&&(wf(c,"xScale",b,0,1,this.a.Lp),wf(c,"yScale",b,0,1,this.a.Lp)),this.kj=c,this.lj=c.y,this.Yf.push(c),
this.Ld())};
e.is=function(a){function b(a,b,c,d){return ec(a,b,c,d,15)}var c,d=this;this.Fn=!0;c=new xf("bigPlay",M.b.g(this.a.Wv,this.canvas.width,this.a.ii,Math.floor(this.a.ii/2)),M.b.g(this.a.Dk,this.canvas.height,Wd.height,Math.floor(Wd.height/2)),this.depth-20,"startScreenPlay",this.a.ii,{T:function(){I(G,d);var a=M.e,b,c,l;void 0===M.e.Qb&&(void 0!==M.a.O.Qb&&(void 0!==M.a.O.Qb.Et&&(b=M.a.O.Qb.Et),void 0!==M.a.O.Qb.Ql&&(Wa(F,"music",M.a.O.Qb.Ql),a.qe()||kb("music"),M.e.Kv=M.a.O.Qb.Ql),c=void 0!==M.a.O.Qb.Bt?
M.a.O.Qb.Bt:0,l=void 0!==M.a.O.Qb.Ui?M.a.O.Qb.Ui:0),void 0===b&&"undefined"!==typeof a_music&&(b=a_music),void 0!==b&&(M.e.Qb=F.play(b,c,l),M.e.Qb&&(F.ep(M.e.Qb,"music"),F.Pk(M.e.Qb,!0))));M.m.ug&&!a.Kc?a.screen=new yf:zf(a,0);return!0},Pb:!0});c.Qc=Math.floor(this.a.ii/2);c.Rc=Math.floor(Wd.height/2);!1!==a?(wf(c,"xScale",b,0,1,this.a.Bk),wf(c,"yScale",b,0,1,this.a.Bk),this.Ck=0):this.Ck=this.a.Bk;this.Ak=c;this.Dk=c.y;this.Yf.push(c);this.Ld()};
function Af(a){var b=ic([gc,function(a,b,g,h){return ec(a,b,g,h,2)},Yb],[!0,!1,!1],[.02,.1,.88]);a.Gr=!0;wf(a.Ak,"xScale",hc(b),1,.25,4E3);wf(a.Ak,"yScale",hc(b),1,-.1,4E3)}e.gs=function(a){var b;this.sr=!0;b=new X(M.b.g(this.a.qn,this.canvas.width,Id.width),M.b.g(this.a.ek,this.canvas.height,Id.height),this.depth-20,new Tb(Id),[Id],{T:M.e.wg,Pb:!0});!1!==a&&wf(b,"alpha",J,0,1,this.a.wv);this.pn=b;this.ek=b.y;this.Yf.push(b);this.Ld()};
e.Ca=function(){var a,b,c,d;if(a=this.a.backgroundImage)M.b.hb(M.bf),c=Math.abs(M.ca),1<a.J?(b=(w.canvas.height-c)/a.ag,d=-(a.xh*b-w.canvas.width)/2,ua(a,d,c)):(b=(w.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.la(0,d,c,b,b,0,1))};
e.em=function(){var a,b,c,d,g,h;if("function"===typeof M.s.Ij&&(h=this.a.qf,(this.va=M.s.Ij())&&0<this.va.length)){this.ha?this.ha.clear():this.ha=new y(this.a.qf,this.a.$h);z(this.ha);h/=this.va.length;for(c in this.va)try{g=this.va[c].f,d=Math.min(1,Math.min((h-20)/g.width,this.a.$h/g.height)),a="center"===this.a.Yh?h*c+Math.round((h-g.width*d)/2):h*c+Math.round(h-g.width*d)-10,b=this.ha.height-g.height*d,g instanceof x?g.la(0,a,b,d,d,0,1):w.context.drawImage(g,a,b,g.width*d,g.height*d)}catch(k){}B(this.ha);
this.Zj=0;this.hn=!0;this.Zh=0;this.pf=Sb(0,0,this.ha.width,this.ha.height);this.Ld()}};e.Ld=function(){var a;a=0;M.W.height<this.a.Vl&&(a=this.a.Vl-M.W.height);this.Fn&&(this.Ak.y=this.Dk-a);this.sr&&(this.pn.y=this.ek-a,this.pn.x=M.b.g(this.a.qn,M.W.width,Id.width)+M.W.left);this.kj&&(this.kj.y=this.lj-a);this.Dj&&this.cc>=this.a.Nc&&(this.Ej=this.Mh-M.ca);this.ha&&(this.tb=M.b.g(this.a.tb,M.W.width,this.ha.width)+M.W.left,this.hc=M.b.g(this.a.hc,M.W.height,this.ha.height)+M.W.top)};
e.dc=function(){this.Ca();this.a.hg&&(M.b.hb(M.Yb),this.a.hg.q(0,0,-this.a.hg.height-10));this.em();this.Ha.start()};e.Zb=function(){var a;for(a=0;a<this.Yf.length;a++)I(G,this.Yf[a])};
e.ra=function(a){this.canvas.$=!0;this.Dj&&this.cc<this.a.Nc&&(this.Hm=this.a.ou(this.cc,this.Nh,this.Cj-this.Nh,this.a.Nc),this.Ej=this.a.pu(this.cc,this.Oh,this.Mh-this.Oh,this.a.Nc)-M.ca,this.Cm=this.a.mu(this.cc,this.a.Fm,this.a.lq-this.a.Fm,this.a.Nc),this.Dm=this.a.nu(this.cc,this.a.Gm,this.a.mq-this.a.Gm,this.a.Nc),this.Bm=this.a.lu(this.cc,this.a.Em,this.a.kq-this.a.Em,this.a.Nc),this.cc+=a,this.cc>=this.a.Nc&&(this.Hm=this.Cj,this.Ej=this.Mh-M.ca,this.Cm=this.a.lq,this.Dm=this.a.mq,this.Bm=
this.a.kq));this.Fn&&(!this.Gr&&this.Ck>=this.a.Bk+this.a.Vv&&Af(this),this.Ck+=a)};e.ig=function(a,b,c){this.pf&&Ub(this.pf,this.tb,this.hc,b,c)&&(this.Ya=Math.floor((b-this.tb)/(this.ha.width/this.va.length)))};
e.jg=function(a,b,c){void 0!==this.Ya&&(this.va[this.Ya].url||this.va[this.Ya].action)&&Ub(this.pf,this.tb,this.hc,b,c)&&(b-=this.tb,b>=this.ha.width/this.va.length*this.Ya&&b<this.ha.width/this.va.length*(this.Ya+1)&&(this.va[this.Ya].url?M.s.Pc(this.va[this.Ya].url):this.va[this.Ya].action()));this.Ya=void 0};e.rb=function(){this.cb=!0};
e.Cb=function(){this.cb&&(this.Ha.stop(),this.Dj?this.cc<this.a.Nc&&(this.cc=this.a.Nc-1):(this.fs(),this.cc=this.a.Nc-1),this.kj?Bf(this.kj):this.hs(!1),this.sr?Bf(this.pn):this.gs(!1),this.Fn?(Bf(this.Ak),this.Gr&&Af(this)):this.is(!1),this.cb=!1)};e.Oc=function(a){a===M.te&&(this.Ca(),this.Ld())};e.Xa=function(){this.Dj&&this.a.hg&&this.a.hg.la(0,this.Hm,this.Ej,this.Cm,this.Dm,0,this.Bm);this.ha&&this.ha.q(this.tb,this.hc);this.uc=!1};
function yf(){this.depth=100;this.i=this.visible=!0;M.b.Ua(this,M.Yb);var a;this.a=M.a.u.lf;if("landscape"===M.orientation)for(a in M.a.u.Xq)this.a[a]=M.a.u.Xq[a];this.ta=M.a.j.Sy;if(M.a.j.lf)for(a in M.a.j.lf)this.a[a]=M.a.j.lf[a];this.Wb=M.a.u.Kb;for(var b in M.a.O.lf)this.a[b]=M.a.O.lf[b];this.nf=-1;this.Fa=0;this.cr=[];H(this)}e=yf.prototype;
e.Ca=function(){var a,b,c,d;M.b.hb(M.bf);if(a=this.a.backgroundImage?this.a.backgroundImage:void 0)c=Math.abs(M.ca),1<a.J?(b=(w.canvas.height-c)/a.ag,d=-(a.xh*b-w.canvas.width)/2,ua(a,d,c)):(b=(w.canvas.height-c)/a.height,d=-Math.floor((a.width*b-this.canvas.width)/2),a.la(0,d,c,b,b,0,1));var g;b=M.a.u.fa.type[M.m.kd].Ac;M.a.j.fa&&M.a.j.fa.type&&M.a.j.fa.type[M.m.kd]&&M.a.j.fa.type[M.m.kd]&&(b=!1===M.a.j.fa.type[M.m.kd].Ac?!1:b);void 0!==this.ta&&void 0!==this.ta.Ac&&(b=this.ta.Ac);c=M.b.g(this.a.Iw,
this.canvas.width,wc.width);a=M.b.g(this.a.cs,M.W.height,wc.height)+M.W.top;b&&(wc.q(0,c,a),b=R.K(),C(b,this.a.bs),Ha(b,"center"),b.q(this.G+" / "+this.to,c+Math.floor(wc.width/2),a+wc.height+this.a.ds));if(void 0!==this.ta&&void 0!==this.ta.yw?this.ta.yw:1)b=R.K(),void 0!==this.a.Yv?C(b,this.a.Yv):C(b,this.a.Gn),c=M.l.M("levelMapScreenTotalScore","<TOTAL SCORE:>"),d=Oa(b,c,this.a.$v,this.a.Zv),d<b.fontSize&&D(b,d),d=M.b.ma(this.a.Hr,this.canvas.width,b.ba(c),b.align),g=M.b.ma(this.a.Ir,M.W.height,
b.U(c),b.h)+M.W.top,b.q(c,d,g),c=""+this.Fk,C(b,this.a.Gn),d=M.b.ma(this.a.Hr,this.canvas.width,b.ba(c),b.align),b.q(c,d,a+wc.height+this.a.ds)};
function Cf(a){if("grid"===a.a.type){z(a.Wh);w.clear();a.mf=[];var b;b=function(b,d,g){var h,k,l,n,q,v,E,A,r,s,t,u,K,aa,S,W,oa,xa,ad,Hb,fd,yb,Le;k=M.m.Z[b];ad=a.Gb?a.a.wu:a.a.xu;Hb=a.a.Nm;fd=ad;if(a.a.Mt)h=a.a.Mt[b];else{xa=a.Gb?a.a.Lv:a.a.Mv;for(yb=Math.floor(k/xa);1<Math.abs(yb-xa);)xa-=1,yb=Math.floor(k/xa);for(h=[];0<k;)h.push(Math.min(xa,k)),k-=xa}yb=h.length;oa=Math.round(((a.Gb?a.a.dr:a.a.er)-(yb+1)*ad)/yb);Le=a.a.Lt?a.a.Lt:!1;if(!Le){xa=1;for(k=0;k<yb;k++)xa=Math.max(h[k],xa);W=Math.round((a.canvas.width-
2*Hb)/xa)}for(k=n=0;k<yb;k++){xa=h[k];Le&&(W=Math.round((a.canvas.width-2*Hb)/xa));for(l=0;l<xa;l++){r=a.a.Op;K=a.a.Yt;t=M.m.Ah||"locked";u=0;q=Df(b,n,void 0,void 0);"object"===typeof q&&null!==q&&(void 0!==q.state&&(t=q.state),"object"===typeof q.stats&&null!==q.stats&&(u=q.stats.stars||0));aa="locked"===t;"function"===typeof M.j.su&&(v=M.j.su(Ef(M.e,b,n),b,n,t))&&(K=aa=r=!1);q=Hb+d;A=fd;S=s=1;if(!1!==K){E=a.Gb?rc:xc;if("played"===t)switch(u){case 1:E=a.Gb?sc:yc;break;case 2:E=a.Gb?tc:zc;break;case 3:E=
a.Gb?uc:Ac}else a.Gb||"locked"!==t||(E=Dc);E.width>W&&(S=W/E.width);E.height>oa&&(S=Math.min(s,oa/E.height));q+=Math.round((W-E.width*S)/2);A+=Math.round((oa-E.height*S)/2);E.la(0,q,A,S,S,0,1);g&&(a.mf[n]={x:q,y:A})}v&&(v.width>W&&(s=W/v.width),v.height>oa&&(s=Math.min(s,oa/v.height)),void 0!==E?(u=M.b.g(a.a.Vq,E.width*S,v.width*s),K=M.b.g(a.a.Wq,E.height*S,v.height*s)):(u=M.b.g(a.a.Vq,W,v.width*s),K=M.b.g(a.a.Wq,oa,v.height*s),g&&(a.mf[n]={x:q+u,y:A+K})),v instanceof y?v.la(q+u,A+K,s,s,0,1):v.la(0,
q+u,A+K,s,s,0,1));!1===r||aa||(r=""+(M.m.Ai?n+1:Ef(M.e,b,n)+1),s=a.fonts.Km,"locked"===t&&void 0!==a.fonts.av?s=a.fonts.av:"unlocked"===t&&void 0!==a.fonts.Ax?s=a.fonts.Ax:"played"===t&&void 0!==a.fonts.played&&(s=a.fonts.played),void 0!==E?(u=M.b.ma(a.a.Zq,E.width*S,s.ba(r),s.align),K=M.b.ma(a.a.$q,E.height*S,s.U(r),s.h)):(u=M.b.ma(a.a.Zq,W,s.ba(r),s.align),K=M.b.ma(a.a.$q,oa,s.U(r),s.h)),s.q(r,q+u,A+K));a.Gb&&aa&&(void 0!==E?(u=M.b.g(a.a.lr,E.width*S,vc.width),K=M.b.g(a.a.mr,E.height*S,vc.height)):
(u=M.b.g(a.a.lr,W,vc.width),K=M.b.g(a.a.mr,oa,vc.height)),vc.q(0,q+u,A+K));Hb+=W;n++}Hb=a.a.Nm;fd+=oa+ad}};a.Sh&&b(a.B-1,0);b(a.B,a.canvas.width,!0);a.Rh&&b(a.B+1,2*a.canvas.width);B(a.Wh)}}function Ff(a,b){switch(b-a.B){case 0:a.vn=0;break;case 1:a.vn=-a.canvas.width;break;case -1:a.vn=a.canvas.width}a.og=!0;a.ik=0;a.moveStart=a.Fa;a.ur=a.vn-a.Fa;a.gk=Math.min(a.a.Gv-a.Dg,Math.round(Math.abs(a.ur)/(a.Wk/1E3)));a.gk=Math.max(a.a.Fv,a.gk)}
function Gf(a){if(1<M.m.Z.length){var b,c;b=M.b.g(a.a.Fx,a.canvas.width,Cc.width);c=M.b.g(a.a.Io,M.W.height,Cc.height)+M.W.top;a.re=new X(b,c,a.depth-20,new Tb(Cc),[Cc],function(){a.sd="previous";Ff(a,a.B-1);return!0});b=M.b.g(a.a.Ex,a.canvas.width,Bc.width);c=M.b.g(a.a.Ho,M.W.height,Bc.height)+M.W.top;a.oe=new X(b,c,a.depth-20,new Tb(Bc),[Bc],function(){a.sd="next";Ff(a,a.B+1);return!0});Hf(a)}else a.le-=a.a.rq}
function Hf(a){if(1<M.m.Z.length){var b;a.Sh?(b=[Cc],a.re.Pa=!0):(b=[new y(Cc.width,Cc.height)],z(b[0]),Cc.q(1,0,0),B(b[0]),a.re.Pa=!1);If(a.re,b);a.Rh?(b=[Bc],a.oe.Pa=!0):(b=[new y(Bc.width,Bc.height)],z(b[0]),Bc.q(1,0,0),B(b[0]),a.oe.Pa=!1);If(a.oe,b)}}
function Jf(a){var b,c,d;z(a.Jf);w.clear();b=R.K();a.a.Fc&&C(b,a.a.Fc);Ha(b,"center");Ia(b,"middle");c=M.l.M("levelMapScreenWorld_"+a.B,"<LEVELMAPSCREENWORLD_"+a.B+">");d=Oa(b,c,a.a.td-(b.stroke?b.Cc:0),a.a.De-(b.stroke?b.Cc:0),!1);d<b.fontSize&&D(b,d);b.q(c,a.Jf.width/2,a.Jf.height/2);B(a.Jf);a.canvas.$=!0}
e.dc=function(){var a,b,c,d=this;this.Gb=this.a.Gb?!0:!1;if(!this.Gb){for(a=0;a<M.m.Z.length;a++)if(9<M.m.Z[a]){b=!0;break}b||(this.Gb=!0)}this.Wh=new y(3*this.canvas.width,this.Gb?this.a.dr:this.a.er);this.ar=-this.canvas.width;this.br=this.Gb?this.a.qq:this.a.sq;this.le=M.b.g(this.br,M.W.height,this.Wh.height)+M.W.top;this.Jf=new y(this.a.td,this.a.De);this.kx=M.b.g(this.a.Kf,this.canvas.width,this.a.td);this.Hs=M.b.g(this.a.Xc,M.W.height,this.Jf.height)+M.W.top;this.Yq="undefined"!==typeof s_level_mask?
s_level_mask:this.Gb?Tb(rc):Tb(xc);this.a.Op&&(this.fonts={},a=function(a){var b,c;for(b in a)c=R.K(),C(c,a[b]),d.fonts[b]=c},this.fonts={},this.fonts.Km=R,this.Gb?a(this.a.Pu):a(this.a.Qu));this.B=M.e.B;this.Z=M.m.Z[this.B];this.Xk=!1;this.Wk=this.mo=this.Dg=0;this.no=this.ar;this.Fa=0;this.Sh=0<this.B;this.Rh=this.B<M.m.Z.length-1;for(b=this.to=this.Fk=this.G=0;b<M.m.Z.length;b++)for(a=0;a<M.m.Z[b];a++)c=Kf(void 0,a,b),this.to+=3,"object"===typeof c&&null!==c&&(this.G+=void 0!==c.stars?c.stars:
0,this.Fk+=void 0!==c.highScore?c.highScore:0);M.j.vu&&(this.Fk=M.j.vu());this.Ca();a=this.Wb[this.a.Ov];this.yn=new X(M.b.g(this.a.Pv,this.canvas.width,a.r.width),M.b.g(this.a.zn,M.W.height,a.r.height)+M.W.top,this.depth-20,new Tb(a.r),[a.r],{T:M.e.wg,ea:this});Gf(this);Cf(this);Jf(this);this.uc=!0};e.Zb=function(){this.re&&I(G,this.re);this.oe&&I(G,this.oe);I(G,this.yn)};
e.rb=function(a,b,c){if(!this.og)for(a=0;a<this.mf.length;a++)if(Ub(this.Yq,this.mf[a].x-this.canvas.width,this.mf[a].y+this.le,b,c)){this.nf=a;break}this.og=!1;1<M.m.Z.length&&(this.Xk=!0,this.Dg=0,this.ts=this.no=b,this.Wk=this.mo=0)};
e.Cb=function(a,b,c){if(!this.og&&-1!==this.nf&&Ub(this.Yq,this.mf[this.nf].x-this.canvas.width,this.mf[this.nf].y+this.le,b,c)&&(a=M.m.Ah||"locked",b=Df(this.B,this.nf,void 0,void 0),"object"===typeof b&&null!==b&&void 0!==b.state&&(a=b.state),"locked"!==a))return I(G,this),zf(M.e,this.nf,this.B),!0;this.nf=-1;this.Xk=!1;1<M.m.Z.length&&(Math.abs(this.Fa)>=this.a.bx&&(this.Wk>=this.a.cx||Math.abs(this.Fa)>=this.a.ax)?"previous"===this.sd?this.Sh&&0<=this.Fa&&this.Fa<=this.canvas.width/2?Ff(this,
this.B-1):(0>this.Fa||(this.sd="next"),Ff(this,this.B)):"next"===this.sd&&(this.Rh&&0>=this.Fa&&this.Fa>=-this.canvas.width/2?Ff(this,this.B+1):(0<this.Fa||(this.sd="previous"),Ff(this,this.B))):0<Math.abs(this.Fa)&&(this.sd="next"===this.sd?"previous":"next",Ff(this,this.B)));return!0};
e.Oc=function(a){if(a===M.kf||a===M.te)this.canvas.$=!0,this.Ca(),a===M.te?(this.Hs=M.b.g(this.a.Xc,M.W.height,this.Jf.height)+M.W.top,this.le=M.b.g(this.br,M.W.height,this.Wh.height)+M.W.top,this.yn.y=M.b.g(this.a.zn,M.W.height,this.yn.images[0].height)+M.W.top,this.re&&(this.re.y=M.b.g(this.a.Io,M.W.height,Cc.height)+M.W.top),this.oe&&(this.oe.y=M.b.g(this.a.Ho,M.W.height,Bc.height)+M.W.top),void 0===this.oe&&void 0===this.re&&(this.le-=this.a.rq)):(Jf(this),Cf(this))};
e.nd=function(a){var b=Cb(0);this.Xk&&(this.mo=Math.abs(this.no-b),0<this.Dg&&(this.Wk=this.mo/(this.Dg/1E3)),this.sd=b>this.no?"previous":"next",this.Dg+=a,this.Fa+=b-this.ts,this.ts=b,this.canvas.$=!0);this.og&&(this.Fa=ac(this.ik,this.moveStart,this.ur,this.gk),this.ik>=this.gk&&(this.og=!1,this.Fa=0),this.ik+=a,this.canvas.$=!0);if(this.og||this.Xk)"previous"===this.sd&&this.Fa>=this.canvas.width/2?0<=this.B-1?(this.B-=1,this.Z=M.m.Z[this.B],this.Sh=0<this.B,this.Rh=this.B<M.m.Z.length-1,Hf(this),
this.Fa-=this.canvas.width,Jf(this),Cf(this),this.canvas.$=!0,this.moveStart-=this.canvas.width):this.Fa=Math.round(this.canvas.width/2):"next"===this.sd&&this.Fa<=-this.canvas.width/2&&(this.B+1<M.m.Z.length?(this.B+=1,this.Z=M.m.Z[this.B],this.Sh=0<this.B,this.Rh=this.B<M.m.Z.length-1,Hf(this),this.Fa+=this.canvas.width,Jf(this),Cf(this),this.canvas.$=!0,this.moveStart+=this.canvas.width):this.Fa=Math.round(-this.canvas.width/2))};
e.Xa=function(){this.Jf.q(this.kx,this.Hs);this.Wh.q(Math.round(this.ar+this.Fa),this.le);this.uc=!1};
function Lf(a,b,c,d){this.depth=10;this.i=this.visible=!0;M.b.Ua(this,M.Yb);var g;this.type=b.failed?"failed":a;this.a=M.a.u.fa;this.ta=this.a.type[this.type];if("landscape"===M.orientation)for(g in M.a.u.Uq)this.a[g]=M.a.u.Uq[g];for(g in M.a.O.fa)this.a[g]=M.a.O.fa[g];if(M.a.O.fa&&M.a.O.fa.type&&M.a.O.fa.type[this.type])for(g in M.a.O.fa.type[this.type])this.a[g]=M.a.O.fa.type[this.type][g];if("failed"===this.type){if(void 0!==M.a.j.fa&&M.a.j.fa.type&&void 0!==M.a.j.fa.type.failed)for(g in M.a.j.fa.type[this.type])this.ta[g]=
M.a.j.fa.type[this.type][g]}else{if(void 0!==M.a.j.fa&&void 0!==M.a.j.fa.type)for(g in M.a.j.fa.type[this.type])this.ta[g]=M.a.j.fa.type[this.type][g];for(g in M.a.j.fa)this.ta[g]=M.a.j.fa[g]}this.pa=b;this.T=c;this.ea=d;this.Dw=[De,Ee,Fe];this.Re=[];this.Ha=new Vb;this.Ha.parent=this;H(this,!1)}
function Mf(a){var b;for(b=0;b<a.G.length;b++)Nf(a.G[b]);for(b=0;b<a.zf.length;b++)I(G,a.zf[b]);a.zf=[];a.Ea&&Nf(a.Ea);a.Ea=void 0;for(b=0;b<a.buttons.length;b++)a.buttons[b].Pa=!1;a.Ha.stop();a.Ha=void 0;Of(a)}
function Pf(a,b){var c;switch(b){case "title_level":c=M.l.M("levelEndScreenTitle_level","<LEVELENDSCREENTITLE_LEVEL>").replace("<VALUE>",a.pa.level);break;case "title_endless":c=M.l.M("levelEndScreenTitle_endless","<LEVELENDSCREENTITLE_ENDLESS>").replace("<VALUE>",a.pa.stage);break;case "title_difficulty":c=M.l.M("levelEndScreenTitle_difficulty","<LEVELENDSCREENTITLE_DIFFICULTY>")}void 0!==c&&a.bc(a.a.Fc,c,a.a.Kf,a.a.Xc,a.a.td,a.a.De)}
function Qf(a,b){var c;switch(b){case "subtitle_failed":c=M.l.M("levelEndScreenSubTitle_levelFailed","<LEVEL_FAILED>")}void 0!==c&&a.bc(a.a.ns,c,a.a.Xw,a.a.Yw)}
function Rf(a,b,c){var d,g,h,k,l;g=M.l.M(b.key,"<"+b.key.toUpperCase()+">");d=b.$d?b.toString(b.Af):b.toString(b.rc);h=a.a.qi;h.align="left";h.h="top";l=R.K();C(l,h);c?(Ia(l,"bottom"),h=a.a.Bf,h.align="left",h.h="bottom",c=R.K(),C(c,h),h=k=0,void 0!==g&&(h+=l.ba(g)+a.a.Vk),void 0!==d&&(h+=c.ba(d)),h=M.b.g(a.a.ve,a.canvas.width,h)-a.c.x,void 0!==g&&(l.q(g,h,a.Vc+l.fontSize),h+=l.ba(g)+a.a.Vk,k+=l.U(g)),void 0!==d&&(b.$d?(d=c.U(d),l=a.Vc+l.fontSize-d,b.zh=new Sf(h,l,a.a.Ag,d,a.depth-100,b.Af,c,a.a.yg,
a.a.zg,a.c,b.toString),k=Math.max(k,d)):(c.q(d,h,a.Vc+l.fontSize+a.a.js),k=Math.max(k,c.U(d)))),0<k&&(a.Vc+=k+a.a.Uc)):(void 0!==g&&(a.bc(h,g,a.a.ve,a.a.Cf),k=a.a.Cf,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.Uc:a.a.Uc,k.offset+=l.U(g)):"number"===typeof k&&(k+=a.a.Uc+l.U(g))),void 0!==d&&(h=a.a.Bf,h.h="top",b.$d?(c=R.K(),h.align="center",C(c,h),g=M.b.g(a.a.ve,a.canvas.width,a.a.Ag)-a.c.x,l=k-a.c.y,b.zh=new Sf(g,l,a.a.Ag,c.U(d),a.depth-100,b.Af,c,a.a.yg,a.a.zg,a.c,b.toString)):a.bc(h,
d,a.a.ve,k)))}
function Tf(a,b,c){var d,g,h,k,l,n;switch(b){case "totalScore":d=""+a.pa.totalScore;g=M.l.M("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");n=0;break;case "highScore":g=M.l.M("levelEndScreenHighScore","<LEVENENDSCREENHIGHSCORE>");d=""+a.pa.highScore;break;case "timeLeft":g=M.l.M("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>");d=""+a.pa.timeLeft;break;case "timeBonus":g=M.l.M("levelEndScreenTimeBonus","<LEVENENDSCREENTIMEBONUS>"),d=""+a.pa.timeBonus,n=a.pa.timeBonus}h=a.a.qi;h.align=
"left";h.h="top";l=R.K();C(l,h);c?(Ia(l,"bottom"),h=a.a.Bf,h.align="left",h.h="bottom",c=R.K(),C(c,h),h=k=0,void 0!==g&&(h+=l.ba(g)+a.a.Vk),void 0!==d&&(h+=c.ba(d)),h=M.b.g(a.a.ve,a.canvas.width,h)-a.c.x,void 0!==g&&(l.q(g,h,a.Vc+l.fontSize),h+=l.ba(g)+a.a.Vk,k+=l.U(g)),void 0!==d&&(void 0!==n?(d=c.U(d),l=a.Vc+l.fontSize-d,n=new Sf(h,l,a.a.Ag,d,a.depth-100,n,c,a.a.yg,a.a.zg,a.c),k=Math.max(k,d)):(c.q(d,h,a.Vc+l.fontSize+a.a.js),k=Math.max(k,c.U(d)))),0<k&&(a.Vc+=k+a.a.Uc)):(void 0!==g&&(a.bc(h,g,
a.a.ve,a.a.Cf),k=a.a.Cf,"object"===typeof k?(k.offset=void 0!==k.offset?k.offset+a.a.Uc:a.a.Uc,k.offset+=l.U(g)):"number"===typeof k&&(k+=a.a.Uc+l.U(g))),void 0!==d&&(h=a.a.Bf,h.h="top",void 0!==n?(c=R.K(),h.align="center",C(c,h),g=M.b.g(a.a.ve,a.canvas.width,a.a.Ag)-a.c.x,l=k-a.c.y,n=new Sf(g,l,a.a.Ag,c.U(d),a.depth-100,n,c,a.a.yg,a.a.zg,a.c)):a.bc(h,d,a.a.ve,k)));n instanceof Sf&&("totalScore"===b?a.Mf=n:a.Re.push(n))}
function Uf(a,b){var c,d,g;c=M.l.M(b.key,"<"+b.key.toUpperCase()+">");d=b.$d?b.toString(b.Af):b.toString(b.rc);void 0!==c&&a.bc(a.a.mm,c,a.a.Sp,a.a.nm);void 0!==d&&(b.$d?(c=R.K(),d=a.a.Eh,a.a.vy||(d.align="center"),C(c,d),d=M.b.g(a.a.rj,a.canvas.width,a.a.qj)-a.c.x,g=M.b.g(a.a.Fh,a.canvas.height,a.a.pj)-a.c.y,b.zh=new Sf(d,g,a.a.qj,a.a.pj,a.depth-100,b.Af,c,a.a.yg,a.a.zg,a.c,b.toString)):a.bc(a.a.Eh,d,a.a.rj,a.a.Fh))}
function Vf(a,b){var c,d,g,h;switch(b){case "totalScore":c=M.l.M("levelEndScreenTotalScore","<LEVENENDSCREENTOTALSCORE>");d=""+a.pa.totalScore;g=0;break;case "timeLeft":c=M.l.M("levelEndScreenTimeLeft","<LEVENENDSCREENTIMELEFT>"),d=""+a.pa.timeLeft}void 0!==c&&a.bc(a.a.mm,c,a.a.Sp,a.a.nm);void 0!==d&&(void 0!==g?(c=R.K(),d=a.a.Eh,d.align="center",C(c,d),d=M.b.g(a.a.rj,a.canvas.width,a.a.qj)-a.c.x,h=M.b.g(a.a.Fh,a.canvas.height,a.a.pj)-a.c.y,g=new Sf(d,h,a.a.qj,a.a.pj,a.depth-100,g,c,a.a.yg,a.a.zg,
a.c)):a.bc(a.a.Eh,d,a.a.rj,a.a.Fh));g instanceof Sf&&("totalScore"===b?a.Mf=g:a.Re.push(g))}e=Lf.prototype;e.bc=function(a,b,c,d,g,h){var k=R.K();C(k,a);void 0!==g&&void 0!==h&&(a=Oa(k,b,g,h,g),k.fontSize>a&&D(k,a));a=k.ba(b);h=k.U(b);k.q(b,M.b.ma(c,this.canvas.width,a,k.align)-this.c.x,M.b.ma(d,this.canvas.height,h,k.h)-this.c.y,g)};
function Wf(a,b){var c,d,g,h;switch(b){case "retry":c=Jd;d=function(){a.ce="retry";Mf(a)};break;case "exit":c=Gd,d=function(){a.ce="exit";Mf(a)}}void 0!==c&&(g=M.b.g(a.a.At,a.canvas.width,c.width)-a.c.x,h=M.b.g(a.a.lp,a.canvas.height,c.height)-a.c.y,a.buttons.push(new X(g,h,a.depth-20,new Tb(c),[c],d,a.c)))}
function Xf(a,b){var c,d,g,h;switch(b){case "retry":c=Rd;d=function(){a.ce="retry";Mf(a)};break;case "exit":c=Qd;d=function(){a.ce="exit";Mf(a)};break;case "next":c=Qd,d=function(){a.ce="next";Mf(a)}}void 0!==c&&(g=M.b.g(a.a.iu,a.canvas.width,c.width)-a.c.x,h=M.b.g(a.a.fq,a.canvas.height,c.height)-a.c.y,a.buttons.push(new X(g,h,a.depth-20,new Tb(c),[c],d,a.c)))}
e.dc=function(){this.p=0;this.G=[];this.zf=[];this.buttons=[];this.canvas.$=!0;this.ce="";this.sc=this.pa.failed?!0:!1;this.Ac=this.ta.Ac&&!this.sc;this.vg=this.ta.vg&&!this.sc&&this.pa.Jq;this.Gl=this.alpha=this.Xf=0;Yf(this);var a,b,c,d,g,h,k=this;switch(this.ta.Wi){case "failed":this.f=this.a.sk.Ou;break;case "level":this.f=this.a.sk.Ru;break;case "difficulty":this.f=this.a.sk.Ch;break;case "endless":this.f=this.a.sk.cu}this.c=new Zf(this.depth-10,this.ua,new y(this.f.width,this.f.height));this.c.x=
M.b.g(this.a.Db,this.canvas.width,this.f.width);this.c.y=M.b.g(this.a.Eb,this.canvas.height,this.f.height);z(this.c.f);this.f.q(0,0,0);!this.sc&&this.Ac&&(b=M.b.g(this.a.Zn,this.canvas.width,0)-this.c.x,a=M.b.g(this.a.$n,this.canvas.height,s_star01_fill.height)-this.c.y+Math.round(s_star01_empty.height/2),s_star01_empty.q(0,b,a),b=M.b.g(this.a.ao,this.canvas.width,0)-this.c.x,a=M.b.g(this.a.bo,this.canvas.height,s_star02_fill.height)-this.c.y+Math.round(s_star02_empty.height/2),s_star02_empty.q(0,
b,a),b=M.b.g(this.a.co,this.canvas.width,0)-this.c.x,a=M.b.g(this.a.eo,this.canvas.height,s_star03_fill.height)-this.c.y+Math.round(s_star03_empty.height/2),s_star03_empty.q(0,b,a));void 0!==this.ta.ui&&Pf(this,this.ta.ui);void 0!==this.ta.os&&Qf(this,this.ta.os);this.ib={};void 0!==this.pa.gd?(c=this.pa.gd,c.visible&&Uf(this,c),this.ib[c.id]=c):void 0!==this.ta.om&&Vf(this,this.ta.om);if(void 0!==this.pa.ib)for(a=this.pa.ib.length,b=R.K(),C(b,this.a.qi),c=R.K(),C(c,this.a.Bf),b=Math.max(b.U("g"),
c.U("g"))*a+this.a.Uc*(a-1),this.Vc=M.b.g(this.a.Cf,this.canvas.height,b)-this.c.y,b=0;b<a;b++)c=this.pa.ib[b],c.visible&&Rf(this,this.pa.ib[b],1<a),this.ib[c.id]=c;else if(void 0!==this.ta.we)if("string"===typeof this.ta.we)Tf(this,this.ta.we,this.a.eq);else if(this.ta.we instanceof Array)for(a=this.ta.we.length,b=R.K(),C(b,this.a.qi),c=R.K(),C(c,this.a.Bf),b=Math.max(b.U("g"),c.U("g"))*a+this.a.Uc*(a-1),this.Vc=M.b.g(this.a.Cf,this.canvas.height,b)-this.c.y,b=0;b<a;b++)Tf(this,this.ta.we[b],1<a||
this.a.eq);B(this.c.f);Wf(this,this.ta.Ti);Xf(this,this.ta.xj);M.e.Vs&&(b=M.b.g(k.a.Eu,k.canvas.width,k.a.Eq)-this.c.x,a=M.b.g(this.a.Fu,this.canvas.height,this.a.Ve)-this.c.y,this.Dq=new xf("default_text",b,a,k.depth-20,"levelEndScreenViewHighscoreBtn",k.a.Eq,{T:function(){void 0!==$f?M.s.Pc(M.v.Oj.url+"submit/"+$f+"/"+k.pa.totalScore):M.s.Pc(M.v.Oj.url+"submit/")},Pb:!0},k.c),this.buttons.push(this.Dq),b=function(a){a&&(k.Dq.Bo("levelEndScreenSubmitHighscoreBtn"),k.Oy=a)},ag(this.pa.totalScore,
b));b=M.b.g(this.a.wh,this.canvas.width,this.a.Zf)-this.c.x;a=M.b.g(this.a.$f,this.canvas.height,this.a.Ve)-this.c.y;this.buttons.push(new X(b,a,this.depth-20,new Sb(0,0,this.a.Zf,this.a.Ve),void 0,function(){k.ce="exit";Mf(k)},this.c));for(b=0;b<this.buttons.length;b++)this.buttons[b].Pa=!1;this.c.y=-this.c.height;a=this.a.ex;this.Ha.sa(a,this.Nw);a+=this.a.nh;g=0;d=this.a.rx;this.Ac&&(d=Math.max(d,this.a.$r+this.a.Zr*this.pa.stars));if(this.Mf&&(this.Ha.sa(a+this.a.dl,function(a,b){bg(b.parent.Mf,
b.parent.pa.totalScore,d)}),g=a+this.a.dl+d,0<this.Re.length)){h=function(a,b){var c=b.parent,d=c.Re[c.Xf];bg(c.Mf,c.Mf.value+d.value,c.a.Wf);bg(d,0,c.a.Wf);c.Xf+=1};for(b=0;b<this.Re.length;b++)g+=this.a.tp,this.Ha.sa(g,h);g+=this.a.Wf}if(void 0!==this.ib&&(g=a,h=function(a,b){var c=b.parent,d=c.jo[c.Xf||0],g=c.ib[d.Uk];void 0!==d.Fe&&(g.visible&&g.$d?bg(g.zh,d.Fe(g.zh.value),c.a.Wf):g.rc=d.Fe(g.rc));d.visible&&d.$d&&bg(d.zh,d.rc,c.a.Wf);c.Xf+=1},this.jo=[],void 0!==this.pa.gd&&void 0!==this.pa.gd.Fe&&
(this.Ha.sa(a+this.a.dl,h),this.jo.push(this.pa.gd),g+=this.a.dl+bonusCounterDuration),void 0!==this.pa.ib))for(b=0;b<this.pa.ib.length;b++)c=this.pa.ib[b],void 0!==c.Fe&&(g+=this.a.tp,this.Ha.sa(g,h),this.jo.push(c),g+=this.a.Wf);if(this.Ac){for(b=0;b<this.pa.stars;b++)a+=this.a.Zr,this.Ha.sa(a,this.Pw),this.Ha.sa(a,this.Qw);a+=this.a.$r}a=Math.max(a,g);this.vg&&(a+=this.a.mv,this.Ha.sa(a,this.Mw),this.Ha.sa(a,this.Kw),this.Ha.sa(a+this.a.nv,this.Lw));this.Ha.sa(a+this.a.Dv,M.s.Iu);this.Ha.start();
this.sc?F.play(Ge):F.play(Be)};e.ra=function(a){this.alpha=this.a.tj*this.Gl/this.a.Xb;this.Gl+=a;this.alpha>=this.a.tj&&(this.alpha=this.a.tj,this.i=!1);this.canvas.$=!0};
e.Nw=function(a,b){function c(){var a;for(a=0;a<d.buttons.length;a++)d.buttons[a].Pa=!0}var d=b.parent,g,h;switch(d.a.Kx){case "fromLeft":h="horizontal";g=M.b.g(d.a.Db,d.canvas.width,d.c.width);d.c.x=-d.c.width;d.c.y=M.b.g(d.a.Eb,d.canvas.height,d.c.height)+Math.abs(M.ca);break;case "fromRight":h="horizontal";g=M.b.g(d.a.Db,d.canvas.width,d.c.width);d.c.x=d.canvas.width;d.c.y=M.b.g(this.parent.a.Eb,d.canvas.height,selft.c.height)+Math.abs(M.ca);break;case "fromBottom":h="vertical";g=M.b.g(d.a.Eb,
d.canvas.height,d.c.height)+Math.abs(M.ca);d.c.x=M.b.g(d.a.Db,d.canvas.width,d.c.width);d.c.y=d.canvas.height+d.c.height;break;default:h="vertical",g=M.b.g(d.a.Eb,d.canvas.height,d.c.height)+Math.abs(M.ca),d.c.x=M.b.g(d.a.Db,d.canvas.width,d.c.width),d.c.y=-d.c.height}"vertical"===h?Y(d.c,"y",g,d.a.nh,d.a.Hl,c):Y(d.c,"x",g,d.a.nh,d.a.Hl,c)};
function Of(a){function b(){I(G,a);a.ea?a.T.call(a.ea,a.ce):a.T(a.ce)}var c,d;switch(a.a.Lx){case "toLeft":d="horizontal";c=-a.c.width;break;case "toRight":d="horizontal";c=a.canvas.width;break;case "toBottom":d="vertical";c=a.canvas.height+a.c.height;break;default:d="vertical",c=-a.c.height}"vertical"===d?Y(a.c,"y",c,a.a.Il,a.a.Jl,b):Y(a.c,"x",c,a.a.Il,a.a.Jl,b)}
e.Pw=function(a,b){var c,d=b.parent,g=Math.abs(M.ca);if(d.G.length<d.pa.stars){switch(d.G.length+1){case 1:c=new Zf(d.depth-30,M.Gd,s_star01_fill);c.x=M.b.g(d.a.Zn,d.canvas.width,0);c.y=M.b.g(d.a.$n,d.canvas.height,s_star01_fill.height)+g+Math.round(s_star01_empty.height/2);break;case 2:c=new Zf(d.depth-30,M.Gd,s_star02_fill);c.x=M.b.g(d.a.ao,d.canvas.width,0);c.y=M.b.g(d.a.bo,d.canvas.height,s_star02_fill.height)+g+Math.round(s_star02_empty.height/2);break;case 3:c=new Zf(d.depth-30,M.Gd,s_star03_fill),
c.x=M.b.g(d.a.co,d.canvas.width,0),c.y=M.b.g(d.a.eo,d.canvas.height,s_star03_fill.height)+g+Math.round(s_star03_empty.height/2)}c.xa=d.a.as;c.ya=d.a.as;c.alpha=d.a.Hw;Y(c,"scale",1,d.a.Gw,gc,function(){var a=d.G.length,b,c,n;z(d.c.f);switch(a){case 1:n=s_star01_fill;b=M.b.g(d.a.Zn,d.canvas.width,0)-d.c.x;c=M.b.g(d.a.$n,d.canvas.height,s_star01_fill.height)-d.c.y+g+Math.round(s_star01_empty.height/2);break;case 2:n=s_star02_fill;b=M.b.g(d.a.ao,d.canvas.width,0)-d.c.x;c=M.b.g(d.a.bo,d.canvas.height,
s_star01_fill.height)-d.c.y+g+Math.round(s_star02_empty.height/2);break;case 3:n=s_star03_fill,b=M.b.g(d.a.co,d.canvas.width,0)-d.c.x,c=M.b.g(d.a.eo,d.canvas.height,s_star01_fill.height)-d.c.y+g+Math.round(s_star03_empty.height/2)}n.q(0,b,c);B(d.c.f);d.c.uc=!0;I(G,d.G[a-1])});Y(c,"alpha",1,d.a.Fw,$b);d.G.push(c);F.play(d.Dw[d.G.length-1])}};
e.Qw=function(a,b){var c=b.parent,d,g;d=c.G[c.zf.length];g=new Zf(c.depth-50,M.Gd,s_sfx_star);g.x=d.x;g.y=d.y;Y(g,"subImage",s_sfx_star.J-1,c.a.Ew,void 0,function(){I(G,g)});c.zf.push(g)};
e.Kw=function(a,b){var c=b.parent,d,g,h,k,l,n,q;d=[];h=R.K();k=M.l.M("levelEndScreenMedal","<LEVELENDSCREENMEDAL>");c.a.rr&&C(h,c.a.rr);g=Oa(h,k,c.a.ck,c.a.tv,!0);g<h.fontSize&&D(h,g);l=M.b.ma(c.a.uv,Gc.width,h.ba(k,c.a.ck),h.align);n=M.b.ma(c.a.vv,Gc.height,h.U(k,c.a.ck),h.h);for(q=0;q<Gc.J;q++)g=new y(Gc.width,Gc.height),z(g),Gc.q(q,0,0),h.q(k,l,n,c.a.ck),B(g),d.push(g);c.Ea=new Zf(c.depth-120,M.Gd,d);c.Ea.Qc=c.a.or;c.Ea.Rc=c.a.pr;c.Ea.x=M.b.g({align:"center"},c.c.canvas.width,c.Ea.width)-c.c.x;
c.Ea.y=M.b.g(c.a.dk,c.Ea.canvas.height,c.Ea.height)-c.c.y+Math.abs(M.ca);l=M.b.g(c.a.on,c.Ea.canvas.width,c.Ea.width)-c.c.x;c.Ea.xa=c.a.bk;c.Ea.ya=c.a.bk;c.Ea.parent=c.c;c.Ea.alpha=0;c.Ea.$x=!0;Y(c.Ea,"scale",1,c.a.ng,$b,function(){I(G,c.Za);c.Za=void 0});Y(c.Ea,"x",l,c.a.ng,$b);Y(c.Ea,"alpha",1,0,$b);Y(c.Ea,"subImage",Gc.J,c.a.rv,$b,void 0,c.a.ng+c.a.nr+c.a.qv,!0,c.a.sv)};
e.Mw=function(a,b){var c,d=b.parent;d.Za=new Zf(d.depth-110,M.Gd,Fc);d.Za.y=M.b.g(d.a.dk,d.Za.canvas.height,Fc.height)-d.c.y+d.a.pv;d.Za.Qc=d.a.or;d.Za.Rc=d.a.pr;d.Za.x=M.b.g(d.a.on,d.Za.canvas.width,d.Za.width)-d.c.x;c=M.b.g(d.a.dk,d.Za.canvas.height,Fc.height)-d.c.y+Math.abs(M.ca);d.Za.xa=d.a.bk*d.a.qr;d.Za.ya=d.a.bk*d.a.qr;d.Za.alpha=0;d.Za.parent=d.c;Y(d.Za,"y",c,d.a.ng,$b);Y(d.Za,"scale",1,d.a.ng,$b);Y(d.Za,"alpha",1,d.a.ng,$b)};
e.Lw=function(a,b){var c=b.parent;c.ne=new Zf(c.depth-130,M.Gd,Ec);c.ne.parent=c.c;c.ne.x=c.Ea.x;c.ne.y=c.Ea.y+c.a.ov;Y(c.ne,"subImage",Ec.J-1,c.a.nr,void 0,function(){I(G,c.ne);c.ne=void 0});F.play(Je)};
e.Zb=function(){var a;for(a=0;a<this.buttons.length;a++)I(G,this.buttons[a]);for(a=0;a<this.G.length;a++)I(G,this.G[a]);for(a=0;a<this.zf.length;a++)I(G,this.zf[a]);this.Ea&&(I(G,this.Ea),this.ne&&I(G,this.ne),this.Za&&I(G,this.Za));I(G,this.c);this.Ha&&this.Ha.stop();this.Mf&&I(G,this.Mf);for(a=0;a<this.Re.length;a++)I(G,this.Re[a]);cg()};e.Xa=function(){var a=w.context.globalAlpha;w.context.globalAlpha=this.alpha;qa(0,0,w.canvas.width,w.canvas.height,this.a.Zp,!1);w.context.globalAlpha=a};
function dg(a,b,c,d){this.depth=-100;this.visible=!1;this.i=!0;M.b.Ua(this,M.Yb);var g,h;this.a=c?M.a.u.yr:M.a.u.options;if("landscape"===M.orientation)for(g in h=c?M.a.u.wz:M.a.u.Qv,h)this.a[g]=h[g];this.Wb=M.a.u.Kb;h=c?M.a.O.yr:M.a.O.options;for(g in h)this.a[g]=h[g];if(M.v.options&&M.v.options.buttons)for(g in M.v.options.buttons)this.a.buttons[g]=M.v.options.buttons[g];this.type=a;this.vx=b;this.Kc=c;this.Qk=!1!==d;H(this)}e=dg.prototype;
e.mh=function(a,b,c,d,g){var h=void 0,k=void 0,l=void 0,n=void 0,q=void 0,v=void 0;switch(a){case "music":h="music_toggle";n=this.Ks;l=M.e.qe()?"on":"off";break;case "music_big":h="music_big_toggle";n=this.Ks;l=M.e.qe()?"on":"off";break;case "sfx_big":h="sfx_big_toggle";n=this.Ls;l=M.e.Ek()?"on":"off";break;case "sfx":h="sfx_toggle";n=this.Ls;l=M.e.Ek()?"on":"off";break;case "language":h="language_toggle";n=this.Js;l=M.e.language();break;case "tutorial":h="default_text";k="optionsTutorial";n=this.mi;
break;case "highScores":h="default_text";k="optionsHighScore";n=this.Pr;this.Wl=this.ww;break;case "moreGames":void 0!==M.v.Cv?(h="default_image",v=M.v.Cv):(h="default_text",k="optionsMoreGames");n=this.xw;q=!0;break;case "resume":h="default_text";k="optionsResume";n=this.close;break;case "exit":h="default_text";k="optionsExit";n=M.qg.customFunctions&&"function"===typeof M.qg.customFunctions.exit?M.qg.customFunctions.exit:function(){};break;case "quit":h="default_text";k="optionsQuit";n=this.jw;break;
case "restart":h="default_text";k="optionsRestart";n=this.ow;break;case "startScreen":h="default_text";k="optionsStartScreen";n=this.Pr;this.Wl=this.zw;break;case "about":h="default_text";k="optionsAbout";n=this.uw;break;case "forfeitChallenge":h="default_text";k="optionsChallengeForfeit";n=this.Kh;break;case "cancelChallenge":h="default_text",k="optionsChallengeCancel",n=this.uh}void 0!==h&&void 0!==n&&("image"===this.Wb[h].type?this.buttons.push(new eg(h,b,c,this.depth-20,v,d,{T:n,ea:this,Pb:q},
this.c)):"toggleText"===this.Wb[h].type?this.buttons.push(new tf(h,b,c,this.depth-20,l,d,{T:n,ea:this,Pb:q},this.c)):"text"===this.Wb[h].type?this.buttons.push(new xf(h,b,c,this.depth-20,k,d,{T:n,ea:this,Pb:q},this.c)):"toggle"===this.Wb[h].type&&this.buttons.push(new fg(h,b,c,this.depth-20,l,{T:n,ea:this,Pb:q},this.c)),this.buttons[this.buttons.length-1].Pa=g||!1)};
e.Pr=function(){var a=this;Y(a.c,"y","inGame"!==this.type?-this.c.f.height:this.canvas.height,this.a.ok,this.a.pk,function(){I(G,a);void 0!==a.Wl&&a.Wl.call(a)});return!0};
e.Ca=function(a,b){var c,d,g,h;z(this.c.f);w.clear();this.a.backgroundImage.q(0,0,0);c=M.l.M("optionsTitle","<OPTIONS_TITLE>");d=R.K();this.a.Fc&&C(d,this.a.Fc);void 0!==this.a.td&&void 0!==this.a.De&&(g=Oa(d,c,this.a.td,this.a.De,this.a.td),d.fontSize>g&&D(d,g));g=M.b.ma(this.a.Kf,this.canvas.width,d.ba(c),d.align)-a;h=M.b.ma(this.a.Xc,this.canvas.height,d.U(c,d.h))-b+-1*M.ca;d.q(c,g,h);B(this.c.f)};
e.Ne=function(a,b,c){var d,g,h,k,l,n,q;h=!1;var v=this.a.buttons[this.type];"inGame"===this.type&&M.a.j.dg.tr&&(v=M.a.j.dg.tr);if("function"!==typeof gg())for(d=0;d<v.length;d++){if("string"===typeof v[d]&&"moreGames"===v[d]){v.splice(d,1);break}for(g=0;g<v[d].length;g++)if("moreGames"===v[d][g]){v[d].splice(g,1);break}}if(!1===M.v.qe||!1===M.e.Xj)for(d=0;d<v.length;d++)if(v[d]instanceof Array){for(g=0;g<v[d].length;g++)if("music"===v[d][g]){M.e.Yj?v[d]="sfx_big":v.splice(d,1);h=!0;break}if(h)break}else if("music_big"===
v[d]){v.splice(d,1);break}if(!M.e.Yj)for(d=0;d<v.length;d++)if(v[d]instanceof Array){for(g=0;g<v[d].length;g++)if("sfx"===v[d][g]){!1!==M.v.qe&&M.e.Xj?v[d]="music_big":v.splice(d,1);h=!0;break}if(h)break}else if("sfx_big"===v[d]){v.splice(d,1);break}if(1===M.l.ru().length)for(d=0;d<v.length;d++)if("language"===v[d]){v.splice(d,1);break}h=this.Wb.default_text.r.height;k=this.a.cj;a=M.b.g(this.a.bj,this.canvas.width,k)-a;n=M.b.g(this.a.sh,this.c.f.height,h*v.length+this.a.bd*(v.length-1))-b+-1*M.ca;
for(d=0;d<v.length;d++){l=a;q=k;if("string"===typeof v[d])this.mh(v[d],l,n,q,c);else for(b=v[d],q=(k-(b.length-1)*this.a.bd)/b.length,g=0;g<b.length;g++)this.mh(b[g],l,n,q,c),l+=q+this.a.bd;n+=h+this.a.bd}};e.Ks=function(a){var b=!0;"off"===a?(b=!1,M.za.Na("off","options:music")):M.za.Na("on","options:music");M.e.qe(b);return!0};e.Ls=function(a){var b=!0;"off"===a?(b=!1,M.za.Na("off","options:sfx")):M.za.Na("on","options:sfx");M.e.Ek(b);return!0};
e.Js=function(a){M.l.Rr(a);M.za.Na(a,"options:language");return!0};
e.mi=function(){function a(){l.ic+=1;l.mi();return!0}function b(){l.ic-=1;l.mi();return!0}function c(){var a;l.Ca(n,q);l.Ue.Pa=!0;for(a=0;a<l.buttons.length;a++)I(G,l.buttons[a]);l.buttons=[];l.Ne(n,q,!0)}var d,g,h,k,l=this,n=M.b.g(l.a.Db,l.canvas.width,l.a.backgroundImage.width),q=M.b.g(l.a.Eb,l.canvas.height,l.a.backgroundImage.height)+-1*M.ca;void 0===l.ic&&(l.ic=0);l.wi=void 0!==M.j.pq?M.j.pq():[];M.za.Na((10>l.ic?"0":"")+l.ic,"options:tutorial");for(d=0;d<l.buttons.length;d++)I(G,l.buttons[d]);
l.buttons=[];this.Kc?(z(l.c.f),w.clear(),l.Ue.Pa=!1):l.Ca(n,q);z(l.c.f);void 0!==l.a.Yc&&(d=M.b.g(l.a.fl,l.c.f.width,l.a.Yc.width),g=M.b.g(l.a.Ee,l.c.f.height,l.a.Yc.height),l.a.Yc.q(0,d,g));k=l.wi[l.ic].title;void 0!==k&&""!==k&&(h=R.K(),l.a.hl&&C(h,l.a.hl),d=Oa(h,k,l.a.il,l.a.yo,l.a.il),h.fontSize>d&&D(h,d),d=M.b.ma(l.a.Ts,l.c.f.width,h.ba(k,l.a.il),h.align),g=M.b.ma(l.a.zo,l.c.f.height,h.U(k,l.a.yo),h.h),h.q(k,d,g));l.ic<l.wi.length&&(h=l.wi[l.ic].f,d=M.b.g(l.a.Qs,l.c.f.width,h.width),g=M.b.g(l.a.wo,
l.c.f.height,h.height),h.q(0,d,g),k=l.wi[l.ic].text,h=R.K(),l.a.gl&&C(h,l.a.gl),d=Oa(h,k,l.a.Jg,l.a.Rs,l.a.Jg),h.fontSize>d&&D(h,d),d=M.b.ma(l.a.Ss,l.c.f.width,h.ba(k,l.a.Jg),h.align),g=M.b.ma(l.a.xo,l.c.f.height,h.U(k,l.a.Jg),h.h),h.q(k,d,g,l.a.Jg));B(l.c.f);h=Yc;d=M.b.g(l.a.Ps,l.canvas.width,h.width)-l.c.x;g=M.b.g(l.a.vo,l.canvas.height,h.height)-l.c.y-M.ca;0<=l.ic-1?l.buttons.push(new X(d,g,l.depth-20,new Tb(h),[h],{T:b,ea:l},l.c)):(h=Wc,l.buttons.push(new X(d,g,l.depth-20,new Tb(h),[h],{T:c,ea:l},
l.c)));h=Xc;d=M.b.g(this.a.Os,l.canvas.width,h.width)-l.c.x;g=M.b.g(this.a.uo,l.canvas.height,h.height)-l.c.y-M.ca;l.ic+1<l.wi.length?l.buttons.push(new X(d,g,l.depth-20,new Tb(h),[h],{T:a,ea:l},l.c)):(h=Wc,l.buttons.push(new X(d,g,l.depth-20,new Tb(h),[h],{T:c,ea:l},l.c)));return!0};
e.uw=function(){function a(a,b,c,g,h,k){var l;l=R.K();b&&C(l,b);b=Oa(l,a,h,k,h);l.fontSize>b&&D(l,b);c=M.b.ma(c,d.c.f.width,l.ba(a,h),l.align);g=M.b.ma(g,d.c.f.height,l.U(a,k),l.h);l.q(a,c,g,h);return g+k}function b(a,b,c){b=M.b.g(b,d.c.f.width,a.width);c=M.b.g(c,d.c.f.height,a.height);a.q(0,b,c);return c+a.height}var c,d=this,g=M.b.g(d.a.Db,d.canvas.width,d.a.backgroundImage.width),h=M.b.g(d.a.Eb,d.canvas.height,d.a.backgroundImage.height)+-1*M.ca;M.za.Na("about","options");for(c=0;c<d.buttons.length;c++)I(G,
d.buttons[c]);d.buttons=[];this.Kc?(z(d.c.f),w.clear(),d.Ue.Pa=!1):d.Ca(g,h);z(d.c.f);void 0!==d.a.Yc&&b(d.a.Yc,d.a.fl,d.a.Ee);var k=null;"function"===typeof M.s.Xt?k=M.s.Xt(d.a,a,b,d.c.f):(c=M.l.M("optionsAbout_header","<OPTIONSABOUT_HEADER>"),a(c,d.a.Xo,d.a.$o,d.a.Bl,d.a.Zo,d.a.Yo),b($c,d.a.Cl,d.a.Oi),c=M.l.M("optionsAbout_text","<OPTIONSABOUT_TEXT>"),a(c,d.a.ap,d.a.Dl,d.a.lh,d.a.Pi,d.a.kh));a(M.l.M("optionsAbout_version","<OPTIONSABOUT_VERSION>")+" "+ff()+("big"===M.size?"b":"s"),d.a.El,d.a.dp,
d.a.Fl,d.a.cp,d.a.bp);B(d.c.f);if(k)for(c=0;c<k.length;++c){var l=k[c];d.buttons.push(new X(l.x,l.y,d.depth-10,Sb(0,0,l.width,l.height),null,{T:function(a){return function(){M.s.Pc(a)}}(l.url),Pb:!0},d.c))}else void 0!==M.v.Gq&&(c=M.b.g(d.a.Cl,d.c.f.width,$c.width),k=M.b.g(d.a.Oi,d.c.f.height,$c.height),c=Math.min(c,M.b.g(d.a.Dl,d.c.f.width,d.a.Pi)),k=Math.min(k,M.b.g(d.a.lh,d.c.f.height,d.a.kh)),l=Math.max(d.a.Pi,$c.width),d.buttons.push(new X(c,k,d.depth-10,Sb(0,0,l,M.b.g(d.a.lh,d.c.f.height,d.a.kh)+
d.a.kh-k),null,{T:function(){M.s.Pc(M.v.Gq)},Pb:!0},d.c)));d.buttons.push(new xf("default_text",M.b.g(d.a.Al,d.c.f.width,d.a.jh),d.a.Ni,d.depth-20,"optionsAbout_backBtn",d.a.jh,{T:function(){var a;d.Ca(g,h);d.Ue.Pa=!0;for(a=0;a<d.buttons.length;a++)I(G,d.buttons[a]);d.buttons=[];d.Ne(g,h,!0);d.Ur=!1},ea:d},d.c));return this.Ur=!0};
function hg(a){var b,c,d,g,h,k=M.b.g(a.a.Db,a.canvas.width,a.a.backgroundImage.width),l=M.b.g(a.a.Eb,a.canvas.height,a.a.backgroundImage.height)+-1*M.ca;M.za.Na("versions","options");for(b=0;b<a.buttons.length;b++)I(G,a.buttons[b]);a.buttons=[];a.Ca(k,l);z(a.c.f);void 0!==a.a.Yc&&a.a.Yc.q(0,M.b.g(a.a.fl,a.c.width,a.a.Yc.width),M.b.g(a.a.Ee,a.c.height,a.a.Yc.height));h=R.K();C(h,a.a.El);Ha(h,"left");c=a.a.ct;d=a.a.dt;for(b in M.version)g=b+": "+M.version[b],h.q(g,c,d),d+=h.U(g)+a.a.bt;c=M.b.g(a.a.Al,
a.c.f.width,a.a.jh);d=a.a.Ni;a.buttons.push(new xf("default_text",c,d,a.depth-20,"optionsAbout_backBtn",a.a.jh,{T:function(){var b;a.Ca(k,l);for(b=0;b<a.buttons.length;b++)I(G,a.buttons[b]);a.buttons=[];a.Ne(k,l,!0)},ea:a},a.c))}e.ww=function(){return!0};e.xw=function(){M.za.Na("moreGames","options");var a=gg();"function"===typeof a&&a();return!0};
e.jw=function(){var a=this;ig(this,"optionsQuitConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){M.za.Na("confirm_yes","options:quit");I(G,a);kf(M.za,M.e.If,jg(M.e),"progression:levelQuit:"+kg());lg();mg(M.e);return!0})};
e.ow=function(){var a=this;ig(this,"optionsRestartConfirmationText","optionsQuitConfirmBtn_Yes","optionsQuitConfirmBtn_No",function(){M.za.Na("confirm_yes","options:restart");I(G,a);var b=M.e;b.state="LEVEL_END";kf(M.za,M.e.If,jg(M.e),"progression:levelRestart:"+kg());b=M.m.Ai?b.nb+1:Ef(b)+1;M.e.fa=!0;M.e.Tq="retry";ng(M.e,!0);b={failed:!0,level:b};M.s.Ph(b);M.yd.Ph(b);return!0})};
e.Kh=function(){var a,b=this;a=function(a){var d=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error";og(b,M.l.M(d,"<"+d.toUpperCase()+">"));a&&(b.Ue.Pa=!1,b.Qk||Yf())};ig(this,"challengeForfeitConfirmText","challengeForfeitConfirmBtn_yes","challengeForfeitConfirmBtn_no",function(){M.e.Kh(a);return!0})};
e.uh=function(){var a,b=this;a=function(a){var d=a?"challengeCancelMessage_success":"challengeCancel_error";og(b,M.l.M(d,"<"+d.toUpperCase()+">"));a&&(b.Ue.Pa=!1,b.Qk||Yf())};ig(this,"challengeCancelConfirmText","challengeCancelConfirmBtn_yes","challengeCancelConfirmBtn_no",function(){M.e.uh(a);return!0})};
function ig(a,b,c,d,g){var h,k,l,n;for(h=0;h<a.buttons.length;h++)I(G,a.buttons[h]);a.buttons=[];b=M.l.M(b,"<"+b.toUpperCase()+">");h=R.K();a.a.Fp?C(h,a.a.Fp):a.a.Ik&&C(h,a.a.Ik);k=Oa(h,b,a.a.hj,a.a.cm,!0);k<h.fontSize&&D(h,k);n=h.ba(b,a.a.hj)+10;l=h.U(b,a.a.hj)+10;k=M.b.ma(a.a.Gp,a.c.f.width,n,h.align);l=M.b.ma(a.a.dm,a.c.f.height,l,h.h);z(a.c.f);h.q(b,k,l,n);B(a.c.f);k=M.b.g(a.a.Dp,a.canvas.width,a.a.yh)-a.c.x;l=M.b.g(a.a.am,a.canvas.height,a.Wb.default_text.r.height)-a.c.y-M.ca;a.buttons.push(new xf("default_text",
k,l,a.depth-20,d,a.a.yh,{T:function(){var b,c,d;c=M.b.g(a.a.Db,a.canvas.width,a.a.backgroundImage.width);d=M.b.g(a.a.Eb,a.canvas.height,a.a.backgroundImage.height)+-1*M.ca;a.Ca(c,d);for(b=0;b<a.buttons.length;b++)I(G,a.buttons[b]);a.buttons=[];a.Ne(c,d,!0);return!0},ea:a},a.c));k=M.b.g(a.a.Ep,a.canvas.width,a.a.yh)-a.c.x;l=M.b.g(a.a.bm,a.canvas.height,a.Wb.default_text.r.height)-a.c.y-M.ca;a.buttons.push(new xf("default_text",k,l,a.depth-20,c,a.a.yh,{T:function(){return"function"===typeof g?g():!0},
ea:a},a.c))}function og(a,b){var c,d,g,h;for(c=0;c<a.buttons.length;c++)I(G,a.buttons[c]);a.buttons=[];d=M.b.g(a.a.Db,a.canvas.width,a.a.backgroundImage.width);g=M.b.g(a.a.Eb,a.canvas.height,a.a.backgroundImage.height)+-1*M.ca;a.Ca(d,g);c=R.K();a.a.rn&&C(c,a.a.rn);d=Oa(c,b,a.a.sn,a.a.yv,!0);d<c.fontSize&&D(c,d);h=c.ba(b,a.a.sn)+10;g=c.U(b,a.a.sn)+10;d=M.b.ma(a.a.zv,a.c.f.width,h,c.align);g=M.b.ma(a.a.Av,a.c.f.height,g,c.h);z(a.c.f);c.q(b,d,g,h);B(a.c.f)}
e.zw=function(){M.za.Na("startScreen","options");mg(M.e);return!0};e.close=function(){I(G,this);return this.canvas.$=!0};
e.dc=function(){var a,b;this.Qk&&Yf(this);M.e.Me=this;this.cq=this.bq=!1;a=this.a.backgroundImage;this.c=new Zf(this.depth-10,this.ua,new y(a.width,a.height));this.c.x=M.b.g(this.a.Db,this.canvas.width,a.width);a=M.b.g(this.a.Eb,this.canvas.height,a.height)+-1*M.ca;this.c.y=a;this.Ca(this.c.x,this.c.y);this.buttons=[];this.vx?this.mi():this.Ne(this.c.x,this.c.y);this.Ue=new X(this.a.wh,this.a.$f,this.depth-20,new Sb(0,0,this.a.Zf,this.a.Ve),void 0,{T:this.close,ea:this},this.c);this.Lg="versions";
this.Oe=new Wb;M.b.Ua(this.Oe,M.Yb);Mb(this.Oe,this.depth-1);Xb(this.Oe,"keyAreaLeft",this.c.x,this.c.y+this.a.Ee,this.a.Tf,this.a.Qi,76);Xb(this.Oe,"keyAreaRight",this.c.x+this.c.width-this.a.Tf,this.c.y+this.a.Ee,this.a.Tf,this.a.Qi,82);Xb(this.Oe,"keyAreaCentre",M.fv/2-this.a.Tf/2,this.c.y+this.a.Ee,this.a.Tf,this.a.Qi,67);b=this;this.c.y="inGame"!==this.type?this.canvas.height:-this.c.f.height;Y(this.c,"y",a,this.a.ci,this.a.di,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].Pa=!0})};
e.Zb=function(){var a;this.Qk&&cg();this.bq&&la(M.kf,M.l.Mm());this.cq&&la(M.te);for(a=0;a<this.buttons.length;a++)I(G,this.buttons[a]);this.Oe.clear();I(G,this.Oe);I(G,this.Ue);I(G,this.c);M.e.Me=null};e.Cb=function(){return!0};e.rb=function(){return!0};e.kg=function(a){this.Ur&&(67===a?this.Lg="":76===a?this.Lg+="l":82===a&&(this.Lg+="r"),"lrl"===this.Lg&&hg(this))};e.Oc=function(a){a===M.kf?(this.Ca(this.c.x,this.c.y),this.bq=!0):a===M.te?this.cq=!0:a===M.zt&&this.close()};
function pg(){this.depth=-200;this.i=this.visible=!0;M.b.Ua(this,M.bf);var a;this.a=M.a.u.Aj;if("landscape"===M.orientation&&M.a.u.Am)for(a in M.a.u.Am)this.a[a]=M.a.u.Am[a];this.Wb=M.a.u.Kb;for(a in M.a.O.Aj)this.a[a]=M.a.O.Aj[a];H(this)}
pg.prototype.Ca=function(){var a,b,c,d;c=this.a.backgroundImage;d=(M.cv-Math.abs(M.ca))/c.ag;this.c.f=new y(d*c.xh,d*c.ag);z(this.c.f);this.c.y=Math.abs(M.ca);a=w.context;1E-4>Math.abs(d)||1E-4>Math.abs(d)||(a.save(),a.translate(0,0),a.rotate(-0*Math.PI/180),a.scale(d,d),a.globalAlpha=1,ua(c,0,0),a.restore());c=R.K();C(c,this.a.font);d=M.l.M("gameEndScreenTitle","<GAMEENDSCREENTITLE>");a=Oa(c,d,this.a.$k-(c.stroke?c.Cc:0),this.a.dx-(c.stroke?c.Cc:0),!0);a<c.fontSize&&D(c,a);a=M.b.ma(this.a.As,this.canvas.width,
c.ba(d),c.align);b=M.b.ma(this.a.Bs,this.canvas.height,c.U(d),c.h);c.q(d,a,b,this.a.$k);B(this.c.f);this.c.canvas.$=!0};pg.prototype.dc=function(){var a=this,b=this.a.backgroundImage,b=new y(b.width,b.height);this.c=new Zf(this.depth,M.Yb,b);this.c.x=0;this.c.y=Math.abs(M.ca);this.Ca();this.button=new xf(this.a.up,M.b.g(this.a.Jt,this.canvas.width,this.a.vp),M.b.g(this.a.wp,this.canvas.height,this.Wb[this.a.up].r.height),this.depth-10,"gameEndScreenBtnText",this.a.vp,function(){I(G,a);mg(M.e)},this.c)};
pg.prototype.Zb=function(){I(G,this.c);I(G,this.button)};pg.prototype.Oc=function(a){a!==M.kf&&a!==M.te||this.Ca()};
function X(a,b,c,d,g,h,k){function l(a,b,c){var d,g;g=M.b.Lm(q.canvas);a=Math.round(q.x+q.parent.x-q.Qc*q.xa);d=Math.round(q.y+q.parent.y-q.Rc*q.ya);if(q.images&&0<q.hf||0<q.ri)q.hf=0,q.ri=0,q.canvas.$=!0;if(q.ji&&q.Pa&&Ub(q.xc,a,d,b-g.x,c-g.y))return q.ji=!1,void 0!==q.ea?q.mk.call(q.ea,q):q.mk(q)}function n(a,b,c){var d,g,h;h=M.b.Lm(q.canvas);d=Math.round(q.x+q.parent.x-q.Qc*q.xa);g=Math.round(q.y+q.parent.y-q.Rc*q.ya);if(q.Pa&&Ub(q.xc,d,g,b-h.x,c-h.y))return q.ji=!0,q.images&&(1<q.images.length?
(q.hf=1,q.canvas.$=!0):1<q.images[0].J&&(q.ri=1,q.canvas.$=!0)),void 0!==typeof Ce&&F.play(Ce),q.$e=a,!0}this.depth=c;this.i=this.visible=!0;this.group="TG_Token";M.b.Ua(this,M.Yb);this.Rc=this.Qc=0;this.x=a;this.y=b;this.width=g?g[0].width:d.Sa-d.Aa;this.height=g?g[0].height:d.mb-d.Ma;this.alpha=this.ya=this.xa=1;this.La=0;this.xc=d;this.images=g;this.ri=this.hf=0;this.ji=!1;this.Pa=!0;this.parent=void 0!==k?k:{x:0,y:0};this.Mk=this.Lk=0;this.uc=!0;this.mk=function(){};this.Pb=!1;"object"===typeof h?
(this.mk=h.T,this.ea=h.ea,this.Pb=h.Pb):"function"===typeof h&&(this.mk=h);var q=this;this.Pb?(this.ig=n,this.jg=l):(this.rb=n,this.Cb=l);H(this)}function wf(a,b,c,d,g,h){void 0===a.ae&&(a.ae=[]);a.ae.push({type:b,start:d,pc:g,Ia:c,duration:h,p:0})}
function Bf(a){var b,c;if(void 0!==a.ae){for(b=0;b<a.ae.length;b++)if(c=a.ae[b],c.i){switch(c.type){case "xScale":a.xa=c.start+c.pc;break;case "yScale":a.ya=c.start+c.pc;break;case "alpha":a.alpha=c.start+c.pc;break;case "angle":a.La=c.start+c.pc;break;case "x":a.x=c.start+c.pc;break;case "y":a.y=c.start+c.pc}c.i=!1}a.canvas.$=!0}}function If(a,b){a.images=b;a.canvas.$=!0}e=X.prototype;e.Sr=function(a){this.visible=this.i=a};e.Zb=function(){this.images&&(this.canvas.$=!0)};
e.ra=function(a){var b,c;if(void 0!==this.ae){for(b=0;b<this.ae.length;b++)switch(c=this.ae[b],c.p+=a,c.type){case "xScale":var d=this.xa,g=this.Lk;this.xa=c.Ia(c.p,c.start,c.pc,c.duration);this.Lk=-(this.images[0].width*this.xa-this.images[0].width*c.start)/2;if(isNaN(this.xa)||isNaN(this.Lk))this.xa=d,this.Lk=g;break;case "yScale":d=this.ya;g=this.Mk;this.ya=c.Ia(c.p,c.start,c.pc,c.duration);this.Mk=-(this.images[0].height*this.ya-this.images[0].height*c.start)/2;if(isNaN(this.ya)||isNaN(this.Mk))this.ya=
d,this.Mk=g;break;case "alpha":this.alpha=c.Ia(c.p,c.start,c.pc,c.duration);break;case "angle":this.La=c.Ia(c.p,c.start,c.pc,c.duration);break;case "x":d=this.x;this.x=c.Ia(c.p,c.start,c.pc,c.duration);isNaN(this.x)&&(this.x=d);break;case "y":d=this.y,this.y=c.Ia(c.p,c.start,c.pc,c.duration),isNaN(this.y)&&(this.y=d)}this.canvas.$=!0}};
e.nd=function(){var a,b,c;c=M.b.Lm(this.canvas);a=Math.round(this.x+this.parent.x-this.Qc*this.xa);b=Math.round(this.y+this.parent.y-this.Rc*this.ya);this.ji&&!Ub(this.xc,a,b,Cb(this.$e)-c.x,G.ka[this.$e].y-c.y)&&(this.images&&(this.ri=this.hf=0,this.canvas.$=!0),this.ji=!1)};
e.Xa=function(){var a,b;a=Math.round(this.x+this.parent.x-this.Qc*this.xa);b=Math.round(this.y+this.parent.y-this.Rc*this.ya);this.images&&(this.images[this.hf]instanceof y?this.images[this.hf].la(a,b,this.xa,this.ya,this.La,this.alpha):this.images[this.hf].la(this.ri,a,b,this.xa,this.ya,this.La,this.alpha));this.uc=!1};
function xf(a,b,c,d,g,h,k,l){this.X=M.a.u.Kb[a];a=void 0!==M.a.O.buttons?M.a.u.aj[M.a.O.buttons[a]||M.a.O.buttons.default_color]:M.a.u.aj[M.a.u.buttons.default_color];this.font=R.K();a.font&&C(this.font,a.font);this.X.fontSize&&D(this.font,this.X.fontSize);this.N=g;this.text=M.l.M(this.N,"<"+g.toUpperCase()+">");void 0!==h&&(this.width=h);this.height=this.X.r.height;this.f={source:this.X.r,oa:this.X.oa,$a:this.X.$a};g=this.Ad(this.f);h=new Sb(0,0,g[0].width,g[0].height);X.call(this,b,c,d,h,g,k,l)}
M.b.Vh(xf);e=xf.prototype;e.Kk=function(a){this.text=M.l.M(this.N,"<"+this.N.toUpperCase()+">");a&&C(this.font,a);If(this,this.Ad(this.f))};e.Bo=function(a,b){this.N=a;this.Kk(b)};e.yi=function(a,b,c){"string"===typeof b&&(this.text=b);c&&C(this.font,c);a instanceof x?this.f.source=a:void 0!==a.oa&&void 0!==a.$a&&void 0!==a.source&&(this.f=a);If(this,this.Ad(this.f))};
e.Ad=function(a){var b,c,d,g,h,k,l=a.oa+a.$a;d=this.height-(this.X.Ec||0);var n=a.source;c=this.font.ba(this.text);void 0===this.width?b=c:"number"===typeof this.width?b=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?b=this.width.width-l:(void 0!==this.width.minWidth&&(b=Math.max(this.width.minWidth-l,c)),void 0!==this.width.maxWidth&&(b=Math.min(this.width.maxWidth-l,c))));c=Oa(this.font,this.text,b,d,!0);c<this.X.fontSize?D(this.font,c):D(this.font,this.X.fontSize);c=a.oa;
d=this.font.align;"center"===d?c+=Math.round(b/2):"right"===d&&(c+=b);d=Math.round(this.height/2);void 0!==this.X.Dc&&(d+=this.X.Dc);h=[];for(g=0;g<n.J;g++)k=new y(b+l,this.height),z(k),n.na(g,0,0,a.oa,this.height,0,0,1),n.mj(g,a.oa,0,n.width-l,this.height,a.oa,0,b,this.height,1),n.na(g,a.oa+n.width-l,0,a.$a,this.height,a.oa+b,0,1),this.font.q(this.text,c,d,b),B(k),h.push(k);return h};e.Oc=function(a){a===M.kf&&this.Kk()};
function eg(a,b,c,d,g,h,k,l){this.X=M.a.u.Kb[a];void 0!==h&&(this.width=h);this.height=this.X.r.height;this.ad={source:this.X.r,oa:this.X.oa,$a:this.X.$a};this.f=g;a=this.Ad();g=new Sb(0,0,a[0].width,a[0].height);X.call(this,b,c,d,g,a,k,l)}M.b.Vh(eg);
eg.prototype.Ad=function(){var a,b,c,d,g,h,k,l=this.ad.oa+this.ad.$a;b=this.height-(this.X.Ec||0);var n=this.ad.source;void 0===this.width?a=this.f.width:"number"===typeof this.width?a=this.width-l:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-l:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-l,this.f.width)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-l,this.f.width))));k=Math.min(a/this.f.width,b/this.f.height);k=Math.min(k,1);g=Math.round(this.ad.oa+
(a-this.f.width*k)/2);h=Math.round((b-this.f.height*k)/2);c=[];for(b=0;b<n.J;b++){d=new y(a+l,this.height);z(d);n.na(b,0,0,this.ad.oa,this.height,0,0,1);n.mj(b,this.ad.oa,0,n.width-l,this.height,this.ad.oa,0,a,this.height,1);n.na(b,this.ad.oa+n.width-l,0,this.ad.$a,this.height,this.ad.oa+a,0,1);try{w.context.drawImage(this.f,g,h,this.f.width*k,this.f.height*k)}catch(q){}B(d);c.push(d)}return c};M.b.Vh(function(a,b,c,d,g,h,k){X.call(this,a,b,c,g,d,h,k)});
function tf(a,b,c,d,g,h,k,l){var n;this.X=M.a.u.Kb[a];a=void 0!==M.a.O.buttons?M.a.u.aj[M.a.O.buttons[a]||M.a.O.buttons.default_color]:M.a.u.aj[M.a.u.buttons.default_color];this.font=R.K();a.font&&C(this.font,a.font);this.X.fontSize&&D(this.font,this.X.fontSize);void 0!==h&&(this.width=h);this.height=this.X.r.height;this.S=this.X.S;if(this.S.length){for(h=0;h<this.S.length;h++)if(this.S[h].id===g){this.Ba=h;break}void 0===this.Ba&&(this.Ba=0);this.text=M.l.M(this.S[this.Ba].N,"<"+this.S[this.Ba].id.toUpperCase()+
">");this.Lf=this.S[this.Ba].r;h=this.Ad();a=new Sb(0,0,h[0].width,h[0].height);n=this;"function"===typeof k?g=function(){n.xf();return k(n.S[n.Ba].id)}:"object"===typeof k?(g={},g.Pb=k.Pb,g.ea=this,g.T=function(){n.xf();return k.T.call(k.ea,n.S[n.Ba].id)}):g=function(){n.xf()};X.call(this,b,c,d,a,h,g,l)}}M.b.Vh(tf);e=tf.prototype;
e.xf=function(a){var b;if(void 0===a)this.Ba=(this.Ba+1)%this.S.length;else for(b=0;b<this.S.length;b++)if(this.S[b].id===a){this.Ba=b;break}this.yi(this.S[this.Ba].r,M.l.M(this.S[this.Ba].N,"<"+this.S[this.Ba].id.toUpperCase()+">"))};e.Kk=function(a){a&&C(this.font,a);this.text=M.l.M(this.S[this.Ba].N,"<"+this.S[this.Ba].id.toUpperCase()+">");If(this,this.Ad())};e.yi=function(a,b,c){this.text=b;this.Lf=a;c&&C(this.font,c);If(this,this.Ad())};
e.Ad=function(){var a,b,c,d,g,h,k=this.X.oa,l=this.X.$a,n=k+l;g=Math.abs(k-l);d=this.height-(this.X.Ec||0);var q=this.X.r,v=this.font.K();b=v.ba(this.text);void 0===this.width?a=b:"number"===typeof this.width?a=this.width-n:"object"===typeof this.width&&(void 0!==this.width.width?a=this.width.width-n:(void 0!==this.width.minWidth&&(a=Math.max(this.width.minWidth-n,b)),void 0!==this.width.maxWidth&&(a=Math.min(this.width.maxWidth-n,b))));d=Oa(v,this.text,a,d,!0);d<v.fontSize&&D(v,d);b=v.ba(this.text,
a);d=k;c=v.align;"center"===c?d=a-g>=b?d+Math.round((a-g)/2):d+(this.X.Ff+Math.round(b/2)):"left"===c?d+=this.X.Ff:"right"===c&&(d+=a);g=Math.round(this.height/2);void 0!==this.X.Dc&&(g+=this.X.Dc);c=[];for(b=0;b<q.J;b++)h=new y(a+n,this.height),z(h),q.na(b,0,0,k,this.height,0,0,1),q.mj(b,k,0,q.width-n,this.height,k,0,a,this.height,1),q.na(b,k+q.width-n,0,l,this.height,k+a,0,1),this.Lf.q(0,this.X.Fg,this.X.Gg),v.q(this.text,d,g,a),B(h),c.push(h);return c};e.Oc=function(a){a===M.kf&&this.Kk()};
function fg(a,b,c,d,g,h,k){var l;this.S=M.a.u.Kb[a].S;if(this.S.length){for(a=0;a<this.S.length;a++)if(this.S[a].id===g){this.Ba=a;break}void 0===this.Ba&&(this.Ba=0);this.Lf=this.S[this.Ba].r;a=new Tb(this.Lf);l=this;g="function"===typeof h?function(){l.xf();return h(l.S[l.Ba].id)}:"object"===typeof h?{ea:this,T:function(){l.xf();return h.T.call(h.ea,l.S[l.Ba].id)}}:function(){l.xf()};X.call(this,b,c,d,a,[this.Lf],g,k)}}M.b.Vh(fg);
fg.prototype.xf=function(a){var b;if(void 0===a)this.Ba=(this.Ba+1)%this.S.length;else for(b=0;b<this.S.length;b++)if(this.S[b].id===a){this.Ba=b;break}this.yi(this.S[this.Ba].r)};fg.prototype.yi=function(a){this.Lf=a;If(this,[].concat(this.Lf))};
function qg(a,b,c,d){this.depth=10;this.visible=!1;this.i=!0;M.b.Ua(this,M.Yb);var g;this.a=M.a.u.Wj;if("landscape"===M.orientation&&M.a.u.cn)for(g in M.a.u.cn)this.a[g]=M.a.u.cn[g];for(g in M.a.O.Wj)this.a[g]=M.a.O.Wj[g];this.Xm=a;this.Ll=b;this.T=c;this.ea=d;this.gi="entering";this.Ms=!1;H(this,!1);Nb(this,"LevelStartDialog")}
function rg(a){var b,c,d,g,h;if("leaving"!==a.gi){a.gi="leaving";a.Qe=0;b=function(){I(G,a);a.ea?a.T.call(a.ea):a.T&&a.T()};if(void 0!==a.a.qk)for(c=0;c<a.a.qk.length;c++)d=a.a.qk[c],g=void 0,d.$i&&(a.Qe++,g=b),h=d.end,"x"===d.type?h=M.b.g(h,a.canvas.width,a.c.f.width):"y"===d.type&&(h=M.b.g(h,a.canvas.height,a.c.f.height)+Math.abs(M.ca)),Y(a.c,d.type,h,d.duration,d.Ia,g,d.qa,d.loop,d.kn);0===a.Qe&&b()}}e=qg.prototype;
e.dc=function(){var a,b,c,d,g,h,k=this;a=this.a.yc;b=a.width;g=a.height;this.c=new Zf(this.depth+10,this.ua,new y(b,g));z(this.c.f);a.q(0,0,0);""!==this.Ll&&(c=M.b.g(this.a.hp,b,0),d=M.b.g(this.a.ip,g,0),a=R.K(),C(a,this.a.gp),void 0!==this.a.oh&&void 0!==this.a.Kl&&(h=Oa(a,this.Ll,this.a.oh,this.a.Kl,this.a.oh),a.fontSize>h&&D(a,h)),a.q(this.Ll,c,d,this.a.oh));""!==this.Xm&&(c=M.b.g(this.a.zq,b,0),d=M.b.g(this.a.Aq,g,0),a=R.K(),C(a,this.a.xq),void 0!==this.a.Nj&&void 0!==this.a.yq&&(h=Oa(a,this.Xm,
this.a.Nj,this.a.yq,this.a.Nj),a.fontSize>h&&D(a,h)),a.q(this.Xm,c,d,this.a.Nj));B(this.c.f);this.c.x=M.b.g(this.a.Cr,this.canvas.width,b);this.c.y=M.b.g(this.a.rk,this.canvas.height,g)+Math.abs(M.ca);this.Qe=0;a=function(){k.Qe--;0===k.Qe&&(k.gi="paused")};if(void 0!==this.a.ei)for(b=0;b<this.a.ei.length;b++)g=this.a.ei[b],c=void 0,g.$i&&(this.Qe++,c=a),d=g.end,"x"===g.type?d=M.b.g(d,this.canvas.width,this.c.f.width):"y"===g.type&&(d=M.b.g(d,this.canvas.height,this.c.f.height)+Math.abs(M.ca)),Y(this.c,
g.type,d,g.duration,g.Ia,c,g.qa,g.loop,g.kn),void 0!==g.Rb&&F.play(g.Rb);0===this.Qe&&(this.gi="paused");this.p=0};e.Zb=function(){I(G,this.c)};e.ra=function(a){"paused"!==this.state&&(this.p+=a,this.p>=this.a.Fr&&rg(this))};e.rb=function(){return this.Ms=!0};e.Cb=function(){this.Ms&&"paused"===this.gi&&rg(this);return!0};
function Zf(a,b,c){this.depth=a;this.i=this.visible=!0;M.b.Ua(this,b);this.f=c;this.jb=0;this.width=c.width;this.height=c.height;this.Rc=this.Qc=this.y=this.x=0;this.ya=this.xa=1;this.La=0;this.alpha=1;this.bb=[];this.fp=0;this.parent={x:0,y:0};this.uc=!0;H(this,!1)}
function Y(a,b,c,d,g,h,k,l,n){var q,v=0<k;switch(b){case "x":q=a.x;break;case "y":q=a.y;break;case "xScale":q=a.xa;break;case "yScale":q=a.ya;break;case "scale":b="xScale";q=a.xa;Y(a,"yScale",c,d,g,void 0,k,l,n);break;case "angle":q=a.La;break;case "alpha":q=a.alpha;break;case "subImage":q=0}a.bb.push({id:a.fp,p:0,i:!0,jj:v,type:b,start:q,end:c,Lb:h,duration:d,Ia:g,qa:k,loop:l,kn:n});a.fp++}
function Nf(a){var b;for(b=a.bb.length-1;0<=b;b--){switch(a.bb[b].type){case "x":a.x=a.bb[b].end;break;case "y":a.y=a.bb[b].end;break;case "xScale":a.xa=a.bb[b].end;break;case "yScale":a.ya=a.bb[b].end;break;case "angle":a.La=a.bb[b].end;break;case "alpha":a.alpha=a.bb[b].end;break;case "subImage":a.jb=a.bb[b].end}"function"===typeof a.bb[b].Lb&&a.bb[b].Lb.call(a)}}
Zf.prototype.ra=function(a){var b,c,d;for(b=0;b<this.bb.length;b++)if(c=this.bb[b],c.i&&(c.p+=a,c.jj&&c.p>=c.qa&&(c.p%=c.qa,c.jj=!1),!c.jj)){c.p>=c.duration?(d=c.end,c.loop?(c.jj=!0,c.qa=c.kn,c.p%=c.duration):("function"===typeof c.Lb&&c.Lb.call(this),this.bb[b]=void 0)):"subImage"===c.type?(d=this.f instanceof Array?this.f.length:this.f.J,d=Math.floor(c.p*d/c.duration)):d=c.Ia(c.p,c.start,c.end-c.start,c.duration);switch(c.type){case "x":this.x=d;break;case "y":this.y=d;break;case "xScale":this.xa=
d;break;case "yScale":this.ya=d;break;case "angle":this.La=d;break;case "alpha":this.alpha=d;break;case "subImage":this.jb=d}this.canvas.$=!0}for(b=this.bb.length-1;0<=b;b--)void 0===this.bb[b]&&this.bb.splice(b,1)};
Zf.prototype.Xa=function(){var a,b,c;b=Math.round(this.x-this.xa*this.Qc)+this.parent.x;c=Math.round(this.y-this.ya*this.Rc)+this.parent.y;a=this.f;a instanceof Array&&(a=this.f[this.jb%this.f.length]);a instanceof y?a.la(b,c,this.xa,this.ya,this.La,this.alpha):a.la(this.jb,b,c,this.xa,this.ya,this.La,this.alpha);this.uc=!1};
function Sf(a,b,c,d,g,h,k,l,n,q,v){this.depth=g;this.visible=!0;this.i=!1;M.b.Ua(this,M.Yb);this.x=a;this.y=b;this.mn=l;this.nn="object"===typeof n?n.top:n;this.gv="object"===typeof n?n.bottom:n;this.ba=c;this.U=d;this.width=this.ba+2*this.mn;this.height=this.U+this.nn+this.gv;this.value=h||0;this.parent=q||{x:0,y:0};this.font=k;this.toString="function"===typeof v?v:function(a){return a+""};this.alpha=1;this.wf=this.vf=this.Rc=this.Qc=0;c=new y(this.width,this.height);this.Vf=new Zf(this.depth,this.ua,
c);this.Vf.x=a-this.mn;this.Vf.y=b-this.nn;this.Vf.parent=q;this.Ka=this.Vf.f;this.se();H(this)}Sf.prototype.Zb=function(){I(G,this.Vf)};function bg(a,b,c){a.i=!0;a.Rl=a.value;a.value=a.Rl;a.end=b;a.duration=c;a.Ia=J;a.p=0}
Sf.prototype.se=function(){var a,b;a=this.font.align;b=this.font.h;var c=this.mn,d=this.nn;this.mp||(this.Ka.clear(),this.canvas.$=!0);z(this.Ka);this.mp&&this.mp.na(0,this.Qx,this.Rx,this.Px,this.Nx,0,0,1);"center"===a?c+=Math.round(this.ba/2):"right"===a&&(c+=this.ba);"middle"===b?d+=Math.round(this.U/2):"bottom"===b&&(d+=this.U);b=this.toString(this.value);a=Oa(this.font,b,this.ba,this.U,!0);a<this.font.fontSize&&D(this.font,a);this.font.q(b,c,d,this.ba);B(this.Ka);this.Vf.uc=!0};
Sf.prototype.ra=function(a){var b;b=Math.round(this.Ia(this.p,this.Rl,this.end-this.Rl,this.duration));this.p>=this.duration?(this.value=this.end,this.i=!1,this.se()):b!==this.value&&(this.value=b,this.se());this.p+=a};function sg(a,b,c){this.depth=-100;this.visible=!1;this.i=!0;this.cw=a;M.b.Ua(this,M.Yb);this.a=M.a.u.gm;this.Wb=M.a.u.Kb;this.xp=b;for(var d in M.a.O.gm)this.a[d]=M.a.O.gm[d];this.Bn=!1!==c;H(this)}e=sg.prototype;e.Js=function(){};
e.mh=function(a,b,c,d,g){b=new xf("default_text",b,c,this.depth-20,a.N||"NO_TEXT_KEY_GIVEN",d,{T:function(){a.T&&(a.ea?a.T.call(a.ea,a):a.T(a))},ea:this},this.c);this.buttons.push(b);a.text&&b.yi(b.f,a.text);this.buttons[this.buttons.length-1].Pa=g||!1};
e.Ca=function(a,b,c){z(this.c.f);w.clear();this.a.backgroundImage.q(0,0,0);a=c?c:this.cw;b=R.K();this.a.Lr&&C(b,this.a.Lr);c=Oa(b,a,this.a.Jn,this.a.In,!0);c<b.fontSize&&D(b,c);c=b.ba(a,this.a.Jn)+10;var d=b.U(a,this.a.In)+10;b.q(a,M.b.ma(this.a.hw,this.c.f.width,c,b.align),M.b.ma(this.a.iw,this.c.f.height-tg(this),d,b.h),c);B(this.c.f)};function tg(a){var b=a.xp;return M.b.g(a.a.sh,a.c.f.height,a.Wb.default_text.r.height*b.length+a.a.bd*(b.length-1))}
e.Ne=function(a,b){var c,d,g,h,k,l,n,q,v,E=[],E=this.xp;g=this.Wb.default_text.r.height;h=this.a.cj;k=M.b.g(this.a.bj,this.canvas.width,h)-a;q=tg(this);for(c=E.length-1;0<=c;c--){n=k;v=h;if("object"===typeof E[c]&&E[c].hasOwnProperty("length")&&E[c].length)for(l=E[c],v=(h-(l.length-1)*this.a.bd)/l.length,d=0;d<l.length;d++)this.mh(l[d],n,q,v,b),n+=v+this.a.bd;else this.mh(E[c],n,q,v,b);q-=g+this.a.bd}};
e.show=function(){var a,b;for(a=0;a<this.buttons.length;a++)b=this.buttons[a],b.Sr(!0);this.c.visible=!0};e.close=function(){I(G,this);return this.canvas.$=!0};function ug(a){var b=M.e.Zd;b.Ca(b.c.x,b.c.y,a);for(a=0;a<b.buttons.length;a++)I(G,b.buttons[a]);b.canvas.$=!0}
e.dc=function(){var a,b;this.Bn&&Yf(this);a=this.a.backgroundImage;this.c=new Zf(this.depth-10,this.ua,new y(a.width,a.height));this.c.x=M.b.g(this.a.Db,this.canvas.width,a.width);a=M.b.g(this.a.Eb,this.canvas.height,a.height)+-1*("landscape"===M.orientation?M.a.u.Zl:M.a.u.zd).fk;this.c.y=a;this.Ca(this.c.x,this.c.y);this.buttons=[];this.Ne(this.c.x);b=this;this.c.y=-this.c.f.height;Y(this.c,"y",a,this.a.ci,this.a.di,function(){var a;for(a=0;a<b.buttons.length;a++)b.buttons[a].Pa=!0})};
e.Zb=function(){var a;this.Bn&&cg();for(a=0;a<this.buttons.length;a++)I(G,this.buttons[a]);I(G,this.c);M.e.Me===this&&(M.e.Me=null)};e.Cb=function(){return!0};e.rb=function(){return!0};
function vg(a){if(null===a||"undefined"===typeof a)return"";a+="";var b="",c,d,g=0;c=d=0;for(var g=a.length,h=0;h<g;h++){var k=a.charCodeAt(h),l=null;if(128>k)d++;else if(127<k&&2048>k)l=String.fromCharCode(k>>6|192,k&63|128);else if(55296!==(k&63488))l=String.fromCharCode(k>>12|224,k>>6&63|128,k&63|128);else{if(55296!==(k&64512))throw new RangeError("Unmatched trail surrogate at "+h);l=a.charCodeAt(++h);if(56320!==(l&64512))throw new RangeError("Unmatched lead surrogate at "+(h-1));k=((k&1023)<<
10)+(l&1023)+65536;l=String.fromCharCode(k>>18|240,k>>12&63|128,k>>6&63|128,k&63|128)}null!==l&&(d>c&&(b+=a.slice(c,d)),b+=l,c=d=h+1)}d>c&&(b+=a.slice(c,g));return b}
function df(a){function b(a){var b="",c="",d;for(d=0;3>=d;d++)c=a>>>8*d&255,c="0"+c.toString(16),b+=c.substr(c.length-2,2);return b}function c(a,b,c,d,g,h,l){a=k(a,k(k(c^(b|~d),g),l));return k(a<<h|a>>>32-h,b)}function d(a,b,c,d,g,h,l){a=k(a,k(k(b^c^d,g),l));return k(a<<h|a>>>32-h,b)}function g(a,b,c,d,g,h,l){a=k(a,k(k(b&d|c&~d,g),l));return k(a<<h|a>>>32-h,b)}function h(a,b,c,d,g,h,l){a=k(a,k(k(b&c|~b&d,g),l));return k(a<<h|a>>>32-h,b)}function k(a,b){var c,d,g,h,k;g=a&2147483648;h=b&2147483648;
c=a&1073741824;d=b&1073741824;k=(a&1073741823)+(b&1073741823);return c&d?k^2147483648^g^h:c|d?k&1073741824?k^3221225472^g^h:k^1073741824^g^h:k^g^h}var l=[],n,q,v,E,A,r,s,t,u;a=vg(a);l=function(a){var b,c=a.length;b=c+8;for(var d=16*((b-b%64)/64+1),g=Array(d-1),h=0,k=0;k<c;)b=(k-k%4)/4,h=k%4*8,g[b]|=a.charCodeAt(k)<<h,k++;b=(k-k%4)/4;g[b]|=128<<k%4*8;g[d-2]=c<<3;g[d-1]=c>>>29;return g}(a);r=1732584193;s=4023233417;t=2562383102;u=271733878;a=l.length;for(n=0;n<a;n+=16)q=r,v=s,E=t,A=u,r=h(r,s,t,u,l[n+
0],7,3614090360),u=h(u,r,s,t,l[n+1],12,3905402710),t=h(t,u,r,s,l[n+2],17,606105819),s=h(s,t,u,r,l[n+3],22,3250441966),r=h(r,s,t,u,l[n+4],7,4118548399),u=h(u,r,s,t,l[n+5],12,1200080426),t=h(t,u,r,s,l[n+6],17,2821735955),s=h(s,t,u,r,l[n+7],22,4249261313),r=h(r,s,t,u,l[n+8],7,1770035416),u=h(u,r,s,t,l[n+9],12,2336552879),t=h(t,u,r,s,l[n+10],17,4294925233),s=h(s,t,u,r,l[n+11],22,2304563134),r=h(r,s,t,u,l[n+12],7,1804603682),u=h(u,r,s,t,l[n+13],12,4254626195),t=h(t,u,r,s,l[n+14],17,2792965006),s=h(s,t,
u,r,l[n+15],22,1236535329),r=g(r,s,t,u,l[n+1],5,4129170786),u=g(u,r,s,t,l[n+6],9,3225465664),t=g(t,u,r,s,l[n+11],14,643717713),s=g(s,t,u,r,l[n+0],20,3921069994),r=g(r,s,t,u,l[n+5],5,3593408605),u=g(u,r,s,t,l[n+10],9,38016083),t=g(t,u,r,s,l[n+15],14,3634488961),s=g(s,t,u,r,l[n+4],20,3889429448),r=g(r,s,t,u,l[n+9],5,568446438),u=g(u,r,s,t,l[n+14],9,3275163606),t=g(t,u,r,s,l[n+3],14,4107603335),s=g(s,t,u,r,l[n+8],20,1163531501),r=g(r,s,t,u,l[n+13],5,2850285829),u=g(u,r,s,t,l[n+2],9,4243563512),t=g(t,
u,r,s,l[n+7],14,1735328473),s=g(s,t,u,r,l[n+12],20,2368359562),r=d(r,s,t,u,l[n+5],4,4294588738),u=d(u,r,s,t,l[n+8],11,2272392833),t=d(t,u,r,s,l[n+11],16,1839030562),s=d(s,t,u,r,l[n+14],23,4259657740),r=d(r,s,t,u,l[n+1],4,2763975236),u=d(u,r,s,t,l[n+4],11,1272893353),t=d(t,u,r,s,l[n+7],16,4139469664),s=d(s,t,u,r,l[n+10],23,3200236656),r=d(r,s,t,u,l[n+13],4,681279174),u=d(u,r,s,t,l[n+0],11,3936430074),t=d(t,u,r,s,l[n+3],16,3572445317),s=d(s,t,u,r,l[n+6],23,76029189),r=d(r,s,t,u,l[n+9],4,3654602809),
u=d(u,r,s,t,l[n+12],11,3873151461),t=d(t,u,r,s,l[n+15],16,530742520),s=d(s,t,u,r,l[n+2],23,3299628645),r=c(r,s,t,u,l[n+0],6,4096336452),u=c(u,r,s,t,l[n+7],10,1126891415),t=c(t,u,r,s,l[n+14],15,2878612391),s=c(s,t,u,r,l[n+5],21,4237533241),r=c(r,s,t,u,l[n+12],6,1700485571),u=c(u,r,s,t,l[n+3],10,2399980690),t=c(t,u,r,s,l[n+10],15,4293915773),s=c(s,t,u,r,l[n+1],21,2240044497),r=c(r,s,t,u,l[n+8],6,1873313359),u=c(u,r,s,t,l[n+15],10,4264355552),t=c(t,u,r,s,l[n+6],15,2734768916),s=c(s,t,u,r,l[n+13],21,
1309151649),r=c(r,s,t,u,l[n+4],6,4149444226),u=c(u,r,s,t,l[n+11],10,3174756917),t=c(t,u,r,s,l[n+2],15,718787259),s=c(s,t,u,r,l[n+9],21,3951481745),r=k(r,q),s=k(s,v),t=k(t,E),u=k(u,A);return(b(r)+b(s)+b(t)+b(u)).toLowerCase()}var $f;
function wg(a,b){var c=M.v.Oj.url+"api";try{var d=new XMLHttpRequest;d.open("POST",c);d.setRequestHeader("Content-Type","application/x-www-form-urlencoded");d.onload=function(){"application/json"===d.getResponseHeader("Content-Type")&&b(JSON.parse(d.responseText))};d.onerror=function(a){console.log("error: "+a)};d.send(a)}catch(g){}}function xg(a){wg("call=api_is_valid",function(b){a(b.is_valid)})}
function ag(a,b){wg("call=is_highscore&score="+a,function(a){0<=a.position?($f=a.code,b(void 0!==$f)):b(!1)})}
TG_StatObjectFactory={iy:function(a){return new TG_StatObject("totalScore",a,"levelEndScreenTotalScore_"+a,0,0,!0,!0)},gy:function(a){return new TG_StatObject("highScore",a,"levelEndScreenHighScore_"+a,yg(),yg(),!0)},fy:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===M.m.bg?function(a){return a+d}:function(a){return a-d})},hy:function(a,b,c,d,g){return new TG_StatObject(a,b,c,0,d,g,!0,"max"===M.m.bg?function(a){return a-d}:function(a){return a+d})}};
TG_StatObject=function(a,b,c,d,g,h,k,l,n){this.id=a;this.type=b;this.key=c;this.rc=d;this.Af=void 0!==g?g:this.rc;this.visible=void 0!==h?h:!0;this.$d=void 0!==k?k:this.rc!==this.Af;this.Fe=l;this.Uk=void 0!==n?n:"totalScore";switch(this.type){case "text":this.toString=function(a){return a};break;case "number":this.toString=function(a){return a+""};break;case "time":this.toString=function(a){return M.b.ix(1E3*a)}}};
TG_StatObject.prototype.K=function(){return new TG_StatObject(this.id,this.type,this.key,this.rc,this.Af,this.visible,this.$d,this.Fe,this.Uk)};M.version=M.version||{};M.version.tg="2.13.0";function zg(a){this.depth=-99;M.b.Ua(this,M.Yb);this.i=!0;this.visible=!1;this.e=a;H(this)}zg.prototype.Lj=function(){};zg.prototype.kg=function(){};zg.prototype.rb=function(a,b,c){a:{var d=this.e,g;for(g=0;g<d.jc.length;++g)if(d.jc[g].rb&&d.jc[g].rb(a,b,c)){a=!0;break a}a=!1}return a};
zg.prototype.Cb=function(a,b,c){var d;a:if(d=this.e,d.Va&&a===d.Do)a=d.Va.a.x,b=d.Va.a.y,d.Va.An&&(a=d.Va.An.x,b=d.Va.An.y),Ag?console.log("Component:\n x: tgScale("+(a+d.Va.Nf.x-Bg)+") + GameUISettingsOffsets.X,\n y: tgScale("+(b+d.Va.Nf.y-Cg)+") + GameUISettingsOffsets.Y,"):console.log("Component:\n x: tgScale("+(a+d.Va.Nf.x)+"),\n y: tgScale("+(b+d.Va.Nf.y)+"),"),d.Ws=!1,d=!0;else{for(var g=0;g<d.jc.length;++g)if(d.jc[g].Cb&&d.jc[g].Cb(a,b,c)){d=!0;break a}d=!1}return d};
function Dg(){this.ua=this.depth=0;this.km=this.Fb=this.i=this.visible=!1;this.jc=[];this.sj={};this.sj.Md=!1;this.Xp={};this.paused=this.Xp.Md=!1;this.Sw=new y(0,0);this.Uw=this.Tw=0;this.Va=null;this.Do=this.Ys=this.Xs=-1;this.Ws=!1;this.vb=this.ub=0;this.Rj=null}e=Dg.prototype;e.dc=function(){this.Rj=new zg(this)};e.Zb=function(){this.Rj&&(I(G,this.Rj),this.Rj=null)};
function Eg(a,b,c){for(var d in b){var g=b[d];g.f?c[d]=new Fg(a,g):g.Cs?c[d]=new Gg(a,M.l.M(g.Cs,"<"+g.Cs+">"),g):g.N?c[d]=new Gg(a,M.l.M(g.N,"<"+g.N+">"),g):g.text&&(c[d]=new Gg(a,g.text,g))}}function Hg(a,b){a.Md&&(a.p+=b,a.p>=a.duration&&(a.Md=!1,a.Lb&&a.Lb()))}
e.ra=function(a){Hg(this.sj,a);Hg(this.Xp,a);for(var b=0;b<this.jc.length;++b)this.jc[b].ra(a);if(this.Va&&this.Ws){a=Cb(this.Do);b=G.ka[this.Do].y;this.canvas===M.b.gf(M.cf)&&this.Va.Jj(this.ub+M.ff,this.vb+M.he);var c=a-this.Xs,d=b-this.Ys;this.Va.x+=c;this.Va.y+=d;this.Va.Nf.x+=c;this.Va.Nf.y+=d;this.Xs=a;this.Ys=b;this.Fb=!0}};e.nd=function(){if(this.Fb){var a=M.b.gf(M.cf);this.canvas!==a?this.canvas.$=this.Fb:(w.hb(a),this.Xa())}};
e.oj=function(a,b){for(var c=M.b.gf(M.cf)===this.canvas,d=0;d<this.jc.length;++d){var g=this.jc[d];g.visible&&(c&&g.Jj(a,b),g.Xa(a,b))}};e.Xa=function(){var a=0,b=0;M.b.gf(M.Fj)!==this.canvas&&(a=M.ff,b=M.he);this.paused?this.Sw.q(this.Tw+this.ub+a,this.Uw+this.vb+b):this.oj(this.ub+a,this.vb+b);this.Fb=!1};function Ig(){this.Bq=[];this.Yp=[];this.Tr=null;this.Nl=void 0;this.ym=!0}
function Jg(a){function b(a,b){if(!b)return!1;var g=0;if("string"===typeof a){if(d(a))return!1}else for(g=0;g<a.length;++g)if(d(a[g]))return!1;if(b.ny){if("string"===typeof a){if(c(a))return!0}else for(g=0;g<a.length;++g)if(c(a[g]))return!0;return!1}return!0}function c(a){for(var b in k)if(b===a||k[b]===a)return!0;return!1}function d(a){for(var b in h)if(b===a||h[b]===a)return!0;return!1}var g;if(a instanceof Ig){if(1!==arguments.length)throw"When using GameUIOptions as argument to GameUIController constructor you should not use extraComponents of gameUiSettings as parameters anymore.";
g=a}else g=new Ig,g.Bq=arguments[0],g.Yp=arguments[1],g.Tr=arguments[2];var h=null,k=null,l=null,h=g.Bq,k=g.Yp,l=g.Tr;this.sg=g;void 0===this.sg.Nl&&(this.sg.Nl=!sf(M.e));Dg.apply(this,arguments);H(this);this.i=this.visible=!0;k=k||[];h=h||[];this.Fs=2;this.n=l||Kg;this.Kp=M.Fj;void 0!==this.n.ua&&(this.Kp=this.n.ua);M.b.Ua(this,this.Kp);this.Gi=this.Fi=0;this.n.background.Hq&&(this.Fi=this.n.background.Hq);this.n.background.Iq&&(this.Gi=this.n.background.Iq);this.n.background.elements||(this.Gc=
this.n.background.f);this.n.background.Mx?(Eg(this,this.n.background.elements,{}),this.Gc=this.n.background.f):(g=this.n.background.f,l=new Dg,Eg(l,this.n.background.elements,[]),g||this.ua!==M.cf?(this.Gc=new y(g.width,g.height),z(this.Gc),g.q(0,0,0),l.oj(-this.Fi,-this.Gi),B(this.Gc)):(w.hb(M.b.gf(this.ua)),l.Xa()));this.Kq=0;b("score",this.n.P)?(this.ue=new Lg(this,this.n.P,"SCORE",0,!0),this.n.pw&&new Fg(this,this.n.pw)):this.ue=new Mg(0,0);this.Th=b("highScore",this.n.Cq)?new Lg(this,this.n.Cq,
"HIGHSCORE",0,!1):new Mg(0,0);b("highScore",this.n.Fq)&&new Fg(this,this.n.Fq);b(["stage","level"],this.n.Cw)&&new Lg(this,this.n.Cw,"STAGE",0,!1);b("lives",this.n.Su)&&new Lg(this,this.n.Su,"LIVES",0,!1);this.bl=b("time",this.n.time)?new Lg(this,this.n.time,"TIME",0,!1,function(a){var b=Math.floor(a%6E4/1E3);return Math.floor(a/6E4)+(10>b?":0":":")+b}):new Mg(0,0);this.bl.yf(36E4);if(this.n.Sc&&this.n.Kr)throw"Don't define both progress and progressFill in your game_ui settings";b("progress",this.n.Sc)?
this.n.Sc.round?new Ng(this,this.n.Sc):new Og(this,this.n.Sc):b("progress",this.n.Kr)&&new Og(this,this.n.Kr);b("lives",this.n.Du)&&new Fg(this,this.n.Du);b("difficulty",this.n.Ch)?new Gg(this,Pg().toUpperCase(),this.n.Ch):Pg();b("difficulty",this.n.Ye)&&(g=md,g=(this.n.Ye.images?this.n.Ye.images:[nd,md,ld])[uf()],this.n.Ye.f||(this.n.Ye.f=g),this.Vt=new Fg(this,this.n.Ye),this.Vt.Qr(g));this.n.jf&&!this.n.jf.length&&(this.n.jf=[this.n.jf]);this.n.Id&&!this.n.Id.length&&(this.n.Id=[this.n.Id]);this.Pq=
[];this.Qq=[];this.Pq[0]=b(["item","item0"],this.n.jf)?new Fg(this,this.n.jf[0]):new Mg(0,"");this.Qq[0]=b(["item","item0"],this.n.Id)?new Gg(this,"",this.n.Id[0]):new Mg(0,"");if(this.n.jf&&this.n.Id)for(g=1;g<this.n.Id.length;++g)b("item"+g,this.n.Id[g])&&(this.Qq[g]=new Gg(this,"0 / 0",this.n.Id[g]),this.Pq[g]=new Fg(this,this.n.jf[g]));for(var n in this.n)g=this.n[n],g.N&&new Gg(this,M.l.M(g.N,"<"+g.N+">")+(g.separator?g.separator:""),g);this.fr=this.Gs=0;this.buttons={};for(n in this.n.buttons)g=
Qg(this,this.n.buttons[n]),this.buttons[n]=g;this.n.Er&&(g=Qg(this,this.n.Er),this.buttons.pauseButton=g);this.fm={};for(n in this.n.fm)g=this.n.fm[n],g=new Rg[g.dy](this,g),this.fm[n]=g;this.vb=this.ub=0}Ze(Dg,Jg);var Rg={};function Qg(a,b){var c=new Sg(a,b,b.X);a.jc.push(c);c.By=b;return c}e=Jg.prototype;e.Vn=function(a,b){this.buttons[b||"pauseButton"].Vn(a)};e.setTime=function(a){this.bl.yf(a);return this};e.getTime=function(){return this.bl.V()};
function Tg(a,b){a.ue.yf(b);a.sg.Nl&&(a.Th.V()<b?a.Th.yf(b):b<a.Th.V()&&a.Th.yf(Math.max(b,a.Kq)))}function Ug(a,b){a.Th.yf(b);a.Kq=b}e.Uf=function(a){Tg(this,this.ue.V()+a);return this};e.Zb=function(){Dg.prototype.Zb.apply(this,arguments);w.hb(this.canvas);w.clear();for(var a in this.buttons)I(G,this.buttons[a])};
e.ra=function(a){1===this.Fs&&this.setTime(this.getTime()+a);if(2===this.Fs){if(this.Gs&&1E3*this.Gs>=this.getTime()){var b=Math.floor(this.getTime()/1E3),c=Math.floor(Math.max(this.getTime()-a,0)/1E3);b!==c&&(b=this.bl,b.ec.p=0,b.ec.io=!0,b.font.setFillColor(b.ec.color),b.se(),"undefined"!==typeof a_gameui_timewarning_second&&F.play(a_gameui_timewarning_second))}this.setTime(Math.max(this.getTime()-a,0))}Dg.prototype.ra.apply(this,arguments);this.fr+=a};
e.oj=function(a,b){this.Gc&&(this.Gc instanceof x?this.Gc.cd(0,a+this.Fi,b+this.Gi,1):this.Gc.cd(a+this.Fi,b+this.Gi,1));Dg.prototype.oj.apply(this,arguments);this.km&&this.Gc&&qa(a,b,this.Gc.width,this.Gc.height,"blue",!0)};
function Vg(a,b,c,d,g,h){this.e=a;this.width=g;this.height=h;this.Ka=null;this.x=c;this.y=d;this.visible=!0;this.a=b;this.alpha=void 0!==b.alpha?b.alpha:1;this.scale=void 0!==b.scale?b.scale:1;this.I={};this.I.ub=0;this.I.vb=0;this.I.scale=this.scale;this.I.alpha=this.alpha;this.I.La=0;this.A={};this.A.Md=!1;this.A.origin={};this.A.target={};this.A.p=0;this.a.sj&&(Wg(this,this.a.sj),this.A.Md=!1);this.e.jc.push(this);Xg||(Xg={sb:function(a){a.value instanceof y?a.Ka=a.value:(a.f=a.value,a.jb=0)},
update:Z.Dd,ob:Z.Bd,end:Z.Cd,ed:J,fd:J,dd:function(a,b,c,d){return 1-L(a,b,c,d)},Qp:function(a,b,c,d){return 1*L(a,b,c,d)+1},Rp:function(a,b,c,d){return 1*L(a,b,c,d)+1}})}var Xg;
function Wg(a,b){a.A.origin.x=void 0===b.x?a.x:b.x;a.A.origin.y=void 0===b.y?a.y:b.y;a.A.origin.alpha=void 0!==b.alpha?b.alpha:1;a.A.origin.scale=void 0!==b.scale?b.scale:1;a.A.target.x=a.x;a.A.target.y=a.y;a.A.target.alpha=a.alpha;a.A.target.scale=a.scale;a.A.duration=b.duration;a.A.Md=!0;a.A.ee=b.ee||L;a.A.p=0;a.A.qa=b.qa||0;Yg(a)}
function Yg(a){a.A.p>=a.A.duration&&(a.A.p=a.A.duration,a.A.Md=!1);var b=a.A.ee(a.A.p,a.A.origin.x,a.A.target.x-a.A.origin.x,a.A.duration),c=a.A.ee(a.A.p,a.A.origin.y,a.A.target.y-a.A.origin.y,a.A.duration);a.I.ub=b-a.x;a.I.vb=c-a.y;a.I.alpha=a.A.ee(a.A.p,a.A.origin.alpha,a.A.target.alpha-a.A.origin.alpha,a.A.duration);a.I.scale=a.A.ee(a.A.p,a.A.origin.scale,a.A.target.scale-a.A.origin.scale,a.A.duration);a.e.Fb=!0}e=Vg.prototype;
e.Xa=function(a,b){this.Ka&&this.Ka.la(this.x+this.I.ub+a,this.y+this.I.vb+b,this.I.scale,this.I.scale,0,this.I.alpha)};e.Jj=function(a,b){Zg(this.x+this.I.ub+a,this.y+this.I.vb+b,this.width*this.I.scale,this.height*this.I.scale)};e.Uj=function(a,b){return a>this.x+this.I.ub&&a<this.x+this.I.ub+this.width*this.I.scale&&b>this.y+this.I.vb&&b<this.y+this.I.vb+this.height*this.I.scale};e.Sr=function(a){this.visible!==a&&(this.visible=a,this.e.Fb=!0)};
e.ra=function(a){this.A.Md&&(0<this.A.qa?this.A.qa-=a:(this.A.p+=-this.A.qa,this.A.qa=0,this.A.p+=a,Yg(this)))};function Mg(a,b){this.Sc=this.value=this.Qj=b}Mg.prototype.yf=function(a){this.value=a};Mg.prototype.V=function(){return this.value};Mg.prototype.Qr=function(){};
function Fg(a,b){this.An=b;this.a={};for(var c in b)this.a[c]=b[c];this.f=this.a.f;this.J=0;this.Te=this.a.Te;this.a.lo&&(this.a.x+=this.f.yb,this.a.y+=this.f.zb);Vg.call(this,a,this.a,this.a.x,this.a.y,this.f?this.f.width:1,this.f?this.f.height:1)}Ze(Vg,Fg);Rg.GameUIImage=Fg;function $g(a,b){a.J!==b&&(a.J=b,a.e.Fb=!0)}e=Fg.prototype;
e.Xa=function(a,b){this.f&&(this.Te&&(a+=-Math.floor(this.f.width/2),b+=-Math.floor(this.f.height/2)),this.f instanceof x?this.f.la(this.J,this.x+a+this.I.ub,this.y+b+this.I.vb,this.I.scale,this.I.scale,0,this.I.alpha):this.f.la(this.x+a+this.I.ub,this.y+b+this.I.vb,this.I.scale,this.I.scale,0,this.I.alpha),this.e.km&&qa(this.x+a-this.f.yb+1,this.y+b-this.f.zb+1,this.f.width-2,this.f.height-2,"black",!0))};
e.Uj=function(a,b){if(!this.f)return!1;var c=0,d=0;this.Te&&(c+=-Math.floor(this.f.width/2),d+=-Math.floor(this.f.height/2));c-=this.f.yb;d-=this.f.zb;return a>c+this.x+this.I.ub&&a<c+this.x+this.I.ub+this.width*this.I.scale&&b>d+this.y+this.I.vb&&b<d+this.y+this.I.vb+this.height*this.I.scale};e.Jj=function(a,b){this.f&&(this.Te&&(a+=-Math.floor(this.f.width/2),b+=-Math.floor(this.f.height/2)),a-=this.f.yb,b-=this.f.zb,Zg(this.x+this.I.ub+a,this.y+this.I.vb+b,this.width*this.I.scale,this.height*this.I.scale))};
e.ld=function(a){a||(a=new p(0,0));a.x=this.x+M.ff+this.e.ub;a.y=this.y+M.he+this.e.vb;return a};e.Qr=function(a){a!==this.f&&(this.f=a,this.e.Fb=!0,this.f&&(this.width=this.f.width,this.height=this.f.height))};e.oq=function(){return this.f};
function Gg(a,b,c){"object"===typeof b&&(c=b,b=c.N?M.l.M(c.N,"<"+c.N+">"):c.text||"");this.text=b;this.font=c.font.K();c.Fd&&C(this.font,c.Fd);this.Ar=c.x;this.Br=c.y;this.zr=c.kb;this.Rv=this.font.fillColor;this.Wc=void 0===c.Wc?.2:c.Wc;Vg.call(this,a,c,Math.floor(c.x-.1*c.kb),Math.floor(c.y-.1*c.qb),Math.floor(1.2*c.kb),Math.floor(1.2*c.qb));this.Ka=new y(this.width,this.height);switch(this.font.align){case "left":this.Gf=Math.floor(.1*c.kb);break;case "right":this.Gf=Math.floor(1.1*c.kb);break;
case "center":this.Gf=Math.floor(.6*c.kb);break;default:throw"Unknown alignment: "+this.font.align;}a=Math.floor(this.Wc*this.font.fontSize);switch(this.font.h){case "top":this.Hf=Math.floor(.1*c.qb);break;case "bottom":this.Hf=Math.floor(1.1*c.qb)+a;break;case "middle":this.Hf=Math.floor(.6*c.qb)+a;break;default:throw"Unknown baseline: "+this.font.h;}this.ec={};this.ec.color="red";this.ec.duration=200;this.ec.p=0;this.ec.io=!1;this.se()}Ze(Vg,Gg);Rg.GameUIText=Gg;
Gg.prototype.ra=function(a){Vg.prototype.ra.apply(this,arguments);this.ec.io&&(this.ec.p+=a,this.ec.duration<=this.ec.p&&(this.ec.io=!1,this.font.setFillColor(this.Rv),this.se()))};
Gg.prototype.se=function(){this.Ka.clear();z(this.Ka);var a=this.font.ba(this.text),b=1;a>this.zr&&(b=this.zr/a);this.font.la(this.text,this.Gf,this.Hf,b,b,0,1);this.e.km&&(qa(0,0,this.Ka.width,this.Ka.height,"black",!0),qa(this.Ar-this.x,this.Br-this.y,this.Ka.width-2*(this.Ar-this.x),this.Ka.height-2*(this.Br-this.y),"red",!0),ra(this.Gf-5,this.Hf,this.Gf+5,this.Hf),ra(this.Gf,this.Hf-5,this.Gf,this.Hf+5));this.e.Fb=!0;B(this.Ka)};function ah(a){return""+a}function bh(a,b,c){return b+c}
function Lg(a,b,c,d,g,h){this.value=this.Qj=d||0;this.kl=-1;this.at=c;this.a=b;this.$s=-99999;this.ro=b.ro||0;this.wj=b.wj?b.wj:h||ah;c=bh;g&&0!==this.a.Pp&&(c=cc);this.Da=new $e(this.Qj,void 0===this.a.Pp?500:this.a.Pp,c);b.Bh&&(this.Bh="game_ui_"+b.Bh);this.text=ch(this)+this.wj(this.Qj);Gg.call(this,a,this.text,b)}Ze(Gg,Lg);Rg.GameUIValue=Lg;Lg.prototype.yf=function(a){this.value=a;bf(this.Da,this.value)};Lg.prototype.V=function(){return this.value};
Lg.prototype.Bo=function(a){var b=this.kl;if(a||G.ge-this.$s>this.ro)b=this.wj(Math.floor(this.Da.V()));this.kl!==b&&(this.$s=G.ge,this.kl=b,this.text=ch(this)+b,this.se())};Lg.prototype.ra=function(a){Gg.prototype.ra.apply(this,arguments);af(this.Da,a);Math.floor(this.Da.V())!==this.kl&&this.Bo()};function ch(a){var b="";a.a.zi&&(b=a.Bh?M.l.M(a.Bh,"<"+a.Bh.toUpperCase()+">"):M.l.M("game_ui_"+a.at,"<"+a.at+">"));return b+(a.a.separator?a.a.separator:"")}
function Og(a,b){this.Tl=this.Sc=0;this.a=b;this.ki=this.uf=0;this.f=b.f;this.be=b.be||b.f;this.Ym=b.Ym||null;this.a.tk=this.a.tk||0;this.a.uk=this.a.uk||0;this.Ml=!0;this.Hk=b.Hk||0;this.G=[];this.Da=new $e(0,200,gc);this.nc=new $e(0,200,gc);Vg.call(this,a,b,b.x,b.y,this.f.width,this.f.height)}Ze(Vg,Og);Rg.GameUIProgress=Og;
Og.prototype.ra=function(a){af(this.Da,a);var b=this.Da.V();b!==this.uf&&(this.e.Fb=!0,this.uf=b);af(this.nc,a);a=this.nc.V();a!==this.ki&&(this.e.Fb=!0,this.ki=a);b+=a;if(this.Ml)for(a=0;a<this.G.length;++a){var c=b>=this.G[a].position&&this.Sc+this.Tl>=this.G[a].position;this.G[a].complete!==c&&(this.a.G&&(this.e.Fb=!0,this.uf=b),this.G[a].complete=c)}};
Og.prototype.Xa=function(a,b){var c,d,g;if(0===this.Hk&&(0<this.nc.V()&&this.be.na(0,this.width*this.Da.V()/100,0,this.be.width*this.nc.V()/100,this.be.height,a+this.x+this.width*this.Da.V()/100,b+this.y),this.f.na(0,0,0,this.width*this.Da.V()/100,this.height,a+this.x,b+this.y),this.a.G))for(c=0;c<this.G.length;++c)d=this.G[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.q(0,a+this.x+this.width/100*d.position,b+this.y+this.a.G.y);if(1===this.Hk&&(0<this.nc.V()&&this.be.na(0,0,this.height-
this.height*this.Da.V()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Da.V()/100)),this.f.na(0,0,this.height-this.height*this.Da.V()/100,this.width,this.height,a+this.x,b+this.y+(this.height-this.height*this.Da.V()/100)),this.a.G))for(c=0;c<this.G.length;++c)d=this.G[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.q(0,a+this.x+this.a.G.x,b+this.y+this.height-this.height/100*d.position);if(2===this.Hk&&(0<this.nc.V()&&this.be.na(0,0,this.height*this.Da.V()/
100,this.be.width,this.be.height*this.nc.V()/100,a+this.x+this.width*this.Da.V()/100,b+this.y),this.f.na(0,0,0,this.width,this.height*this.Da.V()/100,a+this.x,b+this.y),this.a.G))for(c=0;c<this.G.length;++c)d=this.G[c],g=d.complete?s_ui_level_star_fill:s_ui_level_star_empty,g.q(0,a+this.x+this.a.G.x,b+this.y+this.height/100*d.position);this.Ym&&this.Ym.q(0,a+this.x+this.a.tk,b+this.y+this.a.uk)};function Sg(a,b,c){this.el=!1;this.vi=-1;this.e=a;this.a=b;this.Vn(c);Fg.call(this,a,b)}Ze(Fg,Sg);
Rg.GameUIButton=Sg;Sg.prototype.Vn=function(a){var b=null,c=null,d=this.e,g=this.a;void 0===a&&(a=g.X?g.X:0);switch(a){case 0:b=d.sg.ym?Hd:Id;c=function(){sf(M.e)?M.e.wg(!1,!0,d.sg.ym):M.e.wg();return!0};break;case 1:b=Jd;c=function(){M.e.wg();return!0};break;case 2:b=s_btn_small_quit;c=function(){dh(d.sg.ym);return!0};break;case 3:b=g.f}this.Lb=c;this.a.f=b};Sg.prototype.rb=function(a,b,c){return this.Uj(b-M.ff,c-M.he)?(this.el=!0,this.vi=a,$g(this,1),!0):!1};
Sg.prototype.ra=function(a){Fg.prototype.ra.apply(this,arguments);this.el&&(this.Uj(Cb(this.vi)-M.ff,G.ka[this.vi].y-M.he)?$g(this,1):$g(this,0))};Sg.prototype.Cb=function(a,b,c){return this.el&&a===this.vi?($g(this,0),this.Uj(b-M.ff,c-M.he)&&this.Lb&&this.Lb(),this.el=!1,this.vi=-1,!0):!1};
function Ng(a,b){this.Tl=this.Sc=0;this.a=b;this.ki=this.uf=0;this.Ml=!0;this.G=[];this.color=b.color||"#00AEEF";this.sp=b.sp||"#FF0F64";this.rp=b.rp||"#FFED93";this.It=void 0===b.blink||b.blink;this.yc=b.yc;this.rh=!1;this.Pe=0;this.Yi=1E3;this.Zi=0;this.Da=new $e(0,200,gc);this.nc=new $e(0,200,gc);Vg.call(this,a,b,b.x,b.y,1,1)}Ze(Vg,Ng);Rg.GameUIRoundProgress=Ng;
Ng.prototype.ra=function(a){af(this.Da,a);var b=this.Da.V();b!==this.uf&&(this.e.Fb=!0,this.uf=b);af(this.nc,a);var c=this.nc.V();c!==this.ki&&(this.e.Fb=!0,this.ki=c);this.rh&&(this.Pe+=a,this.Pe>=this.Yi?100===this.Sc?(this.rh=!1,this.It&&(this.rh?this.Pe-=this.Yi:(this.rh=!0,this.Zi=this.Pe=0,bf(this.Da,100)))):(this.rh=!1,this.Zi=0,this.Da.eg=0,this.Da.cl=0,bf(this.Da,this.Sc)):this.Zi=(-Math.cos(this.Pe/this.Yi*5*Math.PI*2)+1)/2,this.e.Fb=!0);b+=c;if(this.Ml)for(a=0;a<this.G.length;++a)c=b>=
this.G[a].position&&this.Sc+this.Tl>=this.G[a].position,this.G[a].complete!==c&&(this.a.G&&(this.e.Fb=!0,this.uf=b),this.G[a].complete=c)};Ng.prototype.Jj=function(a,b){this.yc&&Zg(this.x+this.I.ub+a-this.yc.yb,this.y+this.I.vb+b-this.yc.zb,this.yc.width*this.I.scale,this.yc.height*this.I.scale)};
Ng.prototype.Xa=function(a,b){var c,d;if(this.yc){d=this.Da.V()/100;d=Math.max(d,0);d=Math.min(d,1);var g=w.context,h=this.yc.width/2-N(4),k=g.fillStyle;if(0<this.nc.V()){var l=this.nc.V()/100;g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI+2*d*Math.PI,2*(d+l)*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.sp;g.fill()}g.beginPath();g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1);g.lineTo(this.x+a,this.y+b);g.fillStyle=this.color;g.fill();this.Yi&&(l=g.globalAlpha,
g.globalAlpha*=this.Zi,g.beginPath(),g.arc(this.x+a,this.y+b,h,.5*-Math.PI,2*d*Math.PI-.5*Math.PI,!1),g.lineTo(this.x+a,this.y+b),g.fillStyle=this.rp,g.fill(),g.globalAlpha=l);if(this.a.G){var l=g.strokeStyle,n=g.lineWidth;g.strokeStyle="white";g.lineWidth=N(2);for(d=0;d<this.G.length;++d){c=this.G[d];c=c.position/100*Math.PI*2;var q=Math.cos(-.5*Math.PI+c)*h;c=Math.sin(-.5*Math.PI+c)*h;g.beginPath();g.moveTo(Math.round(a+this.x),Math.round(b+this.y));g.lineTo(Math.round(a+this.x+q),Math.round(b+
this.y+c));g.stroke()}g.strokeStyle=l;g.lineWidth=n}this.yc.q(0,a+this.x,b+this.y);if(this.a.G)for(d=0;d<this.G.length;++d)c=this.G[d],h=c.complete?s_star_filled:s_star_empty,c=c.position/100*Math.PI*2,h.q(0,Math.round(a+this.x+Math.cos(-.5*Math.PI+c)*this.a.G.kw*.5),Math.round(b+this.y+Math.sin(-.5*Math.PI+c)*this.a.G.kw*.5));g.fillStyle=k}};M.version=M.version||{};M.version.game_ui="2.1.0";
var Bg=N(14),Cg=N(40),Ag={},eh={background:{f:id,Hq:N(0),Iq:N(34),elements:[{f:kd,x:N(46)+Bg,y:N(16)+Cg},{N:"game_ui_time_left",x:N(6)+Bg,y:N(52)+Cg,kb:N(100),qb:N(20),Wc:.2,font:T,Fd:{fillColor:"#9fa9bf",fontSize:N(20),Mc:"lower",align:"center",h:"top"}},{f:hd,x:N(9,"round")+Bg,y:N(124)+Cg},{N:"game_ui_SCORE",x:N(6)+Bg,y:N(140)+Cg,kb:N(100),qb:N(20),Wc:.2,font:T,Fd:{fillColor:"#9fa9bf",fontSize:N(20),Mc:"lower",align:"center",h:"top"}},{f:hd,x:N(9,"round")+Bg,y:N(200)+Cg},{N:"game_ui_HIGHSCORE",
x:N(6)+Bg,y:N(258)+Cg,kb:N(100),qb:N(20),Wc:.2,font:T,Fd:{fillColor:"#9fa9bf",fontSize:N(20),Mc:"lower",align:"center",h:"top"}},{f:hd,x:N(9,"round")+Bg,y:N(318)+Cg}]},Er:{x:N(6)+Bg,y:N(538)-N(86)+Cg},time:{x:N(6)+Bg,y:N(80)+Cg,kb:N(100),qb:N(38),Wc:.2,zi:!1,separator:"",font:T,Fd:{fontSize:N(38),fillColor:"#172348",align:"center",h:"top"}},P:{x:N(6)+Bg,y:N(166)+Cg,kb:N(100),qb:N(24),ro:50,Wc:.2,zi:!1,separator:"",font:T,Fd:{fontSize:N(24),fillColor:"#172348",align:"center",h:"top"}},Fq:{x:N(43,"round")+
Bg,y:N(212)+Cg,f:jd,Te:!1,lo:!0},Cq:{x:N(6)+Bg,y:N(284)+Cg,kb:N(100),qb:N(20),Wc:.2,zi:!1,separator:"",font:T,Fd:{fillColor:"#59668e",fontSize:N(20),align:"center",h:"top"}},Ch:{x:N(6)+Bg,y:N(362)+Cg,kb:N(100),qb:N(40),Wc:.2,zi:!1,separator:"",font:T,Fd:{fillColor:"#9fa9bf",fontSize:N(20),align:"center",h:"top",Mc:"lower"}},Ye:{x:N(56)+Bg,y:N(340)+Cg,f:md,Te:!1,lo:!1}},Kg=eh,Z={ws:{},xs:{},ys:{},zs:{},wn:{},xn:{},$w:{},Hu:{},ot:function(){Z.ws={sb:Z.ij,update:Z.Dd,ob:Z.Bd,end:Z.Cd,font:me,margin:20,
ed:J,fd:J,dd:ic([L,Yb,L],[!1,!1,!0],[.1,.8,.1])};Z.xs={sb:Z.ij,update:Z.Dd,ob:Z.Bd,end:Z.Cd,font:ne,margin:20,ed:J,fd:J,dd:ic([L,Yb,L],[!1,!1,!0],[.1,.8,.1])};Z.ys={sb:Z.ij,update:Z.Dd,ob:Z.Bd,end:Z.Cd,font:oe,margin:20,ed:J,fd:J,dd:ic([L,Yb,L],[!1,!1,!0],[.1,.8,.1])};Z.zs={sb:Z.ij,update:Z.Dd,ob:Z.Bd,end:Z.Cd,font:pe,margin:20,ed:J,fd:J,dd:ic([L,Yb,L],[!1,!1,!0],[.1,.8,.1])};Z.wn={sb:Z.Qt,update:Z.Dd,ob:Z.Bd,end:Z.Cd,Jh:qe,Ih:re,margin:20,ed:J,fd:J,dd:ic([L,Yb,L],[!1,!1,!0],[.1,.8,.1])};Z.xn={sb:Z.Rt,
update:Z.Dd,ob:Z.Bd,end:Z.Cd,Jh:qe,Ih:re,margin:20,ed:J,fd:J,dd:ic([L,Yb,L],[!1,!1,!0],[.1,.8,.1])};Z.$w={sb:Z.St,update:Z.Dd,ob:Z.Bd,end:Z.Cd,ed:J,fd:J,dd:ic([L,Yb,L],[!1,!1,!0],[.1,.8,.1])};Z.Hu={sb:Z.Pt,update:Z.Dd,ob:Z.Bd,end:Z.Cd,ed:J,fd:J,dd:ic([L,Yb,L],[!1,!1,!0],[.1,.8,.1])}},cy:function(a){function b(a){var d,g={};for(d in a)g[d]="object"===typeof a[d]&&null!==a[d]?b(a[d]):a[d];return g}return b(a)},kA:function(a){Z.ws.font.L=a;Z.xs.font.L=a;Z.ys.font.L=a;Z.zs.font.L=a},jA:function(a){Z.wn.Jh.L=
a;Z.wn.Ih.L=a;Z.xn.Jh.L=a;Z.xn.Ih.L=a},Og:!1,Ub:[],sw:function(a){Z.Og=a},Dy:function(){return Z.Og},nw:function(a){var b,c;for(b=0;b<Z.Ub.length;b+=1)c=Z.Ub[b],void 0===c||void 0!==a&&c.kind!==a||0<c.rg||(Z.Ub[b]=void 0)},nt:function(){Z.Og=!1;Z.Ub=[]},Qg:function(a,b,c,d){var g,h,k;void 0===d&&(d=Z.Og);if(d)for(h=0;h<Z.Ub.length;h+=1)if(g=Z.Ub[h],void 0!==g&&g.ke&&g.kind===a&&g.font===b&&g.text===c)return g.rg+=1,h;g={kind:a,font:b,text:c,rg:1,ke:d};h=b.align;k=b.h;Ha(b,"center");Ia(b,"middle");
d=b.ba(c)+2*a.margin;a=b.U(c)+2*a.margin;g.Ka=new y(d,a);z(g.Ka);b.q(c,d/2,a/2);B(g.Ka);Ha(b,h);Ia(b,k);for(h=0;h<Z.Ub.length;h+=1)if(void 0===Z.Ub[h])return Z.Ub[h]=g,h;Z.Ub.push(g);return Z.Ub.length-1},lt:function(a){var b=Z.Ub[a];b.rg-=1;0>=b.rg&&!b.ke&&(Z.Ub[a]=void 0)},ij:function(a){a.buffer=Z.Qg(a.kind,a.kind.font,a.value,a.ke)},Qt:function(a){var b=a.value.toString();a.buffer=0<=a.value?Z.Qg(a.kind,a.kind.Jh,b,a.ke):Z.Qg(a.kind,a.kind.Ih,b,a.ke)},Rt:function(a){var b=a.value.toString();0<
a.value&&(b="+"+b);a.buffer=0<=a.value?Z.Qg(a.kind,a.kind.Jh,b,a.ke):Z.Qg(a.kind,a.kind.Ih,b,a.ke)},St:function(a){a.Ka=a.value},Pt:function(a){a.f=a.value;a.jb=0},Dd:function(a){a.x=void 0!==a.kind.ed?a.kind.ed(a.time,a.Sk,a.Up-a.Sk,a.duration):a.Sk+a.time/a.duration*(a.Up-a.Sk);a.y=void 0!==a.kind.fd?a.kind.fd(a.time,a.Tk,a.Vp-a.Tk,a.duration):a.Tk+a.time/a.duration*(a.Vp-a.Tk);void 0!==a.kind.Qp&&(a.vf=a.kind.Qp(a.time,0,1,a.duration));void 0!==a.kind.Rp&&(a.wf=a.kind.Rp(a.time,0,1,a.duration));
void 0!==a.kind.dd&&(a.alpha=a.kind.dd(a.time,0,1,a.duration));void 0!==a.kind.bu&&(a.La=a.kind.bu(a.time,0,360,a.duration)%360);void 0!==a.f&&(a.jb=a.time*a.f.J/a.duration)},Bd:function(a){var b=w.context,c;void 0!==a.f&&null!==a.images?1===a.vf&&1===a.wf&&0===a.La?a.f.cd(Math.floor(a.jb),a.x,a.y,a.alpha):a.f.la(Math.floor(a.jb),a.x,a.y,a.vf,a.wf,a.La,a.alpha):(c=void 0!==a.Ka&&null!==a.Ka?a.Ka:Z.Ub[a.buffer].Ka,1===a.vf&&1===a.wf&&0===a.La?c.cd(a.x-c.width/2,a.y-c.height/2,a.alpha):1E-4>Math.abs(a.vf)||
1E-4>Math.abs(a.wf)||(b.save(),b.translate(a.x,a.y),b.rotate(-a.La*Math.PI/180),b.scale(a.vf,a.wf),c.cd(-c.width/2,-c.height/2,a.alpha),b.restore()))},Cd:function(a){void 0!==a.buffer&&Z.lt(a.buffer)},nd:function(a){var b,c,d=!1;for(b=0;b<Z.lb.length;b+=1)c=Z.lb[b],void 0!==c&&(0<c.qa?(c.qa-=a,0>c.qa&&(c.time+=-c.qa,c.qa=0)):c.time+=a,0<c.qa||(c.time>=c.duration?(c.kind.end(c),Z.lb[b]=void 0):c.kind.update(c),d=!0));d&&(Z.canvas.$=!0)},Xa:function(){var a,b;for(a=0;a<Z.lb.length;a+=1)b=Z.lb[a],void 0!==
b&&(0<b.qa||b.kind.ob(b))},lb:[],Ju:function(a,b,c){Z.Tp();void 0===a&&(a=M.gg);void 0===b&&(b=-1E6);void 0===c&&(c=["game"]);Z.visible=!0;Z.i=!0;M.b.Ua(Z,a);Z.depth=b;H(Z);Nb(Z,c);Z.nt();Z.ot()},Gx:function(a,b,c,d,g,h,k,l,n){void 0===l&&(l=void 0!==a.qa?a.qa:0);void 0===n&&(n=Z.Og);void 0===g&&void 0!==a.Hv&&(g=c+a.Hv);void 0===h&&void 0!==a.Iv&&(h=d+a.Iv);void 0===k&&void 0!==a.duration&&(k=a.duration);a={kind:a,value:b,Sk:c,Tk:d,Up:g,Vp:h,x:c,y:d,vf:1,wf:1,alpha:1,La:0,time:0,duration:k,qa:l,
ke:n};a.kind.sb(a);for(b=0;b<Z.lb.length;b+=1)if(void 0===Z.lb[b])return Z.lb[b]=a,b;Z.lb.push(a);return Z.lb.length-1},Rz:function(a){var b;0>a||a>=Z.lb.length||(b=Z.lb[a],void 0!==b&&(b.kind.end(b),Z.lb[a]=void 0))},mw:function(){var a,b;for(a=0;a<Z.lb.length;a+=1)b=Z.lb[a],void 0!==b&&(b.kind.end(b),Z.lb[a]=void 0);Z.lb=[]},Tp:function(){Z.mw();Z.nw();I(G,Z)}};
function $(a,b,c,d){this.ua=this.depth=0;this.visible=!1;this.i=!0;this.Ae=a;this.qd=b;this.open=!1;this.x=void 0===c?0:c;this.y=void 0===d?0:d;this.yj=this.x;this.zj=this.y;this.Yk=this.x;this.Zk=this.y;this.alpha=1;this.Nr=M.a.j.$l.shadowOffsetX/2;this.Or=M.a.j.$l.shadowOffsetY/2;this.gq=this.Tc=0;this.Lu=!1;this.po=this.Be=0;this.us=this.vs=L;this.Mg=0;this.ll=2500;this.Cx=M.qu/2;this.gt=!1;this.ya=this.xa=1;this.sm=this.af=0;this.Wr=!1;this.fu=function(a){return.1>a?ac(a,1,1.3-1,.2):.2>a?1.3:
.45>a?ac(a-.2,1.3,-1.2,.2):.7>a?$b(a-.45,.1,1.2,.2):.8>a?1.3:$b(a-.8,1.3,-(1.3-1),.2)};this.gu=ic([ac,Yb,ac],[!1,!1,!0],[.1,.7,.2]);this.Aw=ic([ac,ac],[!1,!0]);this.Qh=!0;H(this);Nb(this,["game","item"]);M.b.Ua(this,M.gg)}e=$.prototype;e.oq=function(){return this.open===this.Qh?{f:Q,ps:13*this.Ae+this.qd-1}:{f:$d,ps:0}};
function fh(a,b,c,d,g){void 0===b&&(b=0);void 0===c&&(c=0);a.af=b+c;a.sm=b;a.open=!a.open;a.Qh=!1;a.Wr=void 0===g?!1:g;a.i=!0;if(void 0===c||0===c)a.visible=!0;void 0===d&&(d=!1);void 0===a.$b||d||a.$b.Nb()}
e.ra=function(a){var b=1,b=1;this.i=!1;0<this.Be?(this.i=!0,this.Be-=a,this.Be>this.po?b=0:(this.visible=!0,b=0>=this.Be?1:1-this.Be/this.po),b=this.us(b,0,1,1),this.x=this.yj+(this.Yk-this.yj)*b,this.y=this.zj+(this.Zk-this.zj)*b,this.Lu?(this.Tc+=(1-this.Tc)/2*a/12,this.Tc=Math.min(this.Tc,1)):this.Tc=this.gq*(1-b)):(this.x=this.Yk,this.y=this.Zk);0<this.af?(this.i=!0,this.af-=a,this.af>this.sm?b=0:(this.visible=!0,b=0>=this.af?1:1-this.af/this.sm),!this.Qh&&.45<b&&(this.Qh=!0,F.play(we)),this.Wr?
(b=this.Aw(b,0,1,1),this.xa=1-.99*b,this.ya=1+.2*b):(this.xa=this.fu(b),this.ya=this.gu(b,1,.3,1))):this.Qh=!0;if(this.gt)if(this.Mg+=a,this.Mg>=this.ll)this.i=this.gt=!1;else{this.i=!0;this.x=this.yj+L(this.Mg,0,-this.Cx,this.ll);a=this.zj;var c=this.ll,b=M.ju,d=c-this.Mg,g=2,h=5,k,l,n;void 0===g&&(g=4);h=void 0===h?2:Math.sqrt(h);k=[1];for(l=n=1;l<g;l+=1)k.push(k[l-1]*h),n+=k[l];n-=k[g-1]/2;h=Math.pow(k[g-1],2);d=d/c*n;for(l=c=0;l<g;l+=1)if(d>k[l])d-=k[l];else{c=k[l];break}this.y=a+(0+b*(1+-1*(-4*
Math.pow(d-c/2,2)+c*c)/h));this.alpha=dc(this.Mg,1,-1,this.ll)}!1===this.i&&(this.visible=!1,void 0!==this.$b&&this.$b.Nb())};e.nd=function(){this.canvas.$=!0};e.Xa=function(){w.context.save();w.context.translate(this.x-2*this.Nr*this.Tc,this.y-2*this.Or*this.Tc);w.context.scale(this.xa,this.ya);qd.la(0,2*this.Nr*this.Tc,2*this.Or*this.Tc,1,1,0,this.alpha);this.Nb(0,0);w.context.restore()};
e.Nb=function(a,b){var c=this.oq();c.f.la(c.ps,a,b,1,1,0,this.alpha);M.a.j.debug.Zt&&w.context.fillText("s"+this.Ae+"c"+this.qd,a+4,b-Q.height/3)};e.md=function(){return new Rect(this.x-Q.width/2,this.y-Q.height/2,Q.width,Q.height)};function Rect(a,b,c,d){this.x=a;this.y=b;this.width=c;this.height=d}Rect.prototype.contains=function(a,b){return a>=this.x&&a<=this.x+this.width&&b>=this.y&&b<=this.y+this.height};function gh(a){return new Rect(a.x-1,a.y-1,a.width+2,a.height+2)}
function hh(a,b,c){b<a.x?(a.width=a.x-b+a.width,a.x=b):b>a.x+a.width&&(a.width=b-a.x);c<a.y?(a.height=a.y-c+a.height,a.y=c):c>a.y+a.height&&(a.height=c-a.y)}function ih(a){return[new p(a.x,a.y),new p(a.x+a.width,a.y),new p(a.x,a.y+a.height),new p(a.x+a.width,a.y+a.height)]}function jh(a,b,c){this.x=a;this.y=b;this.Jr=c;this.o=[];this.oi="squared";this.Ta=-1;this.hd=new p(0,20);this.aq=.5;this.op=0;this.vk=this.wk="none";this.ak=-1;this.Xi=0;this.ob=!0}
function kh(a,b,c){if("alternate"===a.wk){if(null!==b&&(0===b.Ae||3===b.Ae?"black":"red")===(0===c.Ae||3===c.Ae?"black":"red"))return!1}else if("same"===a.wk&&null!==b&&b.Ae!==c.Ae)return!1;if("asc"===a.vk)if(null===b){if(1!==c.qd)return!1}else{if(b.qd+1!==c.qd)return!1}else if("desc"===a.vk)if(null===b){if(!0===M.k.Hd.En&&13!==c.qd)return!1}else if(b.qd-1!==c.qd)return!1;return!0}
function lh(a,b){var c=0;if(0<=a.ak&&a.o.length+b.length>a.ak||!kh(a,mh(a),b[0]))return!1;for(c=0;c<b.length-1;c+=1)if(!kh(a,b[c],b[c+1]))return!1;a.o=a.o.concat(b);return!0}function mh(a){return 0===a.o.length?null:a.o[a.o.length-1]}function nh(a,b){return 0<=a.ak&&a.o.length>=a.ak?!1:kh(a,mh(a),b)?(a.o.push(b),!0):!1}jh.prototype.pop=function(){return this.o.pop()};
jh.prototype.ld=function(a){var b,c=new p(this.x,this.y),d;if("fanned"===this.oi&&(b=0<=this.Ta?Math.max(0,this.o.length-this.Ta):0,a>=b))for(d=b;d<a;d+=1)b=this.o[d].open?1:this.aq,c=c.add(this.hd.scale(b));return c};jh.prototype.md=function(a){a=this.ld(a);return new Rect(a.x-Q.width/2*1,a.y-Q.height/2*1,1*Q.width,1*Q.height)};
function oh(a){var b,c,d;return"fanned"===a.oi?(b=a.md(0),c=new Rect(b.x,b.y,b.width,b.height),-1===a.Ta?(0<a.hd.x?c.x+=w.width:0>a.hd.x&&(c.x-=w.width),0<a.hd.y?c.y+=w.height:0>a.hd.y&&(c.y-=w.height)):(d=Math.max(a.Ta,a.op),c.x+=a.hd.x*d,c.y+=a.hd.y*d),hh(b,c.x,c.y),hh(b,c.x+c.width,c.y+c.height),gh(b)):gh(a.md(0))}
function ph(a,b,c,d,g,h,k){var l,n,q,v;void 0===c&&(c=0);void 0===d&&(d=0);void 0===h&&(h=0);void 0===k&&(k=!1);for(l=0;l<a.o.length;l+=1){q=l>=d;n=h+Math.max(0,l-d)*c;v=b;!q&&k&&(n=0,v*=2);var E=a,A=l,r=v,s=n;n=g;var t=E.Xi-A,u=E.ld(A);void 0===s&&(s=0);A=E.o[A];v=u.x;u=u.y;A.yj=A.x;A.zj=A.y;A.Yk=v;A.Zk=u;A.gq=A.Tc;void 0!==t&&Mb(A,t);if(!(!0!==q&&0>=A.Be&&A.x===v&&A.y===u)){void 0===s&&(s=0);A.Be=r+s;A.po=r;A.us=A.vs;A.i=!0;if(void 0===s||0===s)A.visible=!0;void 0===n&&(n=!1);void 0===A.$b||n||
A.$b.Nb();A.$b=E}}}jh.prototype.Nb=function(){var a,b,c;if(!0===this.ob){M.b.hb(M.cf);a=oh(this);Zg(a.x,a.y,a.width,a.height);M.a.j.debug.$t&&qa(a.x,a.y,a.width,a.height,"red",!0);void 0!==this.Jr&&(c=this.ld(0),this.Jr.la(0,c.x,c.y,1,1,0,1));if(this.Gu)for(a=0;a<this.o.length;a+=1)b=this.o[a],c=this.ld(a),b.x===c.x&&b.y===c.y&&qd.la(0,c.x,c.y,1,1,0,1);for(a=0;a<this.o.length;a+=1)b=this.o[a],c=this.ld(a),b.x!==c.x||b.y!==c.y||b.visible||b.Nb(Math.round(c.x),Math.round(c.y))}};
function qh(a,b,c){this.depth=c;this.ua=0;this.i=this.visible=!0;this.x=a;this.y=b;this.jb=0;this.ls=9;this.startTime=G.ge;this.duration=M.a.j.$l.au;H(this);Nb(this,["game","item"]);M.b.Ua(this,M.gg)}qh.prototype.Xa=function(){var a=Math.floor((G.ge-this.startTime)/this.duration*this.ls);a>=this.ls?I(G,this):vd.la(a,this.x,this.y,1,1,0,1)};function rh(){this.zc=this.fe=this.ia=this.Sb=void 0}
function sh(a){var b=52,c,d,g;c=M.a.j.od.Hp+M.df;var h=M.a.j.od.Ip+M.ef;if(!0===a){a=[];for(d=0;4>d;d+=1)for(g=1;14>g;g+=1)a.push(new $(d,g,c,h));for(;b;)d=Math.floor(Math.random()*b),b-=1,c=a[b],a[b]=a[d],a[d]=c}else a=[new $(0,1,c,h),new $(1,1,c,h),new $(0,2,c,h),new $(1,2,c,h),new $(0,3,c,h),new $(1,3,c,h),new $(0,4,c,h),new $(1,4,c,h),new $(0,5,c,h),new $(1,5,c,h),new $(0,6,c,h),new $(1,6,c,h),new $(0,7,c,h),new $(1,7,c,h),new $(0,8,c,h),new $(1,8,c,h),new $(0,9,c,h),new $(1,9,c,h),new $(0,10,
c,h),new $(1,10,c,h),new $(0,11,c,h),new $(1,11,c,h),new $(0,12,c,h),new $(1,12,c,h),new $(3,13,c,h),new $(2,13,c,h),new $(2,12,c,h),new $(3,11,c,h),new $(2,11,c,h),new $(3,12,c,h),new $(3,9,c,h),new $(2,9,c,h),new $(3,10,c,h),new $(2,10,c,h),new $(2,6,c,h),new $(3,7,c,h),new $(2,7,c,h),new $(3,8,c,h),new $(2,8,c,h),new $(2,3,c,h),new $(3,4,c,h),new $(2,4,c,h),new $(3,5,c,h),new $(2,5,c,h),new $(3,6,c,h),new $(1,13,c,h),new $(0,13,c,h),new $(3,1,c,h),new $(2,1,c,h),new $(3,2,c,h),new $(2,2,c,h),new $(3,
3,c,h)];return a}function th(){var a=M.k.D,b;for(b=0;b<a.fe.length;b+=1)if(13!==a.fe[b].o.length)return!1;return!0}
rh.prototype.sb=function(a){var b,c,d,g,h,k,l,n=sh(!0!==a);b=7*M.a.j.od.Dn;l=new jh(M.a.j.od.Hp+M.df,M.a.j.od.Ip+M.ef);l.o=[n[0]];a=new Vb;a.sa(b,function(){l.o=[];l.Nb()});a.start();Nb(a,["game","item"]);a=new jh(M.a.j.Sb.sf+M.df,M.a.j.Sb.tf+M.ef,rd);g=24;a.o=n.slice(0,g);ph(a,M.a.j.od.Vw,M.a.j.od.Ww,void 0,void 0,b);a.Xi=-104;a.Qy=!0;b=new jh(M.a.j.ia.sf+M.df,M.a.j.ia.tf+M.ef,sd);b.oi="fanned";b.Ta=M.k.Hd.Hh;b.op=M.k.Hd.Hh;b.hd=new p(M.a.j.ia.uj,M.a.j.ia.vj);b.aq=1;b.Xi=-52;b.Oq=!0;c=[];for(h=0;4>
h;h+=1)d=new jh(M.a.j.wm.sf+h*(Q.width+M.a.j.wm.offset)+M.df,M.a.j.wm.tf+M.ef,ud),d.wk="same",d.vk="asc",d.Tj=!0,c.push(d);d=[];for(h=1;8>h;h+=1)k=new jh(M.a.j.$b.sf+(h-1)*(Q.width+M.a.j.$b.offset)+M.df,M.a.j.$b.tf+M.ef,td),k.oi="fanned",k.wk="alternate",k.vk="desc",k.hd=new p(M.a.j.$b.uj,M.a.j.$b.vj),k.Py=!0,k.o=n.slice(g,g+h),g+=h,mh(k).open=!0,d.push(k),ph(k,M.a.j.od.Uv,M.a.j.od.Dn,void 0,void 0,(h-1)/7*M.a.j.od.Dn);a.Nb();b.Nb();l.Nb();for(h=0;h<c.length;h+=1)c[h].Nb();for(h=0;h<d.length;h+=1)d[h].Nb();
n=F.play(ue);F.Pk(n,!0);F.stop(n,4E3,bc);this.Sb=a;this.ia=b;this.fe=c;this.zc=d};function uh(){this.ua=this.depth=0;this.visible=!0;this.i=!1;this.Hn=0;this.Ze=3600;this.rf=-1;this.yk=0;this.xk=void 0;this.hi=new p(0,0);this.pe=new p(0,0);this.Ns=[];this.de=new vh;H(this);Nb(this,["game","item"]);M.b.Ua(this,M.gg)}
function wh(a,b,c){var d=ve;b!==c&&(!0===c.Tj&&!0!==b.Tj?(!0===b.Oq&&a.P(M.k.P.hk),a.P(M.k.P.jk),d=ze):!0===b.Tj&&!0!==c.Tj?a.P(M.k.P.un):!0===b.Oq?a.P(M.k.P.hk):a.P(M.k.P.move));F.play(d)}e=uh.prototype;e.P=function(a){var b=M.k.Ob,c=b.ue.V();b.Uf(a);0>b.ue.V()&&Tg(b,0);a=b.ue.V()-c;0<a&&this.de.Uf(a)};e.sb=function(){this.i=!0};function xh(a,b){a.Ze=Math.max(b,a.Ze)}
function yh(a){var b,c,d,g,h,k,l,n;g=[];n=M.k.D.ia.Ta;if(0===M.k.D.Sb.o.length){if(M.k.Hd.ko){h=M.a.j.eb.nx;k=M.a.j.eb.mx;l=.2*h;c=M.k.D.ia.o.length;for(b=0;b<c;b+=1)d=M.k.D.ia.pop(),fh(d,h-2*l,l+b*k,void 0,!0),M.k.D.Sb.o.push(d),g.unshift(d);zh(a.de,M.k.D.ia,M.k.D.Sb,g);ph(M.k.D.Sb,h,k);xh(a,k*(c-1)+h);a.P(M.k.P.Ln)}}else{h=M.a.j.eb.qx;k=M.a.j.eb.ox;l=M.a.j.eb.px;c=Math.min(M.k.D.Sb.o.length,M.k.Hd.Hh);M.k.D.ia.Ta=c;for(b=0;b<c;b+=1)d=M.k.D.Sb.pop(),fh(d,h,k*b,!0),nh(M.k.D.ia,d),g.unshift(d);zh(a.de,
M.k.D.Sb,M.k.D.ia,g,!1,M.k.D.ia.Ta-n);M.k.D.ia.Nb();ph(M.k.D.ia,.5*h,k,M.k.D.ia.o.length-c,!0,.2*h,!0);b=k*(c-1)+h;xh(a,b);a.P(M.k.P.rm);a=new Vb;a.sa(b+l,function(){var a=mh(M.k.D.ia);null!==a&&new qh(a.Yk,a.Zk,a.depth+1)});a.sa(k*(c-1),function(){M.k.D.Sb.Nb()});a.start();Nb(a,["game","item"])}}function Ah(a){var b,c,d=M.k.D.zc.concat(M.k.D.fe),g=[],h=[];for(b=0;b<a.length;b+=1)for(c=0;c<d.length;c+=1)!h[c]&&oh(d[c]).contains(a[b].x,a[b].y)&&(g.push(d[c]),h[c]=!0);return g}
function Bh(a){0===a.de.fj.length||a.Ns.push(a.de);a.de=new vh}e.xi=function(){Bh(this);var a=this.Ns.pop();a&&(a.xi(),this.P(M.k.P.Ao))};
e.rb=function(a){var b;if(!(0<this.Ze)&&-1===this.rf){this.rf=a;this.yk=0;this.xk=void 0;this.hi=new p(Cb(a),G.ka[a].y);Bh(this);a:{a=this.hi.x;b=this.hi.y;var c,d,g,h=M.k.D.zc.concat(M.k.D.fe);for(c=0;c<h.length;c+=1){b:{g=h[c];d=a;for(var k=b,l=void 0,l=g.o.length-1;0<=l;l-=1)if(g.md(l).contains(d,k)){g=l;break b}g=0<g.o.length&&oh(g).contains(d,k)?-1:-2}if(-2!==g){if(-1===g)g=h[c].o.length-1;else for(d=g;d<h[c].o.length;d+=1)if(h[c].o[d].open){g=d;break}b:{d=h[c];k=0;for(k=d.o.length-1;k>=g;k-=
1)if(!d.o[k].open||k<d.o.length-1&&!kh(d,d.o[k],d.o[k+1])){d=!1;break b}d=!0}if(d){a={gb:h[c],ej:g};break a}}}g=M.k.D.ia.o.length-1;a=0<=g&&M.k.D.ia.md(g).contains(a,b)?{gb:M.k.D.ia,ej:g,xm:!0}:void 0}void 0!==a&&(a.zk=a.gb.ld(a.ej),a.xb=new jh(a.zk.x,a.zk.y),a.xb.oi="fanned",a.xb.Xi=-104,a.xb.ob=!1,a.xb.Gu=!0,a.xb.o=a.gb.o.slice(a.ej),a.xb.hd=new p(M.a.j.$b.uj,M.a.j.$b.vj),a.gb.o=a.gb.o.slice(0,a.ej),!0===a.xm&&(b=a.gb.Ta,a.gb.Ta=Math.max(a.gb.Ta-1,0),a.eu=a.gb.Ta-b),ph(a.xb,100));this.xk=a}};
e.nd=function(a){var b,c;this.canvas.$=!0;this.Ze=Math.max(this.Ze-a,0);0<this.Ze||-1===this.rf||(this.yk+=a,this.pe=new p(Cb(this.rf),G.ka[this.rf].y),c=this.xk,void 0!==c&&(b=da(this.pe,this.hi),c.xb.x=c.zk.x+b.x,c.xb.y=c.zk.y+b.y,ph(c.xb,a)))};
e.Cb=function(a){var b,c,d,g=0,h,k=null,l,n,q=M.a.j.eb.Mn,v=M.a.j.eb.lw;if(!(0<this.Ze)&&this.rf===a)if(this.rf=-1,a=da(this.pe,this.hi).length(),c=this.yk<M.a.j.eb.jm&&30>a,a=0,b=this.xk,void 0!==b)if(n=function(){g=b.gb.o.length;!0===b.xm&&(b.gb.Ta+=1);b.gb.o=b.gb.o.concat(b.xb.o);ph(b.gb,q,v,g)},c)n(),this.click(this.pe.x,this.pe.y);else{c=!1;h=[b.xb,{x:b.xb.x,y:b.xb.y-Q.height/2},this.pe];h=h.concat(ih(b.xb.o[0].md()));h=Ah(h);for(l=0;l<h.length;l+=1)if(k=h[l],g=k.o.length,lh(k,b.xb.o)){c=!0;
break}c?(ph(k,q,v,g),Ch(this),b.xm?a=b.eu:d=Dh(this,b.gb),wh(this,b.gb,k),zh(this.de,b.gb,k,b.xb.o,d,a)):(F.play(xe),n())}else this.click(this.pe.x,this.pe.y)};function Ch(a){var b,c,d,g;if(!0===th())xh(a,800),a=new Vb,a.sa(400,function(){M.k.mt.call(M.k)}),a.start(),Nb(a,["game","item"]);else if(!0===M.a.j.eb.hm&&0===M.k.D.ia.o.length&&0===M.k.D.Sb.o.length){b=M.k.D.zc;d=!0;for(c=0;c<b.length;c+=1)for(g=0;g<b[c].o.length;g+=1)d=d&&b[c].o[g].open;d&&a.hm()}}
e.hm=function(){var a=M.k.D.fe,b,c,d=M.a.j.eb.xt,g=M.a.j.eb.wt,h,k=this;b=13;for(c=0;c<a.length;c+=1)b=0===a[c].o.length?1:Math.min(b,mh(a[c]).qd);h=(13-b+1)*(d+g);xh(this,h);M.k.jl.Pa=void 0;for(a=b;13>=a;a+=1)c=new Vb,c.sa((a-b)*(d+g),Eh(a,d)),c.start(),Nb(c,["game","item"]);c=new Vb;c.sa(h,function(){Ch(k)});c.start();Nb(c,["game","item"])};
function Eh(a,b){var c=M.k.D.fe.slice(0),d=M.k.D.zc;c.sort(function(a,b){return b.o.length-a.o.length});return function(){var g,h,k;for(g=0;g<d.length;g+=1)if(h=d[g],k=mh(h),null!==k&&k.qd===a)for(k=h.pop(),h=0;h<c.length;h+=1)if(nh(c[h],k)){ph(c[h],b);M.k.vh.P(M.k.P.jk);F.play(ze);break}}}
e.click=function(a,b){var c,d,g=M.a.j.eb.zp,h=!1;if(G.ge-this.Hn<=M.a.j.eb.jm){xh(this,M.a.j.eb.jm);h=M.k.D.zc.concat([M.k.D.ia]);for(g=0;g<h.length;g+=1)if(c=mh(h[g]),null!==c&&c.open&&c.md().contains(a,b)){Fh(this,h[g],c);break}this.Hn=0}else{d=M.k.D.Sb;c=d.md(0);d=d.md(d.o.length-1);hh(c,d.x,d.y);hh(c,d.x+d.width,d.y+d.height);c.contains(a,b)&&(yh(this),h=!0);for(d=0;d<M.k.D.zc.length;d+=1)0!==M.k.D.zc[d].o.length&&(c=mh(M.k.D.zc[d]),!c.open&&M.k.D.zc[d].md(M.k.D.zc[d].o.length-1).contains(a,b)&&
(F.play(we),fh(c,g),xh(this,g),this.P(M.k.P.nk),h=!0));this.Hn=h?0:G.ge}};function Fh(a,b,c){var d,g,h,k;g=M.k.D.zc.slice(0);var l=M.a.j.eb.Wt,n;g.sort(function(a,b){return b.o.length-a.o.length});n=M.k.D.fe.concat(g);for(d=h=0;d<n.length;d+=1)if(g=n[d],g!==b&&lh(g,[c])){b.pop();b===M.k.D.ia?(d=b.Ta,b.Ta=Math.max(b.Ta-1,0),h=b.Ta-d):k=Dh(a,b);ph(g,l,0,g.o.length-1);Mb(c,-999);xh(a,l);wh(a,b,g);Ch(a);zh(a.de,b,g,[c],k,h);break}}
function Dh(a,b){var c=M.a.j.eb.zp,d=mh(b);if(null!==d&&!1===d.open)return fh(d,c),xh(a,c),a.P(M.k.P.nk),!0}function Gh(){this.depth=10;this.i=this.visible=!1;H(this);Nb(this,["game"])}Gh.prototype.pq=function(){var a,b,c;a=[];b=[xd,yd,zd,Ad,Bd];for(c=0;c<b.length;c+=1)a.push({f:b[c],text:M.l.M("TutorialText_"+c,"<TUTORIAL_TEXT_"+c+">"),title:M.l.M("TutorialTitle_"+c,"<TUTORIAL_TITLE_"+c+">")});return a};
function Hh(){this.depth=0;this.i=!1;this.visible=!0;M.b.Ua(this,M.cf);this.a=M.a.j.Nu;H(this);Nb(this,["game"])}Hh.prototype.rt=function(){var a;this.i=!0;this.Ob.setTime(this.P.Zm);a=new Vb;a.sa(this.P.so,function(){0<M.k.Ob.getTime()&&(M.k.Ob.Uf(M.k.P.Cn),0>M.k.Ob.ue.V()&&Tg(M.k.Ob,0))});a.Pk(!0);a.start();Nb(a,["game","item"]);this.D.sb(M.a.j.debug.Rw);this.vh.sb()};
Hh.prototype.mt=function(){var a,b;this.i=!1;this.jl.Pa=!1;M.k.Ob.Uf(M.k.P.Jm);a=Math.round(M.k.Ob.getTime()/1E3);b=a%60;a=Math.round((a-b)/60)+":"+("00"+b.toString()).slice(-2);Ih(M.e,{totalScore:M.k.Ob.ue.V(),timeLeft:a,timeBonus:Math.round(M.k.Ob.getTime()/M.k.P.Ul*M.k.P.Sl)})};
Hh.prototype.dc=function(){var a,b;Z.Ju();Z.sw(!0);Zg();a=M.a.j.cr[uf()];this.Hd=a.Hd;this.P=a.P;this.Ob=new Jg;Tg(this.Ob,this.P.je);this.Ob.setTime(0);(a=yg())||(a=0);Ug(this.Ob,a);this.D=new rh;this.vh=new uh;b=this;this.jl=new X("landscape"===M.orientation?this.a.wx:this.a.xx,"landscape"===M.orientation?this.a.yx:this.a.zx,-1E3,Tb(wd),[wd],function(){b.vh.xi.call(b.vh);return!0});M.b.Ua(this.jl,M.gg);Jh(M.l.M("levelStartHeader","<levelStartHeader>"),M.l.M("levelStartText","<levelStartText>"),
this.rt,this)};Hh.prototype.Zb=function(){var a=G,b,c=Ob(a,"item");for(b=0;b<c.length;b+=1)I(a,c[b]);I(G,this.Ob);I(G,this.jl);Z.Tp()};function Kh(a,b,c,d,g){this.fg=a;this.Is=b;this.o=c;this.hu=d;this.$p=g}
Kh.prototype.xi=function(){var a,b;a=M.a.j.eb.Mn;this.hu&&(b=mh(this.fg),null!==b&&b.open&&fh(b));this.$p&&(M.k.D.ia.Ta-=this.$p);b=this.fg;b.o=b.o.concat(this.o);ph(this.fg,a,0,0,!1,0);for(a=0;a<this.o.length;++a){this.Is.pop();b=this.o[a];var c=-999-a;void 0!==c&&Mb(b,c);(this.fg===M.k.D.Sb&&b.open||this.fg===M.k.D.ia&&!b.open)&&fh(b)}if(this.fg===M.k.D.ia||this.Is===M.k.D.ia)M.k.D.ia.Nb(),ph(M.k.D.ia,0,0,0,!0)};function vh(){this.fj=[];this.P=0}
function zh(a,b,c,d,g,h){b!==c&&a.fj.push(new Kh(b,c,d,g,h))}vh.prototype.Uf=function(a){this.P+=a};vh.prototype.xi=function(){M.k.Ob.Uf(-this.P);for(var a=M.a.j.eb.Mn,b=this.fj.length-1;0<=b;--b)this.fj[b].xi();xh(M.k.vh,a)};M.version=M.version||{};M.version.game="1.3";eh.Ch={x:N(6)+Bg,y:N(384)+Cg,kb:N(100),qb:N(40),Wc:.2,zi:!1,separator:"",font:T,Fd:{fillColor:"#9fa9bf",fontSize:N(20),align:"center",h:"top",Mc:"lower"}};eh.Ye={x:N(28)+Bg,y:N(330)+Cg,f:be,images:[be,ce,ae],Te:!1,lo:!0};
M.version=M.version||{};M.version.theme="1.0";M.version=M.version||{};M.version.game_theme="1.1";M.s=M.s||{};M.s.Kj=function(){document.title=m.jd.sx||m.jd.oo||m.jd.tn?M.a.O.j.nq?M.a.O.j.nq+" \u2013 Coolmath Games Mobile":"Coolmath Games Mobile":"Coolmath Games";M.s.Nn("startScreen");M.s.Nn("levelMapScreen");M.s.Nn("inGame");M.s.tq=void 0;Ve()};M.s.Nn=function(a){if(a=M.a.u.options.buttons[a]){var b=a.indexOf("moreGames");0<=b&&a.splice(b,1)}};
M.s.Hj=function(){var a=new y(dd.width,dd.height);z(a);dd.q(0,0,0);B(a);return a};M.s.Pc=function(){};M.version=M.version||{};M.version.configuration_coolmath="1.0";
function Lh(){this.depth=-1E6;this.i=this.visible=!0;this.ua=M.Gd;this.end=this.fa=this.bn=this.an=this.load=this.sb=!1;this.tm=0;this.Fo=this.Ci=!1;this.state="GAME_INIT";this.screen=null;this.wr=this.nb=this.B=0;this.um=!1;this.Xj=this.Yj=!0;this.Kv=1;this.Kc=!1;this.Bc={};this.aa={difficulty:1,playMusic:!0,playSFX:!0,language:M.l.Mm()};window.addEventListener("gameSetPause",this.uq,!1);window.addEventListener("gameResume",this.vq,!1);document.addEventListener("visibilitychange",this.Cu,!1);this.If=
"timedLevelEvent"}e=Lh.prototype;e.uq=function(){F.pause("master");G.pause()};e.vq=function(){F.li("master");ub(G);Ab(G);Fb(G);G.li()};e.Cu=function(){document.hidden?M.e.uq():M.e.vq()};
e.tl=function(){var a,b=this;void 0!==M.a.O.background&&void 0!==M.a.O.background.color&&(document.body.style.background=M.a.O.background.color);M.za=new jf;M.v.Oj&&M.v.Oj.i&&(b.Vs=xg(function(a){b.Vs=a}));M.m=M.a.j.dg||{};M.m.kd=M.m.kd||"level";M.m.ug=void 0!==M.m.ug?M.m.ug:"level"===M.m.kd;M.m.Z=void 0!==M.m.Z?M.m.Z instanceof Array?M.m.Z:[M.m.Z]:[20];M.m.Ah=void 0!==M.m.Ah?M.m.Ah:"locked";M.m.Rk=void 0!==M.m.Rk?M.m.Rk:"difficulty"===M.m.kd;M.m.Ai=void 0!==M.m.Ai?M.m.Ai:!1;M.m.Xn=void 0!==M.m.Xn?
M.m.Xn:"level"===M.m.kd;M.m.bg=void 0!==M.m.bg?M.m.bg:"max";M.m.Un=void 0!==M.m.Un?M.m.Un:"number";M.s.tu(function(a){var d,g,h;a&&(b.Bc=a);b.aa=gf("preferences",{});b.aa.difficulty=void 0!==b.aa.difficulty?b.aa.difficulty:1;void 0!==M.m.ss&&0>M.m.ss.indexOf(uf())&&(b.aa.difficulty=M.m.ss[0]);b.aa.playMusic=void 0!==b.aa.playMusic?b.aa.playMusic:!0;b.qe(b.aa.playMusic);b.aa.playSFX=void 0!==b.aa.playSFX?b.aa.playSFX:!0;b.Ek(b.aa.playSFX);b.aa.language=void 0!==b.aa.language&&M.l.Mu(b.aa.language)?
b.aa.language:M.l.Mm();M.l.Rr(b.aa.language);void 0===Df(b.B,0,"state",void 0)&&Mh(b.B,0,"state","unlocked");if(M.m.ug)if("locked"===M.m.Ah)for(h=!1,d=0;d<M.m.Z.length;d++){for(a=0;a<M.m.Z[d];a++)if(g=Df(d,a,"state","locked"),"locked"===g){b.B=0<=a-1?d:0<=d-1?d-1:0;h=!0;break}if(h)break}else void 0!==b.aa.lastPlayed&&(b.B=b.aa.lastPlayed.world||0)});b.Kg=Nh();void 0!==b.Kg.authToken&&void 0!==b.Kg.challengeId&&(b.Kc=!0);M.v.CA&&(this.Bb=this.yA?new TestBackendServiceProvider:new BackendServiceProvider,
this.Bb.Lq(function(a){a&&M.e.Bb.Uy(b.Kg.authToken)}));a=parseFloat(m.t.version);F.Oa&&(m.Ga.Go&&m.t.kk||m.t.Bg&&a&&4.4>a)&&(F.Li=1);this.sb=!0;this.Pj=0};function Nh(){var a,b,c,d,g;b={};if(a=window.location.search.substring(1))for(a=a.split("&"),d=0,g=a.length;d<g;d++)c=a[d].split("="),b[c[0]]=c[1];return b}function Oh(a){a.state="GAME_LOAD";a.screen=new pf(function(){M.e.load=!0;ng(M.e,!0);M.yd.Qm();M.s.Qm()},function(){},M.v.mA)}function ng(a,b){a.Ci=b||!1;a.Fo=!0;a.tm++}
function Ph(){var a=M.e;a.tm--;switch(a.state){case "GAME_INIT":a.sb&&!a.EA&&(a.Kc&&a.Bb&&a.Bb.oA(a.Kg.challengeId,function(b){!b&&a.screen&&"function"===typeof a.screen.Wn&&a.screen.Wn("challengeLoadingError_notValid")}),Oh(a));break;case "GAME_LOAD":if(a.load){if(a.Kc&&a.Bb)if(a.Bb.Ku())sf(a),vf(a.Zc.mode);else{a.screen.Wn("challengeLoadingError_notStarted");break}I(G,a.screen);"function"===typeof Gh&&(M.j=new Gh);void 0!==M.v.Ft&&!1!==M.v.Ft.show&&M.b.tt();mg(a)}break;case "LEVEL_INIT":a.an&&Qh(a);
break;case "LEVEL_LOAD":a.bn&&Rh(a);break;case "LEVEL_END":if(a.fa)switch(lg(),M.e.an=!1,M.e.bn=!1,M.k=void 0,M.b.gf(M.jq).$=!0,M.b.gf(M.Fj).$=!0,M.e.Tq){case "retry":zf(M.e,M.e.nb);break;case "next":M.m.ug?M.e.nb+1<M.m.Z[M.e.B]?zf(M.e,M.e.nb+1):M.e.B+1<M.m.Z.length?zf(M.e,0,M.e.B+1):M.m.Xn?(M.e.state="GAME_END",M.e.end=!0,ng(M.e,!1),M.s.yu()):M.e.screen=new yf:zf(M.e,0);break;case "exit":M.m.ug?M.e.screen=new yf:mg(M.e)}break;case "GAME_END":a.end&&(a.end=!1,M.e.screen=null,M.e.screen=new pg)}}
function Ve(){M.e.Fo=!1}function gg(){var a;if(void 0!==M.e.Kg.more_games)try{return a=decodeURIComponent(M.e.Kg.more_games),function(){M.s.Pc(a)}}catch(b){}if("string"===typeof M.qg.moreGamesUrl&&""!==M.qg.moreGamesUrl)return function(){M.s.Pc(M.qg.moreGamesUrl)};if(void 0!==M.v.Ev)return function(){M.s.Pc(M.v.Ev)};if("function"===typeof M.s.tq)return M.s.tq}function sf(a){if(a.Kc&&void 0!==a.Bb)return void 0===a.Zc&&(a.Zc=a.Bb.Ey()),a.Zc}e.Kh=function(a){M.e.Kc&&M.e.Bb&&M.e.Bb.Kh(a)};
e.uh=function(a){M.e.Kc&&M.e.Bb&&M.e.Bb.uh(a)};function uf(){return M.e.aa.difficulty}function kg(){switch(uf()){case 0:return"easy";case 1:return"medium";case 2:return"hard";default:throw"Unknown difficulty: "+uf();}}function Pg(){var a="optionsDifficulty_"+kg();return M.l.M(a,"<"+a+">")}function vf(a){M.e.aa.difficulty=a;hf("preferences",M.e.aa)}e.qe=function(a){void 0!==a&&(M.e.aa.playMusic=a,hf("preferences",M.e.aa),a?lb("music"):kb("music"));return M.e.aa.playMusic};
e.Ek=function(a){void 0!==a&&(M.e.aa.playSFX=a,hf("preferences",M.e.aa),a?(lb("game"),lb("sfx")):(kb("game"),kb("sfx")));return M.e.aa.playSFX};e.language=function(a){void 0!==a&&(M.e.aa.language=a,hf("preferences",M.e.aa));return M.e.aa.language};function Mh(a,b,c,d){var g="game";"game"!==g&&(g="tg");void 0===M.e.Bc["level_"+a+"_"+b]&&(M.e.Bc["level_"+a+"_"+b]={tg:{},game:{}});void 0===c?M.e.Bc["level_"+a+"_"+b][g]=d:M.e.Bc["level_"+a+"_"+b][g][c]=d;M.s.Us()}
function Df(a,b,c,d){var g="game";"game"!==g&&(g="tg");a=M.e.Bc["level_"+a+"_"+b];return void 0!==a&&(a=void 0===c?a[g]:a[g][c],void 0!==a)?a:d}function gf(a,b){var c,d;"game"!==c&&(c="tg");d=M.e.Bc.game;return void 0!==d&&(d=void 0===a?d[c]:d[c][a],void 0!==d)?d:b}function hf(a,b){var c;"game"!==c&&(c="tg");void 0===M.e.Bc.game&&(M.e.Bc.game={tg:{},game:{}});void 0===a?M.e.Bc.game[c]=b:M.e.Bc.game[c][a]=b;M.s.Us()}
function Kf(a,b,c){var d=M.e;void 0===b&&(b=d.nb);void 0===c&&(c=d.B);return void 0===a?Df(c,b,"stats",{}):Df(c,b,"stats",{})[a]}function yg(){var a=Kf("highScore",void 0,void 0);return"number"!==typeof a?0:a}function Sh(){var a,b,c,d=0;for(a=0;a<M.m.Z.length;a++)for(b=0;b<M.m.Z[a];b++)c=Kf(void 0,b,a),"object"===typeof c&&null!==c&&(d+=void 0!==c.highScore?c.highScore:0);return d}function mg(a){a.screen&&I(G,a.screen);a.screen=new rf;a.nb=-1}
function Zg(a,b,c,d){var g;g=void 0!==M.a.O.Uh&&void 0!==M.a.O.Uh.backgroundImage?M.a.O.Uh.backgroundImage:void 0!==M.a.u.Uh?M.a.u.Uh.backgroundImage:void 0;M.b.hb(M.bf);a=a||0;b=b||0;c=c||w.width;d=d||w.height;if(g)if(c=Math.min(Math.min(c,w.width),g.xh),d=Math.min(Math.min(d,w.height),g.ag),void 0!==g){var h=a,k=b-M.np,l,n,q;for(l=0;l<g.J;l+=1)n=l%g.pg*g.width,q=g.height*Math.floor(l/g.pg),n>h+c||n+g.width<h||q>k+d||q+g.height<k||g.na(l,h-n,k-q,c,d,a,b,1)}else qa(a,b,c,d,"white",!1)}
function zf(a,b,c){a.state="LEVEL_INIT";void 0===c||(a.B=c);a.nb=b;a.an=!0;ng(a,!1);M.s.zu()}function Qh(a){a.state="LEVEL_LOAD";a.bn=!0;ng(a,!1);M.s.Au()}
function Rh(a){var b;if(a.B<M.m.Z.length&&a.nb<M.m.Z[a.B]){a.state="LEVEL_PLAY";a.wr+=1;a.fa=!1;a.screen=null;Zg(0,M.np);b=M.za;var c=jg(a,3),d="progression:levelStarted:"+kg(),g=a.If,h;for(h=0;h<b.Y.length;h++)if(!b.Y[h].i){b.Y[h].p=0;b.Y[h].paused=0;b.Y[h].i=!0;b.Y[h].Wp=c;b.Y[h].Dr=d;b.Y[h].tag=g;break}h===b.Y.length&&b.Y.push({i:!0,p:0,paused:0,Wp:c,Dr:d,tag:g});b.Na(c,d);for(b=0;b<a.B;b++);a.aa.lastPlayed={world:a.B,level:a.nb};M.k=new Hh}}
function Ef(a,b,c){var d=0;void 0===b&&(b=a.B);void 0===c&&(c=a.nb);for(a=0;a<b;a++)d+=M.m.Z[a];return d+c}function Jh(a,b,c,d){new qg(a,b,c,d)}function jg(a,b){var c,d=a.nb+"",g=b-d.length;if("number"===typeof b&&1<b)for(c=0;c<g;c++)d="0"+d;return d}
function Ih(a,b){function c(a,b){return"number"!==typeof a?!1:"number"!==typeof b||"max"===M.m.bg&&a>b||"min"===M.m.bg&&a<b?!0:!1}a.state="LEVEL_END";var d,g,h,k,l,n,q={},v=jg(a,3);b=b||{};b.level=M.m.Ai?a.nb+1:Ef(a)+1;b.Jq=!1;g=(d=Df(a.B,a.nb,"stats",void 0))||{};if(void 0!==b.gd||void 0!==b.ib){void 0!==b.gd&&(q[b.gd.id]=b.gd.K(),"highScore"===b.gd.id&&(n=b.gd));if(void 0!==b.ib)for(k=0;k<b.ib.length;k++)q[b.ib[k].id]=b.ib[k].K(),"highScore"===b.ib[k].id&&(n=b.ib[k]);for(k in q)l=q[k],void 0!==
l.Fe&&(q[l.Uk].rc=l.Fe(q[l.Uk].rc));void 0!==q.totalScore&&(h=q.totalScore.rc)}else h=b.totalScore,void 0!==h&&void 0!==b.timeBonus&&(h+=b.timeBonus);if(!0!==b.failed){if(void 0!==h){M.za.Na("points","progression:score:"+kg()+":"+v,h);if(void 0===d||c(h,d.highScore))g.highScore=h,b.Jq=!0,M.za.Na("highScore","progression:score:"+kg()+":"+v,h);void 0!==n&&(n.rc=g.highScore);b.highScore=g.highScore}void 0!==b.stars&&(g.stars=b.stars,M.za.Na("stars","progression:score:"+kg()+":"+v,b.stars));a.nb+1<M.m.Z[a.B]?
"locked"===Df(a.B,a.nb+1,"state","locked")&&Mh(a.B,a.nb+1,"state","unlocked"):a.B+1<M.m.Z.length&&"locked"===Df(a.B+1,0,"state","locked")&&Mh(a.B+1,0,"state","unlocked");Mh(a.B,a.nb,void 0,{stats:g,state:"played"});void 0!==a.Bb&&(d=M.j&&M.j.uu?M.j.uu():Sh(),void 0!==d&&a.Bb.xA(d,M.m.Un));kf(M.za,a.If,v,"progression:levelCompleted:"+kg())}else kf(M.za,a.If,v,"progression:levelFailed:"+kg());new Lf(M.m.kd,b,function(a){M.e.fa=!0;M.e.Tq=a;ng(M.e,!0);a={totalScore:h,level:b.level,highScore:b.highScore,
failed:!0===b.failed,stars:b.stars,stage:b.stage};M.s.Ph(a);M.yd.Ph(a)})}e.mi=function(){M.e.wg(!0)};e.wg=function(a,b,c){var d="inGame";M.e.screen instanceof rf?d="startScreen":M.e.screen instanceof yf?d="levelMapScreen":b&&(d=M.e.Zc.Nt===M.e.Zc.Bp?"inGame_challenger":"inGame_challengee");M.e.Me||(M.e.Me=new dg(d,!0===a,b,c))};
function dh(a){var b=[],c,d,g,h,k;M.e.Me||M.e.Zd||(M.e.Zc.Nt===M.e.Zc.Bp?(c=M.l.M("challengeCancelConfirmText","<CHALLENGECANCELCONFIRMTEXT>"),d="challengeCancelConfirmBtn_yes",g="challengeCancelConfirmBtn_no",k=function(a){var b=a?"challengeCancelMessage_success":"challengeCancelMessage_error",b=M.l.M(b,"<"+b.toUpperCase()+"<");M.e.Zd&&ug(b);a&&Yf()},h=function(){M.e.uh(k);return!0}):(c=M.l.M("challengeForfeitConfirmText","<CHALLENGEFORFEITCONFIRMTEXT>"),d="challengeForfeitConfirmBtn_yes",g="challengeForfeitConfirmBtn_no",
k=function(a){var b=a?"challengeForfeitMessage_success":"challengeForfeitMessage_error",b=M.l.M(b,"<"+b.toUpperCase()+"<");if(M.e.Zd&&(ug(b),a)){var b=M.l.M("challengeForfeitMessage_winnings",""),b=b.replace("<NAME>",M.e.Zc.Dz[M.e.Zc.Bp]),b=b.replace("<AMOUNT>",M.e.Zc.DA),c=M.e.Zd,d,g,h,k;d=R.K();c.a.ms&&C(d,c.a.ms);g=Oa(d,b,c.a.ew,c.a.dw,!0);g<d.fontSize&&D(d,g);g=d.ba(b,c.a.Jn)+10;h=d.U(b,c.a.In)+10;k=M.b.ma(c.a.fw,c.c.f.width,g,d.align);h=M.b.ma(c.a.gw,c.c.f.height-tg(c),h,d.h);z(c.c.f);d.q(b,
k,h,g);B(c.c.f)}a&&Yf()},h=function(){M.e.Kh(k);return!0}),b.push({N:d,T:h,ea:M.e}),b.push({N:g,T:function(){M.e.Zd.close();M.e.Zd=null;return!0}}),M.e.Zd=new sg(c,b,a),M.e.Me=M.e.Zd)}e.Bn=function(){var a,b;b=Ob(G,"game");for(a=0;a<b.length;a++)"function"===typeof b[a].Wm&&b[a].Wm();lf();Pb("game");Gb()};function Yf(a){var b,c;c=Ob(G);for(b=0;b<c.length;b++)"function"===typeof c[b].Wm&&c[b].Wm();Pb();Gb();lf();a&&(a.H=Math.max(0,a.H-1));Qb("system")}
function cg(){var a,b;b=Ob(G);for(a=0;a<b.length;a++)"function"===typeof b[a].Bu&&b[a].Bu();Qb();a=G;for(b=0;b<a.Wd.length;b+=1)a.Wd[b].paused=Math.max(0,a.Wd[b].paused-1);a=M.za;b=M.e.If;var c;for(c=0;c<a.Y.length;c++)void 0!==a.Y[c]&&a.Y[c].tag===b&&(a.Y[c].paused-=1,a.Y[c].paused=Math.max(a.Y[c].paused,0))}function lg(){var a;M.k&&I(G,M.k);for(a=Ob(G,"LevelStartDialog");0<a.length;)I(G,a.pop())}
function ff(){var a="";M.version.builder&&(a=M.version.builder);M.version.tg&&(a+="-"+M.version.tg);M.version.game&&(a+="-"+M.version.game);M.version.config&&(a+="-"+M.version.config);return a}e.dc=function(){this.sb||(this.tl(),ng(M.e,!0),M.yd.Kj(),M.s.Kj())};
e.ra=function(a){"function"===typeof this.hq&&(this.hq(),this.hq||Ve());0<this.tm&&(this.Ci||this.Fo||Ph());700>this.Pj&&(this.Pj+=a,700<=this.Pj&&(M.v.tx&&void 0!==M.v.Lh&&M.v.Lh.Bj&&M.v.Lh.Ok&&M.za.start([M.v.Lh.Bj,M.v.Lh.Ok]),void 0===Df(this.B,0,"state",void 0)&&Mh(this.B,0,"state","unlocked")))};e.Oc=function(a,b){"languageSet"===a&&M.e.language(b)};e.nd=function(){var a,b;for(a=0;a<M.zd.length;a++)b=M.zd[a],b.$&&(w.hb(b),w.clear())};
e.Xa=function(){var a;for(a=0;a<M.zd.length;a++)M.zd[a].$=!1};M.Jw=function(){M.e=new Lh;H(M.e);Nb(M.e,"system")};(void 0===M.yt||M.yt)&&M.Jw();
