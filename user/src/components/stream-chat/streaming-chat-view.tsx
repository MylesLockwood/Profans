import * as React from 'react';
import { IUser } from 'src/interfaces';

interface Props<T> {
  members: T[];
}

const StreamingChatUsers = ({
  members = []
}: Props<IUser>) => (
  <div className="conversation-users">
    <div className="users">
      {members.length > 0
          && members.map((member) => (
            <div className="user" key={member._id}>
              <img alt="avt" src={member?.avatar || '/static/no-avatar.png'} />
              <span className="username">{member.name}</span>
            </div>
          ))}
    </div>
  </div>
);

export default StreamingChatUsers;
