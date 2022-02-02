import React from 'react';

const AcademicYearContext = React.createContext({
    academicYear: new Date().getFullYear(),
    setAcademicYear: () => {},
});
export const withAcademicYear = Component => props => (
    <AcademicYearContext.Consumer>
        {({ academicYear, setAcademicYear }) => (
            <Component {...props} academicYear={academicYear} />
        )}
    </AcademicYearContext.Consumer>
);
export default AcademicYearContext;