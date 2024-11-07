/*
  Warnings:

  - You are about to drop the column `kvnotwendig` on the `Incoming` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Incoming" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Unknown',
    "bereich" TEXT,
    "mitarbeiter" TEXT,
    "kundennr" TEXT,
    "neuanlage" BOOLEAN NOT NULL DEFAULT false,
    "ohneverordnung" BOOLEAN NOT NULL DEFAULT false,
    "kvuploaded" BOOLEAN NOT NULL DEFAULT false,
    "kvsent" BOOLEAN NOT NULL DEFAULT false,
    "inquiry" BOOLEAN NOT NULL DEFAULT false,
    "produktanlage" BOOLEAN NOT NULL DEFAULT false,
    "wiedervorlage" DATETIME,
    "kvbestaetiungsId" TEXT,
    "verordnungsId" TEXT,
    "orderNr" TEXT,
    "svTraegerId" TEXT,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "printedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mailId" TEXT,
    "formSubmissionId" TEXT,
    CONSTRAINT "Incoming_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incoming_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incoming_kvbestaetiungsId_fkey" FOREIGN KEY ("kvbestaetiungsId") REFERENCES "Incoming" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incoming_kvbestaetiungsId_fkey" FOREIGN KEY ("kvbestaetiungsId") REFERENCES "Incoming" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incoming_svTraegerId_fkey" FOREIGN KEY ("svTraegerId") REFERENCES "SVTraeger" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Incoming" ("bereich", "comment", "createdAt", "formSubmissionId", "id", "kundennr", "mailId", "mitarbeiter", "neuanlage", "ohneverordnung", "orderNr", "printed", "printedAt", "source", "status", "svTraegerId", "type", "updatedAt") SELECT "bereich", "comment", "createdAt", "formSubmissionId", "id", "kundennr", "mailId", "mitarbeiter", "neuanlage", "ohneverordnung", "orderNr", "printed", "printedAt", "source", "status", "svTraegerId", "type", "updatedAt" FROM "Incoming";
DROP TABLE "Incoming";
ALTER TABLE "new_Incoming" RENAME TO "Incoming";
CREATE UNIQUE INDEX "Incoming_kvbestaetiungsId_key" ON "Incoming"("kvbestaetiungsId");
CREATE UNIQUE INDEX "Incoming_verordnungsId_key" ON "Incoming"("verordnungsId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
