import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import { ObjectId } from 'mongodb';
import { uniq } from 'lodash';
import { WebSocketServer, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AgendaService, QueueEventService } from 'src/kernel';
import { PERFORMER_SOCKET_CONNECTED_CHANNEL, USER_SOCKET_CONNECTED_CHANNEL, USER_SOCKET_EVENT } from '../constants';

export const CONNECTED_USER_REDIS_KEY = 'connected_users';
export const CONNECTED_ROOM_REDIS_KEY = 'user:';
const SCHEDULE_OFFLINE_SOCKETS = 'SCHEDULE_OFFLINE_SOCKETS';

@Injectable()
@WebSocketGateway()
export class SocketUserService {
  @WebSocketServer() server: Server;

  constructor(
    private readonly redisService: RedisService,
    private readonly agenda: AgendaService,
    private readonly queueEventService: QueueEventService
  ) {
    this.defineJobs();
  }

  private async defineJobs() {
    const collection = (this.agenda as any)._collection;
    await collection.deleteMany({
      name: {
        $in: [SCHEDULE_OFFLINE_SOCKETS]
      }
    });

    this.agenda.define(
      SCHEDULE_OFFLINE_SOCKETS,
      {},
      this.scheduleOfflineSockets.bind(this)
    );
    this.agenda.schedule('1 minute from now', SCHEDULE_OFFLINE_SOCKETS, {});
  }

  private async scheduleOfflineSockets(job: any, done: any): Promise<void> {
    try {
      // get all onine users in the redis and check if socket is exist
      const redisClient = this.redisService.getClient();
      const onlineUserIds = await redisClient.smembers(
        CONNECTED_USER_REDIS_KEY
      );
      await onlineUserIds.reduce(async (previousPromise, userId) => {
        await previousPromise;

        const socketIds = await redisClient.smembers(userId);
        // handle for single node only, for multi nodes, please check here
        // https://stackoverflow.com/questions/58977848/socket-io-with-socket-io-redis-get-all-socket-object-in-a-room
        const connectedSockets = Object.keys(this.server.eio.clients);
        // remove keys doesn't have in connected list and update status
        let hasOnline = false;
        await socketIds.reduce(async (lP, socketId) => {
          await lP;
          if (connectedSockets.includes(socketId)) {
            hasOnline = true;
          } else {
            await redisClient.srem(userId, socketId);
          }

          return Promise.resolve();
        }, Promise.resolve());

        if (!hasOnline) {
          await redisClient.srem(CONNECTED_USER_REDIS_KEY, userId);

          /**
           * emit offline, in this case we will send 2 events for both user and performer temperatyly
           */
          await this.queueEventService.publish({
            channel: USER_SOCKET_CONNECTED_CHANNEL,
            eventName: USER_SOCKET_EVENT.DISCONNECTED,
            data: {
              source: 'user',
              sourceId: userId
            }
          });
          await this.queueEventService.publish({
            channel: PERFORMER_SOCKET_CONNECTED_CHANNEL,
            eventName: USER_SOCKET_EVENT.DISCONNECTED,
            data: {
              source: 'performer',
              sourceId: userId
            }
          });
        }

        return Promise.resolve();
      }, Promise.resolve());
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Schedule offline socket error', e);
    } finally {
      job.remove();
      this.agenda.schedule('1 minute from now', SCHEDULE_OFFLINE_SOCKETS, {});
      typeof done === 'function' && done();
    }
  }

  async addConnection(sourceId: string | ObjectId, socketId: string) {
    // TODO - pass config
    const redisClient = this.redisService.getClient();

    // add to online list
    await redisClient.sadd(CONNECTED_USER_REDIS_KEY, sourceId.toString());
    // add to set: source_id & sockets, to check connection lengths in future in needd?
    await redisClient.sadd(sourceId.toString(), socketId);

    // join this member into member room for feature use?
    // this.server.join(sourceId.toString());
  }

  async userGetAllConnectedRooms(id: string) {
    const redisClient = this.redisService.getClient();
    const results = await redisClient.smembers(CONNECTED_ROOM_REDIS_KEY + id);
    return results;
  }

  async removeConnection(sourceId: string | ObjectId, socketId: string) {
    const redisClient = this.redisService.getClient();
    await redisClient.srem(sourceId.toString(), socketId);

    // if hash is empty, remove conencted user
    const len = await redisClient.scard(sourceId.toString());
    if (!len) {
      await redisClient.srem(CONNECTED_USER_REDIS_KEY, sourceId.toString());
    }
    return len;
  }

  async addConnectionToRoom(roomId: string, id: string, value) {
    const redisClient = this.redisService.getClient();
    // await redisClient.hset('room-' + roomId, id , value);
    await redisClient.hset(`room-${roomId}`, id, `${value},${new Date().getTime()}`);
    await redisClient.sadd(CONNECTED_ROOM_REDIS_KEY + id, roomId);
  }

  async removeConnectionFromRoom(roomId: string, userId: string) {
    const redisClient = this.redisService.getClient();
    await redisClient.hdel(`room-${roomId}`, userId);
    await redisClient.srem(CONNECTED_ROOM_REDIS_KEY + userId, roomId);
  }

  async getConnectionValue(roomId: string, id: string) {
    const redisClient = this.redisService.getClient();
    const results = await redisClient.hmget(`room-${roomId}`, ...[id]);
    return results[0];
  }

  async getRoomUserConnections(roomId: string) {
    const redisClient = this.redisService.getClient();
    const results = await redisClient.hgetall(`room-${roomId}`);
    return results;
  }

  async countRoomUserConnections(roomId: string) {
    const redisClient = this.redisService.getClient();
    const total = await redisClient.hlen(`room-${roomId}`);
    return total;
  }

  async emitToUsers(userIds: string | string[] | ObjectId | ObjectId[], eventName: string, data: any) {
    const stringIds = uniq((Array.isArray(userIds) ? userIds : [userIds])).map((i) => i.toString());
    const redisClient = this.redisService.getClient();
    Promise.all(stringIds.map(async (userId) => {
      // TODO - check
      const socketIds = await redisClient.smembers(userId);
      (socketIds || []).forEach((socketId) => this.server.to(socketId).emit(eventName, data));
    }));
  }

  async emitToRoom(roomName: string, eventName: string, data: any) {
    this.server.to(roomName).emit(eventName, data);
  }
}
