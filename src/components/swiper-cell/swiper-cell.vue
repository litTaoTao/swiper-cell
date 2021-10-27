<template>
	<div
		class="cell_container"
        @touchstart="onTouchStart"
		v-click-outside="handleClickOutside"
		@click="getClickHandler('cell')">
		<div
			:style="{'transform':rightContent.length && translateX(-1),'transition-duration':rightContent.length && dragging}">
			<!-- <div ref="cellLeft" class="cell_left" @click="getClickHandler('left', true)">
				<div>收藏</div>
				<div>添加</div>
			</div> -->
			<div
				@touchend="onClick()"
				:class="cellContent">SwipeCell</div>
			<div ref="cellRight"
				:class="['cell_right', isPostion]"
				@click="getClickHandler('right', true)">
				<div v-for="(item, index) in rightContent" 
					:style="{'transform': translateX(index),'transition-duration':dragging, 'padding-right': paddingRight(index+1)}"
					@touchend="cellTouchEnd"
					:key="index">
					{{item.value}}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ClickOutside from '../../common/directives/ClickOutside';
import { TouchMixin } from '../../common/mixins/touch';
// import func from 'vue-editor-bridge';
export default{
	name:"swiper-cell",
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
			default: '',
		},
		// 限制最多传三个
		rightContent: {
			type: Array,
			validator: value=>{
				if(value.length>3) value.splice(3,value.length)
				return true
			},
			default: ()=> [
				{value:"标记",icon:""},
				{value:"不再关注",icon:""},
				{value:"删除",icon:""}
			],
		},
		//
		type:{
			type:[Number,String],
			default:1 //0 常规 1 定位
		},
		isElastic:{ //弹性
			type:Boolean,
			default:true
		}
	},
	data(){
		return {
			offset: 0,
			isDragging: false,
			//-位移
			elasticX:0,
			lefNodetWidthArr: [],
			cellRightWidth:0,
			cellLeftWidth:0
		}
	},
	computed: {
		computedLeftWidth() {
			return +this.leftWidth || this.getWidthByRef('cellLeft');
		},

		computedRightWidth() {
			return +this.rightWidth || this.getWidthByRef('cellRight');
		},

		isPostion(){
			return this.type && 'cellPostion' || ''
		},

		dragging(){
			return this.offset && this.isDragging && '0s' || '0.6s'
		},
		
		translateX(){
			return function(index) {
				let width = 0;
				this.lefNodetWidthArr.map((item, idx)=>{
					if(idx < index) width += item.width
				})
				if(index < 0) return 'translateX(' + (this.offset +  (this.isElastic?this.elasticX:0)) + 'px)'
				return this.type && 'translateX(' + (-this.offset*width/this.cellRightWidth - (this.isElastic?this.elasticX/this.rightContent.length*index:0)) + 'px)' || ''
			}
		},

		paddingRight(){
			return function(index) { 
				return 10 + (this.isElastic && Math.abs(this.elasticX/this.rightContent.length*index) || 0)  + 'px'
			}
		},

		cellContent() {
			return this.offset && 'cell_content' || 'cell_content_active'
		}
	},
	mounted() {
		//防止弹性效果影响宽度
		this.cellRightWidth = this.getWidthByRef('cellRight');
		this.cellLeftWidth = this.getWidthByRef('cellLeft');
		this.$nextTick(()=> {
			this.$refs['cellRight'].children && Array.from(this.$refs['cellRight'].children).map((item) => {
				this.lefNodetWidthArr.push(item.getBoundingClientRect()) 
			});
		})
		this.bindTouchEvent(this.$el);
	},
	mixins: [
		TouchMixin
	],
	directives: {
		ClickOutside
	},
	methods: {
		getWidthByRef(ref) {
			if (this.$refs[ref]) {
				const rect = this.$refs[ref].getBoundingClientRect();
				//type=1定位时获取宽度为0，为此采用获取子元素宽度之和
				if(!rect.width){
					let childWidth = 0;
					for(const item of this.$refs[ref].children){
						childWidth += item.getBoundingClientRect().width
					}
					return childWidth;
				}
				return rect.width;
			}
			return 0;
		},

		handleClickOutside(){
			if(this.opened) this.close()
		},

		// @exposed-api
		open(position) {
			const offset =
			position === 'left' ? this.computedLeftWidth : -this.computedRightWidth;

			this.opened = true;
			this.offset = offset;

			this.$emit('open', {
				position,
				name: this.name,
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
				this.$emit('close', {
					position,
					name: this.name,
				});
			}
		},

		onTouchStart(event) {
			if (this.disabled) {
				return;
			}
			this.startOffset = this.offset;
			this.touchStart(event);
		},

		range(num, min, max) {
			return Math.min(Math.max(num, min), max);
		},

		preventDefault(event) {
			/* istanbul ignore else */
			if (typeof event.cancelable !== 'boolean' || event.cancelable) {
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
			if (this.direction === 'horizontal') {
				this.isDragging = true;
				this.lockClick = true;
				const isPrevent = !this.opened || this.deltaX * this.startOffset < 0;
				if (isPrevent) {
					this.preventDefault(event, this.stopPropagation);
				}
				
				this.offset = this.range(
					this.deltaX + this.startOffset,
					-this.computedRightWidth,
					this.computedLeftWidth
				);
				//增加弹性
				if(this.computedRightWidth && this.offset === -this.computedRightWidth || this.computedLeftWidth && this.offset === this.computedLeftWidth){
					//
					this.preventDefault(event, this.stopPropagation);
					//弹性系数
					this.elasticX = (this.deltaX + this.startOffset - this.offset)/4;
				}
			}else{
				//上下滑动后取消close
				this.isDragging = true;
				this.lockClick = true;
			}
		},

		onTouchEnd() {
			if (this.disabled) {
				return;
			}
			//回弹
			this.elasticX = 0
			if (this.isDragging) {
				this.toggle(this.offset > 0 ? 'left' : 'right');
				this.isDragging = false;
				// compatible with desktop scenario
				setTimeout(() => {
					this.lockClick = false;
				}, 0);
			}
		},

		toggle(direction) {
			const offset = Math.abs(this.offset);
			const THRESHOLD = 0.15;
			const threshold = this.opened ? 1 - THRESHOLD : THRESHOLD;
			const { computedLeftWidth, computedRightWidth } = this;

			if (
			computedRightWidth &&
			direction === 'right' &&
			offset > computedRightWidth * threshold
			) {
				this.open('right');
			} else if (
			computedLeftWidth &&
			direction === 'left' &&
			offset > computedLeftWidth * threshold
			) {
				this.open('left');
			} else {
				this.close();
			}
		},

		onClick(position = 'outside') {
			this.$emit('click', position);

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
					this.stopPropagations(event)
				}
				this.onClick(position);
			};
		},
		
		cellTouchEnd() {
			this.$emit('cellClick')
		}
	}
}
</script>

<style lang="stylus" scoped>
.cell_container{
	position: relative;
	overflow: hidden;
	line-height: 4em;
	height: 4em;
	&>div{
		height: 100%;
		.cell_content{
			height: 100%;
			width: 100%;
			text-align: center;
		}
		.cell_content_active{
			height: 100%;
			width: 100%;
			text-align: center;
			&:active{
				background: #e8e8e8;
			}
		}
		.cell_left,.cell_right{
			position: absolute;
			top: 0;
			height: 100%;
			display: flex;
			color: #fff;
			&>div{
				white-space:nowrap;
				display: flex;
				align-items: center;
				background: #ccc;
				padding-left: 10px;
			}
		}
		.cell_left{
			left: 0;
			transform:translateX(-100%);
		}
		.cell_right{
			right: 0;
			transform:translateX(100%);
		}
		.cellPostion{
			&>div{
				position: absolute;
			}
		}
	}
}
</style>
