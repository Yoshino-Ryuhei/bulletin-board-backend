import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1745558836538 implements MigrationInterface {
  name = 'InitialSchema1745558836538';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "register" ADD "token" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "register" DROP COLUMN "token"`);
  }
}
