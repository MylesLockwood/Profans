/* eslint-disable no-console */
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from 'src/modules/auth/services';
import { StreamService } from 'src/modules/stream/services';
import { PUBLIC_CHAT } from 'src/modules/stream/constant';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { UserService } from 'src/modules/user/services';
import { UserDto } from 'src/modules/user/dtos';
import * as moment from 'moment';
import { PerformerService } from 'src/modules/performer/services';
import { ConversationService } from 'src/modules/message/services';
import { StreamModel } from '../models';
import { STREAM_MODEL_PROVIDER } from '../providers/stream.provider';

@WebSocketGateway()
export class PublicStreamWsGateway {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => ConversationService))
    private readonly conversationService: ConversationService,
    @Inject(forwardRef(() => SocketUserService))
    private readonly socketService: SocketUserService,
    @Inject(STREAM_MODEL_PROVIDER)
    private readonly streamModel: Model<StreamModel>,
    private readonly streamService: StreamService
  ) {}

  @SubscribeMessage('public-stream/live')
  async goLive(client: Socket, payload: { conversationId: string }) {
    try {
      const { conversationId } = payload;
      if (!conversationId) {
        return;
      }

      const conversation = await this.conversationService.findById(conversationId);
      if (!conversation) return;

      const { token } = client.handshake.query;
      if (!token) return;

      const user = await this.authService.getSourceFromJWT(token);
      if (!user) return;

      const roomName = this.streamService.getRoomName(conversation._id, conversation.type);
      this.socketService.emitToRoom(roomName, 'join-broadcaster', {
        performerId: user._id,
        conversationId
      });
      await Promise.all([this.performerService.goLive(user._id), this.streamModel.updateOne({ _id: conversation.streamId }, { $set: { isStreaming: true } })]);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('public-stream/join')
  async handleJoinPublicRoom(
    client: Socket,
    payload: { conversationId: string }
  ): Promise<void> {
    try {
      const { token } = client.handshake.query;
      const { conversationId } = payload;
      if (!conversationId) {
        return;
      }
      const conversation = conversationId && await this.conversationService.findById(conversationId);
      if (!conversation) {
        return;
      }

      const { performerId, type } = conversation;
      const decodded = token && await this.authService.verifyJWT(token);
      let user: any;
      if (decodded && decodded.source === 'user') {
        user = await this.userService.findById(decodded.sourceId);
      }
      if (decodded && decodded.source === 'performer') {
        user = await this.performerService.findById(decodded.sourceId);
      }
      const roomName = this.streamService.getRoomName(conversationId, type);
      client.join(roomName);
      let role = 'guest';
      if (user) {
        role = user.roles && user.roles.includes('user') ? 'member' : 'model';
        await this.socketService.emitToRoom(
          roomName,
          `message_created_conversation_${conversation._id}`,
          {
            text: `${user.username} has joined this conversation`,
            _id: conversation._id,
            conversationId,
            isSystem: true
          }
        );
      }

      if (role === 'model') {
        await this.performerService.setStreamingStatus(user._id, PUBLIC_CHAT);
      }

      await this.socketService.addConnectionToRoom(
        roomName,
        user ? user._id : client.id,
        role
      );
      const connections = await this.socketService.getRoomUserConnections(
        roomName
      );
      const memberIds: string[] = [];
      Object.keys(connections).forEach((id) => {
        const value = connections[id].split(',');
        if (value[0] === 'member') {
          memberIds.push(id);
        }
      });

      if (memberIds.length && role === 'model') {
        await this.socketService.emitToUsers(memberIds, 'model-joined', { conversationId });
      }

      const members = (memberIds.length && await this.userService.findByIds(memberIds)) || [];
      const data = {
        conversationId,
        total: members.length,
        members: members.map((m) => new UserDto(m).toResponse())
      };
      this.socketService.emitToRoom(roomName, 'public-room-changed', data);

      const stream = await this.streamService.findByPerformerId(performerId, {
        type: PUBLIC_CHAT
      });
      if (!stream) return;

      if (stream.isStreaming) {
        this.socketService.emitToRoom(roomName, 'join-broadcaster', {
          performerId,
          conversationId
        });
      }
    } catch (e) {
      // TODO - log me
      console.log(e);
    }
  }

  @SubscribeMessage('public-stream/leave')
  async handleLeavePublicRoom(
    client: Socket,
    payload: { conversationId: string }
  ): Promise<void> {
    try {
      const { token } = client.handshake.query;
      const { conversationId } = payload;
      if (!conversationId) {
        return;
      }
      const conversation = payload.conversationId && await this.conversationService.findById(conversationId);
      if (!conversation) {
        return;
      }

      const { performerId, type } = conversation;
      const [user] = await Promise.all([
        token && this.authService.getSourceFromJWT(token)
      ]);
      const roomName = this.streamService.getRoomName(conversationId, type);
      client.leave(roomName);

      const [stream] = await Promise.all([
        this.streamService.findByPerformerId(performerId, {
          type: PUBLIC_CHAT
        })
      ]);

      if (user) {
        await this.socketService.emitToRoom(
          roomName,
          `message_created_conversation_${payload.conversationId}`,
          {
            text: `${user.username} has left this conversation`,
            _id: payload.conversationId,
            conversationId,
            isSystem: true
          }
        );
        const results = await this.socketService.getConnectionValue(
          roomName,
          user._id
        );
        if (results) {
          const values = results.split(',');
          const timeJoined = values[1] ? parseInt(values[1], 10) : null;
          const role = values[0];
          if (timeJoined) {
            const streamTime = moment()
              .toDate()
              .getTime() - timeJoined;
            if (role === 'model') {
              await Promise.all([
                this.performerService.updateLastStreamingTime(
                  user._id,
                  streamTime
                ),
                stream && stream.isStreaming && this.streamModel.updateOne({ _id: stream._id }, { $set: { lastStreamingTime: new Date(), isStreaming: false } }),
                this.socketService.emitToRoom(roomName, 'model-left', {
                  performerId,
                  conversationId
                })
              ]);
            } else if (role === 'member') {
              await this.userService.updateStats(user._id, {
                'stats.totalViewTime': streamTime
              });
            }
          }
        }
      }

      await this.socketService.removeConnectionFromRoom(
        roomName,
        user ? user._id : client.id
      );

      const connections = await this.socketService.getRoomUserConnections(
        roomName
      );
      const memberIds: string[] = [];
      Object.keys(connections).forEach((id) => {
        const value = connections[id].split(',');
        if (value[0] === 'member') {
          memberIds.push(id);
        }
      });
      const members = await this.userService.findByIds(memberIds);
      const data = {
        conversationId,
        total: members.length,
        members: members.map((m) => new UserDto(m).toResponse())
      };
      await this.socketService.emitToRoom(roomName, 'public-room-changed', data);
    } catch (e) {
      // TODO - log me
    }
  }
}
