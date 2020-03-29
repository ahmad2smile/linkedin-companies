import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "companies" })
export class Company {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	name: string;

	@Column({ nullable: true })
	followers: number;

	@Column({ nullable: true })
	headquarter: string;

	@Column({ nullable: true })
	industry: string;

	@Column({ nullable: true })
	size: string;

	@Column({ nullable: true })
	type: string;

	@Column({ nullable: true })
	founded: string;

	@Column({ nullable: true })
	specialties: string;

	@Column({ nullable: true })
	about: string;

	@Column({ nullable: true })
	website: string;

	@Column({ nullable: true })
	phone: string;

	@Column({ nullable: true })
	link: string;

	@Column({ nullable: true })
	logo: string;

	@Column({ nullable: true, default: false })
	downloadableAds: boolean;
}
