import { Migration } from '@mikro-orm/migrations';

export class Migration20250910094952 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "stone_vendor" ("id" text not null, "name" text not null, "vendor_code" text not null, "vendor_number" integer not null, "city" text not null, "state" text not null, "country" text not null, "carat" text not null, "remove_diamond" text not null, "color" text not null, "clarity" text not null, "certificate" text not null, "sort_order" integer not null, "image_status" boolean not null, "video_status" boolean not null, "status" boolean not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "stone_vendor_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stone_vendor_deleted_at" ON "stone_vendor" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "stone_vendor" cascade;`);
  }

}
