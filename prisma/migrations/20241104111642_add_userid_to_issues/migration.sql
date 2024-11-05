/*
  Warnings:

  - Added the required column `userId` to the `Issues` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Issues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    CONSTRAINT "Issues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Issues" ("id", "link", "note") SELECT "id", "link", "note" FROM "Issues";
DROP TABLE "Issues";
ALTER TABLE "new_Issues" RENAME TO "Issues";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
