import React, { useState, useEffect, forwardRef, useRef } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { TextField } from "components";
import { useTheme } from "context";

export interface DatePickerRef {
   showPicker: () => void;
}

interface Props {
   value?: Date;
   hidden?: boolean;
   errorMessage?: string;
   onChange?: (newText: string) => void;
   autoFocus?: boolean;
   placeholder?: string;
   preRenderIcon?: JSX.Element;
   onPreRenderIconClick?: () => void;
   postRenderIcon?: JSX.Element;
   onPostRenderIconClick?: () => void;
   datePickerRef?: React.Ref<DatePickerRef>;
}

const DatePicker: React.FC<Props> = (props: Props) => {
   const [value, setValue] = useState<Date>();
   const [visible, setVisible] = useState<boolean>(false);
   const datePickerRef = useRef<DatePickerRef>({ showPicker: () => setVisible(true) });
   const theme = useTheme();

   const onConfirm = (d: Date) => {
       setValue(d);
       setVisible(false);
       if(props.onChange)
         props.onChange(d.toISOString());
   }

   useEffect(() => {
      if (props.value && value === undefined)
         setValue(props.value);
      if(props.datePickerRef) {
         (props.datePickerRef as React.MutableRefObject<DatePickerRef>).current = datePickerRef.current;
      }
   })

   return (
      <>
         <TextField
            preRenderIcon={props.preRenderIcon}
            onPreRenderIconClick={props.onPreRenderIconClick}
            postRenderIcon={props.postRenderIcon}
            onPostRenderIconClick={props.onPostRenderIconClick}
            placeholder={props.placeholder}
            autoFocus={props.autoFocus}
            contextMenuHidden={true}
            editable={false}
            onTouchStart={() => setVisible(true)}
            value={value ? moment(value).format("MMMM Do YYYY") : undefined}
            errorMessage={props.errorMessage}
            preventOnChange
            controlled
         />
         <DateTimePickerModal
            isVisible={visible}
            onConfirm={d => onConfirm(d)}
            onCancel={() => setVisible(false)}
            isDarkModeEnabled={theme.kind === "dark"}
            textColor={theme.value.palette.textColor}
         />
      </>
   )
}

export default forwardRef<DatePickerRef, Props>((props, ref) => <DatePicker datePickerRef={ref} {...props} />);