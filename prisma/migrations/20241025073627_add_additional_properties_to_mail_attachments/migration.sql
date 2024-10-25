/*
  Warnings:

  - Added the required column `fileName` to the `MailAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `MailAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MailAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mailId" TEXT NOT NULL,
    CONSTRAINT "MailAttachment_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MailAttachment" ("blob", "contentType", "createdAt", "id", "mailId", "updatedAt") SELECT "blob", "contentType", "createdAt", "id", "mailId", "updatedAt" FROM "MailAttachment";
DROP TABLE "MailAttachment";
ALTER TABLE "new_MailAttachment" RENAME TO "MailAttachment";
CREATE INDEX "MailAttachment_mailId_idx" ON "MailAttachment"("mailId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
