import { useForm } from "react-hook-form";
import React from "react";

export default function withFormHOC(Component) {
    function UseForm(props) {
        const form = useForm();
        const form2 = useForm();
        return <Component form={form} form2={form2} {...props} />
    }
    return UseForm
}