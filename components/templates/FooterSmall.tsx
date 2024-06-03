import React from "react";
import { Footer, FooterMain, FooterSectionElement } from "../footer";
import FooterCenterElement from "../footer/FooterCenterElement";

export const FooterSmall = () => {
  return (
    <Footer customHeight="min-h-16">
      <FooterMain center={true} customHeight="min-h-16">
        <FooterCenterElement>Morning Compass</FooterCenterElement>
      </FooterMain>
    </Footer>
  );
};
