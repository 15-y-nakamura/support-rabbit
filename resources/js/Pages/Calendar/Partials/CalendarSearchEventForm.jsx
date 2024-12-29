import { useState } from "react";

export default function CalendarSearchEventForm({ onSearch }) {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>検索</label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button type="submit">検索</button>
        </form>
    );
}
