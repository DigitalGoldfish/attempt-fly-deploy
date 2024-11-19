/*
  Warnings:

  - You are about to drop the column `bereichId` on the `Tag` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_BereichToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BereichToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Bereich" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BereichToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tag" ("createdAt", "id", "label", "type", "updatedAt") SELECT "createdAt", "id", "label", "type", "updatedAt" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_BereichToTag_AB_unique" ON "_BereichToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_BereichToTag_B_index" ON "_BereichToTag"("B");
