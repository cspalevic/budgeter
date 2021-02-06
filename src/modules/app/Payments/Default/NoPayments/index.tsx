import React from "react";
import {
    Page,
    Container,
    Label,
    Empty
} from "components";

const NoPayments: React.FC = () => {
    return (
        <Page>
            <Container flex>
                <Label type="header" text="Payments" />
                <Container flex verticallyCenter>
                    <Empty 
                        message="You have no payments, yet" 
                        addCreateNew={false} 
                        onCreateNewClick={() => {}} 
                    />
                </Container>
            </Container>
        </Page>
    )
}

export default NoPayments;