import { useEffect, useState } from "react";

export default function Page({ page, onClose }) {
    const PAGE_SIZE = 512
    const BLOCK = 30
    const ACTUAL_WIDTH = 16
    const WIDTH = ACTUAL_WIDTH * BLOCK
    const HEIGHT = PAGE_SIZE / ACTUAL_WIDTH * BLOCK

    const [segments, setSegments] = useState([])

    useEffect(() => {
        const sgs = []
        sgs.push(newSegment(0, 0, 12 * BLOCK, "Page Header"))
        let curX = 12 * BLOCK
        let curY = 0
        page.cellOffsets?.forEach((offset) => {
            const sz = 2 * BLOCK
            if (curX + sz <= WIDTH) {
                sgs.push(newSegment(curX, curY, sz, `${offset}`))
                curX += sz
            } else {
                let firstSz = WIDTH - curX
                sgs.push(newSegment(curX, curY, firstSz, `${offset}`))
                curX = 0
                curY += BLOCK
                let remSz = sz - firstSz
                let nSegs = Math.ceil(remSz / WIDTH)
                while (nSegs > 1) {
                    sgs.push(newSegment(curX, curY, WIDTH))
                    curY += BLOCK
                    nSegs -= 1
                    remSz -= WIDTH
                }
                sgs.push(newSegment(curX, curY, remSz))
                curX += remSz
            }
            if (curX === WIDTH) {
                curX = 0
                curY += BLOCK
            }
        })
        page.cells?.forEach((cell) => {
            const sz = cell.size * BLOCK
            curX = (cell.start % ACTUAL_WIDTH) * BLOCK
            curY = Math.floor(cell.start / ACTUAL_WIDTH) * BLOCK
            if (curX + sz <= WIDTH) {
                sgs.push(newSegment(curX, curY, sz, "Cell"))
            } else {
                let firstSz = WIDTH - curX
                sgs.push(newSegment(curX, curY, firstSz, "Cell"))
                curX = 0
                curY += BLOCK
                let remSz = sz - firstSz
                let nSegs = Math.ceil(remSz / WIDTH)
                while (nSegs > 1) {
                    sgs.push(newSegment(curX, curY, WIDTH))
                    curY += BLOCK
                    nSegs -= 1
                    remSz -= WIDTH
                }
                sgs.push(newSegment(curX, curY, remSz))
            }
        })
        setSegments(sgs)
    }, [page])

    function newSegment(x, y, size, text) {
        return {
            x,
            y,
            size,
            text
        }
    }

    return (
        <div className="flex flex-col w-full h-full bg-gray-100 border border-gray-400 rounded-md overflow-hidden">
            {/* Title bar */}
            <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                    Page {page.id} | {page.type} | {page.table}
                </h3>
                <button
                    className="text-sm text-black-600 hover:underline cursor-pointer"
                    onClick={onClose}
                >
                    ← Back to Pages
                </button>
            </div>

            {/* Scrollable vertical SVG area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gray-200">
                <svg
                    width={WIDTH}
                    height={HEIGHT}
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    className="border border-gray-600 bg-white shadow-sm"
                >
                    {segments.map((seg, idx) => {
                        let fill = "";
                        let stroke = "";

                        if (idx === 0) { // Page Header
                            fill = "#5e9ae7ff";
                            stroke = "#1e3a8a";
                        } else if (idx > 0 && idx <= page.numCells) { // Cell Pointers
                            fill = "#f39654";
                            stroke = "#bc502c";
                        } else { // Cells
                            fill = "#37c64fff";
                            stroke = "#3f7501ff";
                        }

                        return (
                            <g key={idx}>
                                <rect
                                    x={seg.x}
                                    y={seg.y}
                                    width={seg.size}
                                    height={BLOCK}
                                    fill={fill}
                                    stroke={stroke}
                                />
                                {
                                    seg.text && (
                                        <text
                                            x={seg.x + seg.size / 2}
                                            y={seg.y + BLOCK / 2}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fontSize="12"
                                            fill="black"
                                            fontFamily="monospace"
                                        >
                                            {seg.text}
                                        </text>)
                                }
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}
