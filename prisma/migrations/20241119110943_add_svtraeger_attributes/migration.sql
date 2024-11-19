-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SVTraeger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "fax" TEXT NOT NULL DEFAULT '',
    "postal" TEXT NOT NULL DEFAULT '',
    "preferred" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_SVTraeger" ("email", "fax", "id", "name") SELECT "email", "fax", "id", "name" FROM "SVTraeger";
DROP TABLE "SVTraeger";
ALTER TABLE "new_SVTraeger" RENAME TO "SVTraeger";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
