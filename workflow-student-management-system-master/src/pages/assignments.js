import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal'
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
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
import DatePicker from '@mui/lab/DatePicker';

import '../styling/subjects.css'
import withFormHOC from "../components/hookForm/withFormHOC";
import {withFirebase} from "../components/firebase";
import {withAcademicYear, withAuthUser} from "../components/session";
import withAuthorization from "../components/session/withAuthorization";
import * as MyUtils from "../components/common/myUtils";
import * as MyDataPath from "../components/common/dataPath";

import {onValue} from 'firebase/database';

const CardItem = styled(Card)(({theme}) => ({
    ...theme.typography.body2,
    textAlign: 'left',
    margin: 10,
    paddingLeft: 8,
    paddingRight: 8,
    color: theme.palette.text.secondary,
    width: '70%',
}));

class Assignments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            showEdit: false,
            datePickValue: new Date(),
            editCompleteFlag: false,
            tabValue: 0,
            completeFlag: false,
            subjectResult: null,
            subjectList: [],
            assignmentList: [],
        };
        this.PAGE_PATH = MyDataPath.ASSIGNMENTS(this.props.academicYear);
        this.SUBJECTS_PATH = MyDataPath.SUBJECTS(this.props.academicYear);
    }

    componentDidMount() {
        const {authUser, firebase} = this.props;
        // get assignment list
        onValue(firebase.getListByRootName(authUser.uid, this.PAGE_PATH), (snapshot) => {
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
                const result = snapshot.val();
                this.setSubjectToItem(assList, result);
                let subjectList = MyUtils.keyObjToArray(result);
                this.setState({subjectResult: result});
                this.setState({subjectList: subjectList});
                this.setState({assignmentList: assList});
            });
        });
    }

    componentWillUnmount() {
        const {authUser, firebase} = this.props;
        firebase.offGetListByRootName(authUser.uid, this.PAGE_PATH);
        firebase.offGetListByRootName(authUser.uid, this.SUBJECTS_PATH);
    }

    setSubjectToItem(itemList, subjectResult) {
        itemList.map((item) => {
            item.subject = subjectResult[item.subject_id];
        });
    }

    handleShow() {
        const {subjectList} = this.state;
        if (subjectList.length == 0) {
            alert("No subjects currently, you need to add subjects before adding assignments!");
            return;
        }
        this.props.form.reset({});
        this.setState({show: true});
    }

    handleClose() {
        this.setState({
            show: false,
        });
    }

    handleEditShow(item) {
        this.props.form2.reset(item);
        let flag = item.complete_flag;
        if (!flag) {
            flag = false;
        }
        this.setState({
            showEdit: true,
            editCompleteFlag: flag
        });
    }

    handleEditClose() {
        this.setState({showEdit: false});
    }

    handleTabChange(event, newValue) {
        if (typeof newValue != 'number') {
            this.setState({completeFlag: newValue});
            return;
        }
        this.setState({tabValue: newValue});
    };

    handleSubjectDel(id) {
        const {firebase} = this.props;
        firebase.updateById(this.PAGE_PATH, id, null)
            .catch(error => {
                alert(error);
            });
    }

    // submit form
    onSubmit(data) {
        const {datePickValue} = this.state;
        const {authUser, firebase} = this.props;
        if (!datePickValue) {
            return;
        }
        data.due_date = datePickValue.getTime();
        firebase.insert(authUser, data, this.PAGE_PATH)
            .catch(error => {
                alert(error);
            });
        this.handleClose();
    };

    onEditSubmit(data) {
        const {editCompleteFlag} = this.state;
        const {firebase} = this.props;

        data.complete_flag = editCompleteFlag;
        let id = data.id;
        delete data["id"];
        data["subject"] = null;
        firebase.updateById(this.PAGE_PATH, id, data)
            .catch(error => {
                alert(error);
            });
        this.handleEditClose();
    };

    filterByTabValue() {
        const {completeFlag} = this.state;
        return function (obj) {
            let completeCondition = !obj.complete_flag;
            if (completeFlag) {
                completeCondition = true;
            }
            return completeCondition;
        }
    }

    sortByTabValue() {
        const {tabValue} = this.state;
        return function (a, b) {
            // sort by due date
            if (tabValue == 0) {
                return a.due_date - b.due_date;
            }
            // sort by subject module code
            return a.subject.module_code.localeCompare(b.subject.module_code);
        }
    }

    editCompleteFlagChange(event) {
        this.setState({editCompleteFlag: event.target.checked});
    }

    handleDatePickerChange(newValue) {
        this.setState({datePickValue: newValue});
    }

    render() {
        const {show, showEdit, editCompleteFlag, tabValue, datePickValue, subjectList, assignmentList} = this.state;
        const {register, formState: {errors}, handleSubmit} = this.props.form;
        const {register: register1, handleSubmit: handleSubmit1} = this.props.form2;
        return (
            <div className='subjects'>
                <h1>Assignments</h1>
                <Box sx={{width: '100%'}}>
                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                        <Tabs value={tabValue} onChange={(event, newValue) => {
                            this.handleTabChange(event, newValue)
                        }} centered>
                            <Tab label="Due Date"/>
                            <Tab label="Subject"/>
                            <FormControlLabel
                                value="Include Completed"
                                control={<Switch color="primary"/>}
                                label="Include Completed?"
                                labelPlacement="start"
                            />
                        </Tabs>
                    </Box>
                    <Box sx={{height: 480, maxHeight: 480, overflow: 'auto', borderBottom: 1, borderColor: 'divider'}}>
                        {assignmentList.sort(this.sortByTabValue()).filter(this.filterByTabValue()).length == 0 && (
                            <Box className="my-middle">
                                <div style={{textAlign: "center", padding: "50px"}}>
                                    <h3>no data found...</h3>
                                </div>
                            </Box>
                        )}
                        {assignmentList.sort(this.sortByTabValue()).filter(this.filterByTabValue()).length > 0 && (
                            assignmentList.sort(this.sortByTabValue()).filter(this.filterByTabValue()).map((item) => (
                                <Box className="my-middle" key={item.id}>
                                    <CardItem>
                                        <div className="my-content" style={{color: item.subject.color}}>
                                            <h5 style={{marginBottom: 0}}>{item.subject.module_code}:{" " + item.subject.module_name}</h5>
                                            <h3>{item.title}</h3>
                                        </div>
                                        <div className="edit-icon">
                                            <IconButton edge="end" aria-label="comments"
                                                        onClick={() => {
                                                            this.handleEditShow(item)
                                                        }}
                                            >
                                                <EditIcon/>
                                            </IconButton>
                                        </div>
                                        <div className="edit-icon">
                                            <IconButton edge="end" aria-label="comments"
                                                        onClick={() => {
                                                            this.handleSubjectDel(item.id)
                                                        }}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </div>
                                        <div className="my-progress">
                                            {item.complete_flag && (
                                                <>
                                                    <h5>Complete</h5>
                                                    <h6 style={{marginBottom: 0}}>{item.result}%</h6>
                                                </>
                                            )}
                                            {(!item.complete_flag && item.due_date) && (
                                                <>
                                                    <h5>{MyUtils.gtAndEqToCurrDate(item.due_date) ? "Due" : "Overdue"}</h5>
                                                    <h6 style={{marginBottom: 0}}>{MyUtils.getDateFormatYYYYMMDD(new Date(item.due_date))}</h6>
                                                </>
                                            )}
                                        </div>
                                    </CardItem>
                                </Box>
                            ))
                        )}
                    </Box>
                    <Box className="my-middle" m={2}>
                        <Button
                            type="button"
                            variant="contained"
                            onClick={() => {
                                this.handleShow()
                            }}
                        >
                            + Add
                        </Button>
                    </Box>
                </Box>

                <Modal className='modal' show={show} onHide={() => {
                    this.handleClose()
                }} backdrop="static" keyboard={false} centered={true}>
                    <Modal.Header className='header'>
                        <Modal.Title>
                            <div className='title'> Add Assignment</div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit((data) => {
                            this.onSubmit(data)
                        })}>
                            <div className='subjectsForm'>
                                <label className='moduleCodeLabel'>Subject</label>
                            </div>

                            <div className='subjectsForm'>
                                <select className='termSelector' style={{width: "100%"}} {...register("subject_id", {required: true})}>
                                    {
                                        subjectList.map((item) => (
                                            <option value={item.id} key={item.id}>{item.module_code}-{item.module_name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className='subjectsForm'>
                                <label>Assignment Type</label>
                            </div>

                            <div className='subjectsForm'>
                                <select className='termSelector' {...register("type", {required: true})}>
                                    <option value='0'>Code</option>
                                    <option value='1'>Report</option>
                                </select>
                            </div>
                            <div className='subjectsForm'>
                                <label>Assignment Title</label>
                            </div>
                            <div className='subjectsForm'>
                                <input type='text' className='moduleName' {...register("title", {required: true})}/>
                            </div>
                            {errors.title?.type === 'required' && (
                                <div className='subjectsForm'>
                                    <span className="warning-color">Assignment Title is required</span>
                                </div>
                            )}
                            <div className='subjectsForm'>
                                <label>Weighting(%)</label>
                            </div>
                            <div className='subjectsForm'>
                                <input type='number' className='moduleName' {...register("weighting", {required: true})}/>
                            </div>
                            {errors.weighting?.type === 'required' && (
                                <div className='subjectsForm'>
                                    <span className="warning-color">Weighting is required</span>
                                </div>
                            )}
                            <div className='subjectsForm' style={{marginTop: 10, marginBottom: 10}}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Due Date"
                                        value={datePickValue}
                                        onChange={(newValue) => {
                                            this.handleDatePickerChange(newValue);
                                        }}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </div>
                            {!datePickValue && (
                                <div className='subjectsForm'>
                                    <span className="warning-color">Due Date is required</span>
                                </div>
                            )}
                            <div className='subjectForm'>
                                <label>Description</label>
                                <textarea className='moduleDescription' {...register("desc")}/>
                            </div>
                            <Modal.Footer>
                                <button type='button' className="closeModal" onClick={() => {
                                    this.handleClose()
                                }}>Close
                                </button>
                                <button type='submit' className="saveSubject">Save</button>
                            </Modal.Footer>
                        </form>
                    </Modal.Body>
                </Modal>

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
export default compose(withAcademicYear, withFormHOC, withFirebase, withAuthUser, withAuthorization(condition))(Assignments);