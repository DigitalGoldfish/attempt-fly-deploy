/*
  Warnings:

  - Added the required column `formSubmissionId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "formSubmissionId" TEXT NOT NULL,
    CONSTRAINT "Document_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("blob", "contentType", "createdAt", "id", "type", "updatedAt") SELECT "blob", "contentType", "createdAt", "id", "type", "updatedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_formSubmissionId_key" ON "Document"("formSubmissionId");
CREATE TABLE "new_Incoming" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "documentId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Unknown',
    "bereich" TEXT,
    "mitarbeiter" TEXT,
    "kundennr" TEXT,
    "neuanlage" BOOLEAN NOT NULL DEFAULT false,
    "kvnotwendig" BOOLEAN NOT NULL DEFAULT false,
    "orderNr" TEXT,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "printedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mailId" TEXT,
    CONSTRAINT "Incoming_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incoming_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Incoming" ("bereich", "comment", "createdAt", "documentId", "id", "kundennr", "kvnotwendig", "mailId", "mitarbeiter", "neuanlage", "orderNr", "printed", "printedAt", "source", "status", "type", "updatedAt") SELECT "bereich", "comment", "createdAt", "documentId", "id", "kundennr", "kvnotwendig", "mailId", "mitarbeiter", "neuanlage", "orderNr", "printed", "printedAt", "source", "status", "type", "updatedAt" FROM "Incoming";
DROP TABLE "Incoming";
ALTER TABLE "new_Incoming" RENAME TO "Incoming";
CREATE UNIQUE INDEX "Incoming_documentId_key" ON "Incoming"("documentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
