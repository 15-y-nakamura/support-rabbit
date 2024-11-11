import { useState } from "react";
import { getMonth } from "./util";
import { CalendarHeader } from "./components/CalendarHeader";
import { Sidebar } from "./components/Sidebar";
import { Month } from "./components/Month";

function Calendar() {
    const [currentMonth, setCurrentMonth] = useState(getMonth());
    return (
        <div className="h-screen flex flex-col">
            <CalendarHeader />
            <div className="flex flex-1">
                <Sidebar />
                <Month month={currentMonth} />
            </div>
        </div>
    );
}

export default Calendar;
