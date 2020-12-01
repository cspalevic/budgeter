import React from "react";
import AuthNavigator from "modules/auth";
import AppNavigator from "modules/app";
import { AuthState, useAuth } from "context/Auth";
import BudgetsProvider from "context/Budgets";
import PaymentsProvider from "context/Payments";
import NotificationsProvider from "context/Notifications";
import AppLoader from "modules/app";

const Entry: React.FC = () => {
    const auth = useAuth();

    if(auth.authState === AuthState.SignedOut)
        return <AuthNavigator />;
    return (
        <BudgetsProvider>
            <PaymentsProvider>
                <NotificationsProvider>
                    <AppLoader />
                </NotificationsProvider>
            </PaymentsProvider>
        </BudgetsProvider>
    )
}
export default Entry;