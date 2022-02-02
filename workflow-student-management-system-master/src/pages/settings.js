import React, {Component} from 'react';
import Box from "@mui/material/Box";
import DatePicker from "@mui/lab/DatePicker";
import TextField from "@mui/material/TextField/TextField";
import LocalizationProvider from "@mui/lab/LocalizationProvider/LocalizationProvider";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import {AcademicYearContext} from "../components/session";

class Settings extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <AcademicYearContext.Consumer>
                {({academicYear, setAcademicYear}) => {
                    let academicDate = new Date();
                    academicDate.setFullYear(academicYear);
                    return (
                        <div className='subjects'>
                            <h1>Settings</h1>
                            <Box sx={{m:4, width: '100%'}}>
                                <Box className="my-middle" m={2}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="Select Academic Year"
                                            value={academicDate}
                                            views={['year']}
                                            onChange={(newValue) => {
                                                setAcademicYear(newValue.getFullYear());
                                            }}
                                            renderInput={(params) => <TextField {...params} />}
                                        />
                                    </LocalizationProvider>
                                </Box>
                            </Box>
                        </div>
                    )
                }}
            </AcademicYearContext.Consumer>
        );
    }
}

export default Settings;