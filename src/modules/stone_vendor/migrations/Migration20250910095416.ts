import { Migration } from '@mikro-orm/migrations';

export class Migration20250910095416 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "stone_vendor" drop constraint if exists "stone_vendor_pkey";`);

    this.addSql(`alter table if exists "stone_vendor" rename column "id" to "stone_vendor_id";`);
    this.addSql(`alter table if exists "stone_vendor" add constraint "stone_vendor_pkey" primary key ("stone_vendor_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "stone_vendor" drop constraint if exists "stone_vendor_pkey";`);

    this.addSql(`alter table if exists "stone_vendor" rename column "stone_vendor_id" to "id";`);
    this.addSql(`alter table if exists "stone_vendor" add constraint "stone_vendor_pkey" primary key ("id");`);
  }

}
