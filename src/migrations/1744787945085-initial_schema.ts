import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1744787945085 implements MigrationInterface {
  name = 'InitialSchema1744787945085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "icon_url"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "icon_url" character varying NOT NULL`,
    );
  }
}
