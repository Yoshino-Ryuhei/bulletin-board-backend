import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1744355353670 implements MigrationInterface {
  name = 'InitialSchema1744355353670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "register" ADD "otp" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "register" DROP COLUMN "otp"`);
  }
}
