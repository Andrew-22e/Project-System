<template>
	<view class="pop-decoration">
		<!-- 旋转星星组 -->
		<view class="star star-1">⭐</view>
		<view class="star star-2">✨</view>
		<view class="star star-3">💫</view>
		<view class="star star-4">🌟</view>

		<!-- 漂浮圆圈组 -->
		<view class="circle circle-1"></view>
		<view class="circle circle-2"></view>
		<view class="circle circle-3"></view>

		<!-- 跳跃的心形 -->
		<view class="heart heart-1">💖</view>
		<view class="heart heart-2">💕</view>

		<!-- 旋转的闪电 -->
		<view class="lightning lightning-1">⚡</view>
		<view class="lightning lightning-2">✨</view>

		<!-- 搞怪表情 -->
		<view class="emoji emoji-1">😎</view>
		<view class="emoji emoji-2">🎉</view>
		<view class="emoji emoji-3">🔥</view>

		<!-- 脉冲光环 -->
		<view class="pulse-ring pulse-ring-1"></view>
		<view class="pulse-ring pulse-ring-2"></view>

		<!-- 漂浮气泡 -->
		<view class="bubble bubble-1"></view>
		<view class="bubble bubble-2"></view>
		<view class="bubble bubble-3"></view>
	</view>
</template>

<style scoped>
	.pop-decoration {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		pointer-events: none;
		z-index: 0;
	}

	/* ===== 旋转星星 ===== */
	.star {
		position: absolute;
		font-size: 32rpx;
		animation: starTwinkle 2s ease-in-out infinite;
		filter: drop-shadow(0 0 8rpx rgba(255, 215, 0, 0.6));
	}

	.star-1 {
		top: 5%;
		left: 10%;
		animation-delay: 0s;
		animation-duration: 2.2s;
	}

	.star-2 {
		top: 15%;
		right: 15%;
		animation-delay: 0.5s;
		animation-duration: 2.8s;
	}

	.star-3 {
		top: 40%;
		left: 8%;
		animation-delay: 1s;
		animation-duration: 2.5s;
		font-size: 28rpx;
	}

	.star-4 {
		bottom: 25%;
		right: 12%;
		animation-delay: 1.5s;
		animation-duration: 3s;
		font-size: 30rpx;
	}

	@keyframes starTwinkle {
		0%, 100% {
			opacity: 1;
			transform: scale(1) rotate(0deg);
		}
		25% {
			opacity: 0.5;
			transform: scale(0.9) rotate(90deg);
		}
		50% {
			opacity: 0.3;
			transform: scale(0.7) rotate(180deg);
		}
		75% {
			opacity: 0.6;
			transform: scale(0.85) rotate(270deg);
		}
	}

	/* ===== 漂浮圆圈 ===== */
	.circle {
		position: absolute;
		border-radius: 50%;
		animation: floatUp 5s ease-in-out infinite;
		box-shadow: 0 0 15rpx rgba(255, 107, 157, 0.5);
	}

	.circle-1 {
		width: 50rpx;
		height: 50rpx;
		background: linear-gradient(135deg, rgba(255, 20, 147, 0.6), rgba(255, 107, 157, 0.4));
		top: 20%;
		left: 5%;
		animation-delay: 0s;
	}

	.circle-2 {
		width: 40rpx;
		height: 40rpx;
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.5), rgba(0, 200, 220, 0.3));
		bottom: 15%;
		right: 8%;
		animation-delay: 1.5s;
	}

	.circle-3 {
		width: 30rpx;
		height: 30rpx;
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.6), rgba(255, 240, 100, 0.4));
		top: 45%;
		right: 5%;
		animation-delay: 0.8s;
	}

	@keyframes floatUp {
		0%, 100% {
			transform: translateY(0) rotate(0deg);
			opacity: 0.7;
		}
		25% {
			transform: translateY(-30rpx) rotate(90deg);
			opacity: 0.5;
		}
		50% {
			transform: translateY(-60rpx) rotate(180deg);
			opacity: 0.3;
		}
		75% {
			transform: translateY(-30rpx) rotate(270deg);
			opacity: 0.6;
		}
	}

	/* ===== 跳跃的心形 ===== */
	.heart {
		position: absolute;
		font-size: 36rpx;
		animation: heartBounce 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
		filter: drop-shadow(0 0 6rpx rgba(255, 107, 157, 0.5));
	}

	.heart-1 {
		top: 35%;
		left: 25%;
		animation-delay: 0s;
	}

	.heart-2 {
		bottom: 30%;
		left: 70%;
		animation-delay: 0.5s;
		font-size: 32rpx;
	}

	@keyframes heartBounce {
		0%, 100% {
			transform: scale(1) translateY(0);
		}
		50% {
			transform: scale(1.3) translateY(-20rpx);
		}
	}

	/* ===== 旋转的闪电 ===== */
	.lightning {
		position: absolute;
		font-size: 34rpx;
		animation: lightningFlash 2s ease-in-out infinite;
		filter: drop-shadow(0 0 10rpx rgba(255, 215, 0, 0.7));
	}

	.lightning-1 {
		top: 10%;
		left: 50%;
		animation-delay: 0s;
		animation-duration: 2.3s;
	}

	.lightning-2 {
		top: 60%;
		right: 20%;
		animation-delay: 1s;
		animation-duration: 2.7s;
	}

	@keyframes lightningFlash {
		0%, 100% {
			opacity: 1;
			transform: scale(1) rotate(0deg);
		}
		50% {
			opacity: 0.4;
			transform: scale(0.8) rotate(180deg);
		}
	}

	/* ===== 搞怪表情 ===== */
	.emoji {
		position: absolute;
		font-size: 40rpx;
		animation: emojiJump 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
	}

	.emoji-1 {
		top: 25%;
		right: 30%;
		animation-delay: 0s;
	}

	.emoji-2 {
		bottom: 20%;
		left: 35%;
		animation-delay: 0.5s;
	}

	.emoji-3 {
		top: 55%;
		left: 15%;
		animation-delay: 1s;
		font-size: 38rpx;
	}

	@keyframes emojiJump {
		0%, 100% {
			transform: translateY(0) scale(1);
		}
		50% {
			transform: translateY(-25rpx) scale(1.2) rotate(10deg);
		}
	}

	/* ===== 脉冲光环 ===== */
	.pulse-ring {
		position: absolute;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 107, 157, 0.4), transparent);
		animation: pulseGrow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.pulse-ring-1 {
		width: 80rpx;
		height: 80rpx;
		top: 18%;
		left: 70%;
		animation-delay: 0s;
	}

	.pulse-ring-2 {
		width: 60rpx;
		height: 60rpx;
		bottom: 28%;
		right: 15%;
		background: radial-gradient(circle, rgba(0, 200, 220, 0.3), transparent);
		animation-delay: 0.5s;
	}

	@keyframes pulseGrow {
		0%, 100% {
			transform: scale(0.8);
			opacity: 1;
		}
		50% {
			transform: scale(1.4);
			opacity: 0;
		}
	}

	/* ===== 漂浮气泡 ===== */
	.bubble {
		position: absolute;
		border-radius: 50%;
		border: 2rpx solid rgba(255, 255, 255, 0.4);
		background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent);
		animation: bubbleFloat 6s ease-in infinite;
	}

	.bubble-1 {
		width: 45rpx;
		height: 45rpx;
		left: 20%;
		bottom: -50rpx;
		animation-delay: 0s;
	}

	.bubble-2 {
		width: 30rpx;
		height: 30rpx;
		left: 60%;
		bottom: -50rpx;
		animation-delay: 1s;
	}

	.bubble-3 {
		width: 55rpx;
		height: 55rpx;
		left: 80%;
		bottom: -50rpx;
		animation-delay: 2s;
	}

	@keyframes bubbleFloat {
		0% {
			bottom: -50rpx;
			opacity: 1;
			transform: translateX(0) scale(1);
		}
		50% {
			transform: translateX(30rpx) scale(1.1);
		}
		100% {
			bottom: 110vh;
			opacity: 0;
			transform: translateX(-30rpx) scale(0.8);
		}
	}
</style>
