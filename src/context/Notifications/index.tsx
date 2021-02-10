import React, { createContext, useContext, useEffect, useState } from "react";
import { Notification, Notifications, Registered, RegistrationError } from "react-native-notifications";
import UserService from "services/external/api/me";

interface Props {
   children: React.ReactNode;
}

interface Context {
    askForPermissions: () => Promise<unknown>;
}

const NotificationsContext = createContext<Context>(undefined!);

const NotificationsProvider: React.FC<Props & any> = (props: Props) => {

    const askForPermissions = () => {
        return new Promise((resolve, reject) => {
            Notifications.events().registerRemoteNotificationsRegistered(async (event: Registered) => {
                try {
                    const userService = UserService.getInstance();
                    await userService.registerDevice(event.deviceToken);
                    resolve();
                }
                catch(error) {
                    reject();
                }
            })
            
            Notifications.events().registerRemoteNotificationsRegistrationFailed(event => {
                reject(event.localizedDescription);
            })

            Notifications.registerRemoteNotifications();
        })
    }
    return (
        <NotificationsContext.Provider value={{ askForPermissions }}>
            {props.children}
        </NotificationsContext.Provider>
    )
};

export const useNotifications = (): Context => useContext<Context>(NotificationsContext);

export default NotificationsProvider;