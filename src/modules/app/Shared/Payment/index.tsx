import React, { useRef } from "react";
import {
   Button,
   Container,
   DatePicker,
   Icon,
   KeyboardAccessory,
   Label,
   NumberPad,
   Page,
   PickerSelect,
   Spacer,
   TextField
} from "components";
import { FormikProps, withFormik } from "formik";
import * as Yup from "yup";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Payment } from "services/models/data/payment";
import { TextInput } from "react-native";
import {
   RecurrenceLabels,
   RecurrenceMap
} from "services/models/data/recurrence";
import { usePayments } from "context/Payments";
import { PickerSelectRef } from "components/PickerSelect";
import { DatePickerRef } from "components/DatePicker";

export interface PaymentParams {
   payment?: Payment;
}

type ParamList = {
   Payment: PaymentParams;
};

type RouteProps = RouteProp<ParamList, "Payment">;

interface FormProps {
   label: string;
   numberPadRef: React.MutableRefObject<TextInput | null>;
   repeatRef: React.MutableRefObject<PickerSelectRef | undefined>;
   initialOccurrenceRef: React.MutableRefObject<DatePickerRef | undefined>;
}

interface FormValues {
   title?: string;
   amount?: number;
   repeat?: string;
   initialOccurrenceDate?: string;
}

const PaymentForm = (props: FormProps & FormikProps<FormValues>) => (
   <>
      <Container allowScroll flex>
         <Label type="header" text={props.label} />
         <Spacer />
         <TextField
            preRenderIcon={<Icon name="title" />}
            errorMessage={props.touched.title ? props.errors.title : undefined}
            onChange={props.handleChange("title")}
            value={props.values.title}
            placeholder="Title"
            autoFocus
            onSubmit={() => props.numberPadRef.current?.focus()}
         />
         <NumberPad
            preRenderIcon={<Icon name="attach-money" />}
            placeholder="Amount"
            value={props.values.amount}
            textInputRef={props.numberPadRef}
            onChange={(n) => props.setFieldValue("amount", n, true)}
            errorMessage={
               props.touched.amount ? props.errors.amount : undefined
            }
            onSubmit={() => props.repeatRef.current?.showPicker()}
         />
         <PickerSelect
            preRenderIcon={<Icon name="repeat" />}
            placeholder="Repeat?"
            items={Object.keys(RecurrenceLabels)}
            value={props.values.repeat}
            onChange={(repeat) => {
               props.setFieldValue("repeat", repeat, true);
               props.initialOccurrenceRef.current?.showPicker();
            }}
            errorMessage={
               props.touched.repeat ? props.errors.repeat : undefined
            }
            pickerSelectRef={props.repeatRef}
         />
         <DatePicker
            preRenderIcon={<Icon name="event" />}
            placeholder="Initial Occurrence Date"
            value={
               props.values.initialOccurrenceDate
                  ? new Date(props.values.initialOccurrenceDate)
                  : undefined
            }
            onChange={(date) =>
               props.setFieldValue(
                  "initialOccurrenceDate",
                  date.toUTCString(),
                  true
               )
            }
            errorMessage={
               props.touched.initialOccurrenceDate
                  ? props.errors.initialOccurrenceDate
                  : undefined
            }
            datePickerRef={props.initialOccurrenceRef}
         />
      </Container>
      <KeyboardAccessory justifyContent="flex-end">
         <Button
            onPress={props.handleSubmit}
            text="Save"
            loading={props.isSubmitting}
         />
      </KeyboardAccessory>
   </>
);

const PaymentScreen: React.FC = () => {
   const route = useRoute<RouteProps>();
   const navigation = useNavigation();
   const payments = usePayments();
   const numberPadRef = useRef<TextInput>(null);
   const repeatRef = useRef<PickerSelectRef>();
   const initialOccurrenceRef = useRef<DatePickerRef>();

   const testForValidRepeat = (repeat: string) => repeat in RecurrenceLabels;
   const Form = withFormik<FormProps, FormValues>({
      mapPropsToValues: () => ({
         title: route.params?.payment?.title,
         amount: route.params?.payment?.amount,
         repeat:
            route.params?.payment?.recurrence &&
            RecurrenceMap[route.params?.payment?.recurrence],
         initialOccurrenceDate: route.params?.payment
            ? new Date(
                 route.params.payment.initialYear,
                 route.params.payment.initialMonth,
                 route.params.payment.initialDate
              ).toString()
            : undefined
      }),
      validationSchema: Yup.object().shape({
         title: Yup.string().required("Title cannot be blank"),
         amount: Yup.number().required("Amount is required").min(0),
         repeat: Yup.string()
            .required("Repeat is required")
            .test(
               "validRepeat",
               `Repeat must be one of ${Object.keys(RecurrenceLabels).join(
                  ", "
               )}`,
               testForValidRepeat as Yup.TestFunction<
                  string | undefined,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  Record<string, any>
               >
            ),
         initialOccurrenceDate: Yup.string().required(
            "Initial Occurrence Date is required"
         )
      }),
      handleSubmit: async (values: FormValues) => {
         const initialOccurenceDate = new Date(values.initialOccurrenceDate!);
         const payment: Partial<Payment> = {
            title: values.title,
            amount: values.amount,
            recurrence: RecurrenceLabels[values.repeat!],
            initialDay: initialOccurenceDate.getDay(),
            initialDate: initialOccurenceDate.getDate(),
            initialMonth: initialOccurenceDate.getMonth(),
            initialYear: initialOccurenceDate.getFullYear()
         };
         if (route.params?.payment?.id) {
            const updated = await payments.update(
               route.params?.payment?.id,
               payment
            );
            if (updated) navigation.goBack();
         } else {
            const created = await payments.create(payment);
            if (created) navigation.goBack();
         }
      }
   })(PaymentForm);

   return (
      <Page>
         <Form
            label={
               route.params && route.params.payment
                  ? "Update Payment"
                  : "Create Payment"
            }
            numberPadRef={numberPadRef}
            repeatRef={repeatRef}
            initialOccurrenceRef={initialOccurrenceRef}
         />
      </Page>
   );
};

export default PaymentScreen;
