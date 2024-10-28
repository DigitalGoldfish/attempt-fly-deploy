-- CreateTable
CREATE TABLE "_BereichToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BereichToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Bereich" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BereichToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_BereichToUser_AB_unique" ON "_BereichToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BereichToUser_B_index" ON "_BereichToUser"("B");
