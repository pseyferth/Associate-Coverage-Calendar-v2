import { useState } from 'react';

const associates = ['Paul', 'Nnamdi', 'Peyton'];
const weeks = generateWeeks('2025-05-05', '2025-08-31');
const options = ['DNS', 'SUBOPTIMAL', 'NO ISSUES'];

function generateWeeks(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const weekArray = [];

  while (startDate <= endDate) {
    const monday = new Date(startDate);
    weekArray.push(monday.toISOString().split('T')[0]);
    startDate.setDate(startDate.getDate() + 7);
  }
  return weekArray;
}

export default function TeamCalendar() {
  const [availability, setAvailability] = useState({});
  const [schedule, setSchedule] = useState({});

  const handleAvailabilityChange = (person, week, value) => {
    setAvailability((prev) => ({
      ...prev,
      [person]: {
        ...(prev[person] || {}),
        [week]: value,
      },
    }));
  };

  const generateSchedule = () => {
    const newSchedule = {};
    weeks.forEach((week) => {
      const candidates = associates
        .filter((person) => availability[person]?.[week] === 'NO ISSUES')
        .concat(
          associates.filter((person) => availability[person]?.[week] === 'SUBOPTIMAL')
        );

      newSchedule[week] = candidates.length > 0 ? candidates[0] : 'Unassigned';
    });
    setSchedule(newSchedule);
  };

  const downloadCSV = () => {
    let csvContent = "Week,Assigned\n";
    weeks.forEach((week) => {
      csvContent += `${week},${schedule[week] || "Pending"}\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "coverage_schedule.csv");
    link.click();
  };

  const countAssignments = () => {
    const counts = {};
    Object.values(schedule).forEach((person) => {
      if (!counts[person]) counts[person] = 0;
      counts[person] += 1;
    });
    return counts;
  };

  const assignmentCounts = countAssignments();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Portfolio and Fund Coverage Scheduler</h1>
      <div className="flex space-x-4 mb-6">
        <button onClick={generateSchedule} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md font-semibold">Generate Schedule</button>
        <button onClick={downloadCSV} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md font-semibold">Download CSV</button>
      </div>
      <div className="flex flex-wrap gap-6 mb-10">
        {associates.map((person) => (
          <div key={person} className="bg-white rounded-xl border p-6 shadow-sm w-72">
            <h2 className="text-xl font-semibold mb-4">{person}</h2>
            {weeks.map((week) => (
              <div key={week} className="mb-2">
                <label className="block text-sm font-medium">{week}</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-gray-200"
                  value={availability[person]?.[week] || ""}
                  onChange={(e) => handleAvailabilityChange(person, week, e.target.value)}
                >
                  <option value="">--</option>
                  {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Coverage Calendar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {weeks.map((week) => (
            <div key={week} className="border rounded-lg p-4 bg-white shadow-sm text-center">
              <div className="font-semibold">{week}</div>
              <div className="text-sm text-gray-600">Assigned: {schedule[week] || 'Pending'}</div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Assignments Summary</h3>
          <ul className="text-gray-800">
            {associates.map((person) => (
              <li key={person}>{person}: {assignmentCounts[person] || 0} weeks</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

}
