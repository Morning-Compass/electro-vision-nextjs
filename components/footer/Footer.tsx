import { ReactNode } from "react";

type FooterProps = {
  children: ReactNode;
  customHeight?: string;
};

function Footer({ children, customHeight = undefined, ...props }: FooterProps) {
  return (
    <footer
      className={`bg-ev-primary text-ev-text flex flex-col w-screen ${customHeight ?? ""} transition-colors duration-500`}
      {...props}
    >
      {children}
    </footer>
  );
}

export default Footer;
