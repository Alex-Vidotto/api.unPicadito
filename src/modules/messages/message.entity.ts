import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { User } from '../user/user.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'text', nullable: false })
    content!: string;

    @Column({ type: 'int', nullable: false })
    senderId!: number;

    @Column({ type: 'int', nullable: false })
    receiverId!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne('User', (user: User) => user.messagesSent, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'senderId' })
    sender!: User;

    @ManyToOne('User', (user: User) => user.messagesReceived, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'receiverId' })
    receiver!: User;
}
