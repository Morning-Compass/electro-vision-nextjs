import {ReactNode} from "react";

export type FooterSectionProps = {
    children: ReactNode;
    [key: string]: unknown;
}

export function FooterSection({children}: FooterSectionProps) {
    return (
        <div className="flex flex-col justify-center mt-6 pt-8 pb-8">
            {children}
        </div>
    );
}
