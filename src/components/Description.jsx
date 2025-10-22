// components/Description.jsx
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Description({ selectedObj }) {
    if (selectedObj === null) {
        return (
            <div className="p-6 text-gray-800">
                <h1 className="text-2xl font-bold mb-3">
                    RocketSQL File Format Viewer
                </h1>
                <p className="text-gray-700 leading-relaxed text-sm mb-4">
                    This website visualizes the internals of RocketSQL's file format. <a
                        href="https://github.com/m0hossam/rocketsql/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline"
                    >RocketSQL</a> is an embedded SQL DBMS I built from scratch to learn database internals.
                    It borrows a lot from SQLite's file format and storage architecture.
                    To check the SQL statements and meta commands supported, please check out the <a
                        href="https://github.com/m0hossam/rocketsql/blob/main/README.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline"
                    >README</a>.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm mb-4">
                    Also, this project was inspired by <a
                        href="https://github.com/invisal/sqlite-internal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline"
                    >SQLite File Format Viewer</a>. Huge thanks to them.
                </p>

                <div className="flex items-center gap-4 text-black-700 leading-relaxed text-xl mb-4">
                    Contact me:
                    <a
                        href="https://github.com/m0hossam"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-blue transition-colors duration-200 underline"
                    >
                        <FaGithub />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/mohamed-hossam-m07/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0077b5] hover:text-blue-800 transition-colors duration-200"
                    >
                        <FaLinkedin />
                    </a>
                </div>
            </div>
        );
    }

    // When something *is* selected, show its details
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
                {selectedObj.name}
            </h2>

            <table className="min-w-full border border-gray-300 rounded-md text-sm">
                <tbody>
                    {Object.entries(selectedObj).slice(1).map(([key, value]) => (
                        <tr key={key} className="even:bg-gray-50">
                            <td className="border border-gray-300 font-medium text-gray-700 px-3 py-2 w-1/3">
                                {toTitleCase(key)}
                            </td>
                            <td className="border border-gray-300 text-gray-900 px-3 py-2">
                                {typeof value === "object"
                                    ? JSON.stringify(value, null, 2)
                                    : String(value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function toTitleCase(str) {
    return str
        .replace(/([A-Z])/g, " $1")   // insert space before capitals
        .replace(/^./, (s) => s.toUpperCase()) // capitalize first letter
        .trim();
}

