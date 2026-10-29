import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { type FriendshipStatus, FRIENDSHIP_STATUS } from '../../constants/type';

@Entity('friendships')
export class FriendshipEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  senderId: number;

  @Column({ type: 'int' })
  receiverId: number;

  @Column({ type: 'varchar', default: FRIENDSHIP_STATUS.PENDING })
  status: FriendshipStatus;
}
