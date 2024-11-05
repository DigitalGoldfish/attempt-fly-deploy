/*
  Warnings:

  - You are about to drop the `MailAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_additionalDocuments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `type` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `documentId` on the `Incoming` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incomingId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mailId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MailAttachment_mailId_idx";

-- DropIndex
DROP INDEX "_additionalDocuments_B_index";

-- DropIndex
DROP INDEX "_additionalDocuments_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MailAttachment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_additionalDocuments";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "blob" BLOB NOT NULL,
    "previewImages" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "incomingId" TEXT NOT NULL,
    "formSubmissionId" TEXT NOT NULL,
    "mailId" TEXT NOT NULL,
    CONSTRAINT "Document_incomingId_fkey" FOREIGN KEY ("incomingId") REFERENCES "Incoming" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("blob", "contentType", "createdAt", "formSubmissionId", "id", "updatedAt") SELECT "blob", "contentType", "createdAt", "formSubmissionId", "id", "updatedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_formSubmissionId_key" ON "Document"("formSubmissionId");
CREATE TABLE "new_Incoming" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Unknown',
    "bereich" TEXT,
    "mitarbeiter" TEXT,
    "kundennr" TEXT,
    "neuanlage" BOOLEAN NOT NULL DEFAULT false,
    "kvnotwendig" BOOLEAN NOT NULL DEFAULT false,
    "ohneverordnung" BOOLEAN NOT NULL DEFAULT false,
    "orderNr" TEXT,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "printedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mailId" TEXT,
    "formSubmissionId" TEXT,
    CONSTRAINT "Incoming_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incoming_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Incoming" ("bereich", "comment", "createdAt", "formSubmissionId", "id", "kundennr", "kvnotwendig", "mailId", "mitarbeiter", "neuanlage", "ohneverordnung", "orderNr", "printed", "printedAt", "source", "status", "type", "updatedAt") SELECT "bereich", "comment", "createdAt", "formSubmissionId", "id", "kundennr", "kvnotwendig", "mailId", "mitarbeiter", "neuanlage", "ohneverordnung", "orderNr", "printed", "printedAt", "source", "status", "type", "updatedAt" FROM "Incoming";
DROP TABLE "Incoming";
ALTER TABLE "new_Incoming" RENAME TO "Incoming";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
