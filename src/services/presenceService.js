import * as signalR from '@microsoft/signalr';

class PresenceService {
    constructor() {
        this.connection = null;
        this.onlineUsers = new Set();
        this.listeners = [];
    }

    async connect(userId, token) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            return;
        }

        try {
            // Tạo connection tới SignalR Hub
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl('http://localhost:5012/chatHub', {
                    accessTokenFactory: () => token,
                    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
                })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Lắng nghe sự kiện user online
            this.connection.on('UserOnline', (userId) => {
                console.log('User online:', userId);
                this.onlineUsers.add(userId.toString());
                this.notifyListeners();
            });

            // Lắng nghe sự kiện user offline
            this.connection.on('UserOffline', (userId) => {
                console.log('User offline:', userId);
                this.onlineUsers.delete(userId.toString());
                this.notifyListeners();
            });

            // Lắng nghe danh sách user online ban đầu
            this.connection.on('OnlineUsersList', (userIds) => {
                console.log('Online users list:', userIds);
                this.onlineUsers = new Set(userIds.map(id => id.toString()));
                this.notifyListeners();
            });

            // Lắng nghe tin nhắn mới
            this.connection.on('ReceiveMessage', (message) => {
                console.log('New message received:', message);
                this.notifyListeners({ type: 'newMessage', data: message });
            });

            // Kết nối
            await this.connection.start();
            console.log('SignalR Connected successfully');

            // Gửi thông báo user online
            await this.connection.invoke('UserConnected', userId);

        } catch (error) {
            console.error('SignalR Connection Error:', error);
            throw error;
        }
    }

    async disconnect(userId) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('UserDisconnected', userId);
                await this.connection.stop();
                console.log('SignalR Disconnected');
            } catch (error) {
                console.error('SignalR Disconnect Error:', error);
            }
        }
        this.onlineUsers.clear();
        this.notifyListeners();
    }

    isUserOnline(userId) {
        return this.onlineUsers.has(userId?.toString());
    }

    getOnlineUsers() {
        return Array.from(this.onlineUsers);
    }

    // Subscribe để lắng nghe thay đổi trạng thái
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners(data) {
        this.listeners.forEach(callback => callback(data || { type: 'presenceUpdate' }));
    }

    async sendMessage(chatRoomId, message) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('SendMessage', chatRoomId, message);
            } catch (error) {
                console.error('Send message error:', error);
                throw error;
            }
        }
    }

    async joinChatRoom(chatRoomId) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('JoinChatRoom', chatRoomId);
            } catch (error) {
                console.error('Join chat room error:', error);
            }
        }
    }

    async leaveChatRoom(chatRoomId) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('LeaveChatRoom', chatRoomId);
            } catch (error) {
                console.error('Leave chat room error:', error);
            }
        }
    }
}

// Singleton instance
const presenceService = new PresenceService();
export default presenceService;
