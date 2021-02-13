import React from "react";
import { 
    Page, 
    Label, 
    Container, 
    ActionItem,
    List,
    Link,
    Spacer,
    MessageBox,
    Box,
    Icon
} from "components";
import { useBudgets } from "context/Budgets";
import { BudgetIncome } from "services/external/api/models/data/income";
import { BudgetPayment } from "services/external/api/models/data/payment";
import { DueTodayItem } from "services/external/api/models/data/budget";
import { useNavigation } from "@react-navigation/native";
import { HomeRoutes } from "../../routes";
import { toCurrency } from "services/internal/currency";
import { useTheme } from "context";
import { TouchableOpacityComponent, View } from "react-native";

interface Props {
    dueTodayItems: DueTodayItem[];
    incomeItems: BudgetIncome[];
    paymentItems: BudgetPayment[];
}

const BudgetList: React.FC<Props> = (props: Props) => {
    const budgets = useBudgets();
    const navigation = useNavigation();
    const theme = useTheme();
    const moneyIn = budgets.value.incomes.map(x => x.amount).reduce((p, c) => p + c, 0);
    const moneyOut = budgets.value.payments.map(x => x.amount).reduce((i, c) => i + c, 0);
    const leftOver = (moneyIn - moneyOut);
    let sub = "+", c = theme.value.palette.green;
    if(leftOver < 0) {
        sub = "-";
        c = theme.value.palette.red;
    }

    return (
        <Page>
            <Container title={`${budgets.title}`} allowScroll flex>
                <Label type="header" text={`${budgets.title}`} style={{ paddingBottom: 5 }} />
                <Label text={`${sub} ${toCurrency(leftOver)}`} type="regular" color={c} />
                <Spacer />
                <ActionItem title={<Label type="regular" text="Summary" />}>
                    <Box style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row", alignItems: 'center' }}>
                            <Icon name="arrow-upward" size={32} color={theme.value.palette.green} />
                            <Label type="regular" text={toCurrency(moneyIn)} color={theme.value.palette.green} />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Icon name="arrow-downward" size={32} color={theme.value.palette.red} />
                            <Label type="regular" text={toCurrency(moneyOut)} color={theme.value.palette.red} />
                        </View>
                    </Box>
                </ActionItem>
                <Spacer />
                <ActionItem 
                    title={<Label type="regular" text="Due Today" />} 
                    action={props.dueTodayItems.length > 0 && <Link text="View all" onPress={() => navigation.navigate(HomeRoutes.BudgetDueTodayList)} />}
                >
                    {props.dueTodayItems.length === 0 ? (
                        <MessageBox>
                            <Label
                                type="regular"
                                text="You have nothing due today"
                            />
                        </MessageBox>
                    ) : (
                        <List 
                            items={props.dueTodayItems.map(x => ({
                                id: x.item.id,
                                text: x.item.title,
                                note: { text: toCurrency(x.item.amount), color: x.type === "income" ? "green" : "red" },
                                onPress: () => {
                                    if(x.type === "income")
                                        navigation.navigate(HomeRoutes.Income, { income: x.item })
                                    else
                                        navigation.navigate(HomeRoutes.Payment, { payment: x.item })
                                }
                            }))} 
                        />
                    )}
                </ActionItem>
                <Spacer />
                <ActionItem 
                    title={<Label type="regular" text="Incomes" />} 
                    action={props.incomeItems.length > 0 && <Link text="View all" onPress={() => navigation.navigate(HomeRoutes.BudgetIncomesList)} />}
                >
                    {props.incomeItems.length === 0 ? (
                        <MessageBox>
                            <Label
                                type="regular"
                                text="No incomes detected for this month"
                            />
                        </MessageBox>
                    ) : (
                        <List 
                            items={props.incomeItems.map(x => ({
                                id: x.id,
                                text: x.title,
                                note: { text: toCurrency(x.amount), color: "green" },
                                onPress: () => navigation.navigate(HomeRoutes.Income, { income: x })
                            }))} 
                        />
                    )}
                </ActionItem>
                <Spacer />
                <ActionItem 
                    title={<Label type="regular" text="Payments" />} 
                    action={props.paymentItems.length > 0 && <Link text="View all" onPress={() => navigation.navigate(HomeRoutes.BudgetPaymentsList)} />}
                >
                    {props.paymentItems.length === 0 ? (
                        <MessageBox>
                            <Label
                                type="regular"
                                text="No payments detected for this month"
                            />
                        </MessageBox>
                    ) : (
                        <List 
                            items={props.paymentItems.map(x => ({
                                id: x.id,
                                text: x.title,
                                note: { text: toCurrency(x.amount), color: "red" },
                                onPress: () => navigation.navigate(HomeRoutes.Payment, { payment: x })
                            }))} 
                        />
                    )}
                </ActionItem>
            </Container>
            {/* <Container fullWith>
                <SummaryView>
                    <View>
                        <View style={{ flexDirection: "row" }}>
                            <Label text={toCurrency(moneyIn)} type="regular" />
                        </View>
                        <View>
                            <Label type="regular" text="-" />
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <Label text={toCurrency(moneyOut)} type="regular" />
                        </View>
                        <View>
                            <Label type="regular" text="---------------" />
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <Label text={toCurrency(leftOver)} type="regular" color={leftOver > 0 ? theme.value.palette.green : theme.value.palette.red} />
                        </View>
                    </View>
                </SummaryView>
            </Container> */}
        </Page>
    )
}

export default BudgetList;