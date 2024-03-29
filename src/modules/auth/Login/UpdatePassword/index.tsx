import React, { useRef } from "react";
import {
   Button,
   Container,
   Icon,
   KeyboardAccessory,
   Label,
   Page,
   Spacer,
   TextFieldSecret
} from "components";
import { Text, TextInput, View } from "react-native";
import { FormikProps, withFormik } from "formik";
import * as Yup from "yup";
import { makeStyles, useAuth } from "context";

const useStyles = makeStyles((theme) => ({
   passwordRequirement: {
      flexDirection: "row",
      alignItems: "stretch"
   },
   iconStyles: {
      paddingRight: 10
   },
   invalid: {
      color: theme.palette.red
   },
   valid: {
      color: theme.palette.green
   }
}));

const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const specialCharacters = "!#$%&()*+,-./:;<=>?@_";

interface PasswordRequirements {
   containsMinimumLength: boolean;
   containsUpperCase: boolean;
   containsSpecialCharacters: boolean;
}

interface FormProps {
   passwordRef: React.MutableRefObject<TextInput | null>;
   confirmPasswordRef: React.MutableRefObject<TextInput | null>;
   checkForPasswordRequirements: () => PasswordRequirements;
}

interface FormValues {
   password: string;
   confirmPassword: string;
}

const UpdatePasswordForm = (props: FormProps & FormikProps<FormValues>) => {
   const styles = useStyles();
   const passwordRequirements = props.checkForPasswordRequirements();
   return (
      <>
         <Container allowScroll flex title="Update password">
            <Label type="header" text="Update your password" />
            <Spacer />
            <TextFieldSecret
               placeholder="Enter your password"
               errorMessage={
                  props.touched.password ? props.errors.password : undefined
               }
               onChange={props.handleChange("password")}
               onSubmit={() =>
                  props.confirmPasswordRef.current &&
                  props.confirmPasswordRef.current.focus()
               }
               ref={props.passwordRef}
               newPassword
            />
            <TextFieldSecret
               placeholder="Confirm your password"
               errorMessage={
                  props.touched.confirmPassword
                     ? props.errors.confirmPassword
                     : undefined
               }
               onChange={props.handleChange("confirmPassword")}
               onSubmit={() => props.handleSubmit()}
               ref={props.confirmPasswordRef}
            />
            <Spacer />
            <View style={styles.passwordRequirement}>
               {passwordRequirements.containsMinimumLength ? (
                  <Icon
                     name="check-circle"
                     style={[styles.iconStyles, styles.valid]}
                  />
               ) : (
                  <Icon
                     name="error"
                     style={[styles.iconStyles, styles.invalid]}
                  />
               )}
               <Text
                  style={
                     passwordRequirements.containsMinimumLength
                        ? styles.valid
                        : styles.invalid
                  }
               >
                  Have at least 8 characters
               </Text>
            </View>
            <View style={styles.passwordRequirement}>
               {passwordRequirements.containsUpperCase ? (
                  <Icon
                     name="check-circle"
                     style={[styles.iconStyles, styles.valid]}
                  />
               ) : (
                  <Icon
                     name="error"
                     style={[styles.iconStyles, styles.invalid]}
                  />
               )}
               <Text
                  style={
                     passwordRequirements.containsUpperCase
                        ? styles.valid
                        : styles.invalid
                  }
               >
                  Have at least one upper case character
               </Text>
            </View>
            <View style={styles.passwordRequirement}>
               {passwordRequirements.containsSpecialCharacters ? (
                  <Icon
                     name="check-circle"
                     style={[styles.iconStyles, styles.valid]}
                  />
               ) : (
                  <Icon
                     name="error"
                     style={[styles.iconStyles, styles.invalid]}
                  />
               )}
               <Text
                  style={
                     passwordRequirements.containsSpecialCharacters
                        ? styles.valid
                        : styles.invalid
                  }
               >
                  Have at least one special character:{" "}
                  {`\n${specialCharacters}`}
               </Text>
            </View>
         </Container>
         <KeyboardAccessory justifyContent="flex-end">
            <Button
               onPress={props.handleSubmit}
               text="Update"
               loading={props.isSubmitting}
            />
         </KeyboardAccessory>
      </>
   );
};

const UpdatePasswordScreen: React.FC = () => {
   const auth = useAuth();
   const passwordRef = useRef<TextInput>(null);
   const confirmPasswordRef = useRef<TextInput>(null);
   const passwordRequirements = useRef<PasswordRequirements>({
      containsUpperCase: false,
      containsMinimumLength: false,
      containsSpecialCharacters: false
   });

   const testForMinimumRequirements = (value: string): boolean => {
      let hasMinimumLength = false;
      let hasUpperCase = false;
      let hasSpecialCharacters = false;
      if (value && value.length >= 8) hasMinimumLength = true;
      Array.from(upperChars).forEach((c) => {
         if (value && value.includes(c)) hasUpperCase = true;
      });
      Array.from(specialCharacters).forEach((c) => {
         if (value && value.includes(c)) hasSpecialCharacters = true;
      });
      passwordRequirements.current = {
         containsSpecialCharacters: hasSpecialCharacters,
         containsMinimumLength: hasMinimumLength,
         containsUpperCase: hasUpperCase
      };
      return hasMinimumLength && hasUpperCase && hasSpecialCharacters;
   };

   const Form = withFormik<FormProps, FormValues>({
      mapPropsToValues: () => ({
         password: "",
         confirmPassword: ""
      }),
      validationSchema: Yup.object().shape({
         password: Yup.string()
            .required("Password cannot be blank")
            .test(
               "minimumRequirements",
               "Password must meet minimum requirements",
               testForMinimumRequirements as Yup.TestFunction<
                  string | undefined,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  Record<string, any>
               >
            ),
         confirmPassword: Yup.string()
            .required("Confirm your password")
            .oneOf([Yup.ref("password"), null], "Does not match password")
      }),
      handleSubmit: async (values: FormValues) => {
         await auth.updatePassword(values.password);
      }
   })(UpdatePasswordForm);

   return (
      <Page>
         <Form
            checkForPasswordRequirements={() => passwordRequirements.current}
            passwordRef={passwordRef}
            confirmPasswordRef={confirmPasswordRef}
         />
      </Page>
   );
};

export default UpdatePasswordScreen;
