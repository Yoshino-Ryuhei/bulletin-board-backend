import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1741924763278 implements MigrationInterface {
  name = 'InitialSchema1741924763278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "umail" TO "email"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "email" TO "umail"`,
    );
  }
}
