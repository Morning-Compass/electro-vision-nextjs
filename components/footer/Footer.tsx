import { ReactNode } from "react";

type FooterProps = {
  children: ReactNode;
  customHeight?: string;
};

function Footer({ children, customHeight = undefined, ...props }: FooterProps) {
  return (
    <footer
      className={`bg-mc-primary text-mc-text flex flex-col w-screen ${customHeight ?? ""}`}
      {...props}
    >
      {children}
    </footer>
  );
}

export default Footer;
