// 简单的文件数据库（可用于生产环境使用真实数据库替换）
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_DIR = path.join(__dirname, '../data');
const DB_FILES = {
	streams: path.join(DB_DIR, 'streams.json'),
	debate: path.join(DB_DIR, 'debate.json'),
	users: path.join(DB_DIR, 'users.json'),
	statistics: path.join(DB_DIR, 'statistics.json'),
	liveSchedule: path.join(DB_DIR, 'live-schedule.json')
};

// 确保数据目录存在
if (!fs.existsSync(DB_DIR)) {
	fs.mkdirSync(DB_DIR, { recursive: true });
}

// 初始化默认数据
function initDefaultData() {
	// 初始化直播流
	if (!fs.existsSync(DB_FILES.streams)) {
		fs.writeFileSync(DB_FILES.streams, JSON.stringify([], null, 2));
	}
	
	// 初始化辩论设置
	if (!fs.existsSync(DB_FILES.debate)) {
		fs.writeFileSync(DB_FILES.debate, JSON.stringify({
			title: "如果有一个能一键消除痛苦的按钮，你会按吗？",
			description: "这是一个关于痛苦、成长与人性选择的深度辩论",
			leftPosition: "会按",
			rightPosition: "不会按"
		}, null, 2));
	}
	
	// 初始化用户数据
	if (!fs.existsSync(DB_FILES.users)) {
		fs.writeFileSync(DB_FILES.users, JSON.stringify([], null, 2));
	}
	
	// 初始化统计数据
	if (!fs.existsSync(DB_FILES.statistics)) {
		fs.writeFileSync(DB_FILES.statistics, JSON.stringify({
			totalVotes: 0,
			totalUsers: 0,
			dailyStats: []
		}, null, 2));
	}
	
	// 初始化直播计划
	if (!fs.existsSync(DB_FILES.liveSchedule)) {
		fs.writeFileSync(DB_FILES.liveSchedule, JSON.stringify({
			scheduledStartTime: null,
			scheduledEndTime: null,
			streamId: null,
			debateId: null,
			isScheduled: false
		}, null, 2));
	}
}

// 读取数据
function readData(key) {
	try {
		const data = fs.readFileSync(DB_FILES[key], 'utf8');
		return JSON.parse(data);
	} catch (error) {
		if (error.code === 'ENOENT') {
			initDefaultData();
			return readData(key);
		}
		throw error;
	}
}

// 写入数据
function writeData(key, data) {
	fs.writeFileSync(DB_FILES[key], JSON.stringify(data, null, 2));
}

// 直播流管理
const streams = {
	getAll: () => readData('streams'),
	
	getById: (id) => {
		const streams = readData('streams');
		return streams.find(s => s.id === id);
	},
	
	create: (streamData) => {
		const streams = readData('streams');
		const newStream = {
			id: uuidv4(),
			...streamData,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		streams.push(newStream);
		writeData('streams', streams);
		return newStream;
	},
	
	// add方法作为create的别名，方便使用
	add: function(streamData) {
		return this.create(streamData);
	},
	
	update: (id, streamData) => {
		const streams = readData('streams');
		const index = streams.findIndex(s => s.id === id);
		if (index === -1) return null;
		
		streams[index] = {
			...streams[index],
			...streamData,
			updatedAt: new Date().toISOString()
		};
		writeData('streams', streams);
		return streams[index];
	},
	
	delete: (id) => {
		const streams = readData('streams');
		const filtered = streams.filter(s => s.id !== id);
		writeData('streams', filtered);
		return filtered.length < streams.length;
	},
	
	toggle: (id) => {
		const streams = readData('streams');
		const index = streams.findIndex(s => s.id === id);
		if (index === -1) return null;
		
		streams[index].enabled = !streams[index].enabled;
		streams[index].updatedAt = new Date().toISOString();
		writeData('streams', streams);
		return streams[index];
	},
	
	getActive: () => {
		const streams = readData('streams');
		return streams.find(s => s.enabled === true);
	}
};

// 辩论设置管理
const debate = {
	get: () => readData('debate'),
	
	update: (debateData) => {
		const current = readData('debate');
		const updated = {
			...current,
			...debateData,
			updatedAt: new Date().toISOString()
		};
		writeData('debate', updated);
		return updated;
	}
};

// 用户管理
const users = {
	getAll: () => readData('users'),
	
	getById: (id) => {
		const users = readData('users');
		return users.find(u => u.id === id);
	},
	
	createOrUpdate: (userData) => {
		const users = readData('users');
		const index = users.findIndex(u => u.id === userData.id);
		
		if (index === -1) {
			// 新用户
			const newUser = {
				...userData,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				totalVotes: 0,
				joinedDebates: 0,
				status: 'active'
			};
			users.push(newUser);
			writeData('users', users);
			return newUser;
		} else {
			// 更新用户
			users[index] = {
				...users[index],
				...userData,
				updatedAt: new Date().toISOString()
			};
			writeData('users', users);
			return users[index];
		}
	},
	
	updateStats: (id, stats) => {
		const users = readData('users');
		const index = users.findIndex(u => u.id === id);
		if (index === -1) return null;
		
		users[index].totalVotes = (users[index].totalVotes || 0) + (stats.votes || 0);
		users[index].joinedDebates = (users[index].joinedDebates || 0) + (stats.debates || 0);
		users[index].updatedAt = new Date().toISOString();
		writeData('users', users);
		return users[index];
	}
};

// 统计数据管理
const statistics = {
	get: () => readData('statistics'),
	
	incrementVotes: (count = 1) => {
		const stats = readData('statistics');
		stats.totalVotes = (stats.totalVotes || 0) + count;
		writeData('statistics', stats);
		return stats;
	},
	
	updateDashboard: (data) => {
		const stats = readData('statistics');
		// 更新传入的字段
		if (data.totalVotes !== undefined) {
			stats.totalVotes = data.totalVotes;
		}
		if (data.lastLiveTime !== undefined) {
			stats.lastLiveTime = data.lastLiveTime;
		}
		if (data.liveDuration !== undefined) {
			stats.liveDuration = data.liveDuration;
		}
		// 更新其他可能的字段
		if (data.totalUsers !== undefined) {
			stats.totalUsers = data.totalUsers;
		}
		if (data.totalComments !== undefined) {
			stats.totalComments = data.totalComments;
		}
		if (data.totalLikes !== undefined) {
			stats.totalLikes = data.totalLikes;
		}
		stats.updatedAt = new Date().toISOString();
		writeData('statistics', stats);
		return stats;
	},
	
	getDashboard: () => {
		const stats = readData('statistics');
		const users = readData('users');
		const streams = readData('streams');
		const activeStream = streams.find(s => s.enabled);
		
		return {
			totalUsers: users.length,
			activeUsers: users.filter(u => u.status === 'active').length,
			totalVotes: stats.totalVotes || 0,
			isLive: !!activeStream
		};
	}
};

// 直播计划管理
const liveSchedule = {
	get: () => readData('liveSchedule'),
	
	update: (scheduleData) => {
		const current = readData('liveSchedule');
		const updated = {
			...current,
			...scheduleData,
			updatedAt: new Date().toISOString()
		};
		writeData('liveSchedule', updated);
		return updated;
	},
	
	clear: () => {
		const cleared = {
			scheduledStartTime: null,
			scheduledEndTime: null,
			streamId: null,
			debateId: null,
			isScheduled: false,
			updatedAt: new Date().toISOString()
		};
		writeData('liveSchedule', cleared);
		return cleared;
	}
};

// 初始化
initDefaultData();

module.exports = {
	streams,
	debate,
	users,
	statistics,
	liveSchedule
};

