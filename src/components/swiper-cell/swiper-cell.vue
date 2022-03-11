<template>
    <div
        class="cell_container"
        @touchstart="onTouchStart"
        v-click-outside="handleClickOutside"
        @click="getClickHandler('cell')"
    >
        <div
            :style="{
                transform: translateX(-1),
                'transition-duration': dragging,
            }"
        >
            <!-- 左边 -->
            <div
                ref="cellLeft"
                :class="['cell_left', isPostion]"
                v-if="leftContent"
                @click="getClickHandler('left', true)"
            >
                <div v-for="(item, index) in leftContent" :key="index">
                    <div>
                        <span v-html="item.value"></span>
                        <span v-if="item.icon">
                            <img
                                v-if="/http/.test(item.icon)"
                                :src="item.icon"
                            />
                            <i v-else :class="item.icon" aria-hidden="true"></i>
                        </span>
                    </div>
                </div>
            </div>
            <div @touchend="onClick" class="cell_content">
                <slot></slot>
            </div>
            <!-- 右边 -->
            <div
                ref="cellRight"
                v-if="rightContent"
                :class="['cell_right', isPostion]"
                @click="getClickHandler('right', true)"
            >
                <div
                    v-for="(item, index) in rightContent"
                    :style="{
                        transform: index && translateX(index),
                        'transition-duration': index && dragging,
                    }"
                    @touchend="
                        item.callBack && !lockClick && item.callBack(item)
                    "
                    :key="index"
                >
                    <div>
                        <span v-html="item.value"></span>
                        <span v-if="item.icon">
                            <img
                                v-if="/http/.test(item.icon)"
                                :src="item.icon"
                            />
                            <i v-else :class="item.icon" aria-hidden="true"></i>
                        </span>
                    </div>
                    <div
                        :style="{
                            transform: `scaleX(${scaleX})`,
                            'transition-duration': dragging,
                        }"
                        class="transformScaleX"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ClickOutside from "../../common/directives/ClickOutside";
import { TouchMixin } from "../../common/mixins/touch";
// import func from 'vue-editor-bridge';
export default {
    name: "swiper-cell",
    props: {
        // @deprecated
        // should be removed in next major version, use beforeClose instead
        onClose: Function,
        disabled: Boolean,
        leftWidth: [Number, String],
        rightWidth: [Number, String],
        beforeClose: Function,
        stopPropagation: Boolean,
        name: {
            type: [Number, String],
            default: "",
        },
        quotient: {
            type: Array,
            validator: (value) => {
                if (value.length > 2) value.splice(2, value.length);
                return true;
            },
            default: () => [2.5, 8],
        },
        // 限制最多传三个
        rightContent: {
            type: [Array, Boolean],
            validator: (value) => {
                if (value.length > 3) value.splice(3, value.length);
                return true;
            },
            default: () => [
                { value: "标为未读", icon: "" },
                { value: "不显示", icon: "" },
                { value: "删除", icon: "" },
            ],
        },
        // 限制最多传一个
        leftContent: {
            type: [Array, Boolean],
            validator: (value) => {
                if (value.length > 1) value.splice(1, value.length);
                return true;
            },
            default: () => [{ value: "标记", icon: "fa fa-star-o" }],
        },
        //
        type: {
            type: [Number, String],
            default: 1, // 0 常规 1 定位
        },
        isElastic: {
            // 弹性
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            offset: 0,
            isDragging: false,
            // -位移
            elasticX: 0,
            rightNodetWidthArr: [],
            cellRightWidth: 0,
            cellLeftWidth: 0,
            isLeft: false,
            isRight: false,
            lockClick: false,
        };
    },
    computed: {
        computedLeftWidth() {
            return +this.leftWidth || this.getWidthByRef("cellLeft");
        },

        computedRightWidth() {
            return +this.rightWidth || this.getWidthByRef("cellRight");
        },

        isPostion() {
            return (this.type && "cellPostion") || "";
        },

        dragging() {
            return (this.offset && this.isDragging && "0s") || "0.3s";
            // return (this.offset && this.isDragging) || "duration";
        },

        translateX() {
            return function (index) {
                // 外层移动
                if (index < 0) {
                    return (
                        "translateX(" +
                        (this.offset + (this.isElastic ? this.elasticX : 0)) +
                        "px)"
                    );
                }
                // 右滑取消下列事件
                if (this.offset > 0) return;
                let width = 0;
                this.rightNodetWidthArr.map((item, idx) => {
                    if (idx < index) width += item.width;
                });
                // 元素应当滑动距离
                let elasticDistance =
                    (this.elasticX / this.rightContent.length) * index;

                // 无定位、有弹性状态
                if (!this.type && this.isElastic) {
                    return `translateX(${-elasticDistance}px)`;
                }
                elasticDistance =
                    (-this.offset * width) / this.cellRightWidth -
                    ((this.isElastic && elasticDistance) || 0);
                // 其他状态
                return (this.type && `translateX(${elasticDistance}px)`) || "";
            };
        },

        scaleX() {
            // 右滑取消下列事件
            if (this.offset > 0) return false;
            let scale =
                (this.isElastic &&
                    Math.abs(this.elasticX / this.rightContent.length)) * 2 ||
                0;
            return scale;
        },
    },
    mounted() {
        // 防止弹性效果影响宽度
        this.cellRightWidth = this.getWidthByRef("cellRight");
        this.cellLeftWidth = this.getWidthByRef("cellLeft");

        this.$nextTick(() => {
            this.$refs["cellRight"].children &&
                Array.from(this.$refs["cellRight"].children).map((item) => {
                    this.rightNodetWidthArr.push(item.getBoundingClientRect());
                });
        });
        this.bindTouchEvent(this.$el);
    },
    mixins: [TouchMixin],
    directives: {
        ClickOutside,
    },
    methods: {
        getWidthByRef(ref) {
            if (this.$refs[ref]) {
                const rect = this.$refs[ref].getBoundingClientRect();
                // type=1定位时获取宽度为0，为此采用获取子元素宽度之和
                if (!rect.width) {
                    let childWidth = 0;
                    for (const item of this.$refs[ref].children) {
                        childWidth += item.getBoundingClientRect().width;
                    }
                    return childWidth;
                }
                return rect.width;
            }
            return 0;
        },

        handleClickOutside() {
            if (this.opened) this.close();
        },

        // @exposed-api
        open(position) {
            const offset =
                position === "left"
                    ? this.computedLeftWidth
                    : -this.computedRightWidth;

            this.opened = true;
            this.offset = offset;

            this.$emit("open", {
                position,
                name: this.name,
                close: this.close,
                // @deprecated
                // should be removed in next major version
                detail: this.name,
            });
        },

        // @exposed-api
        close(position) {
            this.offset = 0;

            if (this.opened) {
                this.opened = false;
                this.$emit("close", {
                    position,
                    name: this.name,
                });
            }
        },

        onTouchStart(event) {
            if (this.disabled) {
                return;
            }
            this.isLeft = false;
            this.isRight = false;
            this.startOffset = this.offset;
            //
            this.touchStart(event);
        },

        range(num, min, max) {
            return Math.min(Math.max(num, min), max);
        },

        preventDefault(event) {
            /* istanbul ignore else */
            if (typeof event.cancelable !== "boolean" || event.cancelable) {
                event.preventDefault();
            }

            if (this.isStopPropagations) {
                // eslint-disable-next-line no-undef
                stopPropagation(event);
            }
        },

        stopPropagations(event) {
            event.stopPropagation();
        },

        onTouchMove(event) {
            if (this.disabled) {
                return;
            }
            this.touchMove(event);
            if (this.direction === "horizontal") {
                this.isDragging = true;
                this.lockClick = true;
                const isPrevent =
                    !this.opened || this.deltaX * this.startOffset < 0;
                if (isPrevent) {
                    this.preventDefault(event, this.stopPropagation);
                }

                this.offset = this.range(
                    this.deltaX + this.startOffset,
                    -this.computedRightWidth,
                    this.computedLeftWidth
                );

                if (this.offset > 0 && !this.isRight) {
                    this.isLeft = true;
                } else {
                    if (this.offset < 0 && this.isLeft) {
                        this.offset = 0;
                        this.elasticX = 0;
                    }
                }
                if (this.offset < 0 && !this.isLeft) {
                    this.isRight = true;
                } else {
                    if (this.offset > 0 && this.isRight) {
                        this.offset = 0;
                        this.elasticX = 0;
                    }
                }
                this.$emit("move", this.deltaX);
                // 增加弹性
                if (
                    (this.computedRightWidth &&
                        this.offset === -this.computedRightWidth) ||
                    (this.computedLeftWidth &&
                        this.offset === this.computedLeftWidth)
                ) {
                    //
                    this.preventDefault(event, this.stopPropagation);
                    let quotient =
                        (this.offset > 0 && this.quotient[0]) ||
                        this.quotient[1];
                    // 弹性系数
                    this.elasticX =
                        (this.deltaX + this.startOffset - this.offset) /
                        quotient;
                }
            } else {
                // 上下滑动后取消close
                this.isDragging = true;
                this.lockClick = true;
            }
        },

        onTouchEnd() {
            if (this.disabled) {
                return;
            }
            // 回弹
            this.elasticX = 0;
            if (this.isDragging) {
                this.toggle(this.offset > 0 ? "left" : "right");
                this.isDragging = false;
                // compatible with desktop scenario
                setTimeout(() => {
                    this.lockClick = false;
                }, 0);
                //
            }
        },

        toggle(direction) {
            const offset = Math.abs(this.offset);
            const THRESHOLD = 0.15;
            const threshold = this.opened ? 1 - THRESHOLD : THRESHOLD;
            const { computedLeftWidth, computedRightWidth } = this;

            if (
                computedRightWidth &&
                direction === "right" &&
                offset > computedRightWidth * threshold
            ) {
                this.open("right");
            } else if (
                computedLeftWidth &&
                direction === "left" &&
                offset > computedLeftWidth * threshold
            ) {
                this.open("left");
            } else {
                this.close();
            }
        },

        onClick(position = "outside") {
            this.$emit("click", position);

            if (this.opened && !this.lockClick) {
                if (this.beforeClose) {
                    this.beforeClose({
                        position,
                        name: this.name,
                        instance: this,
                    });
                } else if (this.onClose) {
                    this.onClose(position, this, { name: this.name });
                } else {
                    this.close(position);
                }
            }
        },

        getClickHandler(position, stop) {
            return (event) => {
                if (stop) {
                    this.stopPropagations(event);
                }
                this.onClick(position);
            };
        },
    },
};
</script>

<style lang="stylus" scoped>
.cell_container {
    position: relative;
    overflow: hidden;
    line-height: 4em;
    height: 4em;
    background: #CFD0D2;

    img {
        width: 1.5em;
        height: 1.5em;
    }

    &>div {
        height: 100%;

        .cell_content {
            height: 100%;
            width: 100%;
            position: absolute;
            text-align: center;
            background: #FFF;

            &:active {
                background: #EEE;
            }
        }

        .cell_left, .cell_right {
            position: absolute;
            top: 0;
            height: 100%;
            display: flex;
            color: #FFF;

            &>div {
                height: 100%;
                white-space: nowrap;
                box-sizing: border-box;
                display: flex;
                align-items: center;

                &>div:nth-child(1) {
                    padding: 0 10px;
                }

                &>span {
                    pointer-events: none;
                    display: inline-block;
                    width: 100%;
                    text-align: center;
                    margin: 0 2px;
                }
            }
        }

        .cell_right {
            right: 0;
            transform: translateX(100%);

            .transformScaleX {
                display: inline-block;
                height: 100%;
                width: 1px;
                transform-origin: 0;
            }

            &>div:nth-child(1) {
                background: #3D83E5;

                div {
                    background: #3D83E5;
                }
            }

            &>div:nth-child(2) {
                background: #EEA151;

                div {
                    background: #EEA151;
                }
            }

            &>div:nth-child(3) {
                background: #E75E58;

                div {
                    background: #E75E58;
                }
            }
        }

        .cell_left {
            left: 0;

            &>div {
                transform: translateX(-100%);
            }
        }

        .cellPostion {
            &>div {
                position: absolute;
            }
        }
    }
}
</style>
