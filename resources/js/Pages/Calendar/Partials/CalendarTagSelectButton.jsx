import { useState, useEffect } from "react";
import axios from "axios";
import CalendarModal from "./CalendarModal";

export default function CalendarTagSelectButton({ onTagSelected }) {
    const [tags, setTags] = useState([]);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#000000");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const defaultTags = [
        { id: 1, name: "お出かけ", color: "#FF0000" },
        { id: 2, name: "仕事", color: "#00FF00" },
        { id: 3, name: "勉強", color: "#0000FF" },
        { id: 4, name: "家事", color: "#FFFF00" },
        { id: 5, name: "健康", color: "#FF00FF" },
        { id: 6, name: "自由時間", color: "#00FFFF" },
    ];

    useEffect(() => {
        // タグの取得
        const fetchTags = async () => {
            try {
                const response = await axios.get("/api/v2/calendar/tags");
                setTags([...defaultTags, ...response.data.tags]);
            } catch (error) {
                console.error("Error fetching tags:", error);
                // デフォルトタグのみを設定
                setTags(defaultTags);
            }
        };
        fetchTags();
    }, []);

    const handleTagCreate = async () => {
        if (tags.length >= 12) {
            alert("タグは最大12個まで作成できます。");
            return;
        }
        try {
            const response = await axios.post("/api/v2/calendar/tags", {
                name: newTagName,
                color: newTagColor,
            });
            const newTag = response.data.tag;
            setTags([...tags, newTag]);
            setNewTagName("");
            setNewTagColor("#000000");
        } catch (error) {
            console.error("Error creating tag:", error);
        }
    };

    const handleTagSelect = (tag) => {
        onTagSelected(tag.id);
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FFA742] text-white p-2 rounded shadow-md"
            >
                タグを選択
            </button>
            <CalendarModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <div className="flex flex-col space-y-4">
                    <h2 className="text-lg font-bold">タグを選択</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {tags.slice(0, 12).map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagSelect(tag)}
                                className="p-2 border border-gray-300 rounded"
                                style={{ backgroundColor: tag.color }}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                    <h2 className="text-lg font-bold">新しいタグを作成</h2>
                    <div className="flex flex-col space-y-2">
                        <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="タグ名"
                            className="p-2 border border-gray-300 rounded"
                        />
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={newTagColor}
                                onChange={(e) => setNewTagColor(e.target.value)}
                                className="hidden"
                                id="colorPicker"
                            />
                            <label
                                htmlFor="colorPicker"
                                className="w-8 h-8 cursor-pointer"
                                style={{
                                    backgroundImage:
                                        "url('/img/palette-icon.png')",
                                    backgroundSize: "cover",
                                }}
                            ></label>
                            <div
                                className="w-8 h-8 border border-gray-300 rounded"
                                style={{ backgroundColor: newTagColor }}
                            ></div>
                        </div>
                        <button
                            type="button"
                            onClick={handleTagCreate}
                            className="bg-customPink text-white p-2 rounded shadow-md"
                        >
                            作成
                        </button>
                    </div>
                </div>
            </CalendarModal>
        </>
    );
}
