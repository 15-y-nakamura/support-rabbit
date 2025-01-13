import { useState, useEffect } from "react";
import axios from "axios";
import CalendarModal from "./CalendarModal";

export default function CalendarTagSelectButton({ onTagSelected }) {
    const [tags, setTags] = useState([]);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#000000");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);

    const defaultTags = [
        { id: "default-1", name: "お出かけ", color: "#FF0000" },
        { id: "default-2", name: "仕事", color: "#00FF00" },
        { id: "default-3", name: "勉強", color: "#0000FF" },
        { id: "default-4", name: "家事", color: "#FFFF00" },
        { id: "default-5", name: "健康", color: "#FF00FF" },
        { id: "default-6", name: "自由時間", color: "#00FFFF" },
    ];

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoadingTags(true);
        try {
            const response = await axios.get("/api/v2/calendar/tags");
            setTags([...defaultTags, ...response.data.tags]);
        } catch (error) {
            console.error("Error fetching tags:", error);
            setTags(defaultTags);
        } finally {
            setLoadingTags(false);
        }
    };

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
                className="p-2 rounded shadow-md"
            >
                <img
                    src="/img/tag-create-icon.png"
                    alt="タグを作成"
                    className="w-6 h-6"
                />
            </button>
            <CalendarModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <div className="flex flex-col space-y-4">
                    <h2 className="text-lg font-bold">タグ一覧</h2>
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
                    <hr className="w-full border-t border-gray-300 my-4" />
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
                            className="bg-customPink text-white p-2 rounded shadow-md w-full"
                        >
                            作成
                        </button>
                    </div>
                </div>
            </CalendarModal>
        </>
    );
}
