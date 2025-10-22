// src/components/Page.jsx
import { useEffect, useState } from "react";
import { generateSegments } from "../utils/segments";

export default function Page({ page, onClose }) {
    const PAGE_SIZE = 512;
    const BLOCK = 30;
    const ACTUAL_WIDTH = 16;

    const [groups, setGroups] = useState([]);
    const [dimensions, setDimensions] = useState({ WIDTH: 0, HEIGHT: 0 });
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        const { groups, WIDTH, HEIGHT } = generateSegments(page, { PAGE_SIZE, BLOCK, ACTUAL_WIDTH });
        setGroups(groups);
        setDimensions({ WIDTH, HEIGHT });
        console.log(page);
    }, [page]);

    const { WIDTH, HEIGHT } = dimensions;
    const MARGIN = 2;

    const COLORS = {
        header: { fill: "#60a5fa", stroke: "#1e40af" },
        pointer: { fill: "#fbbf24", stroke: "#b45309" },
        cell: { fill: "#34d399", stroke: "#047857" },
        free: { fill: "#d1d5db", stroke: "#6b7280" },

    };

    const handleClick = (id) => {
        setSelectedId((prev) => (prev === id ? null : id));
    };

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

            {/* Scrollable SVG */}
            <div className="flex-1 overflow-y-auto overflow-x-auto p-4 bg-gray-200">
                <svg
                    width={WIDTH}
                    height={HEIGHT}
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    className="border border-gray-600 bg-white shadow-sm"
                >
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="6"
                            markerHeight="6"
                            refX="5"
                            refY="3"
                            orient="auto"
                            fill="currentColor"
                        >
                            <path d="M0,0 L6,3 L0,6 Z" />
                        </marker>
                    </defs>
                    {groups.map((group) => {
                        const { fill, stroke } = COLORS[group.type];
                        const isSelected = selectedId === group.id;
                        const highlight = isSelected ? { fillOpacity: 0.6, strokeWidth: 2 } : {};

                        return (
                            <g
                                key={group.id}
                                onClick={() => handleClick(group.id)}
                                className="cursor-pointer transition-all duration-200"
                            >
                                <title>{`Offset: ${group.start}\nLength: ${group.length}`}</title>
                                {group.parts.map((p, i) => (
                                    <rect
                                        key={i}
                                        x={p.x + MARGIN}
                                        y={p.y + MARGIN / 2}
                                        width={p.size - 2 * MARGIN}
                                        height={BLOCK - MARGIN}
                                        fill={fill}
                                        stroke={stroke}
                                        {...highlight}
                                    />
                                ))}
                                {group.text && (
                                    <text
                                        x={group.parts[0].x + group.parts[0].size / 2}
                                        y={group.parts[0].y + BLOCK / 2}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="12"
                                        fill="black"
                                        fontFamily="monospace"
                                    >
                                        {group.text}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                    {(() => {
                        const selectedGroup = groups.find(
                            (g) => g.id === selectedId && g.type === "pointer"
                        );
                        if (!selectedGroup) return null;

                        const x1 = selectedGroup.parts[0].x + selectedGroup.parts[0].size / 2;
                        const y1 = selectedGroup.parts[0].y + BLOCK;

                        // Compute arrow target (based on group.text = offset)
                        const x2 = (selectedGroup.text % ACTUAL_WIDTH) * BLOCK;
                        const y2 = Math.floor(selectedGroup.text / ACTUAL_WIDTH) * BLOCK + BLOCK / 2;

                        return (
                            <line
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="black"
                                strokeWidth="3"
                                strokeDasharray="4"
                                markerEnd="url(#arrowhead)"
                            />
                        );
                    })()}
                </svg>
            </div>
        </div>
    );
}
