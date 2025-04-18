import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1744787871219 implements MigrationInterface {
  name = 'InitialSchema1744787871219';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "icon_url" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "icon_url"`);
  }
}
