import Vue from "vue";
export const isServer = false;
const MIN_DISTANCE = 10;
const TouchMixinData = {
	startX: Number,
	startY: Number,
	deltaX: Number,
	deltaY: Number,
	offsetX: Number,
	offsetY: Number,
	direction: String
};

function getDirection(x, y) {
	if (x > y && x > MIN_DISTANCE) {
		return "horizontal";
	}

	if (y > x && y > MIN_DISTANCE) {
		return "vertical";
	}

	return "";
}

export let supportsPassive = false;

export function on(target, event, handler, passive = false) {
	if (!isServer) {
		target.addEventListener(
			event,
			handler,
			supportsPassive ? {
				capture: false,
				passive
			} : false
		);
	}
}

export const TouchMixin = ({
	data() {
		TouchMixinData;
		return {
			direction: ""
		};
	},

	methods: {
		touchStart(event) {
			this.resetTouchStatus();
			this.startX = event.touches[0].clientX;
			this.startY = event.touches[0].clientY;
		},

		touchMove(event) {
			const touch = event.touches[0];
			this.deltaX = touch.clientX - this.startX;
			this.deltaY = touch.clientY - this.startY;
			this.offsetX = Math.abs(this.deltaX);
			this.offsetY = Math.abs(this.deltaY);
			this.direction = this.direction || getDirection(this.offsetX, this.offsetY);
		},

		resetTouchStatus() {
			this.direction = "";
			this.deltaX = 0;
			this.deltaY = 0;
			this.offsetX = 0;
			this.offsetY = 0;
		},

		// avoid Vue 2.6 event bubble issues by manually binding events
		// https://github.com/youzan/vant/issues/3015
		bindTouchEvent(el) {
			const {
				onTouchStart,
				onTouchMove,
				onTouchEnd
			} = this;

			on(el, "touchstart", onTouchStart);
			on(el, "touchmove", onTouchMove);

			if (onTouchEnd) {
				on(el, "touchend", onTouchEnd);
				on(el, "touchcancel", onTouchEnd);
			}
		}
	}
});