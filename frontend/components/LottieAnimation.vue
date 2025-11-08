<template>
	<view class="lottie-wrapper" :style="{ width: width + 'rpx', height: height + 'rpx' }">
		<canvas 
			:canvas-id="canvasId" 
			:id="canvasId"
			:style="{ width: width + 'rpx', height: height + 'rpx' }"
			class="lottie-canvas"
		></canvas>
		<view v-if="loading" class="loading-text">加载中...</view>
		<view v-if="error" class="error-text">加载失败</view>
	</view>
</template>

<script>
export default {
	name: 'LottieAnimation',
	props: {
		// 动画数据
		animationData: {
			type: Object,
			default: () => ({})
		},
		// 容器宽度
		width: {
			type: Number,
			default: 300
		},
		// 容器高度
		height: {
			type: Number,
			default: 300
		},
		// 是否自动播放
		autoplay: {
			type: Boolean,
			default: true
		},
		// 是否循环播放
		loop: {
			type: Boolean,
			default: true
		},
		// 播放速度
		speed: {
			type: Number,
			default: 1
		}
	},
	data() {
		return {
			canvasId: '',
			ctx: null,
			animation: null,
			loading: false,
			error: false,
			currentFrame: 0,
			totalFrames: 0,
			frameRate: 60,
			animationTimer: null
		}
	},
	mounted() {
		this.initCanvas()
		this.loadAnimation()
	},
	beforeUnmount() {
		this.destroyAnimation()
	},
	methods: {
		// 初始化画布
		initCanvas() {
			this.canvasId = 'lottie-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
			
			this.$nextTick(() => {
				this.ctx = uni.createCanvasContext(this.canvasId, this)
				if (this.ctx) {
					this.ctx.scale(uni.getSystemInfoSync().pixelRatio, uni.getSystemInfoSync().pixelRatio)
				}
			})
		},
		
		// 加载动画
		loadAnimation() {
			if (!this.animationData || Object.keys(this.animationData).length === 0) {
				this.error = true
				return
			}
			
			this.loading = true
			this.error = false
			
			try {
				// 解析动画数据
				this.parseAnimationData()
				this.loading = false
				
				if (this.autoplay) {
					this.play()
				}
				
				this.$emit('ready')
				
			} catch (err) {
				console.error('Lottie animation load error:', err)
				this.error = true
				this.loading = false
				this.$emit('error', err)
			}
		},
		
		// 解析动画数据
		parseAnimationData() {
			const data = this.animationData
			
			// 获取基本信息
			this.totalFrames = data.op || 0
			this.frameRate = data.fr || 60
			
			// 计算动画时长
			this.duration = this.totalFrames / this.frameRate
			
			// 初始化动画对象
			this.animation = {
				data: data,
				currentFrame: 0,
				isPlaying: false,
				isPaused: false,
				loop: this.loop,
				speed: this.speed
			}
		},
		
		// 播放动画
		play() {
			if (!this.animation) return
			
			this.animation.isPlaying = true
			this.animation.isPaused = false
			
			this.startAnimation()
			this.$emit('play')
		},
		
		// 暂停动画
		pause() {
			if (!this.animation) return
			
			this.animation.isPaused = true
			this.stopAnimation()
			this.$emit('pause')
		},
		
		// 停止动画
		stop() {
			if (!this.animation) return
			
			this.animation.isPlaying = false
			this.animation.isPaused = false
			this.animation.currentFrame = 0
			
			this.stopAnimation()
			this.renderFrame(0)
			this.$emit('stop')
		},
		
		// 开始动画循环
		startAnimation() {
			if (this.animationTimer) {
				clearInterval(this.animationTimer)
			}
			
			const frameInterval = 1000 / (this.frameRate * this.speed)
			
			this.animationTimer = setInterval(() => {
				if (!this.animation.isPlaying || this.animation.isPaused) {
					return
				}
				
				this.animation.currentFrame += 1
				
				// 检查是否到达最后一帧
				if (this.animation.currentFrame >= this.totalFrames) {
					if (this.animation.loop) {
						this.animation.currentFrame = 0
					} else {
						this.animation.currentFrame = this.totalFrames - 1
						this.stop()
						this.$emit('complete')
						return
					}
				}
				
				this.renderFrame(this.animation.currentFrame)
				this.$emit('enterFrame', {
					currentTime: this.animation.currentFrame / this.frameRate,
					totalTime: this.duration,
					currentFrame: this.animation.currentFrame,
					totalFrames: this.totalFrames
				})
				
			}, frameInterval)
		},
		
		// 停止动画循环
		stopAnimation() {
			if (this.animationTimer) {
				clearInterval(this.animationTimer)
				this.animationTimer = null
			}
		},
		
		// 渲染指定帧
		renderFrame(frame) {
			if (!this.ctx || !this.animation) return
			
			// 清空画布
			this.ctx.clearRect(0, 0, this.width, this.height)
			
			// 这里应该实现 Lottie 的渲染逻辑
			// 由于 Lottie 渲染比较复杂，这里提供一个简化的示例
			this.renderSimplifiedFrame(frame)
			
			this.ctx.draw()
		},
		
		// 简化的帧渲染（示例）
		renderSimplifiedFrame(frame) {
			if (!this.ctx) return
			
			// 这里是一个简化的渲染示例
			// 实际使用时需要完整的 Lottie 渲染引擎
			
			const progress = frame / this.totalFrames
			const centerX = this.width / 2
			const centerY = this.height / 2
			
			// 绘制一个简单的动画效果作为示例
			this.ctx.beginPath()
			this.ctx.arc(
				centerX, 
				centerY, 
				20 + Math.sin(progress * Math.PI * 2) * 10, 
				0, 
				Math.PI * 2
			)
			this.ctx.fillStyle = `hsl(${progress * 360}, 70%, 50%)`
			this.ctx.fill()
		},
		
		// 跳转到指定帧
		goToAndStop(frame, isFrame = true) {
			if (!this.animation) return
			
			const targetFrame = isFrame ? frame : Math.floor(frame * this.totalFrames)
			this.animation.currentFrame = Math.max(0, Math.min(targetFrame, this.totalFrames - 1))
			
			this.renderFrame(this.animation.currentFrame)
			this.$emit('seek', this.animation.currentFrame)
		},
		
		// 跳转到指定帧并播放
		goToAndPlay(frame, isFrame = true) {
			this.goToAndStop(frame, isFrame)
			this.play()
		},
		
		// 设置播放速度
		setSpeed(speed) {
			if (this.animation) {
				this.animation.speed = speed
				if (this.animation.isPlaying) {
					this.startAnimation()
				}
			}
		},
		
		// 销毁动画
		destroyAnimation() {
			this.stopAnimation()
			this.animation = null
			this.ctx = null
		}
	},
	
	// 监听属性变化
	watch: {
		animationData: {
			handler() {
				this.destroyAnimation()
				this.loadAnimation()
			},
			deep: true
		},
		
		speed(newSpeed) {
			this.setSpeed(newSpeed)
		},
		
		loop(newLoop) {
			if (this.animation) {
				this.animation.loop = newLoop
			}
		}
	}
}
</script>

<style scoped>
.lottie-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: transparent;
}

.lottie-canvas {
	display: block;
	background-color: transparent;
}

.loading-text,
.error-text {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 24rpx;
	color: #999;
}

.error-text {
	color: #ff4444;
}
</style>