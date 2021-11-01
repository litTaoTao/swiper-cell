## swiper-cell

> 弹性滑动单元格

### Install

``` bash
npm install swiper-cell --save

```

###  Demo
```html
<template>
        <div>
            <div class="swiperCell" v-for="i in 20" :key="i">
                <swiper-cell :quotient="quotient"
                            @touchstart.native="touchstart(i)"
                            @move="move"
                            @touchend.native="touchend"
                            @close="close"
                            :disabled="disabled"
                            :class="i===index&&isTag&&'container_active'||'container'"
                            @open="open"></swiper-cell>
            </div>
        </div>
</template>

<script>
import SwiperCell from 'swiper-cell'

export default {
    name: "HelloWorld",
    components: { 
        SwiperCell
    },
    props: {
        msg: String,
    },
    data () {
        return {
            index: '',
            quotient:[2.5, 8],
            isTag: false,
            disabled:false,
            timer:null,
            position: ''
        }
    },
    methods: {
        open(e) {
            this.position = e.position
            if(e.position==='left'){
                e.close()
            }
        },
        touchstart(i){
            if(this.disabled && this.position==='left') {
                this.disabled && clearTimeout(this.timer)
                this.timer = null
            }
            this.index = i
        },
        touchend(){
            if(!this.timer && this.position==='left') {
                this.disabled = false
            }
        },
        close(){
            if(this.position==='left'){
                this.disabled = true
            }
            this.timer = setTimeout(()=>{
                this.index = ''
                this.isTag = false
                this.disabled = false
            },300)
        },
        move(deltaX) {
            if(deltaX>170) return this.isTag = true
            this.isTag = false
        }
    }
};
</script>
<style lang="stylus" scoped>
.swiperCell{
    border-bottom: 1px solid #EEE;
    overflow: hidden;
    &>.container{
        background: #CFD0D2;
    }
    &>.container_active{
        background: #E8B741;
    }
}
</style>

```

## Props


| 属性                           | 说明                    | 类型                                               |     默认值
| ------------------------------ | ----------------------- | ------------------------------------------------- | ----------------
| name                           | 标识符，可以在事件参数中获取到  | number \| string                            |  auto
| before-close	                 | 关闭前的回调函数         | Function                                          | -
| disabled	                     | 是否禁用滑动	            | boolean                                           | false
| stop-propagation		         | 是否阻止滑动事件冒泡	     | boolean                                           | false
| leftContent	                 | 左侧内容（最多一个）      | array \| boolean                                  | [<br />&emsp;{value:"标记",icon:"fa fa-star-o"}<br />]
| rightContent	                 | 有侧内容（最多一个）      | array \| boolean                                  | [<br />&emsp;{value:"标为未读",icon:""},<br />&emsp;{value:"不显示",icon:""},<br />&emsp;{value:"删除",icon:""}<br />]
| quotient	                     | 左右两侧弹性系数	         | array                                             | [ 2.5, 8 ]
| type	                         | 类型(0 \| 1)              | number \| string                                 | 1
| isElastic	                     | 是否开启弹性	             | boolean                                           | true


## Slots

| 属性                           | 说明                   
| ------------------------------ | --------------------
| default                        | 自定义显示内容


## Slots

| 事件名                          | 说明               | 回调参数    
| ------------------------------ | -----------------   |------
|click                           |点击时触发           | 关闭时的点击位置 (left right cell outside)
|open                            |打开时触发           | {position: 'left' | 'right' ,name: string, close: Function}
|close                           |关闭时触发           | { position: string , name: string }
|move                            |移动时触发           | { deltaX: string }