import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1744764270764 implements MigrationInterface {
  name = 'InitialSchema1744764270764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "register" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "register" DROP COLUMN "updated_at"`);
  }
}
