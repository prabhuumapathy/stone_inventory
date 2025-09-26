import { Migration } from '@mikro-orm/migrations';

export class Migration20250910100246 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "stone_vendor" alter column "stone_vendor_id" type integer using ("stone_vendor_id"::integer);`);
    this.addSql(`create sequence if not exists "stone_vendor_stone_vendor_id_seq";`);
    this.addSql(`select setval('stone_vendor_stone_vendor_id_seq', (select max("stone_vendor_id") from "stone_vendor"));`);
    this.addSql(`alter table if exists "stone_vendor" alter column "stone_vendor_id" set default nextval('stone_vendor_stone_vendor_id_seq');`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "stone_vendor" alter column "stone_vendor_id" type text using ("stone_vendor_id"::text);`);
    this.addSql(`alter table if exists "stone_vendor" alter column "stone_vendor_id" drop default;`);
  }

}
