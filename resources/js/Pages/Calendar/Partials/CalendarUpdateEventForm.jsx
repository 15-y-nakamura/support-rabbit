import { useState } from "react";
import axios from "axios";

export default function CalendarUpdateEventForm({ event, onEventUpdated }) {
    const [title, setTitle] = useState(event.title);
    const [description, setDescription] = useState(event.description);
    const [startTime, setStartTime] = useState(event.start_time);
    const [endTime, setEndTime] = useState(event.end_time);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `/api/v2/calendar/events/${event.id}`,
                {
                    title,
                    description,
                    start_time: startTime,
                    end_time: endTime,
                }
            );
            onEventUpdated(response.data.event);
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>タイトル</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>説明</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div>
                <label>開始時間</label>
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>終了時間</label>
                <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </div>
            <button type="submit">更新</button>
        </form>
    );
}
