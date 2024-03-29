import React, { useState, forwardRef } from "react";
import { TextField, Icon } from "components";
import { TextInput } from "react-native";

interface Props {
   placeholder?: string;
   errorMessage?: string;
   onChange?: (newText: string) => void;
   onSubmit?: () => void;
   textInputRef?: React.Ref<TextInput>;
   newPassword?: boolean;
}

const TextFieldSecret: React.FC<Props> = (props: Props) => {
   const [hidden, setHidden] = useState<boolean>(true);

   const visible = <Icon onPress={() => setHidden(false)} name="visibility" />;
   const visibleOff = (
      <Icon onPress={() => setHidden(true)} name="visibility-off" />
   );

   return (
      <TextField
         preRenderIcon={<Icon name="lock" />}
         placeholder={props.placeholder}
         errorMessage={props.errorMessage}
         hidden={hidden}
         postRenderIcon={hidden ? visible : visibleOff}
         onPostRenderIconClick={() => setHidden(!hidden)}
         onChange={(nt) => props.onChange && props.onChange(nt)}
         onSubmit={props.onSubmit}
         ref={props.textInputRef}
         textContentType={props.newPassword ? "newPassword" : "password"}
         autoCapitalize="none"
      />
   );
};

export default forwardRef((props: Props, ref: React.Ref<TextInput>) => (
   <TextFieldSecret textInputRef={ref} {...props} />
));
