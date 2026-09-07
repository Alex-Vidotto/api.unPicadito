import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

@Entity('friendships')
export class FriendshipEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  senderId: number;

  @Column({ type: 'int' })
  receiverId: number;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: FriendshipStatus;
}