import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal'
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import styled from "@mui/material/styles/styled";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import {compose} from "recompose";
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import '../styling/subjects.css'
import withFormHOC from "../components/hookForm/withFormHOC";
import {withFirebase} from "../components/firebase";
import {withAcademicYear, withAuthUser} from "../components/session";
import withAuthorization from "../components/session/withAuthorization";
import * as MyUtils from "../components/common/myUtils";
import * as MyDataPath from "../components/common/dataPath";

import {onValue} from 'firebase/database';
import StaticDatePicker from "@mui/lab/StaticDatePicker";

const CardItem = styled(Card)(({theme}) => ({
    ...theme.typography.body2,
    textAlign: 'left',
    margin: 10,
    paddingLeft: 8,
    paddingRight: 8,
    color: theme.palette.text.secondary,
    width: '70%',
}));

class Calendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            showEdit: false,
            datePickValue: new Date(),
            editCompleteFlag: false,
            subjectResult: null,
            subjectList: [],
            assignmentList: [],
            examList: [],
            currPath: null,
        };
        this.ASSIGNMENTS_PATH = MyDataPath.ASSIGNMENTS(this.props.academicYear);
        this.EXAMS_PATH = MyDataPath.EXAMS(this.props.academicYear);
        this.SUBJECTS_PATH = MyDataPath.SUBJECTS(this.props.academicYear);
    }

    componentDidMount() {
        const {authUser, firebase} = this.props;
        // get assignment list
        onValue(firebase.getListByRootName(authUser.uid, this.ASSIGNMENTS_PATH), (snapshot) => {
            const {subjectResult} = this.state;
            const result = snapshot.val();
            let assList = MyUtils.keyObjToArray(result);
            if (subjectResult) {
                this.setSubjectToItem(assList, subjectResult);
                this.setState({assignmentList: assList});
                return;
            }
            // get subject list
            onValue(firebase.getListByRootName(authUser.uid, this.SUBJECTS_PATH), (snapshot) => {
                const subjectResult = snapshot.val();
                this.setSubjectToItem(assList, subjectResult);
                let subjectList = MyUtils.keyObjToArray(subjectResult);
                this.setState({subjectResult: subjectResult});
                this.setState({subjectList: subjectList});
                this.setState({assignmentList: assList});

                // get exam list
                onValue(firebase.getListByRootName(authUser.uid, this.EXAMS_PATH), (snapshot) => {
                    const result = snapshot.val();
                    let examList = MyUtils.keyObjToArray(result);
                    this.setSubjectToItem(examList, subjectResult);
                    this.setState({examList: examList});
                });
            });
        });
    }

    componentWillUnmount() {
        const {authUser, firebase} = this.props;
        firebase.offGetListByRootName(authUser.uid, this.ASSIGNMENTS_PATH);
        firebase.offGetListByRootName(authUser.uid, this.EXAMS_PATH);
        firebase.offGetListByRootName(authUser.uid, this.SUBJECTS_PATH);
    }

    setSubjectToItem(itemList, subjectResult) {
        itemList.map((item) => {
            item.subject = subjectResult[item.subject_id];
        });
    }

    handleEditShow(item, path) {
        this.props.form2.reset(item);
        let flag = item.complete_flag;
        if (!flag) {
            flag = false;
        }
        this.setState({
            showEdit: true,
            currPath: path,
            editCompleteFlag: flag
        });
    }

    handleEditClose() {
        this.setState({showEdit: false});
    }

    handleSubjectDel(id, path) {
        const {firebase} = this.props;
        firebase.updateById(path, id, null)
            .catch(error => {
                alert(error);
            });
    }

    onEditSubmit(data) {
        const {editCompleteFlag, currPath} = this.state;
        const {firebase} = this.props;

        data.complete_flag = editCompleteFlag;
        let id = data.id;
        delete data["id"];
        data["subject"] = null;
        firebase.updateById(currPath, id, data)
            .catch(error => {
                alert(error);
            });
        this.handleEditClose();
    };

    editCompleteFlagChange(event) {
        this.setState({editCompleteFlag: event.target.checked});
    }

    handleDatePickerChange(newValue) {
        this.setState({datePickValue: newValue});
    }

    filterByDatePick() {
        const {datePickValue} = this.state;
        return function (obj) {
            let dateCondition = MyUtils.getDateFormatYYYYMMDD(new Date(obj.due_date)) === MyUtils.getDateFormatYYYYMMDD(datePickValue);
            let completeCondition = !obj.complete_flag;
            return dateCondition && completeCondition;
        }
    }

    render() {
        const {showEdit, editCompleteFlag, datePickValue, assignmentList, examList} = this.state;
        const {register: register1, handleSubmit: handleSubmit1} = this.props.form2;
        return (
            <div className='subjects'>
                <h1>Calendar</h1>
                <Box sx={{width: "100%", height: 650, maxHeight: 650, overflow: 'auto'}}>
                    <Box sx={{fontSize: "1rem"}}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <StaticDatePicker
                                displayStaticWrapperAs="desktop"
                                openTo="day"
                                value={datePickValue}
                                onChange={(newValue) => {
                                    this.handleDatePickerChange(newValue);
                                }}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </Box>
                    <Box className="my-middle">
                        <h3>Assignments</h3>
                    </Box>
                    <Box sx={{maxHeight: 350, overflow: 'auto', mb: 4}}>
                        {assignmentList.filter(this.filterByDatePick()).length == 0 && (
                            <Box className="my-middle">
                                <h3>no data found...</h3>
                            </Box>
                        )}
                        {assignmentList.filter(this.filterByDatePick()).length > 0 && (
                            assignmentList.filter(this.filterByDatePick()).map((item) => (
                                <Box className="my-middle" key={item.id}>
                                    <CardItem>
                                        <div className="my-content" style={{color: item.subject.color}}>
                                            <h5 style={{marginBottom: 0}}>{item.subject.module_code}:{" " + item.subject.module_name}</h5>
                                            <h3>{item.title}</h3>
                                        </div>
                                        <div className="edit-icon">
                                            <IconButton edge="end" aria-label="comments"
                                                        onClick={() => {
                                                            this.handleEditShow(item, this.ASSIGNMENTS_PATH)
                                                        }}
                                            >
                                                <EditIcon/>
                                            </IconButton>
                                        </div>
                                        <div className="edit-icon">
                                            <IconButton edge="end" aria-label="comments"
                                                        onClick={() => {
                                                            this.handleSubjectDel(item.id, this.ASSIGNMENTS_PATH)
                                                        }}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </div>
                                        <div className="my-progress">
                                            <h5>{MyUtils.gtAndEqToCurrDate(item.due_date) ? "Due" : "Overdue"}</h5>
                                            <h6 style={{marginBottom: 0}}>{MyUtils.getDateFormatYYYYMMDD(new Date(item.due_date))}</h6>
                                        </div>
                                    </CardItem>
                                </Box>
                            ))
                        )}
                    </Box>
                    <Box className="my-middle">
                        <h3>Exams</h3>
                    </Box>
                    <Box sx={{maxHeight: 350, overflow: 'auto'}}>
                        {examList.filter(this.filterByDatePick()).length == 0 && (
                            <Box className="my-middle">
                                <h3>no data found...</h3>
                            </Box>
                        )}
                        {examList.filter(this.filterByDatePick()).length > 0 && (
                            examList.filter(this.filterByDatePick()).map((item) => (
                                <Box className="my-middle" key={item.id}>
                                    <CardItem>
                                        <div className="my-content" style={{color: item.subject.color}}>
                                            <h5 style={{marginBottom: 0}}>{item.subject.module_code}:{" " + item.subject.module_name}</h5>
                                            <h3>{item.title}</h3>
                                        </div>
                                        <div className="edit-icon">
                                            <IconButton edge="end" aria-label="comments"
                                                        onClick={() => {
                                                            this.handleEditShow(item, this.EXAMS_PATH)
                                                        }}
                                            >
                                                <EditIcon/>
                                            </IconButton>
                                        </div>
                                        <div className="edit-icon">
                                            <IconButton edge="end" aria-label="comments"
                                                        onClick={() => {
                                                            this.handleSubjectDel(item.id, this.EXAMS_PATH)
                                                        }}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </div>
                                        <div className="my-progress">
                                            <h5>{MyUtils.gtAndEqToCurrDate(item.due_date) ? "Due" : "Overdue"}</h5>
                                            <h6 style={{marginBottom: 0}}>{MyUtils.getDateFormatYYYYMMDD(new Date(item.due_date))}</h6>
                                        </div>
                                    </CardItem>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>

                <Modal className='modal' show={showEdit} onHide={() => {
                    this.handleEditClose()
                }} backdrop="static" keyboard={false} centered={true}>
                    <Modal.Header className='header'>
                        <Modal.Title>
                            <div className='title'>Edit Progress</div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit1((data) => {
                            this.onEditSubmit(data)
                        })}>
                            <div className='subjectsForm'>
                                <label className='moduleCodeLabel'>Complete</label>
                            </div>
                            <div className='subjectsForm'>
                                <Switch color="primary"
                                        checked={editCompleteFlag}
                                        onChange={(event) => {
                                            this.editCompleteFlagChange(event)
                                        }}
                                />
                            </div>
                            <div className='subjectsForm'>
                                <label className='moduleCodeLabel'>Result(%)</label>
                            </div>
                            <div className='subjectsForm'>
                                <input type='text' className='moduleCode' {...register1("result")}/>
                            </div>
                            <Modal.Footer>
                                <button type='button' className="closeModal" onClick={() => {
                                    this.handleEditClose()
                                }}>Close
                                </button>
                                <button type='submit' className="saveSubject">Save</button>
                            </Modal.Footer>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

const condition = authUser => !!authUser;
export default compose(withAcademicYear, withFormHOC, withFirebase, withAuthUser, withAuthorization(condition))(Calendar);