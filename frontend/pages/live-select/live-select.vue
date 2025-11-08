<template>
	<view class="live-select-container">
		<!-- 背景（与 home.vue 相同，但不需要动画） -->
		<view class="fullscreen-bg"></view>
		
		<!-- 顶部标题区域 -->
		<view class="header-section">
			<view class="header-title">
				<view class="title-main">
					<image src="/static/iconfont/zhibo.png" class="title-icon-img" mode="aspectFit"></image>
					<text class="title-main-text">选择直播间</text>
				</view>
				<text class="title-sub">Choose Your Live Room</text>
			</view>
		</view>
		
		<!-- 直播列表 -->
		<scroll-view class="live-list-section" scroll-y="true">
			<!-- 加载中 -->
			<view v-if="loading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载直播列表中...</text>
			</view>
			
			<!-- 直播卡片列表 -->
			<view v-else-if="liveStreams.length > 0" class="live-cards-container">
				<view 
					v-for="stream in liveStreams" 
					:key="stream.id"
					class="live-card"
					:class="{ 'is-live': stream.isLive }"
					@click="enterLiveRoom(stream)"
				>
					<!-- 直播状态标签 -->
					<view class="live-status-badge" :class="{ 'live': stream.isLive }">
						<text class="status-dot">●</text>
						<text class="status-text">{{ stream.isLive ? '正在直播' : '未开播' }}</text>
					</view>
					
					<!-- 直播间信息 -->
					<view class="card-content">
						<!-- 辩题信息 -->
						<view v-if="stream.debateTopic && stream.debateTopic.title" class="debate-info">
							<text class="debate-title">{{ stream.debateTopic.title }}</text>
							<view class="debate-sides">
								<view class="side left-side">
									<image src="/static/iconfont/gongjigongju.png" class="side-icon-img" mode="aspectFit"></image>
									<text class="side-text">{{ stream.debateTopic.leftSide || stream.debateTopic.leftPosition || '' }}</text>
								</view>
								<text class="vs">VS</text>
								<view class="side right-side">
									<image src="/static/iconfont/fangyudunpai-.png" class="side-icon-img" mode="aspectFit"></image>
									<text class="side-text">{{ stream.debateTopic.rightSide || stream.debateTopic.rightPosition || '' }}</text>
								</view>
							</view>
						</view>
						
						<!-- 直播数据（仅直播中显示） -->
						<view v-if="stream.isLive" class="stream-stats">
							<view class="stat-item">
								<image src="/static/iconfont/guankanrenshu.png" class="stat-icon-img" mode="aspectFit"></image>
								<text class="stat-label">观看:</text>
								<text class="stat-value">{{ stream.activeUsers || 0 }}</text>
							</view>
							<view class="stat-item">
								<image src="/static/iconfont/toupiao.png" class="stat-icon-img" mode="aspectFit"></image>
								<text class="stat-label">投票:</text>
								<text class="stat-value">{{ stream.totalVotes || 0 }}</text>
							</view>
						</view>
						
						<!-- 投票进度条（仅直播中显示，显示具体票数） -->
						<view v-if="stream.isLive" class="vote-progress">
							<view class="progress-bar-container">
								<view class="progress-left" :style="{ width: stream.leftPercentage + '%' }">
									<text class="progress-text">{{ stream.leftVotes || 0 }}</text>
								</view>
								<view class="progress-right" :style="{ width: stream.rightPercentage + '%' }">
									<text class="progress-text">{{ stream.rightVotes || 0 }}</text>
								</view>
							</view>
							<!-- 票数信息 -->
							<view class="vote-info">
								<text class="vote-label left-label">正方: {{ stream.leftVotes || 0 }}</text>
								<text class="vote-label right-label">反方: {{ stream.rightVotes || 0 }}</text>
							</view>
						</view>
						
						<!-- 进入按钮 -->
						<view class="enter-btn" :class="{ 'disabled': !stream.isLive }">
							<text class="btn-text">{{ stream.isLive ? '进入直播间' : '等待开播' }}</text>
							<image v-if="stream.isLive" src="/static/iconfont/bofang.png" class="btn-icon-img" mode="aspectFit"></image>
							<image v-else src="/static/iconfont/suo.png" class="btn-icon-img" mode="aspectFit"></image>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view v-else class="empty-container">
				<image src="/static/iconfont/zhibo.png" class="empty-icon-img" mode="aspectFit"></image>
				<text class="empty-text">暂无直播间</text>
				<text class="empty-hint">请稍后再来</text>
			</view>
		</scroll-view>
		
		<!-- 底部刷新按钮 -->
		<view class="footer-section">
			<view class="refresh-btn" @click="refreshStreams">
				<image src="/static/iconfont/shuaxin.png" class="refresh-icon-img" mode="aspectFit"></image>
				<text class="refresh-text">刷新列表</text>
			</view>
		</view>
	</view>
</template>

<script>
import apiService from '@/utils/api-service.js';

export default {
	data() {
		return {
			loading: true,
			liveStreams: [],
			wsConnection: null,
			reconnectTimer: null
		};
	},
	
	onLoad() {
		console.log('📺 直播选择页面加载');
		this.loadLiveStreams();
		this.connectWebSocket();
	},
	
	onShow() {
		// 页面显示时刷新列表
		this.refreshStreams();
	},
	
	onUnload() {
		// 页面卸载时断开WebSocket
		this.disconnectWebSocket();
	},
	
	methods: {
		// 加载直播流列表
		async loadLiveStreams() {
			try {
				this.loading = true;
				console.log('📡 正在获取直播流列表...');
				
				const streams = await apiService.getStreamsList();
				
				console.log('✅ 获取到直播流:', streams);
				console.log(`📊 总共 ${streams?.length || 0} 个直播流`);
				
				if (!streams || streams.length === 0) {
					console.warn('⚠️ 没有获取到任何直播流');
					this.liveStreams = [];
					this.loading = false;
					return;
				}
				
				// 筛选已启用的直播流
				const enabledStreams = streams.filter(s => s.enabled);
				console.log(`✅ 筛选后有 ${enabledStreams.length} 个已启用的直播流`);
				
				if (enabledStreams.length === 0) {
					console.warn('⚠️ 没有已启用的直播流');
					this.liveStreams = [];
					this.loading = false;
					return;
				}
				
				// 为每个直播流获取详细信息
				const streamsWithDetails = await Promise.all(
					enabledStreams.map(stream => this.fetchStreamDetails(stream))
				);
				
				this.liveStreams = streamsWithDetails;
				this.loading = false;
				
				console.log('✅ 直播流列表加载完成:');
				this.liveStreams.forEach(stream => {
					console.log(`  - ${stream.name} (ID: ${stream.id}): ${stream.isLive ? '🟢 正在直播' : '⚪ 未开播'}`);
				});
			} catch (error) {
				console.error('❌ 加载直播流列表失败:', error);
				this.loading = false;
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				});
			}
		},
		
		// 获取单个直播流的详细信息
		async fetchStreamDetails(stream) {
			try {
				console.log(`📊 获取直播流 "${stream.name}" (ID: ${stream.id}) 的详细信息...`);
				
				// 🔧 修复：为每个流单独调用Dashboard API，传递streamId参数
				// 这样可以获取每个流的独立状态，支持多流并发直播
				const dashboard = await apiService.getDashboard(stream.id);
				console.log(`📊 流 "${stream.name}" 的 Dashboard 数据:`, {
					isLive: dashboard?.isLive,
					streamId: dashboard?.streamId,
					liveStreamUrl: dashboard?.liveStreamUrl,
					activeUsers: dashboard?.activeUsers
				});
				
				// 直接使用Dashboard返回的isLive状态，确保每个流的状态独立
				const isCurrentlyLive = dashboard?.isLive === true;
				
				console.log(`${isCurrentlyLive ? '🟢' : '⚪'} 直播流 "${stream.name}" 状态: ${isCurrentlyLive ? '正在直播' : '未开播'}`);
				
			// 🔧 修复：优先使用 Dashboard 的票数数据（votes API 返回空数据）
			let votesData = null;
			
			// 如果Dashboard数据包含票数，直接使用（最准确）
			if (dashboard && dashboard.leftVotes !== undefined && dashboard.rightVotes !== undefined) {
				console.log('📊 使用 Dashboard 的票数数据:', {
					left: dashboard.leftVotes,
					right: dashboard.rightVotes,
					total: dashboard.totalVotes
				});
				votesData = {
					leftVotes: dashboard.leftVotes,
					rightVotes: dashboard.rightVotes,
					totalVotes: dashboard.totalVotes || ((dashboard.leftVotes || 0) + (dashboard.rightVotes || 0)),
					leftPercentage: dashboard.leftPercentage,
					rightPercentage: dashboard.rightPercentage
				};
			}
				
				// 获取辩题信息（传递当前流的ID）
				const debateResponse = await apiService.getDebateTopic(stream.id);
				
				// 处理辩题数据，确保格式统一
				let debateTopic = null;
				if (debateResponse && debateResponse.success && debateResponse.data) {
					debateTopic = debateResponse.data;
				} else if (debateResponse && debateResponse.data) {
					debateTopic = debateResponse.data;
				} else if (debateResponse && debateResponse.title) {
					// 直接返回辩题对象的情况
					debateTopic = debateResponse;
				}
				
				return {
					...stream,
					isLive: isCurrentlyLive, // 从该流的Dashboard获取独立状态
					activeUsers: isCurrentlyLive ? (dashboard?.activeUsers || 0) : 0,
					totalVotes: votesData?.totalVotes || (votesData?.leftVotes || 0) + (votesData?.rightVotes || 0),
					leftVotes: votesData?.leftVotes || 0,
					rightVotes: votesData?.rightVotes || 0,
					leftPercentage: votesData?.leftPercentage || 50,
					rightPercentage: votesData?.rightPercentage || 50,
					debateTopic: debateTopic
				};
			} catch (error) {
				console.warn('⚠️ 获取直播流详细信息失败:', stream.id, error);
				return {
					...stream,
					isLive: false,
					activeUsers: 0,
					totalVotes: 0,
					leftVotes: 0,
					rightVotes: 0,
					leftPercentage: 50,
					rightPercentage: 50
				};
			}
		},
		
		// 刷新直播流列表
		async refreshStreams() {
			console.log('🔄 刷新直播流列表');
			await this.loadLiveStreams();
			
			uni.showToast({
				title: '刷新成功',
				icon: 'success',
				duration: 1500
			});
		},
		
		// 进入直播间
		enterLiveRoom(stream) {
			if (!stream.isLive) {
				uni.showToast({
					title: '直播未开始',
					icon: 'none'
				});
				return;
			}
			
			console.log('🚀 进入直播间:', stream.id, stream.name);
			
			// 跳转到直播间页面，传递 streamId
			uni.navigateTo({
				url: `/pages/home/home?streamId=${stream.id}`
			});
		},
		
		// ==================== WebSocket 相关 ====================
		
		// 连接 WebSocket
		connectWebSocket() {
			try {
				const wsUrl = apiService.getWebSocketUrl();
				console.log('🔌 连接 WebSocket:', wsUrl);
				
				this.wsConnection = uni.connectSocket({
					url: wsUrl,
					success: () => {
						console.log('✅ WebSocket 连接请求已发送');
					},
					fail: (error) => {
						console.error('❌ WebSocket 连接失败:', error);
					}
				});
				
				this.wsConnection.onOpen(() => {
					console.log('✅ WebSocket 已连接');
				});
				
				this.wsConnection.onMessage((event) => {
					try {
						const message = JSON.parse(event.data);
						this.handleWebSocketMessage(message);
					} catch (error) {
						console.error('❌ 解析 WebSocket 消息失败:', error);
					}
				});
				
				this.wsConnection.onError((error) => {
					console.error('❌ WebSocket 错误:', error);
					this.scheduleReconnect();
				});
				
				this.wsConnection.onClose(() => {
					console.log('🔌 WebSocket 已断开');
					this.scheduleReconnect();
				});
			} catch (error) {
				console.error('❌ 创建 WebSocket 连接失败:', error);
			}
		},
		
		// 断开 WebSocket
		disconnectWebSocket() {
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer);
				this.reconnectTimer = null;
			}
			
			if (this.wsConnection) {
				try {
					this.wsConnection.close();
					this.wsConnection = null;
				} catch (error) {
					console.error('❌ 关闭 WebSocket 失败:', error);
				}
			}
		},
		
		// 计划重连
		scheduleReconnect() {
			if (this.reconnectTimer) {
				return;
			}
			
			this.reconnectTimer = setTimeout(() => {
				console.log('🔄 尝试重连 WebSocket');
				this.reconnectTimer = null;
				this.connectWebSocket();
			}, 5000);
		},
		
		// 处理 WebSocket 消息
		handleWebSocketMessage(message) {
			const { type, streamId, liveId, data } = message;
			
			// 🔧 支持多种streamId字段名（兼容性处理）
			const currentStreamId = streamId || liveId || data?.streamId || data?.liveId;
			
			console.log('📩 收到 WebSocket 消息:', type, '流ID:', currentStreamId);
			
			switch (type) {
				case 'liveStatus':
				case 'live-status-changed':
					// 处理直播状态更新，支持多流
					if (currentStreamId && data) {
						this.updateLiveStatus(currentStreamId, data);
					} else if (data) {
						// 如果没有streamId，尝试从data中获取
						const streamIdFromData = data.streamId || data.liveId;
						if (streamIdFromData) {
							this.updateLiveStatus(streamIdFromData, data);
						} else {
							console.warn('⚠️ WebSocket消息缺少streamId，无法更新特定流状态');
						}
					}
					break;
				case 'votesUpdate':
				case 'votes-updated':
					// 处理投票更新，支持多流
					if (currentStreamId && data) {
						this.updateVotes(currentStreamId, data);
					}
					break;
				default:
					console.log('📨 未知消息类型:', type);
					break;
			}
		},
		
		// 更新直播状态
		updateLiveStatus(streamId, data) {
			const stream = this.liveStreams.find(s => s.id === streamId);
			if (stream) {
				// 🔧 支持多种状态字段格式
				const isLive = data.isLive !== undefined 
					? data.isLive 
					: (data.status === 'started' || data.status === 'running');
				
				stream.isLive = isLive;
				// 如果提供了activeUsers，也更新
				if (data.activeUsers !== undefined) {
					stream.activeUsers = data.activeUsers;
				}
				
				console.log(`✅ 直播间 "${stream.name}" 状态更新: ${isLive ? '🟢 直播中' : '⚪ 未开播'}`);
				
				// 强制更新视图
				this.$forceUpdate();
			} else {
				console.warn(`⚠️ 未找到流ID为 ${streamId} 的直播流，无法更新状态`);
			}
		},
		
		// 更新投票数据（支持多流，完全符合文档要求）
		updateVotes(streamId, data) {
			const stream = this.liveStreams.find(s => s.id === streamId);
			if (stream) {
				// 🔍 多直播流支持：检查消息是否属于当前流
				const messageStreamId = data.streamId || streamId;
				if (messageStreamId && messageStreamId !== streamId) {
					console.log('⏩ 投票更新消息不属于当前流，忽略:', messageStreamId, '当前流:', streamId);
					return;
				}
				
				// 更新票数数据
				if (data.leftVotes !== undefined) {
					stream.leftVotes = data.leftVotes;
				}
				if (data.rightVotes !== undefined) {
					stream.rightVotes = data.rightVotes;
				}
				if (data.totalVotes !== undefined) {
					stream.totalVotes = data.totalVotes;
				} else if (data.leftVotes !== undefined && data.rightVotes !== undefined) {
					// 如果没有totalVotes，根据leftVotes和rightVotes计算
					stream.totalVotes = (data.leftVotes || 0) + (data.rightVotes || 0);
				}
				if (data.leftPercentage !== undefined) {
					stream.leftPercentage = data.leftPercentage;
				}
				if (data.rightPercentage !== undefined) {
					stream.rightPercentage = data.rightPercentage;
				}
				
				console.log(`✅ 直播间 "${stream.name}" 票数更新:`, {
					left: stream.leftVotes,
					right: stream.rightVotes,
					total: stream.totalVotes
				});
				
				// 强制更新视图
				this.$forceUpdate();
			} else {
				console.warn(`⚠️ 未找到流ID为 ${streamId} 的直播流，无法更新票数`);
			}
		}
	}
};
</script>

<style scoped>
/* ==================== 容器和背景 ==================== */
.live-select-container {
	width: 100%;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;
	box-sizing: border-box;
	max-width: 100vw;
}

/* 背景 - 波普艺术风格：柔和的渐变 */
.fullscreen-bg {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(
		135deg,
		#D9468F 0%,
		#9B6ED8 25%,
		#6BA3FF 50%,
		#5ED4B3 75%,
		#FFD93D 100%
	);
	background-size: 400% 400%;
	animation: popGradient 15s ease infinite;
	z-index: 0;
}

@keyframes popGradient {
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
}

.fullscreen-bg::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: 
		radial-gradient(circle at 20% 30%, rgba(217, 70, 143, 0.25) 0%, transparent 50%),
		radial-gradient(circle at 80% 70%, rgba(155, 110, 216, 0.25) 0%, transparent 50%),
		radial-gradient(circle at 50% 50%, rgba(107, 163, 255, 0.15) 0%, transparent 50%);
	animation: popPulse 8s ease-in-out infinite;
}

@keyframes popPulse {
	0%, 100% { opacity: 0.6; transform: scale(1); }
	50% { opacity: 0.8; transform: scale(1.1); }
}

/* ==================== 顶部标题区域 ==================== */
.header-section {
	position: relative;
	z-index: 10;
	padding: 60rpx 40rpx 40rpx;
	text-align: center;
}

.header-title {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.title-main {
	display: flex;
	align-items: center;
	gap: 16rpx;
	transform: rotate(-2deg);
	animation: titleBounce 3s ease-in-out infinite;
}

@keyframes titleBounce {
	0%, 100% { transform: rotate(-2deg) translateY(0); }
	50% { transform: rotate(2deg) translateY(-8rpx); }
}

.title-icon-img {
	width: 56rpx;
	height: 56rpx;
	filter: drop-shadow(0 0 20rpx #D9468F) drop-shadow(0 0 40rpx #6BA3FF);
	animation: iconSpin 4s linear infinite;
}

@keyframes iconSpin {
	0% { transform: rotate(0deg) scale(1); }
	50% { transform: rotate(180deg) scale(1.1); }
	100% { transform: rotate(360deg) scale(1); }
}

.title-main-text {
	font-size: 64rpx;
	font-weight: 700;
	color: #FFFFFF;
	text-shadow: 
		1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
	letter-spacing: 2rpx;
}


.title-sub {
	font-size: 28rpx;
	color: #FFFFFF;
	letter-spacing: 1rpx;
	text-transform: uppercase;
	font-weight: 600;
	text-shadow: 
		1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
}

/* ==================== 直播列表区域 ==================== */
.live-list-section {
	flex: 1;
	position: relative;
	z-index: 10;
	padding: 0 30rpx 30rpx;
	overflow-y: auto;
	box-sizing: border-box; /* 确保padding包含在宽度内 */
}

.live-cards-container {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
	padding-bottom: 120rpx; /* 为底部按钮留出空间 */
	width: 100%;
	box-sizing: border-box; /* 确保宽度计算正确 */
}

/* ==================== 直播卡片 ==================== */
.live-card {
	background: linear-gradient(
		135deg,
		rgba(255, 255, 255, 0.95) 0%,
		rgba(255, 255, 255, 0.9) 100%
	);
	border-radius: 0;
	padding: 30rpx;
	border: 6rpx solid #000000;
	box-shadow: 
		12rpx 12rpx 0 #D9468F,
		-12rpx -12rpx 0 #6BA3FF,
		0 0 40rpx rgba(255, 217, 61, 0.4);
	transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	position: relative;
	overflow: visible;
	width: 100%;
	box-sizing: border-box;
	max-width: 100%;
	transform: rotate(-1deg);
	animation: cardFloat 4s ease-in-out infinite;
}

.live-card:nth-child(even) {
	transform: rotate(1deg);
	box-shadow: 
		-12rpx 12rpx 0 #5ED4B3,
		12rpx -12rpx 0 #9B6ED8,
		0 0 40rpx rgba(217, 70, 143, 0.4);
}

@keyframes cardFloat {
	0%, 100% { transform: rotate(-1deg) translateY(0); }
	50% { transform: rotate(1deg) translateY(-10rpx); }
}

.live-card::before {
	content: '';
	position: absolute;
	top: -6rpx;
	left: -6rpx;
	right: -6rpx;
	height: 8rpx;
	background: linear-gradient(90deg, 
		#D9468F 0%,
		#FFD93D 25%,
		#5ED4B3 50%,
		#6BA3FF 75%,
		#9B6ED8 100%
	);
	background-size: 200% 100%;
	animation: borderRun 3s linear infinite;
}

@keyframes borderRun {
	0% { background-position: 0% 0%; }
	100% { background-position: 200% 0%; }
}

.live-card.is-live::before {
	height: 12rpx;
	animation: borderRun 1s linear infinite, borderPulse 2s ease-in-out infinite;
}

@keyframes borderPulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.7; }
}

.live-card:active {
	transform: rotate(0deg) scale(0.95) !important;
	box-shadow: 
		6rpx 6rpx 0 #D9468F,
		-6rpx -6rpx 0 #6BA3FF,
		0 0 60rpx rgba(255, 217, 61, 0.6);
}

/* ==================== 直播状态标签 ==================== */
.live-status-badge {
	display: inline-flex;
	align-items: center;
	gap: 10rpx;
	padding: 12rpx 24rpx;
	border-radius: 0;
	background: #000000;
	border: 4rpx solid #FFFFFF;
	margin-bottom: 20rpx;
	transform: rotate(-3deg);
	box-shadow: 
		4rpx 4rpx 0 #D9468F,
		-4rpx -4rpx 0 #6BA3FF;
}

.live-status-badge.live {
	background: #D9468F;
	border-color: #FFD93D;
	box-shadow: 
		6rpx 6rpx 0 #000000,
		0 0 30rpx #D9468F,
		0 0 60rpx rgba(217, 70, 143, 0.6);
	animation: badgePulse 1.5s ease-in-out infinite, badgeShake 0.5s ease-in-out infinite;
}

@keyframes badgePulse {
	0%, 100% {
		box-shadow: 
			6rpx 6rpx 0 #000000,
			0 0 30rpx #D9468F,
			0 0 60rpx rgba(217, 70, 143, 0.6);
		transform: rotate(-3deg) scale(1);
	}
	50% {
		box-shadow: 
			6rpx 6rpx 0 #000000,
			0 0 50rpx #D9468F,
			0 0 100rpx rgba(217, 70, 143, 0.8);
		transform: rotate(-3deg) scale(1.05);
	}
}

@keyframes badgeShake {
	0%, 100% { transform: rotate(-3deg) translateX(0); }
	25% { transform: rotate(-2deg) translateX(-2rpx); }
	75% { transform: rotate(-4deg) translateX(2rpx); }
}

.status-dot {
	font-size: 24rpx;
	color: #FFFFFF;
	font-weight: 700;
}

.live-status-badge.live .status-dot {
	color: #FFD93D;
	animation: dotBlink 0.8s ease-in-out infinite;
	text-shadow: 0 0 20rpx #FFD93D;
}

@keyframes dotBlink {
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.5; transform: scale(1.3); }
}

.status-text {
	font-size: 26rpx;
	color: #FFFFFF;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5rpx;
	text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
}

/* ==================== 卡片内容 ==================== */
.card-content {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	width: 100%;
	box-sizing: border-box; /* 确保宽度计算正确 */
}

.stream-name {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.name-icon-img {
	width: 36rpx;
	height: 36rpx;
}

.name-text {
	font-size: 36rpx;
	font-weight: 700;
	color: #000000;
	letter-spacing: 0.5rpx;
}

/* ==================== 辩题信息 ==================== */
.debate-info {
	background: linear-gradient(135deg, #FFD93D 0%, #D9468F 100%);
	border-radius: 0;
	padding: 24rpx;
	border: 5rpx solid #000000;
	box-shadow: 
		6rpx 6rpx 0 #000000,
		inset 0 0 20rpx rgba(255, 255, 255, 0.3);
	transform: rotate(1deg);
}

.debate-title {
	display: block;
	font-size: 28rpx;
	color: #FFFFFF;
	margin-bottom: 16rpx;
	line-height: 1.4;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.5rpx;
	text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
}

.debate-sides {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	width: 100%;
	box-sizing: border-box;
}

.side {
	flex: 1;
	font-size: 24rpx;
	padding: 14rpx 16rpx;
	border-radius: 0;
	text-align: center;
	min-width: 0;
	box-sizing: border-box;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	border: 4rpx solid #000000;
	box-shadow: 4rpx 4rpx 0 #000000;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.5rpx;
}

.side-icon-img {
	width: 28rpx;
	height: 28rpx;
	flex-shrink: 0;
	filter: drop-shadow(2rpx 2rpx 0 #000000);
}

.side-text {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.left-side {
	background: #D9468F;
	color: #FFFFFF;
	transform: rotate(-2deg);
}

.right-side {
	background: #6BA3FF;
	color: #FFFFFF;
	transform: rotate(2deg);
}

.vs {
	font-size: 32rpx;
	color: #FFFFFF;
	font-weight: 800;
	text-shadow: 
		1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
}


/* ==================== 统计数据 ==================== */
.stream-stats {
	display: flex;
	gap: 20rpx;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 14rpx 20rpx;
	background: #000000;
	border-radius: 0;
	border: 4rpx solid #FFFFFF;
	box-shadow: 
		4rpx 4rpx 0 #D9468F,
		-4rpx -4rpx 0 #6BA3FF;
	transform: rotate(-1deg);
}

.stat-item:nth-child(even) {
	transform: rotate(1deg);
	box-shadow: 
		-4rpx 4rpx 0 #5ED4B3,
		4rpx -4rpx 0 #9B6ED8;
}

.stat-icon-img {
	width: 28rpx;
	height: 28rpx;
	filter: drop-shadow(0 0 10rpx #FFD93D);
}

.stat-label {
	font-size: 24rpx;
	color: #FFFFFF;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5rpx;
}

.stat-value {
	font-size: 28rpx;
	font-weight: 700;
	color: #FFD93D;
	text-shadow: 
		1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
}

/* ==================== 投票进度条 ==================== */
.vote-progress {
	margin-top: 16rpx;
	width: 100%;
	box-sizing: border-box;
}

.progress-bar-container {
	display: flex;
	height: 50rpx;
	border-radius: 0;
	overflow: visible;
	background: #000000;
	border: 5rpx solid #FFFFFF;
	box-shadow: 
		6rpx 6rpx 0 #D9468F,
		-6rpx -6rpx 0 #6BA3FF;
	width: 100%;
	box-sizing: border-box;
	max-width: 100%;
	position: relative;
}

.progress-left,
.progress-right {
	display: flex;
	align-items: center;
	justify-content: center;
	transition: width 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	position: relative;
	overflow: visible;
}

.progress-left {
	background: linear-gradient(90deg, 
		#D9468F 0%,
		#FFD93D 50%,
		#D9468F 100%
	);
	background-size: 200% 100%;
	animation: progressShine 2s linear infinite;
	box-shadow: inset 0 0 20rpx rgba(255, 255, 255, 0.3);
}

.progress-right {
	background: linear-gradient(90deg, 
		#6BA3FF 0%,
		#5ED4B3 50%,
		#6BA3FF 100%
	);
	background-size: 200% 100%;
	animation: progressShine 2s linear infinite reverse;
	box-shadow: inset 0 0 20rpx rgba(255, 255, 255, 0.3);
}

@keyframes progressShine {
	0% { background-position: 0% 0%; }
	100% { background-position: 200% 0%; }
}

.progress-text {
	font-size: 24rpx;
	color: #FFFFFF;
	font-weight: 700;
	text-shadow: 
		1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
	z-index: 10;
}

/* ==================== 票数信息 ==================== */
.vote-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 16rpx;
	gap: 16rpx;
}

.vote-label {
	font-size: 24rpx;
	font-weight: 700;
	padding: 10rpx 18rpx;
	border-radius: 0;
	border: 4rpx solid #000000;
	text-transform: uppercase;
	letter-spacing: 0.5rpx;
	box-shadow: 4rpx 4rpx 0 #000000;
}

.left-label {
	color: #FFFFFF;
	background: #D9468F;
}

.right-label {
	color: #FFFFFF;
	background: #6BA3FF;
}

/* ==================== 进入按钮 ==================== */
.enter-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 24rpx;
	border-radius: 0;
	background: linear-gradient(135deg, 
		#D9468F 0%,
		#FFD93D 50%,
		#5ED4B3 100%
	);
	background-size: 200% 200%;
	animation: buttonGradient 3s ease infinite;
	border: 6rpx solid #000000;
	box-shadow: 
		8rpx 8rpx 0 #000000,
		0 0 40rpx #D9468F,
		0 0 80rpx rgba(217, 70, 143, 0.4);
	transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	margin-top: 16rpx;
	width: 100%;
	box-sizing: border-box;
	max-width: 100%;
	transform: rotate(-1deg);
	position: relative;
	overflow: hidden;
}

@keyframes buttonGradient {
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
}

.enter-btn::before {
	content: '';
	position: absolute;
	top: -50%;
	left: -50%;
	width: 200%;
	height: 200%;
	background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
	animation: buttonShine 2s linear infinite;
}

@keyframes buttonShine {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.enter-btn:active {
	transform: rotate(0deg) scale(0.95);
	box-shadow: 
		4rpx 4rpx 0 #000000,
		0 0 60rpx #D9468F,
		0 0 120rpx rgba(217, 70, 143, 0.7);
}

.enter-btn.disabled {
	background: #666666;
	border-color: #000000;
	box-shadow: 4rpx 4rpx 0 #000000;
	opacity: 0.7;
	animation: none;
}

.enter-btn.disabled::before {
	display: none;
}

.btn-text {
	font-size: 32rpx;
	font-weight: 700;
	color: #FFFFFF;
	text-shadow: 
		1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
	text-transform: uppercase;
	letter-spacing: 1rpx;
	position: relative;
	z-index: 1;
}

.btn-icon-img {
	width: 32rpx;
	height: 32rpx;
	filter: drop-shadow(2rpx 2rpx 0 #000000) drop-shadow(0 0 10rpx #FFFFFF);
	position: relative;
	z-index: 1;
	animation: iconBounce 1s ease-in-out infinite;
}

@keyframes iconBounce {
	0%, 100% { transform: translateY(0) rotate(0deg); }
	50% { transform: translateY(-4rpx) rotate(10deg); }
}

/* ==================== 加载状态 ==================== */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 40rpx;
	gap: 40rpx;
}

.loading-spinner {
	width: 80rpx;
	height: 80rpx;
	border: 8rpx solid #000000;
	border-top-color: #D9468F;
	border-right-color: #6BA3FF;
	border-bottom-color: #5ED4B3;
	border-left-color: #FFD93D;
	border-radius: 0;
	animation: popSpin 1s linear infinite;
	box-shadow: 
		0 0 30rpx #D9468F,
		0 0 60rpx rgba(217, 70, 143, 0.4);
	transform: rotate(45deg);
}

@keyframes popSpin {
	0% { transform: rotate(45deg) scale(1); }
	50% { transform: rotate(225deg) scale(1.2); }
	100% { transform: rotate(405deg) scale(1); }
}

.loading-text {
	font-size: 32rpx;
	color: #FFFFFF;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 1rpx;
	text-shadow: 
		1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
	animation: textPulse 1.5s ease-in-out infinite;
}

@keyframes textPulse {
	0%, 100% { transform: scale(1); opacity: 1; }
	50% { transform: scale(1.1); opacity: 0.8; }
}

/* ==================== 空状态 ==================== */
.empty-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 40rpx;
	gap: 30rpx;
}

.empty-icon-img {
	width: 120rpx;
	height: 120rpx;
	filter: drop-shadow(0 0 30rpx #D9468F) drop-shadow(0 0 60rpx #6BA3FF);
	animation: iconFloat 3s ease-in-out infinite;
	transform: rotate(-10deg);
}

@keyframes iconFloat {
	0%, 100% { transform: rotate(-10deg) translateY(0); }
	50% { transform: rotate(10deg) translateY(-20rpx); }
}

.empty-text {
	font-size: 40rpx;
	color: #FFFFFF;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 1rpx;
	text-shadow: 
		1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
}

.empty-hint {
	font-size: 28rpx;
	color: #FFFFFF;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5rpx;
	text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
}

/* ==================== 底部刷新按钮 ==================== */
.footer-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 30rpx;
	background: linear-gradient(
		to top,
		rgba(0, 0, 0, 0.95) 0%,
		rgba(0, 0, 0, 0.7) 70%,
		transparent 100%
	);
	z-index: 20;
	display: flex;
	justify-content: center;
}

.refresh-btn {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 20rpx 50rpx;
	border-radius: 0;
	background: linear-gradient(135deg, #9B6ED8 0%, #6BA3FF 100%);
	border: 5rpx solid #000000;
	box-shadow: 
		6rpx 6rpx 0 #000000,
		0 0 30rpx #6BA3FF,
		0 0 60rpx rgba(107, 163, 255, 0.4);
	transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	transform: rotate(-1deg);
	position: relative;
	overflow: hidden;
}

.refresh-btn::before {
	content: '';
	position: absolute;
	top: -50%;
	left: -50%;
	width: 200%;
	height: 200%;
	background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
	animation: refreshShine 2s linear infinite;
}

@keyframes refreshShine {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.refresh-btn:active {
	transform: rotate(0deg) scale(0.95);
	box-shadow: 
		3rpx 3rpx 0 #000000,
		0 0 50rpx #6BA3FF,
		0 0 100rpx rgba(107, 163, 255, 0.7);
}

.refresh-icon-img {
	width: 36rpx;
	height: 36rpx;
	filter: drop-shadow(2rpx 2rpx 0 #000000);
	position: relative;
	z-index: 1;
	animation: refreshSpin 2s linear infinite;
}

@keyframes refreshSpin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.refresh-text {
	font-size: 30rpx;
	color: #FFFFFF;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 1rpx;
	text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
	position: relative;
	z-index: 1;
}
</style>

