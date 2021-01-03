import { makeStyles, useTheme } from "context";
import React, { useState, useEffect } from "react";
import {
   View,
   TextInput,
   TouchableOpacity
} from "react-native";

const useStyles = makeStyles(palette => ({
   container: {
      paddingVertical: 10,
      borderBottomWidth: 2,
      borderBottomColor: "#e0e0e0",
      flexDirection: "row",
      marginBottom: 10,
      width: "100%"
   },
   icon: {
      fontSize: 18,
      width: 25,
      color: palette.gray,
      resizeMode: "contain"
   }
}))

interface Props {
   value?: string;
   hidden?: boolean;
   errorMessage?: string;
   onChange?: (newText: string) => void;
   autoFocus?: boolean;
   placeholder?: string;
   preRenderIcon?: JSX.Element;
   onPreRenderIconClick?: () => void;
   postRenderIcon?: JSX.Element;
   onPostRenderIconClick?: () => void;
}

const TextField: React.FC<Props> = (props: Props) => {
   const [value, setValue] = useState<string>();
   const styles = useStyles();
   const theme = useTheme();

   const onChange = (input?: string) => {
      let newValue = (input === undefined ? "" : input);
      setValue(newValue);
      if(props.onChange)
         props.onChange(newValue);
   }

   useEffect(() => {
      if (props.value && value === undefined)
         setValue(props.value);
   })

   return (
      <View style={styles.container}>
          {props.preRenderIcon && (
              <TouchableOpacity onPress={props.onPreRenderIconClick}>
                {React.cloneElement(props.preRenderIcon, { style: styles.icon })}
              </TouchableOpacity> )}
          <TextInput
            placeholder={props.placeholder}
            placeholderTextColor={theme.pallette.gray}
            autoFocus={props.autoFocus}
            onChangeText={onChange}
            style={{ width: "80%" }}
          />
          {props.postRenderIcon && (
             <TouchableOpacity onPress={props.onPostRenderIconClick}>
                {React.cloneElement(props.postRenderIcon, { style: styles.icon })}
             </TouchableOpacity> )}
         {/* {props.errorMessage &&
            <Text style={globalStyles.errorMessage}>{props.errorMessage}</Text> } */}
      </View>
   )
}

export default TextField;