import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Company {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	followers: number;

	@Column()
	headquarter: string;

	@Column()
	industry: string;

	@Column()
	size: string;

	@Column()
	type: string;

	@Column()
	founded: string;

	@Column()
	specialties: string;

	@Column()
	about: string;

	@Column()
	website: string;

	@Column()
	link: string;

	@Column()
	logo: string;
}
