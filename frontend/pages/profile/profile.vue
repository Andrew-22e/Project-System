<template>
	<view class="profile-container">
		<!-- 页面头部 -->
		<view class="page-header">
			<view class="page-title-container">
				<image src="/static/iconfont/blue-user.png" class="page-title-icon" mode="aspectFit"></image>
				<text class="page-title">个人中心</text>
			</view>
			<text class="page-subtitle">RHODES ISLAND CHAMPS</text>
		</view>

		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-avatar">
				<image v-if="userInfo && userInfo.avatarUrl" :src="userInfo.avatarUrl" class="avatar-image" mode="aspectFill"></image>
				<image v-else src="/static/iconfont/blue-user.png" class="avatar-default-icon" mode="aspectFit"></image>
			</view>
			<view class="user-info">
				<text class="user-name">{{ userInfo ? userInfo.nickName : '辩论用户' }}</text>
				<text class="user-id">ID: {{ userId }}</text>
			</view>
		</view>

		<!-- 数据统计卡片 -->
		<view class="stats-card">
			<view class="stats-header">
				<view class="stats-title-container">
					<image src="/static/iconfont/shuju.png" class="stats-title-icon" mode="aspectFit"></image>
					<text class="stats-title">我的数据</text>
				</view>
			</view>
			<view class="stats-grid">
				<view class="stat-box">
					<text class="stat-number">{{ totalVotes }}</text>
					<text class="stat-label">投票次数</text>
				</view>
				<view class="stat-box">
					<text class="stat-number">{{ joinedDebates }}</text>
					<text class="stat-label">参与辩论</text>
				</view>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-item" @click="handleLogout">
				<view class="menu-icon logout-icon">
					<image src="/static/iconfont/tuichudenglu.png" class="menu-icon-img" mode="aspectFit"></image>
				</view>
				<text class="menu-text">退出登录</text>
				<text class="menu-arrow">></text>
			</view>
		</view>

		<!-- 底部导航栏 -->
		<view class="bottom-nav">
			<view class="nav-item" :class="{ 'active': currentTab === 'home' }" @click="switchTab('home')">
				<view class="nav-icon">
					<image v-if="currentTab === 'home'" src="/static/iconfont/dibu_zhuye_yixuanzhongzhuangtai.png" class="nav-icon-img" mode="aspectFit"></image>
					<image v-else src="/static/iconfont/dibu_zhuye_weixuanzhongzhuangtai.png" class="nav-icon-img" mode="aspectFit"></image>
				</view>
				<text class="nav-text">首页</text>
			</view>
			
			<view class="nav-item" :class="{ 'active': currentTab === 'profile' }" @click="switchTab('profile')">
				<view class="nav-icon">
					<image v-if="currentTab === 'profile'" src="/static/iconfont/wodexuanzhong.png" class="nav-icon-img" mode="aspectFit"></image>
					<image v-else src="/static/iconfont/wode.png" class="nav-icon-img" mode="aspectFit"></image>
				</view>
				<text class="nav-text">我的</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 'profile',
				userInfo: null,
				userId: '',
				totalVotes: 0,
				joinedDebates: 0
			}
		},
		onLoad() {
			// 加载用户信息
			this.loadUserInfo();
		},
		onShow() {
			// 页面显示时，确保导航栏选中状态正确
			this.currentTab = 'profile';
		},
		methods: {
			// 加载用户信息
			loadUserInfo() {
				// 从本地存储获取用户信息
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo) {
					this.userInfo = userInfo;
					// 生成用户ID（基于昵称哈希）
					this.userId = this.generateUserId(userInfo.nickName || '辩论用户');
				}
				
				// 从本地存储获取用户数据
				const userData = uni.getStorageSync('userData');
				if (userData) {
					this.totalVotes = userData.totalVotes || 0;
					this.joinedDebates = userData.joinedDebates || 0;
				}
			},
			
			// 生成用户ID
			generateUserId(name) {
				// 简单的哈希生成ID
				let hash = 0;
				for (let i = 0; i < name.length; i++) {
					const char = name.charCodeAt(i);
					hash = ((hash << 5) - hash) + char;
					hash = hash & hash;
				}
				return Math.abs(hash).toString().slice(0, 8);
			},
			
			// 退出登录
			handleLogout() {
				uni.showModal({
					title: '确认退出',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							// 清除本地存储
							uni.removeStorageSync('userInfo');
							uni.removeStorageSync('loginCode');
							uni.removeStorageSync('userData');
							
							uni.showToast({
								title: '已退出登录',
								icon: 'success',
								duration: 1500
							});
							
							// 跳转到登录页
							setTimeout(() => {
								uni.redirectTo({
									url: '/pages/index/index'
								});
							}, 1500);
						}
					}
				});
			},
			
			// 切换标签
			switchTab(tab) {
				this.currentTab = tab;
				if (tab === 'home') {
					// 返回首页 - 使用 navigateBack 返回，不会重新加载页面
					const pages = getCurrentPages();
					if (pages.length > 1) {
						// 如果有上一页，直接返回
						uni.navigateBack({
							delta: 1
						});
					} else {
						// 如果页面栈中只有当前页，使用 redirectTo
						uni.redirectTo({
							url: '/pages/home/home'
						});
					}
				}
			}
		}
	}
</script>

<style>
	.profile-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #FFE5F0 0%, #E5F3FF 50%, #FFF5E5 100%);
		padding: 80rpx 30rpx 140rpx 30rpx;
	}

	/* 页面头部 */
	.page-header {
		text-align: center;
		margin-bottom: 40rpx;
		padding: 20rpx 0;
	}

	.page-title-container {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 15rpx;
		margin-bottom: 15rpx;
	}

	.page-title-icon {
		width: 50rpx;
		height: 50rpx;
		filter: drop-shadow(3rpx 3rpx 0 #FFD93D) drop-shadow(6rpx 6rpx 0 rgba(78, 205, 196, 0.3));
	}

	.page-title {
		font-size: 52rpx;
		font-weight: 900;
		color: #FF6B9D;
		letter-spacing: 2rpx;
		text-shadow: 3rpx 3rpx 0 #FFD93D, 6rpx 6rpx 0 rgba(78, 205, 196, 0.3);
	}

	.page-subtitle {
		font-size: 24rpx;
		color: #4ECDC4;
		font-weight: 700;
		letter-spacing: 2rpx;
		text-shadow: 1rpx 1rpx 0 rgba(255, 217, 61, 0.3);
	}

	/* 用户信息卡片 */
	.user-card {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
		border: 5rpx solid #FF6B9D;
		border-radius: 30rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;
		gap: 30rpx;
		box-shadow: 8rpx 8rpx 0 rgba(255, 107, 157, 0.2), 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10rpx);
	}

	.user-avatar {
		width: 130rpx;
		height: 130rpx;
		background: linear-gradient(135deg, #FF6B9D, #FF1493);
		border: 5rpx solid #FFD93D;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
		overflow: hidden;
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.avatar-default-icon {
		width: 70rpx;
		height: 70rpx;
	}

	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.user-name {
		font-size: 38rpx;
		font-weight: 900;
		color: #FF6B9D;
		letter-spacing: 1rpx;
		text-shadow: 2rpx 2rpx 0 rgba(255, 217, 61, 0.3);
	}

	.user-id {
		font-size: 24rpx;
		color: #4ECDC4;
		font-weight: 600;
		letter-spacing: 1rpx;
	}

	/* 数据统计卡片 */
	.stats-card {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
		border: 5rpx solid #4ECDC4;
		border-radius: 30rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 8rpx 8rpx 0 rgba(78, 205, 196, 0.2), 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10rpx);
	}

	.stats-header {
		margin-bottom: 25rpx;
	}

	.stats-title-container {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.stats-title-icon {
		width: 36rpx;
		height: 36rpx;
		filter: drop-shadow(2rpx 2rpx 0 rgba(255, 217, 61, 0.3));
	}

	.stats-title {
		font-size: 32rpx;
		font-weight: 900;
		color: #4ECDC4;
		letter-spacing: 1rpx;
		text-shadow: 2rpx 2rpx 0 rgba(255, 217, 61, 0.3);
	}

	.stats-grid {
		display: flex;
		gap: 20rpx;
		justify-content: space-around;
	}

	.stat-box {
		flex: 1;
		background: linear-gradient(135deg, #FFD93D 0%, #FFA500 100%);
		border: 4rpx solid #000;
		border-radius: 20rpx;
		padding: 25rpx 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10rpx;
		box-shadow: 4rpx 4rpx 0 rgba(0, 0, 0, 0.1);
	}

	.stat-number {
		font-size: 48rpx;
		font-weight: 900;
		color: #000;
		text-shadow: 2rpx 2rpx 0 rgba(255, 255, 255, 0.5);
	}

	.stat-label {
		font-size: 24rpx;
		color: #000;
		font-weight: 700;
		letter-spacing: 1rpx;
	}

	/* 功能菜单 */
	.menu-section {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
		border: 5rpx solid #FF6B9D;
		border-radius: 30rpx;
		overflow: hidden;
		box-shadow: 8rpx 8rpx 0 rgba(255, 107, 157, 0.2), 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10rpx);
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 30rpx 35rpx;
		transition: all 0.3s ease;
	}

	.menu-item:active {
		background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(255, 107, 157, 0.05) 100%);
		transform: scale(0.98);
	}

	.menu-icon {
		width: 70rpx;
		height: 70rpx;
		background: linear-gradient(135deg, #FF6B9D, #FF1493);
		border: 4rpx solid #FFD93D;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 25rpx;
		box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.3);
	}

	.logout-icon {
		background: linear-gradient(135deg, #FF6B9D, #dc3545);
	}

	.menu-icon-img {
		width: 40rpx;
		height: 40rpx;
	}

	.menu-text {
		flex: 1;
		font-size: 32rpx;
		font-weight: 800;
		color: #000;
		letter-spacing: 1rpx;
	}

	.menu-arrow {
		font-size: 32rpx;
		color: #FF6B9D;
		font-weight: bold;
	}

	/* 底部导航栏 */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 120rpx;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
		border-top: 5rpx solid #FF6B9D;
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding: 10rpx 20rpx;
		box-shadow: 0 -4rpx 20rpx rgba(255, 107, 157, 0.2);
		z-index: 1000;
		backdrop-filter: blur(20rpx);
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		height: 100%;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 20rpx;
		padding: 10rpx;
	}

	.nav-item:active {
		transform: scale(0.92);
	}

	.nav-item.active {
		background: linear-gradient(135deg, rgba(255, 107, 157, 0.15) 0%, rgba(255, 107, 157, 0.1) 100%);
		transform: scale(1.05);
	}

	.nav-icon {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8rpx;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-icon-img {
		width: 48rpx;
		height: 48rpx;
		transition: all 0.3s ease;
	}

	.nav-item.active .nav-icon {
		transform: scale(1.15);
	}

	.nav-item.active .nav-icon-img {
		transform: scale(1.1);
		filter: drop-shadow(0 2rpx 6rpx rgba(255, 107, 157, 0.4));
	}

	.nav-text {
		font-size: 22rpx;
		color: #666;
		font-weight: 600;
		transition: all 0.3s ease;
		letter-spacing: 0.5rpx;
	}

	.nav-item.active .nav-text {
		color: #FF1493;
		font-weight: 900;
		text-shadow: 0 1rpx 2rpx rgba(255, 20, 147, 0.2);
	}
</style>
