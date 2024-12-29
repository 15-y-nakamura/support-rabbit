import axios from "axios";

export default function CalendarDeleteEventButton({ eventId, onEventDeleted }) {
    const handleDelete = async () => {
        try {
            await axios.delete(`/api/v2/calendar/events/${eventId}`);
            onEventDeleted(eventId);
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    return <button onClick={handleDelete}>削除</button>;
}
