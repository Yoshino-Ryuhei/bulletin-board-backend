import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1744764359337 implements MigrationInterface {
  name = 'InitialSchema1744764359337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "register" ADD "expire_at" TIMESTAMP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "register" DROP COLUMN "expire_at"`);
  }
}
