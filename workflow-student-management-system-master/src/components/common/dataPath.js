export const ASSIGNMENTS = (academicYear) => (genPath('assignments/', academicYear));
export const EXAMS = (academicYear) => (genPath('exams/', academicYear));
export const SUBJECTS = (academicYear) => (genPath('subjects/', academicYear));

const genPath = (basePath, academicYear) => {
    if (!academicYear) {
        return basePath;
    }
    return (basePath + academicYear + "/")
};

