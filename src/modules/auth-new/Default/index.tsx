import React from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { colors } from "styles";
import Welcome from "assets/svg/Welcome";
import { Button, Container, Label, Link, Page } from "components-new";
import { useNavigation } from "@react-navigation/native";
import { AuthRoutes } from "modules/auth-new/routes";

const styles = StyleSheet.create({
    welcomeText: {
        alignItems: "center"
    },
    image: {
        alignItems: "center",
        paddingVertical: 15
    },
    registerText: {
        paddingTop: 8,
        flexDirection: "row"
    },
    registerLink: {
        paddingLeft: 5
    }
 })

const DefaultScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <Page>
            <Container flex verticallyCenter>
                <View style={styles.welcomeText}>
                    <Label type="header" text="Welcome!" />
                    <Label type="shadow" text="Please log in to continue" />
                </View>
                <View style={styles.image}>
                    <Welcome />
                </View>
                <Button onPress={() => navigation.navigate(AuthRoutes.Login)} text="Log in" />
                <View style={styles.registerText}>
                    <Label type="subText" text="Don't have an account?" />
                    <Link 
                        onPress={() => navigation.navigate(AuthRoutes.Register)}
                        text="Register Here"
                        style={styles.registerLink}
                    />
                </View>
            </Container>
        </Page>
    )
}

export default DefaultScreen;