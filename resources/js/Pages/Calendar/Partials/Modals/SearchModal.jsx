import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SearchModal({
    isOpen,
    onClose,
    handleSearch,
    handleDateClick,
    setCurrentDate,
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchType, setSearchType] = useState("title");
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isTagsLoading, setIsTagsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (searchType === "tag") {
            fetchTags();
        }
    }, [searchType]);

    const getAuthToken = () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("認証トークンがありません");
        }
        return token;
    };

    const fetchTags = async () => {
        setIsTagsLoading(true);
        try {
            const authToken = getAuthToken();
            const response = await axios.get("/api/v2/calendar/tags", {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setTags(response.data.tags);
        } catch (error) {
            console.error("タグの取得中にエラーが発生しました:", error);
        } finally {
            setIsTagsLoading(false);
        }
    };

    const handleTitleSearch = async () => {
        const authToken = getAuthToken();
        const searchResults = await handleSearch(query, "");
        try {
            const [
                weekdayResults,
                weekendResults,
                weeklyResults,
                monthlyResults,
                yearlyResults,
            ] = await Promise.all([
                axios.get("/api/v2/calendar/weekday-events", {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
                axios.get("/api/v2/calendar/weekend-events", {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
                axios.get("/api/v2/calendar/weekly-events", {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
                axios.get("/api/v2/calendar/monthly-events", {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
                axios.get("/api/v2/calendar/yearly-events", {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
            ]);

            const filteredResults = searchResults.filter((result) =>
                result.title.includes(query)
            );
            const filteredWeekdayResults = weekdayResults.data.events.filter(
                (result) => result.title.includes(query)
            );
            const filteredWeekendResults = weekendResults.data.events.filter(
                (result) => result.title.includes(query)
            );
            const filteredWeeklyResults = weeklyResults.data.events.filter(
                (result) => result.title.includes(query)
            );
            const filteredMonthlyResults = monthlyResults.data.events.filter(
                (result) => result.title.includes(query)
            );
            const filteredYearlyResults = yearlyResults.data.events.filter(
                (result) => result.title.includes(query)
            );

            const combinedResults = [
                ...filteredResults,
                ...filteredWeekdayResults,
                ...filteredWeekendResults,
                ...filteredWeeklyResults,
                ...filteredMonthlyResults,
                ...filteredYearlyResults,
            ];
            combinedResults.sort(
                (a, b) => new Date(a.start_time) - new Date(b.start_time)
            );
            setResults(combinedResults);
        } catch (error) {
            console.error("イベントの取得中にエラーが発生しました:", error);
        }
    };

    const handleTagSearch = async () => {
        const authToken = getAuthToken();
        const searchResults = await handleSearch("", selectedTag?.id);
        try {
            const [
                weekdayResults,
                weekendResults,
                weeklyResults,
                monthlyResults,
                yearlyResults,
            ] = await Promise.all([
                axios.get(
                    `/api/v2/calendar/weekday-events?tag_id=${selectedTag?.id}`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                ),
                axios.get(
                    `/api/v2/calendar/weekend-events?tag_id=${selectedTag?.id}`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                ),
                axios.get(
                    `/api/v2/calendar/weekly-events?tag_id=${selectedTag?.id}`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                ),
                axios.get(
                    `/api/v2/calendar/monthly-events?tag_id=${selectedTag?.id}`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                ),
                axios.get(
                    `/api/v2/calendar/yearly-events?tag_id=${selectedTag?.id}`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                ),
            ]);

            const filteredSearchResults = searchResults.filter(
                (result) => result.tag_id === selectedTag?.id
            );
            const filteredWeekdayResults = weekdayResults.data.events.filter(
                (result) => result.tag_id === selectedTag?.id
            );
            const filteredWeekendResults = weekendResults.data.events.filter(
                (result) => result.tag_id === selectedTag?.id
            );
            const filteredWeeklyResults = weeklyResults.data.events.filter(
                (result) => result.tag_id === selectedTag?.id
            );
            const filteredMonthlyResults = monthlyResults.data.events.filter(
                (result) => result.tag_id === selectedTag?.id
            );
            const filteredYearlyResults = yearlyResults.data.events.filter(
                (result) => result.tag_id === selectedTag?.id
            );

            const combinedResults = [
                ...filteredSearchResults,
                ...filteredWeekdayResults,
                ...filteredWeekendResults,
                ...filteredWeeklyResults,
                ...filteredMonthlyResults,
                ...filteredYearlyResults,
            ];
            combinedResults.sort(
                (a, b) => new Date(a.start_time) - new Date(b.start_time)
            );
            setResults(combinedResults);
        } catch (error) {
            console.error("イベントの取得中にエラーが発生しました:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResults([]);
        if (searchType === "title") {
            await handleTitleSearch();
        } else {
            await handleTagSearch();
        }
        setIsLoading(false);
        setHasSearched(true);
    };

    const handleMove = (date) => {
        const newDate = new Date(date);
        setCurrentDate(newDate);
        handleDateClick(newDate);
        onClose();
    };

    const handleSearchTypeChange = (type) => {
        setSearchType(type);
        setResults([]);
        setHasSearched(false);
    };

    const groupResultsByDate = (results) => {
        return results.reduce((groups, result) => {
            const date = new Date(result.start_time).toLocaleDateString(
                "ja-JP",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }
            );
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(result);
            return groups;
        }, {});
    };

    if (!isOpen) return null;

    const groupedResults = groupResultsByDate(results);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
            <div
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 sm:mx-auto flex flex-col sm:flex-row relative overflow-y-auto"
                style={{
                    maxWidth: "800px",
                    width: "100%",
                    minHeight: "400px",
                    maxHeight: "90vh",
                    margin: "auto",
                }}
            >
                <button
                    className="absolute top-0 right-0 mt-2 mr-2 text-gray-600"
                    onClick={onClose}
                >
                    &times;
                </button>
                <div className="w-full sm:w-1/2 pr-0 sm:pr-4 border-r-0 sm:border-r border-gray-300">
                    <div
                        className="bg-cream p-4 rounded-lg"
                        style={{ height: "100%", minHeight: "400px" }}
                    >
                        <h3 className="text-2xl font-bold mb-6 text-center">
                            検索
                        </h3>
                        <div className="flex justify-center mb-6">
                            <button
                                className={`w-1/2 py-2 sm:py-4 text-gray-700 font-medium ${
                                    searchType === "title"
                                        ? "bg-customPink"
                                        : "bg-[#FFB6C1]"
                                }`}
                                onClick={() => handleSearchTypeChange("title")}
                            >
                                タイトル検索
                            </button>
                            <button
                                className={`w-1/2 py-2 sm:py-4 text-gray-700 font-medium ${
                                    searchType === "tag"
                                        ? "bg-customPink"
                                        : "bg-[#FFB6C1]"
                                }`}
                                onClick={() => handleSearchTypeChange("tag")}
                            >
                                タグ検索
                            </button>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <form onSubmit={handleSubmit}>
                                {searchType === "title" ? (
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold mb-2">
                                            タイトル検索
                                        </label>
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) =>
                                                setQuery(e.target.value)
                                            }
                                            placeholder="タイトルを入力"
                                            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                                        />
                                        <button
                                            type="submit"
                                            className="w-full bg-customBlue hover:bg-blue-400 text-white py-2 rounded-lg font-semibold transition-colors duration-300"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <div className="flex justify-center">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            ) : (
                                                "検索"
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold mb-2">
                                            タグ検索
                                        </label>
                                        {isTagsLoading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-16 h-16 border-8 border-gray-200 border-t-pink-400 rounded-full animate-spin"></div>
                                            </div>
                                        ) : tags.length === 0 ? (
                                            <div className="text-center text-gray-500">
                                                タグが作成されていません。
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-3 gap-3 mb-4">
                                                    {tags.map((tag) => (
                                                        <div
                                                            key={tag.id}
                                                            onClick={() =>
                                                                setSelectedTag(
                                                                    tag
                                                                )
                                                            }
                                                            className={`p-2 border border-gray-300 rounded-lg cursor-pointer transition-colors duration-300 ${
                                                                selectedTag?.id ===
                                                                tag.id
                                                                    ? "border-2 border-customBlue"
                                                                    : ""
                                                            }`}
                                                            style={{
                                                                backgroundColor:
                                                                    tag.color,
                                                                borderColor:
                                                                    selectedTag?.id ===
                                                                    tag.id
                                                                        ? "customBlue"
                                                                        : "gray",
                                                            }}
                                                        >
                                                            {tag.name}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full bg-customBlue hover:bg-blue-400 text-white py-2 rounded-lg font-semibold transition-colors duration-300"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <div className="flex justify-center">
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                    ) : (
                                                        "検索"
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
                <div className="w-full sm:w-1/2 pl-0 sm:pl-4 mt-6 sm:mt-0 bg-gray-100 p-4 rounded-lg flex flex-col items-center">
                    <h3 className="text-lg font-bold mb-4">検索結果</h3>
                    <ul className="max-h-[500px] overflow-y-auto space-y-4 w-full px-2 sm:px-4 flex flex-col items-center">
                        {Object.keys(groupedResults).length > 0
                            ? Object.keys(groupedResults).map((date) => (
                                  <li key={date} className="w-full">
                                      <h4 className="font-bold text-lg mb-2">
                                          {date}
                                      </h4>
                                      {groupedResults[date].map((result) => (
                                          <div
                                              key={result.id}
                                              className="bg-white shadow-lg rounded-lg p-4 mb-4"
                                              style={{
                                                  width: "100%",
                                                  maxWidth: "300px",
                                              }}
                                          >
                                              <div>
                                                  <div className="font-bold text-lg">
                                                      {result.title}
                                                  </div>
                                                  {result.tag ? (
                                                      <div
                                                          className="text-sm text-white px-2 py-1 rounded-lg mt-2"
                                                          style={{
                                                              backgroundColor:
                                                                  result.tag
                                                                      .color,
                                                          }}
                                                      >
                                                          {result.tag.name}
                                                      </div>
                                                  ) : result.tag_id ? (
                                                      <div
                                                          className="text-sm text-white px-2 py-1 rounded-lg mt-2"
                                                          style={{
                                                              backgroundColor:
                                                                  tags.find(
                                                                      (tag) =>
                                                                          tag.id ===
                                                                          result.tag_id
                                                                  )?.color,
                                                          }}
                                                      >
                                                          {
                                                              tags.find(
                                                                  (tag) =>
                                                                      tag.id ===
                                                                      result.tag_id
                                                              )?.name
                                                          }
                                                      </div>
                                                  ) : null}
                                                  <div className="text-sm text-gray-500 mt-2">
                                                      {new Date(
                                                          result.start_time
                                                      ).toLocaleDateString(
                                                          "ja-JP",
                                                          {
                                                              year: "numeric",
                                                              month: "long",
                                                              day: "numeric",
                                                          }
                                                      )}
                                                  </div>
                                              </div>
                                              <button
                                                  className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-300 hover:bg-green-600"
                                                  onClick={() =>
                                                      handleMove(
                                                          result.start_time
                                                      )
                                                  }
                                              >
                                                  移動
                                              </button>
                                          </div>
                                      ))}
                                  </li>
                              ))
                            : hasSearched &&
                              !isLoading && (
                                  <li className="text-center text-black w-full">
                                      該当するデータがありません。
                                  </li>
                              )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
