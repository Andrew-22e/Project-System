/**
 * 直播配置文件
 * 用于配置直播流地址和相关参数
 */

export default {
	// ==================== HLS 直播流配置（优化版） ====================
	
	// 主直播流地址（默认使用高清）
	liveStreamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
	
	// ==================== 多清晰度支持 ====================
	// HLS 支持 ABR (自适应比特率)，可以根据网络情况自动切换清晰度
	multiQualityStreams: {
		// 超清 (1080p)
		high: {
			url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
			label: '超清',
			resolution: '1920x1080',
			bitrate: 3000,  // kbps
			recommended: '5Mbps以上网速'
		},
		// 高清 (720p)
		medium: {
			url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
			label: '高清',
			resolution: '1280x720',
			bitrate: 1500,
			recommended: '2Mbps以上网速'
		},
		// 标清 (480p)
		low: {
			url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
			label: '标清',
			resolution: '854x480',
			bitrate: 800,
			recommended: '1Mbps以上网速'
		},
		// 流畅 (360p)
		smooth: {
			url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
			label: '流畅',
			resolution: '640x360',
			bitrate: 500,
			recommended: '512Kbps以上网速'
		}
	},
	
	// 默认清晰度（可选：high / medium / low / smooth）
	defaultQuality: 'medium',
	
	// 是否启用自适应清晰度（根据网络自动切换）
	adaptiveBitrate: true,
	
	// 备用直播流地址
	backupStreamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
	
	// ==================== HLS 播放器配置 ====================
	config: {
		// 是否自动播放
		autoplay: true,
		
		// 是否默认静音（iOS自动播放需要静音）
		muted: false,
		
		// 播放模式：live(直播) | RTC(实时通话，延迟更低)
		mode: 'live',
		
		// 画面填充模式：contain(包含) | fillCrop(裁剪)
		objectFit: 'contain',
		
		// 最小缓冲区，单位s（减少延迟）
		minCache: 1,
		
		// 最大缓冲区，单位s（保证流畅）
		maxCache: 3,
		
		// 画面方向：vertical(竖屏) | horizontal(横屏)
		orientation: 'vertical',
		
		// 声音输出方式：speaker(扬声器) | ear(听筒)
		soundMode: 'speaker',
		
		// 是否启用后台播放（小程序默认不支持）
		backgroundMute: false,
		
		// 是否启用画中画模式
		pictureInPictureMode: []  // [] 表示禁用
	},
	
	// ==================== HLS 高级配置 ====================
	advanced: {
		// 自动重连配置
		reconnect: {
			enabled: true,       // 是否启用自动重连
			maxAttempts: 3,      // 最大重连次数
			delay: 3000,         // 重连延迟 (ms)
			exponentialBackoff: true  // 是否使用指数退避
		},
		
		// 网络质量监控
		networkMonitor: {
			enabled: true,       // 是否启用监控
			interval: 5000,      // 监控间隔 (ms)
			lowBitrateThreshold: 500,   // 低码率阈值 (kbps)
			lowFpsThreshold: 15,        // 低帧率阈值 (fps)
			highJitterThreshold: 200    // 高抖动阈值 (ms)
		},
		
		// 错误处理配置
		errorHandling: {
			showToast: true,     // 是否显示错误提示
			autoReport: false,   // 是否自动上报错误
			retryOnError: true   // 错误时是否重试
		}
	},
	
	// ==================== 更多测试直播流 ====================
	testStreams: {
		// 央视频道
		cctv: {
			cctv1: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226231/index.m3u8',
			cctv2: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226195/index.m3u8',
			cctv3: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226397/index.m3u8',
			cctv4: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226191/index.m3u8',
			cctv5: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226395/index.m3u8',
			cctv6: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226393/index.m3u8',
			cctv13: 'http://39.134.24.166/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226233/index.m3u8'
		},
		
		// 卫视频道
		satellite: {
			hunan: 'http://39.134.24.161/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226211/index.m3u8',
			zhejiang: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226199/index.m3u8',
			jiangsu: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226200/index.m3u8',
			beijing: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226222/index.m3u8',
			dongfang: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226217/index.m3u8'
		},
		
		// 国际测试流
		international: {
			bigBuckBunny: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
			sintel: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
			appleDemo: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8'
		}
	},
	
	// 常用直播平台推流地址示例
	examples: {
		// 腾讯云直播
		tencent: {
			// RTMP: rtmp://live-push.myqcloud.com/live/streamname?txSecret=xxx&txTime=xxx
			// HLS: https://live-play.myqcloud.com/live/streamname.m3u8
			// FLV: https://live-play.myqcloud.com/live/streamname.flv
		},
		
		// 阿里云直播
		aliyun: {
			// RTMP: rtmp://video-center.alivecdn.com/AppName/StreamName?auth_key=xxx
			// HLS: https://video-center.alivecdn.com/AppName/StreamName.m3u8
			// FLV: https://video-center.alivecdn.com/AppName/StreamName.flv
		},
		
		// 七牛云直播
		qiniu: {
			// RTMP: rtmp://pili-publish.xxx.com/AppName/StreamName
			// HLS: https://pili-live-hls.xxx.com/AppName/StreamName.m3u8
			// FLV: https://pili-live-hdl.xxx.com/AppName/StreamName.flv
		}
	}
}

