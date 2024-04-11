import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  pageContent?: string;

  @Column({ type: 'jsonb' })
  metadata: string;

  @Column()
  embedding: string;
}
