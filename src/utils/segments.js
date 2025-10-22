
export function generateSegments(page, { PAGE_SIZE, BLOCK, ACTUAL_WIDTH }) {
    const WIDTH = ACTUAL_WIDTH * BLOCK;
    const HEIGHT = (PAGE_SIZE / ACTUAL_WIDTH) * BLOCK;
    const groups = [];

    const addWrappedParts = (startX, startY, size, type, id, text, logicalStart, logicalLength) => {
        const parts = [];
        let curX = startX;
        let curY = startY;
        let remSz = size;

        while (remSz > 0) {
            const avail = WIDTH - curX;
            const segSize = Math.min(avail, remSz);
            parts.push({ x: curX, y: curY, size: segSize });
            remSz -= segSize;
            curX = remSz > 0 ? 0 : curX + segSize;
            if (remSz > 0) curY += BLOCK;
        }

        groups.push({
            id,
            type,
            text,
            parts,
            start: logicalStart,
            length: logicalLength,
        });
    };

    // --- Page Header ---
    addWrappedParts(0, 0, 12 * BLOCK, "header", "header", "Page Header", 0, 12);

    let curX = 12 * BLOCK;
    let curY = 0;

    // --- Cell Pointers ---
    page.cellOffsets?.forEach((offset, i) => {
        const sz = 2 * BLOCK;
        addWrappedParts(curX, curY, sz, "pointer", `ptr-${i}`, `${offset}`, 12 + 2 * i, 2);
        curX += sz;
        if (curX >= WIDTH) {
            curX = 0;
            curY += BLOCK;
        }
    });

    // --- Cells ---
    page.cells?.forEach((cell, i) => {
        const sz = cell.size * BLOCK;
        const startX = (cell.start % ACTUAL_WIDTH) * BLOCK;
        const startY = Math.floor(cell.start / ACTUAL_WIDTH) * BLOCK;
        addWrappedParts(startX, startY, sz, "cell", `cell-${i}`, "Cell", cell.start, cell.size);
    });

    // --- Free Blocks ---
    page.freeBlocks?.forEach((blk, i) => {
        const sz = blk.size * BLOCK;
        const startX = (blk.start % ACTUAL_WIDTH) * BLOCK;
        const startY = Math.floor(blk.start / ACTUAL_WIDTH) * BLOCK;
        addWrappedParts(startX, startY, sz, "free", `free-${i}`, "Free", blk.start, blk.size);
    });

    return { groups, WIDTH, HEIGHT };
}
