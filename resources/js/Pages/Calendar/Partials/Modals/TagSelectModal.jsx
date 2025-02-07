import { useState, useEffect } from "react";
import axios from "axios";
import EventModal from "../../../../Components/EventModal"; // 修正されたインポートパス
import ConfirmDeleteModal from "./ConfirmDeleteModal"; // 削除確認モーダル

// 認証トークンを取得する関数
const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("Auth token is missing");
    }
    return token;
};

export default function TagSelectModal({ isOpen, onClose, onTagSelected }) {
    const [tags, setTags] = useState([]);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#000000");
    const [selectedTag, setSelectedTag] = useState(null);
    const [loadingTags, setLoadingTags] = useState(false);
    const [errors, setErrors] = useState({});
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

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

            // 認証している user_id と一致するタグのみをフィルタリング
            const userId = response.data.user_id;
            const filteredTags = response.data.tags.filter(
                (tag) => tag.user_id === userId
            );

            const sortedTags = filteredTags.sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
            );
            setTags(sortedTags);
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
        setIsCreating(true);
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
            const updatedTags = [...tags, newTag].sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
            );
            setTags(updatedTags);
            setNewTagName("");
            setNewTagColor("#000000");
            setErrors({});
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Error creating tag:", error);
            }
        } finally {
            setIsCreating(false);
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
            const updatedTags = tags.filter((tag) => tag.id !== selectedTag.id);
            setTags(updatedTags);
            setSelectedTag(null);
        } catch (error) {
            console.error("Error deleting tag:", error);
        }
    };

    const handleTagClick = (tag) => {
        setSelectedTag(selectedTag?.id === tag.id ? null : tag);
    };

    const openConfirmDeleteModal = () => {
        setIsConfirmDeleteOpen(true);
    };

    const closeConfirmDeleteModal = () => {
        setIsConfirmDeleteOpen(false);
    };

    return (
        <>
            <EventModal isOpen={isOpen} onClose={onClose}>
                <div className="flex flex-col space-y-4">
                    <h2 className="text-lg font-bold">タグ一覧</h2>

                    {/* タグ選択レイアウトを修正 */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {loadingTags ? (
                            <div className="col-span-3 flex justify-center items-center">
                                <div className="w-16 h-16 border-8 border-gray-200 border-t-pink-400 rounded-full animate-spin"></div>
                            </div>
                        ) : tags.length === 0 ? (
                            <div className="col-span-3 text-center text-gray-500">
                                タグが作成されていません
                            </div>
                        ) : (
                            (() => {
                                const tagElements = [];
                                for (let i = 0; i < tags.length; i++) {
                                    const tag = tags[i];
                                    tagElements.push(
                                        <div
                                            key={tag.id}
                                            onClick={() => handleTagClick(tag)}
                                            className={`p-2 border border-gray-300 rounded-lg cursor-pointer transition-colors duration-300 ${
                                                selectedTag?.id === tag.id
                                                    ? "border-2 border-customBlue"
                                                    : ""
                                            }`}
                                            style={{
                                                backgroundColor: tag.color,
                                                borderColor:
                                                    selectedTag?.id === tag.id
                                                        ? "customBlue"
                                                        : "gray",
                                            }}
                                        >
                                            {tag.name}
                                        </div>
                                    );
                                }
                                return tagElements;
                            })()
                        )}
                    </div>

                    {/* ボタンを右寄せし、サイズ調整 */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={openConfirmDeleteModal}
                            className="bg-customBlue hover:bg-blue-400 text-white px-4 py-2 rounded shadow-md"
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
                        {errors.name && (
                            <div className="text-red-500">
                                {errors.name.map((error, index) => (
                                    <p key={index}>{error}</p>
                                ))}
                            </div>
                        )}

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
                                    document
                                        .getElementById("colorPicker")
                                        .click()
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
                        {errors.color && (
                            <div className="text-red-500">
                                {errors.color.map((error, index) => (
                                    <p key={index}>{error}</p>
                                ))}
                            </div>
                        )}

                        {/* ボタンのレイアウトを整え、サイズを統一 */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleTagCreate}
                                className="bg-customPink text-white px-6 py-2 rounded shadow-md flex items-center justify-center"
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <div className="flex justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    "作成"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </EventModal>
            <ConfirmDeleteModal
                isOpen={isConfirmDeleteOpen}
                onClose={closeConfirmDeleteModal}
                onConfirm={() => {
                    handleTagDelete();
                    closeConfirmDeleteModal();
                }}
            />
        </>
    );
}
