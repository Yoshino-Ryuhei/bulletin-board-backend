import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1744788200058 implements MigrationInterface {
  name = 'InitialSchema1744788200058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "icon_url" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "icon_url" SET NOT NULL`,
    );
  }
}
