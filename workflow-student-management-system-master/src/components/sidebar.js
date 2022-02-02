import React from 'react'
import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import * as BsIcons from "react-icons/bs";
import * as MdIcons from "react-icons/md";
import * as ImIcons from "react-icons/im";

export const sidebarItems = [
    {
        title: 'Calendar',
        path: '/calendar',
        icon: <BsIcons.BsFillCalendarDateFill />,
        className: 'nav-item'
    },
    {
        title: 'Assignments',
        path: '/assignments',
        icon: <MdIcons.MdAssignment />,
        className: 'nav-item'
    },
    {
        title: 'Exams',
        path: '/exams',
        icon: <FaIcons.FaPencilAlt />,
        className: 'nav-item'
    },
    {
        title: 'Subjects',
        path: '/subjects',
        icon: <ImIcons.ImBooks />,
        className: 'nav-item'
    },
    {
        title: 'Settings',
        path: '/settings',
        icon: <IoIcons.IoMdSettings />,
        className: 'nav-item'
    }
]