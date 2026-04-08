const parseScheduleData = (text) => {
  const lines = text.trim().split("\n");
  const scheduleList = [];

  lines.forEach((line) => {
    const columns = line.split("\t").map((col) => col.trim());

    if (columns.length >= 7) {
      const hari = columns[0];
      const jam = columns[1];
      const kodeMK = columns[2];
      const namaMK = columns[3];
      const kelas = columns[4];
      const dosen = columns[5]?.replace(";", "") || "";
      const ruang = columns[6];

      if (!hari || !jam) return;

      let startTime = "";
      let endTime = "";
      if (jam.includes("-")) {
        const timeSplit = jam.split("-");
        startTime = timeSplit[0].trim();
        endTime = timeSplit[1].trim();
      }

      scheduleList.push({
        courseCode: kodeMK,
        courseName: namaMK,
        day: hari,
        className: kelas,
        startTime: startTime,
        endTime: endTime,
        lecturer: dosen || "Belum ditentukan",
        room: ruang,
        priority: "medium",
      });
    }
  });

  return mergeConsecutiveClasses(scheduleList);
};

const mergeConsecutiveClasses = (scheduleList) => {
  const merged = [];
  scheduleList.forEach((current) => {
    const existingIndex = merged.findIndex(
      (item) => item.courseCode === current.courseCode && item.day === current.day
    );
    if (existingIndex !== -1) {
      merged[existingIndex].endTime = current.endTime;
    } else {
      merged.push(current);
    }
  });
  return merged;
};

// Sample data from user request context (tabs separated)
const sampleInput = `Senin\t07:00 - 08:40\tCOMP6047\tAlgorithm\tL1AC\tBpk Budi;\tR.123
Senin\t08:40 - 10:20\tCOMP6047\tAlgorithm\tL1AC\tBpk Budi;\tR.123
Selasa\t13:00 - 14:40\tCOMP6048\tData Structures\tL2BC\tIbu Susi\tR.456`;

const results = parseScheduleData(sampleInput);
console.log(JSON.stringify(results, null, 2));
