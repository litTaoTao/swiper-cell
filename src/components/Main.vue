<template>
	<div
		class="cell_container"
		v-clickoutside="handleClickOutside"
		@click="getClickHandler('cell')">
		<div
			:style="{'transform':
			'translateX('+(offset+(isElastic?elasticX:0))+'px)','transition-duration':duration}">
			<!-- <div ref="cellLeft"
				class="cell_left"
				v-if="this.leftArray.length"
				@click="getClickHandler('left', true)">
				<div v-for="(item,index) in leftArray"
					ref="leftNode"
					:class="divPostion"
					:style="translateX(index,'left')"
					:key="index">
					{{item}}
				</div>
			</div> -->
			<div 
				@touchend="onClick()"
				:class="offset?'cell_content':'cell_content_active'">
				<slot name="content">内容</slot>
			</div>
			<div ref="cellRight"
				v-if="this.rightArray.length"
				class="cell_right"
				@click="getClickHandler('right', true)">
				<div v-for="(item,index) in rightArray"
					ref="rightNode"
					:class="divPostion"
					:style="translateX(index,'right')"
					@click="cellClick(index)"
					:key="index">
					{{item}}
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import clickoutside from '../directive/clickoutside';
import { TouchMixin } from '../mixins/touch';
export default{
	name:"SwipeCell",
	directives: {
      clickoutside
    },
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
		//
		type:{
			type:[Number,String],
			default:1 //0 常规   1 定位
		},
		isElastic:{  //弹性
			type:Boolean,
			default:true
		},
		rightArray:{
			type: Array,
			default: () =>['标记', '不再关注', '删除']
		},
		leftArray:{
			type: Array,
			default: () =>['收藏','标记']
		}
	},
	data(){
		return {
			offset: 0,
			dragging: true,
			//-位移
			elasticX:0,
			cellWidth_right:0,
			cellWidth_left:0,
			// 右侧子节点宽度
			cellNodeWidth_left:[],
			cellNodeWidth_right:[]
		}
	},
	computed: {
		computedLeftWidth() {
			return +this.leftWidth || this.getWidthByRef('cellLeft');
		},

		computedRightWidth() {
			return +this.rightWidth || this.getWidthByRef('cellRight');
		},
		//填充内容
		padding() {
			return 10+(this.isElastic?Math.abs(this.elasticX/3):0)+'px'
		},
		//动画时间
		duration() {
			return this.dragging?'0s':'0.6s'
		},
		//定位
		divPostion() {
			return this.type?'divPostion':''
		},
		translateX () {
			return (index,direction = 'right')=>{
				let nodeOption = {
					'transform': 'translateX(0)',
					'transition-duration': this.duration
				}
				nodeOption['padding-'+direction] = this.padding
				if(!this['cellNodeWidth_'+direction]) return nodeOption
				let nodeWidth = 0;
				this['cellNodeWidth_'+direction].map((res, i) => {
					if (index > i){
						nodeWidth += res
					}
				})
				let translateX = -this.offset*nodeWidth/this['cellWidth_'+direction]-(this.isElastic?this.elasticX/3*index:0)
				this.type && (nodeOption.transform = 'translateX('+translateX+'px)')
				return nodeOption
			}
		}
	},
	mounted() {
		//防止弹性效果影响宽度
		this.cellWidth_right = this.getWidthByRef('cellRight');
		this.cellLeftWidth = this.getWidthByRef('cellLeft');
		this.$refs["rightNode"]&&this.$refs["rightNode"].map(res=>{
			this.cellNodeWidth_right.push(res.getBoundingClientRect().width)
		})
		this.$refs["leftNode"]&&this.$refs["leftNode"].map(res=>{
			this.cellNodeWidth_left.push(res.getBoundingClientRect().width)
		})
		this.bindTouchEvent(this.$el);
	},
	mixins: [
		TouchMixin
	],
	methods: {
		cellClick(index){
			this.$emit('cellClick',index)
		},
		
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

		handleClickOutside(e){
			this.opened&&this.close()
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

		preventDefault(event, isStopPropagation) {
			/* istanbul ignore else */
			if (typeof event.cancelable !== 'boolean' || event.cancelable) {
				event.preventDefault();
			}

			if (this.isStopPropagations) {
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
				this.dragging = true;
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
				this.dragging = true;
				this.lockClick = true;
			}
		},

		onTouchEnd() {
			if (this.disabled) {
				return;
			}
			//回弹
			this.elasticX = 0
			if (this.dragging) {
				this.toggle(this.offset > 0 ? 'left' : 'right');
				this.dragging = false;
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
					event.stopPropagation();
				}
				this.onClick(position);
			};
		},
	}
}
</script>
<style lang="scss" scoped>
.cell_container{
	position: relative;
	overflow: hidden;
	line-height: 68px;
	height:68px;
	div{
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
			.divPostion{
				position: absolute;
			}
			div{
				white-space:nowrap;
				display: flex;
				align-items: center;
				background: #ccc;
				padding: 0 10px;
			}
		}
		.cell_left{
			left: 0;
			transform: translateX(-100%);
		}
		.cell_right{
			right: 0;
			transform: translateX(100%);
		}
	}
}
</style>