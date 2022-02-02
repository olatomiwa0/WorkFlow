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

import {onValue} from 'firebase/database';

import '../styling/subjects.css'
import withFormHOC from "../components/hookForm/withFormHOC";
import {withFirebase} from "../components/firebase";
import {withAcademicYear, withAuthUser} from "../components/session";
import withAuthorization from "../components/session/withAuthorization";
import * as MyUtils from "../components/common/myUtils";
import * as MyDataPath from "../components/common/dataPath";

const CardItem = styled(Card)(({theme}) => ({
    ...theme.typography.body2,
    textAlign: 'left',
    margin: 10,
    paddingLeft: 8,
    paddingRight: 8,
    color: theme.palette.text.secondary,
    width: '70%',
}));

class Subjects extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            showEdit: false,
            editCompleteFlag: false,
            tabValue: 0,
            completeFlag: false,
            subjectList: []
        };
        this.PAGE_PATH = MyDataPath.SUBJECTS(this.props.academicYear);
    }

    componentDidMount() {
        const {authUser, firebase} = this.props;
        onValue(firebase.getListByRootName(authUser.uid, this.PAGE_PATH), (snapshot) => {
            const result = snapshot.val();
            let dataList = MyUtils.keyObjToArray(result);
            this.setState({subjectList: dataList});
        });
    }

    componentWillUnmount() {
        const {authUser, firebase} = this.props;
        firebase.offGetListByRootName(authUser.uid, this.PAGE_PATH);
    }

    handleShow() {
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
        const {firebase, academicYear} = this.props;
        firebase.updateById(this.PAGE_PATH, id, null).then(() => {
            firebase.delSubItemsBySubjectId(id, academicYear);
        }).catch(error => {
                alert(error);
            });
    }

    // submit form
    onSubmit(data) {
        const {authUser, firebase} = this.props;
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
        firebase.updateById(this.PAGE_PATH, id, data)
            .catch(error => {
                alert(error);
            });
        this.handleEditClose();
    };

    filterByTabValue() {
        const {completeFlag, tabValue} = this.state;
        return function (obj) {
            let semesterCondition = true;
            let completeCondition = !obj.complete_flag;
            if (tabValue != 0) {
                semesterCondition = (obj.term == tabValue)
            }
            if (completeFlag) {
                completeCondition = true;
            }
            return semesterCondition && completeCondition;
        }
    }

    editCompleteFlagChange(event) {
        this.setState({editCompleteFlag: event.target.checked});
    }

    render() {
        const {show, showEdit, editCompleteFlag, tabValue, subjectList} = this.state;
        const {register, formState: {errors}, handleSubmit} = this.props.form;
        const {register: register1, handleSubmit: handleSubmit1} = this.props.form2;
        return (
            <div className='subjects'>
                <h1>Subjects</h1>
                <Box sx={{width: '100%'}}>
                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                        <Tabs value={tabValue} onChange={(event, newValue) => {
                            this.handleTabChange(event, newValue)
                        }} centered>
                            <Tab label="Year"/>
                            <Tab label="Semester 1"/>
                            <Tab label="Semester 2"/>
                            <FormControlLabel
                                value="Include Completed"
                                control={<Switch color="primary"/>}
                                label="Include Completed?"
                                labelPlacement="start"
                            />
                        </Tabs>
                    </Box>
                    <Box sx={{height: 480, maxHeight: 480, overflow: 'auto', borderBottom: 1, borderColor: 'divider'}}>
                        {subjectList.filter(this.filterByTabValue()).length == 0 && (
                            <Box className="my-middle">
                                <div style={{textAlign: "center", padding: "50px"}}>
                                    <h3>no data found...</h3>
                                </div>
                            </Box>
                        )}
                        {subjectList.filter(this.filterByTabValue()).length > 0 && (
                            subjectList.filter(this.filterByTabValue()).map((item) => (
                                <Box className="my-middle" key={item.id}>
                                    <CardItem>
                                        <div className="my-content" style={{color: item.color}}>
                                            <h5 style={{marginBottom: 0}}>{item.module_code}</h5>
                                            <h3>{item.module_name}</h3>
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
                                            {item.complete_flag ? "Complete" : "In progress"}
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
                            <div className='title'> Add Subject</div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit((data) => {
                            this.onSubmit(data)
                        })}>
                            <div className='subjectsForm'>
                                <label className='moduleCodeLabel'>Module Code</label>
                                <label>Colour</label>
                            </div>

                            <div className='subjectsForm'>
                                <input type='text'
                                       className='moduleCode' {...register("module_code", {required: true})}/>
                                <input type='color' className='colourSelect' {...register("color")}/>
                            </div>
                            {errors.module_code?.type === 'required' && (
                                <div className='subjectsForm'>
                                    <span className="warning-color">Module Code is required</span>
                                </div>
                            )}


                            <div className='subjectsForm'>
                                <label>Title/Name</label>
                                <input type='text'
                                       className='moduleName' {...register("module_name", {required: true})}/>
                            </div>
                            {errors.module_name?.type === 'required' && (
                                <div className='subjectsForm'>
                                    <span className="warning-color">Title/Name is required</span>
                                </div>
                            )}

                            <div className='subjectsForm'>
                                <label>Lecturer</label>
                                <input type='text'
                                       className='lecturerName' {...register("lecturer", {required: true})}/>
                            </div>

                            <div className='subjectsForm'>
                                <label className='moduleCreditsLabel'>Credits</label>
                                <label>Term</label>
                            </div>

                            <div className='subjectsForm'>
                                <input type='number'
                                       className='moduleCredits' {...register("credits", {required: true})}/>
                                <select className='termSelector' {...register("term", {required: true})}>
                                    <option value="">Please select</option>
                                    <option value='1'>Semester 1</option>
                                    <option value='2'>Semester 2</option>
                                </select>
                            </div>
                            {errors.credits?.type === 'required' && (
                                <div className='subjectsForm'>
                                    <span className="warning-color">Credits is required</span>
                                </div>
                            )}
                            {errors.term?.type === 'required' && (
                                <div className='subjectsForm'>
                                    <span className="warning-color">Term is required</span>
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
                                        onChange={(event) => {this.editCompleteFlagChange(event)}}
                                />
                            </div>
                            <div className='subjectsForm'>
                                <label className='moduleCodeLabel'>Result(%)</label>
                            </div>
                            <div className='subjectsForm'>
                                <input type='number' className='moduleCode' {...register1("result")}/>
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
export default compose(withAcademicYear, withFormHOC, withFirebase, withAuthUser, withAuthorization(condition))(Subjects);
