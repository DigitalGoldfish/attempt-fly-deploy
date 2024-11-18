/*
  Warnings:

  - You are about to drop the column `rotation` on the `Document` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "height" INTEGER,
    "width" INTEGER,
    "blob" BLOB NOT NULL,
    "previewImages" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "incomingId" TEXT,
    "formSubmissionId" TEXT,
    "mailId" TEXT,
    CONSTRAINT "Document_incomingId_fkey" FOREIGN KEY ("incomingId") REFERENCES "Incoming" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("blob", "contentType", "createdAt", "fileName", "formSubmissionId", "height", "id", "incomingId", "mailId", "previewImages", "size", "updatedAt", "width") SELECT "blob", "contentType", "createdAt", "fileName", "formSubmissionId", "height", "id", "incomingId", "mailId", "previewImages", "size", "updatedAt", "width" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_formSubmissionId_key" ON "Document"("formSubmissionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
