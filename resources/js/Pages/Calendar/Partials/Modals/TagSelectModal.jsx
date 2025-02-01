import { useState, useEffect } from "react";
import axios from "axios";
import EventModal from "../Modals/EventModal";

// 認証トークンを取得する関数
const getAuthToken = () => {
    return localStorage.getItem("authToken");
};

export default function TagSelectModal({ isOpen, onClose, onTagSelected }) {
    const [tags, setTags] = useState([]);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#000000");
    const [selectedTag, setSelectedTag] = useState(null);
    const [loadingTags, setLoadingTags] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTags();
        }
    }, [isOpen]);

    const fetchTags = async () => {
        setLoadingTags(true);
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error("Auth token is missing");
            }
            const response = await axios.get("/api/v2/calendar/tags", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setTags(response.data.tags);
        } catch (error) {
            console.error("Error fetching tags:", error);
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
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error("Auth token is missing");
            }
            const response = await axios.post(
                "/api/v2/calendar/tags",
                {
                    name: newTagName,
                    color: newTagColor,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            const newTag = response.data.tag;
            setTags([...tags, newTag]);
            setNewTagName("");
            setNewTagColor("#000000");
        } catch (error) {
            console.error("Error creating tag:", error);
        }
    };

    const handleTagDelete = async () => {
        if (!selectedTag) {
            alert("削除するタグを選択してください。");
            return;
        }
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error("Auth token is missing");
            }
            await axios.delete(`/api/v2/calendar/tags/${selectedTag.id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setTags(tags.filter((tag) => tag.id !== selectedTag.id));
            setSelectedTag(null);
        } catch (error) {
            console.error("Error deleting tag:", error);
        }
    };

    const handleTagClick = (tag) => {
        setSelectedTag(selectedTag?.id === tag.id ? null : tag);
    };

    return (
        <EventModal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col space-y-4">
                <h2 className="text-lg font-bold">タグ一覧</h2>

                {/* タグ選択レイアウトを修正 */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {tags.map((tag) => (
                        <div
                            key={tag.id}
                            onClick={() => handleTagClick(tag)}
                            className={`p-2 border border-gray-300 rounded-lg cursor-pointer transition-colors duration-300 ${
                                selectedTag?.id === tag.id
                                    ? "border-2 border-[#80ACCF]"
                                    : ""
                            }`}
                            style={{
                                backgroundColor: tag.color,
                                borderColor:
                                    selectedTag?.id === tag.id
                                        ? "#80ACCF"
                                        : "gray",
                            }}
                        >
                            {tag.name}
                        </div>
                    ))}
                </div>

                {/* ボタンを右寄せし、サイズ調整 */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleTagDelete}
                        className="bg-[#80ACCF] text-white px-4 py-2 rounded shadow-md"
                    >
                        選択したタグを削除
                    </button>
                </div>

                <hr className="w-full border-t border-gray-300 my-4" />
                <h2 className="text-lg font-bold">新しいタグを作成</h2>
                <div className="flex flex-col space-y-3">
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
                        <div
                            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded shadow-md cursor-pointer"
                            onClick={() =>
                                document.getElementById("colorPicker").click()
                            }
                        >
                            <label
                                htmlFor="colorPicker"
                                className="w-8 h-8 cursor-pointer"
                                style={{
                                    backgroundImage:
                                        "url('/img/icons/palette-icon.png')",
                                    backgroundSize: "cover",
                                }}
                            ></label>
                            <span className="text-gray-700">色を作成</span>
                        </div>
                        <div
                            className="w-10 h-10 border border-gray-300 rounded"
                            style={{ backgroundColor: newTagColor }}
                        ></div>
                    </div>

                    {/* ボタンのレイアウトを整え、サイズを統一 */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleTagCreate}
                            className="bg-customPink text-white px-6 py-2 rounded shadow-md"
                        >
                            作成
                        </button>
                    </div>
                </div>
            </div>
        </EventModal>
    );
}
