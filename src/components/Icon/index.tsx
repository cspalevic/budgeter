import React from "react";
import {default as MaterialIcon} from "react-native-vector-icons/MaterialIcons";
import { StyleProp, TextStyle } from "react-native";
import { useTheme } from "context";

interface Props {
    name: string;
    color?: string;
    size?: number;
    style?: StyleProp<TextStyle>;
    onPress?: () => void;
}

const Icon: React.FC<Props> = (props: Props) => {
    const theme = useTheme();
    return (
        <MaterialIcon 
            name={props.name} 
            color={props.color ?? theme.pallette.textColor}
            size={props.size}
            style={props.style}
            onPress={props.onPress}
        />
    )
}

export default Icon;