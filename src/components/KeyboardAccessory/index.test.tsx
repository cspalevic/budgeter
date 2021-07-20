/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import { render } from '@testing-library/react-native';
import KeyboardAccessory from "./";
import { ThemeProvider } from "context";

it("renders correctly", () => {
   render(
      <ThemeProvider>
         <KeyboardAccessory>
         </KeyboardAccessory>
      </ThemeProvider>
   );
});